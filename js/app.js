// Inicialización general de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  CHASQUI_UI.initNav();
  CHASQUI_UI.initBackToTop();
  CHASQUI_MAP_MODULE.initMap();
  CHASQUI_REPORTS.cargarReportesRecientes();
  CHASQUI_UI.observarReveal();

  document.getElementById('btn-enviar-reporte')
    .addEventListener('click', CHASQUI_REPORTS.enviarReporte);

  // fecha en el footer / año dinámico si se usa en algún lugar
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
});
