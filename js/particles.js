// Fondo animado de la bienvenida: líneas de teleférico (al estilo Mi Teleférico
// de La Paz, "la ciudad de los teleféricos") con cabinas subiendo y bajando
// entre torres, en vez de la antigua red de partículas.
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;

  // Colores de cable/cabinas: se adaptan según el tema claro/oscuro activo
  let COLOR_CABLE = 'rgba(147, 167, 154, 0.28)';
  let COLORES_CABINA = ['34,197,94', '245,185,66', '255,92,92', '78,201,224'];

  function actualizarColoresPorTema() {
    const esClaro = document.body.dataset.theme === 'light';
    COLOR_CABLE = esClaro ? 'rgba(20, 42, 27, 0.28)' : 'rgba(147, 167, 154, 0.28)';
    COLORES_CABINA = esClaro
      ? ['15,105,60', '190,130,15', '196,58,58', '20,110,130']
      : ['34,197,94', '245,185,66', '255,92,92', '78,201,224'];
  }
  document.addEventListener('chasqui:theme-changed', actualizarColoresPorTema);
  actualizarColoresPorTema();

  // Definición de "líneas" de teleférico (como las líneas reales de Mi Teleférico:
  // Roja, Amarilla, Celeste, Verde...). Anclas en fracciones de pantalla para que
  // sea responsive; cada línea sube desde una ladera hacia otra, cruzando el cielo.
  const DEFINICION_LINEAS = [
    { desde: [-0.03, 0.90], hasta: [0.40, 0.08], colorIdx: 0, velocidad: 0.020 },
    { desde: [0.10, 1.05], hasta: [0.58, 0.02], colorIdx: 1, velocidad: 0.016 },
    { desde: [1.03, 0.78], hasta: [0.62, 0.06], colorIdx: 2, velocidad: 0.018 },
    { desde: [0.88, 1.04], hasta: [0.42, 0.20], colorIdx: 3, velocidad: 0.014 },
    { desde: [0.30, 1.06], hasta: [0.80, 0.32], colorIdx: 0, velocidad: 0.022 }
  ];

  let lineas = [];

  function construirLineas() {
    lineas = DEFINICION_LINEAS.map((def) => {
      const x1 = def.desde[0] * w, y1 = def.desde[1] * h;
      const x2 = def.hasta[0] * w, y2 = def.hasta[1] * h;
      return {
        x1, y1, x2, y2,
        colorIdx: def.colorIdx,
        cabinas: [
          { t: Math.random() * 0.5, dir: 1, velocidad: def.velocidad },
          { t: 0.5 + Math.random() * 0.5, dir: -1, velocidad: def.velocidad }
        ]
      };
    });
  }

  function ajustarTamano() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    construirLineas();
  }

  function dibujarTorre(x, y) {
    // Pequeño pilón/torre de soporte del cable
    ctx.strokeStyle = COLOR_CABLE;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 24);
    ctx.moveTo(x - 8, y + 24);
    ctx.lineTo(x + 8, y + 24);
    ctx.stroke();
  }

  function dibujarCabina(x, y, colorRGB) {
    // Hilo corto que conecta la cabina con el cable
    ctx.strokeStyle = `rgba(${colorRGB}, 0.55)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 6);
    ctx.stroke();

    // Cuerpo de la cabina (pequeño rectángulo con brillo)
    ctx.fillStyle = `rgba(${colorRGB}, 0.9)`;
    ctx.shadowColor = `rgba(${colorRGB}, 0.6)`;
    ctx.shadowBlur = 9;
    ctx.fillRect(x - 5, y + 6, 10, 7);
    ctx.shadowBlur = 0;
  }

  function paso() {
    ctx.clearRect(0, 0, w, h);

    lineas.forEach((linea) => {
      // Cable
      ctx.strokeStyle = COLOR_CABLE;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(linea.x1, linea.y1);
      ctx.lineTo(linea.x2, linea.y2);
      ctx.stroke();

      // Torres en ambos extremos (estaciones)
      dibujarTorre(linea.x1, linea.y1);
      dibujarTorre(linea.x2, linea.y2);

      // Cabinas subiendo y bajando por el cable
      const colorRGB = COLORES_CABINA[linea.colorIdx % COLORES_CABINA.length];
      linea.cabinas.forEach((cabina) => {
        cabina.t += cabina.velocidad * 0.01 * cabina.dir;
        if (cabina.t >= 1) { cabina.t = 1; cabina.dir = -1; }
        if (cabina.t <= 0) { cabina.t = 0; cabina.dir = 1; }
        const x = linea.x1 + (linea.x2 - linea.x1) * cabina.t;
        const y = linea.y1 + (linea.y2 - linea.y1) * cabina.t;
        dibujarCabina(x, y, colorRGB);
      });
    });

    requestAnimationFrame(paso);
  }

  window.addEventListener('resize', ajustarTamano);
  ajustarTamano();
  paso();
})();
