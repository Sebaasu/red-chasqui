// Mapa operativo: contenedores, camión y alertas de proximidad
const CHASQUI_MAP_MODULE = (() => {

  let map, userMarker;
  let trucks = [];
  let activeAlerts = {};
  let watchId = null;
  let casaVecinoCoords = CHASQUI_CONFIG.ubicacionVecinoPorDefecto;
  let gpsActivo = false;

  const ZONAS = [
    { nombre: 'Sur (Calacoto / Obrajes)', centro: [-16.5400, -68.0870], pasaHoy: true },
    { nombre: 'Centro (Sopocachi / Centro)', centro: [-16.5050, -68.1300], pasaHoy: false },
    { nombre: 'Este (Miraflores / V. Fátima)', centro: [-16.4950, -68.1200], pasaHoy: true },
    { nombre: 'Oeste (Cotahuma / Llojeta)', centro: [-16.5100, -68.1500], pasaHoy: false }
  ];

  function tileUrlPorTema() {
    const estilo = document.body.dataset.theme === 'light' ? 'light_all' : 'dark_all';
    return `https://{s}.basemaps.cartocdn.com/rastertiles/${estilo}/{z}/{x}/{y}{r}.png`;
  }

  function initMap() {
    map = L.map('map', { zoomControl: false }).setView(CHASQUI_CONFIG.centroMapa, CHASQUI_CONFIG.zoomInicial);
    window.CHASQUI_MAP = map;

    // Las teselas del mapa siguen el mismo tono (claro/oscuro) elegido en la pantalla de inicio
    let capaTeselas = L.tileLayer(tileUrlPorTema(), {
      attribution: '&copy; OSM &copy; CARTO'
    }).addTo(map);

    document.addEventListener('chasqui:theme-changed', () => {
      map.removeLayer(capaTeselas);
      capaTeselas = L.tileLayer(tileUrlPorTema(), { attribution: '&copy; OSM &copy; CARTO' }).addTo(map);
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const homeIcon = L.divIcon({
      html: `<div class="marker-pin" style="background:#F5B942"><i data-lucide="home" class="w-4 h-4"></i></div>`,
      className: '', iconSize: [32, 32]
    });
    userMarker = L.marker(casaVecinoCoords, { icon: homeIcon }).addTo(map)
      .bindPopup('<b>Tu ubicación</b><br>Referencia para alertas');

    cargarContenedores();
    cargarRutaCamion();

    // Bind GPS toggle button
    const gpsBtn = document.getElementById('btn-gps-toggle');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        if (!gpsActivo) {
          gpsActivo = true;
          gpsBtn.innerHTML = `<i data-lucide="locate-off" class="w-4 h-4"></i> Desactivar GPS`;
          gpsBtn.classList.remove('btn-green');
          gpsBtn.classList.add('btn-outline');
          document.getElementById('gps-info-box').classList.remove('hidden');
          requestRealGPS();

          // Pedir permiso de notificaciones del navegador en el mismo clic
          // (los navegadores exigen que la solicitud venga de una acción del usuario)
          const notifStatusEl = document.getElementById('notif-status-text');
          CHASQUI_UI.solicitarPermisoNotificaciones().then((permiso) => {
            if (permiso === 'granted') {
              CHASQUI_UI.showToast('🔔 Notificaciones activadas: te avisaremos cuando el camión esté cerca.');
              if (notifStatusEl) notifStatusEl.textContent = 'Notificaciones: activadas ✓';
            } else if (permiso === 'denied') {
              CHASQUI_UI.showToast('Notificaciones bloqueadas. Actívalas en los ajustes del navegador para recibir el aviso.');
              if (notifStatusEl) notifStatusEl.textContent = 'Notificaciones: bloqueadas (revisa tu navegador)';
            } else if (permiso === 'unsupported') {
              if (notifStatusEl) notifStatusEl.textContent = 'Notificaciones: no disponibles en este navegador';
            } else {
              if (notifStatusEl) notifStatusEl.textContent = 'Notificaciones: pendientes de confirmar';
            }
          });
        } else {
          gpsActivo = false;
          gpsBtn.innerHTML = `<i data-lucide="locate" class="w-4 h-4"></i> Activar mi GPS`;
          gpsBtn.classList.remove('btn-outline');
          gpsBtn.classList.add('btn-green');
          document.getElementById('gps-info-box').classList.add('hidden');
          
          // Restore default coordinates
          casaVecinoCoords = CHASQUI_CONFIG.ubicacionVecinoPorDefecto;
          userMarker.setLatLng(casaVecinoCoords);
          map.setView(CHASQUI_CONFIG.centroMapa, CHASQUI_CONFIG.zoomInicial);
          
          const alertBox = document.getElementById('proximity-alert');
          if (alertBox) alertBox.classList.add('hidden');
        }
        lucide.createIcons();
      });
    }
    iniciarEcoTips();
  }

  let containerMarkers = [];

  function dibujarContenedores(contenedores) {
    // Limpiar marcadores existentes del mapa
    containerMarkers.forEach(m => map.removeLayer(m));
    containerMarkers = [];

    contenedores.forEach(c => {
      // Determinar borde e información del contenedor según su tipo de reciclaje
      let borderColor = '#10B981'; // Verde para general / Isla Verde
      let glowColor = 'rgba(16, 185, 129, 0.45)';
      let tipoTexto = 'Residuos Generales (Isla Verde)';
      
      if (c.tipo === 'plastico') {
        borderColor = '#FBBF24'; // Amarillo
        glowColor = 'rgba(245, 185, 66, 0.45)';
        tipoTexto = 'Envases y Botellas Plásticas';
      } else if (c.tipo === 'papel') {
        borderColor = '#3B82F6'; // Azul
        glowColor = 'rgba(59, 130, 246, 0.45)';
        tipoTexto = 'Papel y Cartón';
      }

      // Determinar color de fondo del badge circular en base a la capacidad (semáforo)
      const statusColor = c.nivel >= 80 ? 'var(--coral)' : (c.nivel >= 50 ? 'var(--gold)' : 'var(--green)');
      const isCriticalClass = c.nivel >= 80 ? 'is-full' : '';

      const containerIcon = L.divIcon({
        html: `
          <div class="custom-container-marker ${isCriticalClass}" style="--border-color: ${borderColor}; --glow-color: ${glowColor}; border-color: ${borderColor} !important; box-shadow: 0 0 12px ${glowColor} !important;">
            <div class="container-image-container">
              <img src="../images/contenedor.jpeg" alt="Contenedor" class="container-marker-img">
            </div>
            <div class="container-marker-badge" style="background: ${statusColor}">
              <span>${c.nivel}%</span>
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker-container',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([c.lat, c.lng], { icon: containerIcon })
        .addTo(map)
        .bindPopup(`<b>Contenedor ${c.nombre}</b><br>
                    Tipo: <b>${tipoTexto}</b><br>
                    Llenado: <b>${c.nivel}%</b> (${c.nivel >= 80 ? 'CRÍTICO (Lleno)' : (c.nivel >= 50 ? 'Medio' : 'Disponible')})`);
      
      marker.tipoChasqui = c.tipo || 'general';
      containerMarkers.push(marker);
    });
  }

  // Función de filtrado global disponible en el objeto window
  window.filtrarContenedoresPorTipo = function(tipo, btnElement) {
    // Alternar clases en los botones de filtro
    const filterContainer = document.getElementById('container-filters');
    if (filterContainer) {
      filterContainer.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
    }
    if (btnElement) {
      btnElement.classList.add('active');
    }

    // Filtrar marcadores en Leaflet
    containerMarkers.forEach(marker => {
      if (tipo === 'todos' || marker.tipoChasqui === tipo) {
        if (!map.hasLayer(marker)) map.addLayer(marker);
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    });
  };

  async function cargarContenedores() {
    try {
      const res = await fetch(CHASQUI_CONFIG.apiBase + 'get_containers.php');
      const contenedores = await res.json();
      window.CHASQUI_CONTENEDORES = contenedores;
      dibujarContenedores(contenedores);
      document.dispatchEvent(new CustomEvent('chasqui:contenedores-listos', { detail: contenedores }));
    } catch (err) {
      console.warn('No se pudo cargar contenedores desde la API PHP, usando local:', err);
      const niveles = [35, 82, 15, 91, 55, 12, 78, 92, 45, 10, 88, 62, 23, 79, 90, 14, 52, 83, 71, 39, 81, 16];
      const coords = [
        [-16.491556, -68.13446], [-16.492042, -68.137679], [-16.496814, -68.137658], [-16.498438, -68.13283],
        [-16.497328, -68.13313], [-16.496773, -68.133774], [-16.490829, -68.136628], [-16.492824, -68.1371],
        [-16.488615, -68.140115], [-16.494592, -68.134396], [-16.492453, -68.138258], [-16.496279, -68.136628],
        [-16.492121, -68.133656], [-16.492597, -68.139653], [-16.490013, -68.137776], [-16.492553, -68.13298],
        [-16.497739, -68.132443], [-16.498767, -68.133967], [-16.497904, -68.137014], [-16.492903, -68.132186],
        [-16.490664, -68.140104], [-16.495621, -68.136971]
      ];
      const fallbackContenedores = coords.map((c, idx) => {
        let tipo = 'general';
        if (idx % 3 === 1) tipo = 'plastico';
        else if (idx % 3 === 2) tipo = 'papel';
        return {
          nombre: "C-" + (idx + 1).toString().padStart(2, '0'),
          lat: c[0],
          lng: c[1],
          nivel: niveles[idx % niveles.length],
          tipo: tipo
        };
      });
      window.CHASQUI_CONTENEDORES = fallbackContenedores;
      dibujarContenedores(fallbackContenedores);
      document.dispatchEvent(new CustomEvent('chasqui:contenedores-listos', { detail: fallbackContenedores }));
    }
  }

  function iniciarEcoTips() {
    const tips = [
      "¿Sabías que separar el plástico reduce en un 80% la basura que llega a Alpacoma?",
      "Enjuaga y aplasta tus botellas de plástico antes de arrojarlas en los contenedores amarillos 🟡.",
      "El papel y cartón deben estar limpios y secos para depositarlos en los contenedores azules 🔵.",
      "Clasificar los residuos orgánicos en las Islas Verdes 🟢 ayuda a compostar y nutrir las áreas verdes de La Paz.",
      "Si todos clasificamos los residuos, extenderemos la vida útil del sistema de desechos de la ciudad por 15 años.",
      "Alpacoma está por cerrar. Clasificar tus residuos hoy es cuidar el mañana de nuestra La Paz."
    ];
    let currentTipIdx = 0;
    const ecoTipTextEl = document.getElementById('eco-tip-text');
    if (!ecoTipTextEl) return;

    ecoTipTextEl.textContent = tips[0];
    ecoTipTextEl.style.transition = 'opacity 0.4s ease';
    
    setInterval(() => {
      currentTipIdx = (currentTipIdx + 1) % tips.length;
      ecoTipTextEl.style.opacity = '0';
      setTimeout(() => {
        ecoTipTextEl.textContent = tips[currentTipIdx];
        ecoTipTextEl.style.opacity = '1';
      }, 400);
    }, 10000);
  }

  // Reduce la cantidad de puntos de una ruta densa manteniendo su forma general,
  // para que la simulación no tarde demasiado en completar una vuelta.
  function reducirRuta(ruta, maxPuntos) {
    if (ruta.length <= maxPuntos) return ruta;
    const factor = ruta.length / maxPuntos;
    const reducida = [];
    for (let i = 0; i < maxPuntos; i++) {
      reducida.push(ruta[Math.floor(i * factor)]);
    }
    reducida.push(ruta[ruta.length - 1]);
    return reducida;
  }

  // Usa OSRM (routing sobre calles reales de OpenStreetMap) para "pegar" los
  // puntos de referencia a la trayectoria real de avenidas y calles, en vez
  // de avanzar en línea recta entre ellos. Se cierra el recorrido agregando
  // el punto de partida al final para que sea un circuito completo.
  async function obtenerRutaSobreCalles(waypoints) {
    try {
      const puntosCircuito = [...waypoints, waypoints[0]];
      const coordsStr = puntosCircuito.map(p => `${p[1]},${p[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.code === 'Ok' && data.routes && data.routes[0]) {
        // GeoJSON entrega [lng, lat]; Leaflet necesita [lat, lng]
        const rutaCompleta = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        return reducirRuta(rutaCompleta, 45);
      }
    } catch (err) {
      console.warn('No se pudo obtener ruta real de calles (OSRM), se usará la ruta local:', err);
    }
    return null;
  }

  async function cargarRutaCamion() {
    let camionesDB = [];
    try {
      const res = await fetch(CHASQUI_CONFIG.apiBase + 'get_truck_position.php');
      camionesDB = await res.json();
    } catch (err) {
      console.warn('Usando ruta simulada localmente (sin conexión a PHP):', err);
    }

    // Fallback si no hay conexión
    if (!Array.isArray(camionesDB) || camionesDB.length === 0) {
      camionesDB = [
        {
          id: 1,
          nombre_ruta: "Ruta Centro-Sopocachi (Real 1)",
          placa: "4821-LPD",
          ruta: [[-16.498854,-68.14034],[-16.497579,-68.138709],[-16.496304,-68.136864],[-16.495687,-68.136091],[-16.4947,-68.135619],[-16.493548,-68.134804],[-16.492725,-68.134203],[-16.491697,-68.135533],[-16.491409,-68.13592],[-16.493095,-68.136907],[-16.491738,-68.137655],[-16.493507,-68.138881],[-16.49363,-68.14064],[-16.494494,-68.141928],[-16.495317,-68.145833],[-16.498525,-68.140254]]
        },
        {
          id: 2,
          nombre_ruta: "Ruta San Pedro-Miraflores (Real 2)",
          placa: "5078-DFA",
          ruta: [[-16.497211,-68.136145],[-16.496697,-68.13578],[-16.496049,-68.135276],[-16.494579,-68.134418],[-16.493283,-68.133484],[-16.494548,-68.131242],[-16.495957,-68.132197],[-16.498003,-68.133602],[-16.499515,-68.1346],[-16.497201,-68.136188],[-16.496029,-68.13666],[-16.495103,-68.136799],[-16.498425,-68.131338],[-16.497366,-68.130577],[-16.497376,-68.128345],[-16.496564,-68.127776],[-16.494939,-68.130802],[-16.495782,-68.130802],[-16.496008,-68.13063],[-16.495998,-68.131092],[-16.499258,-68.133323],[-16.499803,-68.132057],[-16.498404,-68.131349]]
        },
        {
          id: 3,
          nombre_ruta: "Ruta Sopocachi Auxiliar (Real 3)",
          placa: "3192-KPT",
          ruta: [[-16.50251,-68.137132],[-16.503086,-68.136499],[-16.503559,-68.136016],[-16.50433,-68.135254],[-16.504968,-68.134718],[-16.506037,-68.13239],[-16.505256,-68.131757],[-16.504413,-68.133044],[-16.503683,-68.134578],[-16.503209,-68.133903],[-16.50359,-68.133302],[-16.503683,-68.132765],[-16.504063,-68.131435],[-16.502973,-68.129686],[-16.501832,-68.130716],[-16.502531,-68.131832],[-16.503754,-68.131006],[-16.504012,-68.131371],[-16.501071,-68.134514],[-16.502387,-68.135866],[-16.501862,-68.136317],[-16.500803,-68.135126],[-16.500567,-68.135147],[-16.500978,-68.136799],[-16.501071,-68.136928],[-16.501852,-68.136359],[-16.502449,-68.137046]]
        }
      ];
    }

    for (let c of camionesDB) {
      if (!c.ruta || c.ruta.length === 0) continue;

      // Usar las coordenadas manuales exactas trazadas por el usuario (sin filtros OSRM que cortan esquinas)
      const rutaFinal = c.ruta;

      // Dibujar polyline para cada camión en el mapa (verde para 1, celeste para 2, dorado para 3)
      let color = 'var(--sky)';
      let pulseColor = 'rgba(78, 201, 224, 0.45)';
      if (c.id === 1) {
        color = 'var(--green)';
        pulseColor = 'rgba(34, 197, 94, 0.45)';
      } else if (c.id === 3) {
        color = 'var(--gold)';
        pulseColor = 'rgba(245, 185, 66, 0.45)';
      }

      const tIcon = L.divIcon({
        html: `
          <div class="custom-truck-marker" style="border-color: ${color}; box-shadow: 0 0 15px ${pulseColor}">
            <div class="truck-image-container">
              <img src="../images/camion.jpeg" alt="Camión" class="truck-marker-img">
            </div>
            <div class="truck-marker-pulse" style="border-color: ${color}"></div>
          </div>
        `,
        className: 'custom-leaflet-marker-truck',
        iconSize: [45, 45],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      L.polyline(rutaFinal, {
        color: color,
        weight: 4,
        opacity: 0.5,
        dashArray: '8, 12'
      }).addTo(map);

      // Crear instancia de camión
      const t = {
        id: c.id,
        nombre_ruta: c.nombre_ruta,
        placa: c.placa,
        ruta: rutaFinal,
        paso: 0,
        capacidad: 15 + Math.round(Math.random() * 20),
        animacionId: null,
        marker: L.marker(rutaFinal[0], { icon: tIcon }).addTo(map)
      };
      t.marker.bindPopup(`<b>${c.nombre_ruta} (${c.placa})</b><br>Capacidad: ${t.capacidad}% lleno<br>Estado: Recolectando`);
      trucks.push(t);
    }

    lucide.createIcons();

    setInterval(actualizarSimulacion, CHASQUI_CONFIG.intervaloSimulacionMs);
    actualizarSimulacion();
  }

  function distanciaMetros(c1, c2) {
    const R = 6371e3;
    const phi1 = c1[0] * Math.PI / 180, phi2 = c2[0] * Math.PI / 180;
    const deltaPhi = (c2[0] - c1[0]) * Math.PI / 180, deltaLambda = (c2[1] - c1[1]) * Math.PI / 180;
    const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  function animarCamion(t, posAnterior, posSiguiente, duracion) {
    const inicio = performance.now();
    
    function mover(ahora) {
      const transcurrido = ahora - inicio;
      const pct = Math.min(transcurrido / duracion, 1);
      
      const lat = posAnterior[0] + (posSiguiente[0] - posAnterior[0]) * pct;
      const lng = posAnterior[1] + (posSiguiente[1] - posAnterior[1]) * pct;
      
      t.marker.setLatLng([lat, lng]);
      t.marker.setPopupContent(`<b>${t.nombre_ruta} (${t.placa})</b><br>Capacidad: ${t.capacidad}% lleno<br>Estado: Recolectando`);
      
      // Actualizar datos GPS
      if (t.id === 1) {
        actualizarDatosGPSConCoords([lat, lng]);
      }
      
      // Registrar en consola IoT
      const consoleEl = document.getElementById('relay-console');
      if (consoleEl && pct >= 0.99 && t.id === 1) {
        const time = new Date().toLocaleTimeString();
        const row = document.createElement('div');
        row.style.color = 'var(--muted)';
        row.innerHTML = `<span style="color:var(--faint)">[${time}]</span> RX ${t.placa}: ${lat.toFixed(5)}, ${lng.toFixed(5)} | Carga: ${t.capacidad}%`;
        consoleEl.appendChild(row);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        while (consoleEl.children.length > 6) consoleEl.removeChild(consoleEl.children[1]);
      }
      
      if (pct < 1) {
        t.animacionId = requestAnimationFrame(mover);
      }
    }
    
    if (t.animacionId) {
      cancelAnimationFrame(t.animacionId);
    }
    t.animacionId = requestAnimationFrame(mover);
  }

  function actualizarSimulacion() {
    if (trucks.length === 0) return;

    let algunCamionCerca = false;
    let camionCercanoInfo = "";
    let closestDist = Infinity;

    trucks.forEach(t => {
      const pasoAnterior = t.paso;
      t.paso = (t.paso + 1) % t.ruta.length;
      
      if (t.paso === 0) {
        t.capacidad = 15;
      } else {
        t.capacidad = Math.min(98, t.capacidad + Math.round(Math.random() * 5 + 4));
      }

      const posAnterior = t.ruta[pasoAnterior];
      const posSiguiente = t.ruta[t.paso];

      // Lanzar animación suave
      animarCamion(t, posAnterior, posSiguiente, CHASQUI_CONFIG.intervaloSimulacionMs);

      // Calcular distancia actual aproximada
      const dist = distanciaMetros(posSiguiente, casaVecinoCoords);
      if (dist < closestDist) {
        closestDist = dist;
      }

      if (dist < CHASQUI_CONFIG.radioAlertaMetros) {
        algunCamionCerca = true;
        camionCercanoInfo = `${t.nombre_ruta} (${t.placa}) a ${dist}m`;
        
        // Alerta sonora y de escritorio del sistema
        const alertKey = `warning_${t.id}`;
        const now = Date.now();
        if (!activeAlerts[alertKey] || (now - activeAlerts[alertKey] > 120000)) {
          CHASQUI_UI.playNotificationSound();
          CHASQUI_UI.mostrarNotificacionSistema(`🚛 Camión cerca: ${t.placa}`, {
            body: `${t.nombre_ruta} a ${dist} metros.`,
            icon: '../LOGO.png',
            tag: `chasqui-proximidad-${t.id}`,
            renotify: true
          });
          activeAlerts[alertKey] = now;
        }
      }
    });

    const alertBox = document.getElementById('proximity-alert');
    if (alertBox) {
      if (gpsActivo && algunCamionCerca) {
        alertBox.classList.remove('hidden');
        alertBox.querySelector('p.text-\\[12px\\]').textContent = camionCercanoInfo;
      } else {
        alertBox.classList.add('hidden');
      }
    }
  }

  function actualizarDatosGPS() {
    if (trucks.length > 0) {
      const currentPos = trucks[0].marker.getLatLng();
      actualizarDatosGPSConCoords([currentPos.lat, currentPos.lng]);
    }
  }

  function actualizarDatosGPSConCoords(posCamion) {
    if (!gpsActivo) return;

    let masCercana = ZONAS[0];
    let minDist = distanciaMetros(casaVecinoCoords, ZONAS[0].centro);

    for (let i = 1; i < ZONAS.length; i++) {
      let d = distanciaMetros(casaVecinoCoords, ZONAS[i].centro);
      if (d < minDist) {
        minDist = d;
        masCercana = ZONAS[i];
      }
    }

    const detectedZoneEl = document.getElementById('detected-zone');
    const serviceTodayEl = document.getElementById('service-today-status');

    if (detectedZoneEl) detectedZoneEl.textContent = masCercana.nombre;

    if (masCercana.pasaHoy) {
      if (serviceTodayEl) {
        serviceTodayEl.textContent = 'PASA HOY';
        serviceTodayEl.className = 'badge badge-green';
      }
    } else {
      if (serviceTodayEl) {
        serviceTodayEl.textContent = 'NO PASA HOY';
        serviceTodayEl.className = 'badge badge-coral';
      }
    }
  }

  function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  function agregarMarcadorReporte(coords, tipo, desc) {
    const alertIcon = L.divIcon({
      html: `<div class="marker-pin" style="background:#FF5C5C; width:26px; height:26px;"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i></div>`,
      className: '', iconSize: [26, 26]
    });
    L.marker(coords, { icon: alertIcon }).addTo(map)
      .bindPopup(`<b>Reporte</b><br>${escaparHtml(tipo)}<br>${escaparHtml(desc)}`).openPopup();
    lucide.createIcons();
  }

  function requestRealGPS() {
    if (!navigator.geolocation) { CHASQUI_UI.showToast('GPS no soportado en este navegador.'); return; }
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    watchId = navigator.geolocation.watchPosition((pos) => {
      casaVecinoCoords = [pos.coords.latitude, pos.coords.longitude];
      userMarker.setLatLng(casaVecinoCoords);
      
      // Actualizar o crear círculo de alerta (geocerca)
      if (window.userCircle) {
        window.userCircle.setLatLng(casaVecinoCoords);
      } else {
        window.userCircle = L.circle(casaVecinoCoords, {
          radius: CHASQUI_CONFIG.radioAlertaMetros,
          color: '#22C55E',
          fillColor: '#22C55E',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }
      
      map.setView(casaVecinoCoords, 15);
      actualizarDatosGPS();
    }, () => {
      CHASQUI_UI.showToast('No se pudo acceder al GPS real. Usando ubicación de simulación.');
      actualizarDatosGPS();
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
  }

  function getCasaVecinoCoords() { return casaVecinoCoords; }

  return { initMap, agregarMarcadorReporte, requestRealGPS, getCasaVecinoCoords };
})();
