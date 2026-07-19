// Pantalla de bienvenida: contadores del hero + navegación entre módulos
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  animarStatsHero();

  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      const href = card.dataset.href;
      if (href) {
        window.location.href = href;
      } else {
        mostrarToastProximamente(card.querySelector('.module-title').textContent);
      }
    });
  });
});

function animarStatsHero() {
  document.querySelectorAll('.hero-stat-value[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimales = el.dataset.target.includes('.') ? 1 : 0;
    const duracion = 1100;
    const inicio = performance.now();

    function tick(ahora) {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      el.textContent = (target * progreso).toFixed(decimales) + suffix;
      if (progreso < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function mostrarToastProximamente(nombreModulo) {
  const toast = document.createElement('div');
  toast.className = 'glass-card';
  toast.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:2000; padding:12px 18px; font-size:13px; border-left:3px solid var(--gold); animation:fadeIn .2s ease;';
  toast.textContent = `"${nombreModulo}" está en desarrollo — próximamente disponible.`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
