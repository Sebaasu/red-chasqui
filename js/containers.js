// Barras de nivel de llenado de contenedores (reutiliza los datos cargados por map.js)
document.addEventListener('chasqui:contenedores-listos', (e) => {
  const cont = document.getElementById('fill-bars');
  if (!cont) return;
  const contenedores = e.detail;

  cont.innerHTML = contenedores.map(c => {
    const color = c.nivel >= 80 ? 'var(--coral)' : (c.nivel >= 50 ? 'var(--gold)' : 'var(--green)');
    
    let tipoBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">General</span>';
    if (c.tipo === 'plastico') {
      tipoBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 ml-2">Plástico</span>';
    } else if (c.tipo === 'papel') {
      tipoBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-2">Papel</span>';
    }

    return `
      <div class="fill-item">
        <div class="fill-header">
          <span class="fill-name"><span class="fill-dot" style="background:${color}"></span>${c.nombre}${tipoBadge}</span>
          <span class="fill-pct">${c.nivel}%</span>
        </div>
        <div class="fill-track">
          <div class="fill-bar" style="width:${c.nivel}%; background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');
});
