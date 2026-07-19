# Red Chasqui · GAMLP

Infraestructura de monitoreo LoRa + GPS para La Paz. La pantalla principal
(`index.html`) es la bienvenida a la red y el menú de funcionalidades;
cada funcionalidad vive en su propia carpeta como un "módulo" independiente
que comparte el mismo backend PHP y los mismos estilos base.

```
red-chasqui/
├── index.html              → Bienvenida a Red Chasqui + menú de módulos
├── css/
│   └── styles.css          → Estilos compartidos (navbar, cards, botones,
│                              partículas, landing, y estilos del módulo de residuos)
├── js/
│   ├── particles.js        → Fondo animado de partículas (red de sensores)
│   ├── landing.js           → Contadores del hero + navegación de módulos
│   ├── ui.js                 → Navegación interna, reveal, contadores, toasts
│   ├── map.js                 → Lógica de mapa Leaflet (usada por el módulo de residuos)
│   ├── containers.js          → Barras de nivel de contenedores
│   ├── reports.js             → Envío/consulta de reportes
│   └── app.js                  → Inicialización del módulo de residuos
├── residuos/                  → MÓDULO: Gestión de Residuos (el único ya funcional)
│   ├── index.html
│   └── config.js                → Configuración propia del módulo (rutas relativas)
├── php/                        → Backend compartido entre módulos
│   ├── db.php                        → Conexión SQLite + creación de tablas
│   ├── get_containers.php
│   ├── get_truck_position.php
│   ├── submit_report.php
│   └── get_reports.php
└── data/
    └── chasqui.sqlite       → Se crea automáticamente al primer uso
```

## Módulos

- **Gestión de Residuos** (`/residuos/`): completamente funcional — mapa en vivo,
  reportes ciudadanos, estadísticas y comunidad.
- **Monitoreo Antitrameaje**, **Optimización Vial**, **Seguridad Vehicular**,
  **Alumbrado Inteligente** y **Alerta de Ríos**: aparecen en el menú principal
  como tarjetas "Próximamente" / "Núcleo del proyecto". Al hacer clic muestran
  un aviso — son los siguientes módulos a construir sobre la misma red de
  8 gateways LoRa.

## Cómo ejecutarlo

```bash
cd red-chasqui
php -S localhost:8000
```

Abre `http://localhost:8000` — verás la bienvenida a Red Chasqui. Desde ahí
entras a "Gestión de Residuos" para el módulo funcional.

## Cómo agregar un nuevo módulo

1. Crea una carpeta nueva, p. ej. `red-chasqui/antitrameaje/`.
2. Copia `residuos/config.js` como base y ajusta `apiBase` a `'../php/'`.
3. Enlaza `../css/styles.css` y los scripts de `../js/` que necesites.
4. En `index.html`, cambia la tarjeta correspondiente: agrega
   `data-href="antitrameaje/index.html"` y cambia su `.module-status` a
   `status-activo`.
