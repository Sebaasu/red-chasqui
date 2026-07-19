// Envío y listado de reportes ciudadanos vía la API PHP o localStorage (fallback estático/offline)
const CHASQUI_REPORTS = (() => {

  async function enviarReporte() {
    const tipo = document.getElementById('report-type').value;
    const nombre = document.getElementById('report-name').value || 'Anónimo';
    const descripcion = document.getElementById('report-desc').value || 'Sin descripción';

    const base = CHASQUI_MAP_MODULE.getCasaVecinoCoords();
    const lat = base[0] + (Math.random() - 0.5) * 0.003;
    const lng = base[1] + (Math.random() - 0.5) * 0.003;

    const payload = { tipo, nombre, descripcion, lat, lng };
    let guardadoEnServidor = false;

    try {
      const res = await fetch(CHASQUI_CONFIG.apiBase + 'submit_report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          guardadoEnServidor = true;
          CHASQUI_UI.showToast('✅ Reporte enviado a la cuadrilla municipal.');
        }
      }
    } catch (err) {
      console.warn('Servidor PHP fuera de línea, guardando localmente...', err);
    }

    if (!guardadoEnServidor) {
      // Guardar en localStorage para persistencia estática (GitHub Pages)
      const localList = JSON.parse(localStorage.getItem('chasqui-local-reports') || '[]');
      const newReport = {
        id: 'local_' + Date.now(),
        tipo,
        nombre,
        descripcion,
        lat,
        lng,
        creado_en: new Date().toISOString(),
        resuelto: 0
      };
      localList.push(newReport);
      localStorage.setItem('chasqui-local-reports', JSON.stringify(localList));
      CHASQUI_UI.showToast('Reporte registrado localmente (Persistido en el navegador).');
    }

    CHASQUI_MAP_MODULE.agregarMarcadorReporte([lat, lng], tipo, descripcion);
    document.getElementById('report-desc').value = '';
    cargarReportesRecientes();
  }

  function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  async function cargarReportesRecientes() {
    const lista = document.getElementById('reports-list');
    if (!lista) return;

    let reportes = [];
    let usarLocal = false;

    try {
      const res = await fetch(CHASQUI_CONFIG.apiBase + 'get_reports.php');
      if (res.ok) {
        reportes = await res.json();
      } else {
        usarLocal = true;
      }
    } catch (err) {
      usarLocal = true;
    }

    if (usarLocal) {
      // Inicializar con semillas locales de Sopocachi si está vacío
      if (!localStorage.getItem('chasqui-local-reports')) {
        const t_10m = new Date(Date.now() - 10*60*1000).toISOString();
        const t_45m = new Date(Date.now() - 45*60*1000).toISOString();
        const semillas = [
          { id: 'semilla_1', tipo: 'Contenedor lleno / rebalsando', nombre: 'Vecino', descripcion: 'Contenedor C-02 lleno', lat: -16.4968, lng: -68.1376, creado_en: t_10m, resuelto: 0 },
          { id: 'semilla_2', tipo: 'Microbasural clandestino', nombre: 'Vecino', descripcion: 'Basura acumulada en la esquina', lat: -16.4928, lng: -68.1371, creado_en: t_45m, resuelto: 0 }
        ];
        localStorage.setItem('chasqui-local-reports', JSON.stringify(semillas));
      }
      const localList = JSON.parse(localStorage.getItem('chasqui-local-reports') || '[]');
      reportes = localList.filter(r => r.resuelto === 0);
    }

    // Renderizar reportes
    lista.innerHTML = reportes.map(r => {
      let tiempoTexto = r.tiempo;
      if (!tiempoTexto && r.creado_en) {
        const diffMs = Date.now() - new Date(r.creado_en).getTime();
        const diffMins = Math.round(diffMs / 60000);
        if (diffMins < 60) {
          tiempoTexto = `Hace ${diffMins} min`;
        } else {
          tiempoTexto = `Hace ${Math.round(diffMins/60)} horas`;
        }
      }
      if (!tiempoTexto) tiempoTexto = "Hace un momento";

      const descCorta = r.descripcion_corta || `${r.tipo}: ${r.descripcion || 'Sin detalles'}`;

      return `
        <div class="tl-item">
          <div class="tl-dot" style="${r.resuelto ? 'background:var(--faint)' : ''}"></div>
          <div class="tl-card">
            <div class="flex items-center justify-between gap-2">
              <div class="tl-time">${escaparHtml(tiempoTexto.toUpperCase())}</div>
              ${r.resuelto
                ? '<span class="badge" style="background:rgba(34,197,94,0.14); color:var(--green)">RESUELTO</span>'
                : `<button class="btn-marcar-resuelto" data-id="${r.id}" style="background:none; border:1px solid var(--border-strong); color:var(--muted); font-size:10px; padding:3px 9px; border-radius:999px; cursor:pointer;">Marcar resuelto</button>`
              }
            </div>
            <div class="tl-title" style="${r.resuelto ? 'text-decoration:line-through; color:var(--faint)' : ''}">${escaparHtml(descCorta)}</div>
          </div>
        </div>
      `;
    }).join('');

    CHASQUI_UI.observarReveal();

    lista.querySelectorAll('.btn-marcar-resuelto').forEach(btn => {
      btn.addEventListener('click', () => marcarResuelto(btn.dataset.id));
    });

    // Colocar marcadores en el mapa para reportes locales
    if (usarLocal && window.CHASQUI_MAP) {
      if (!window.reportesDibujadosMap) window.reportesDibujadosMap = {};
      reportes.forEach(r => {
        if (!window.reportesDibujadosMap[r.id]) {
          CHASQUI_MAP_MODULE.agregarMarcadorReporte([r.lat, r.lng], r.tipo, r.descripcion || '');
          window.reportesDibujadosMap[r.id] = true;
        }
      });
    }
  }

  async function marcarResuelto(id) {
    let resueltoEnServidor = false;
    
    // Si no es un ID puramente local, intentamos resolver en servidor
    if (typeof id === 'string' && !id.startsWith('local_') && !id.startsWith('semilla_')) {
      try {
        const res = await fetch(CHASQUI_CONFIG.apiBase + 'resolve_report.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            resueltoEnServidor = true;
            CHASQUI_UI.showToast('✅ Reporte marcado como resuelto.');
          }
        }
      } catch (err) {
        console.warn('No se pudo marcar en servidor, reintentando localmente...', err);
      }
    }

    if (!resueltoEnServidor) {
      // Resolver en localStorage para persistencia estática
      const localList = JSON.parse(localStorage.getItem('chasqui-local-reports') || '[]');
      const item = localList.find(r => r.id === id);
      if (item) {
        item.resuelto = 1;
        localStorage.setItem('chasqui-local-reports', JSON.stringify(localList));
        CHASQUI_UI.showToast('✅ Reporte local marcado como resuelto.');
      }
    }

    cargarReportesRecientes();
  }

  return { enviarReporte, cargarReportesRecientes };
})();
