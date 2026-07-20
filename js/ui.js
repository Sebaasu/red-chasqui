// Manejo de la interfaz: navegación, reveal on scroll, contadores, sonidos y notificaciones
const CHASQUI_UI = (() => {

  const titles = {
    mapa: {
      badge: 'En vivo · GAMLP',
      title: 'Mapa operativo',
      sub: 'Monitoreo en tiempo real de camiones, contenedores y reportes ciudadanos.'
    },
    horarios: {
      badge: 'Cronograma Semanal',
      title: 'Horarios de Recolección',
      sub: 'Consulta los días y horas estimados de paso de los camiones.'
    },
    registro: {
      badge: 'Reportes ciudadanos',
      title: 'Registra un incidente',
      sub: 'Cuéntanos qué está pasando en tu zona y lo enviamos directo a la cuadrilla.'
    }
  };

  let audioCtx = null;

  function switchTab(tabId) {
    document.querySelectorAll('.subpage').forEach(el => el.classList.remove('active'));
    document.getElementById('sub-' + tabId).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.nav-links a[data-tab="${tabId}"]`).classList.add('active');

    // El texto de cada sección ya vive en su propio bloque .page-intro dentro del HTML,
    // así que aquí solo nos encargamos de la navegación y las animaciones.
    document.getElementById('navLinks').classList.remove('open');
    lucide.createIcons();

    if (tabId === 'mapa' && window.CHASQUI_MAP) {
      setTimeout(() => window.CHASQUI_MAP.invalidateSize(), 100);
    }

    setTimeout(observarReveal, 30);
  }

  function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
  }

  // ---- Reveal on scroll dentro del contenedor visible actualmente ----
  let observer = null;
  function observarReveal() {
    if (observer) observer.disconnect();
    const activo = document.querySelector('.subpage.active');
    if (!activo) return;
    const root = activo.classList.contains('overflow-y-auto') ? activo : null;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { root, threshold: 0.15 });

    activo.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ---- Contadores animados de las tarjetas de estadísticas ----
  function animarContadores() {
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const decimales = el.dataset.target.includes('.') ? 1 : 0;
      const duracion = 900;
      const inicio = performance.now();

      function tick(ahora) {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const valor = target * progreso;
        el.textContent = valor.toFixed(decimales) + suffix;
        if (progreso < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // ---- Botón volver arriba, compartido entre subpáginas con scroll ----
  function initBackToTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;
    document.querySelectorAll('.subpage.overflow-y-auto, .subpage').forEach(sp => {
      sp.addEventListener('scroll', () => {
        btn.classList.toggle('visible', sp.scrollTop > 240);
      });
    });
    btn.addEventListener('click', () => {
      const activo = document.querySelector('.subpage.active');
      if (activo) activo.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function playNotificationSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.start(); osc.stop(audioCtx.currentTime + 0.5);
  }

  // ---- Notificaciones del sistema (Web Notifications API) ----
  // Avisan al vecino aunque tenga la pestaña minimizada o esté en otra app
  // (el navegador debe seguir abierto en segundo plano; no es un push del
  // sistema operativo con el navegador cerrado, eso requiere infraestructura
  // adicional de servidor).
  function solicitarPermisoNotificaciones() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Promise.resolve(Notification.permission);
    }
    return Notification.requestPermission();
  }

  function mostrarNotificacionSistema(titulo, opciones) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const notif = new Notification(titulo, opciones);
      notif.onclick = () => { window.focus(); notif.close(); };
    } catch (err) {
      console.warn('No se pudo mostrar la notificación del sistema:', err);
    }
  }

  function estadoPermisoNotificaciones() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'glass-card';
    toast.style.cssText = 'position:fixed; bottom:88px; right:22px; z-index:2000; padding:12px 18px; font-size:13px; border-left:3px solid var(--green); animation:fadeIn .2s ease;';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function initAccesibilidadTeclado() {
    document.querySelectorAll('[role="button"]').forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });
  }

  function initNav() {
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(a.dataset.tab);
      });
    });
    document.getElementById('navBurger').addEventListener('click', toggleMenu);
    initAccesibilidadTeclado();
  }

  // Toggle card helper
  window.toggleCard = function(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    card.classList.toggle('collapsed');
    
    // Cambiar la rotación del chevron
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // Inicializar colapso en pantallas móviles
  document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const filterCard = document.getElementById('filter-card');
        const gpsCard = document.getElementById('gps-card');
        if (filterCard) filterCard.classList.add('collapsed');
        if (gpsCard) gpsCard.classList.add('collapsed');
        if (window.lucide) window.lucide.createIcons();
      }, 300);
    }
  });

  return {
    switchTab, playNotificationSound, showToast, initNav, observarReveal, animarContadores, initBackToTop,
    solicitarPermisoNotificaciones, mostrarNotificacionSistema, estadoPermisoNotificaciones
  };
})();
