// Barras de nivel de llenado de contenedores (reutiliza los datos cargados por map.js)
document.addEventListener('chasqui:contenedores-listos', (e) => {
  const cont = document.getElementById('fill-bars');
  if (!cont) return;
  const contenedores = e.detail;

  cont.innerHTML = contenedores.map(c => {
    const color = c.nivel >= 80 ? 'var(--coral)' : (c.nivel >= 50 ? 'var(--gold)' : 'var(--green)');
    return `
      <div class="fill-item">
        <div class="fill-header">
          <span class="fill-name"><span class="fill-dot" style="background:${color}"></span>${c.nombre}</span>
          <span class="fill-pct">${c.nivel}%</span>
        </div>
        <div class="fill-track">
          <div class="fill-bar" style="width:${c.nivel}%; background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');
});
