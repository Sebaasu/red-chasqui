// Fondo dinámico de la pantalla de bienvenida: carrusel de imágenes (carpeta /fondos)
// + selector de tema claro/oscuro. Todo esto vive SOLO en index.html.
(function () {
  const contenedor = document.getElementById('bg-slideshow');

  // Imágenes disponibles en la carpeta /fondos
  const IMAGENES = [
    'fondos/LP.webp',
    'fondos/LP1.webp',
    'fondos/LP2.webp',
    'fondos/LP3.webp',
    'fondos/LP4.webp',
    'fondos/LP5.webp',
    'fondos/LP6.webp'
  ];

  const DURACION_MS = 7000; // tiempo que cada fondo permanece visible
  let indiceActual = 0;
  let slides = [];

  function crearSlides() {
    if (!contenedor) return; // el módulo de mapa no tiene slideshow, solo el toggle de tema
    IMAGENES.forEach((src) => {
      const slide = document.createElement('div');
      slide.className = 'bg-slide';
      slide.style.backgroundImage = `url("${src}")`;
      contenedor.appendChild(slide);
      slides.push(slide);
    });
    if (slides.length > 0) slides[0].classList.add('active');
  }

  function mostrarSiguiente() {
    if (slides.length < 2) return;
    const anterior = indiceActual;
    indiceActual = (indiceActual + 1) % slides.length;
    slides[anterior].classList.remove('active');
    slides[indiceActual].classList.add('active');
  }

  crearSlides();
  if (contenedor) setInterval(mostrarSiguiente, DURACION_MS);

  // ---------- Toggle de tema claro / oscuro ----------
  const CLAVE_TEMA = 'chasqui-theme';
  const body = document.body;
  const botonTema = document.getElementById('theme-toggle');

  function aplicarTema(tema) {
    body.dataset.theme = tema;
    if (botonTema) {
      const icono = botonTema.querySelector('i');
      if (icono) {
        icono.setAttribute('data-lucide', tema === 'light' ? 'sun' : 'moon');
      }
      botonTema.title = tema === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
      botonTema.setAttribute('aria-label', botonTema.title);
      if (window.lucide) window.lucide.createIcons();
    }
    document.dispatchEvent(new CustomEvent('chasqui:theme-changed', { detail: { tema } }));
  }

  const temaGuardado = localStorage.getItem(CLAVE_TEMA);
  aplicarTema(temaGuardado === 'light' ? 'light' : 'dark');

  if (botonTema) {
    botonTema.addEventListener('click', () => {
      const nuevoTema = body.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(CLAVE_TEMA, nuevoTema);
      aplicarTema(nuevoTema);
    });
  }
})();
