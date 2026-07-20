# Red Chasqui · GAMLP
Plataforma IoT municipal y red de telemetría de espectro libre (LoRaWAN) para la optimización de servicios urbanos en La Paz, Bolivia.

---

## 1. Visión y Alcance del Proyecto
La **Red Chasqui** es una infraestructura inteligente diseñada para la compleja topografía de La Paz. Propone el despliegue de gateways LoRaWAN propios de la alcaldía ubicados estratégicamente en los miradores de la hoyada, logrando **más de un 90% de cobertura urbana** con línea de vista directa (LOS).

Aunque la red da soporte a múltiples verticales del Plan Integral La Paz 2050 (Movilidad Sostenible, Ciudad Inteligente, Gestión Vial y Prevención de Riesgos), se ha seleccionado el módulo de **Gestión de Residuos Sólidos** como nuestro **eje impulsor principal**. Esto se debe a su **impacto vecinal inmediato** en la población (notificaciones sonoras de proximidad del camión y estado de contenedores).

Para alinearnos directamente con la crisis de residuos y el inminente cierre del relleno de Alpacoma, la plataforma incorpora **Separación en Origen de 4 Categorías** (Basura Común ⚪, Plásticos 🟡, Papel/Cartón 🔵, Islas Verdes 🟢) mediante imágenes y bordes diferenciados en el mapa, acompañados de un banner dinámico de **eco-consejos** para concientización ciudadana. Toda la interfaz del mapa cuenta con **tarjetas colapsables** automáticas en teléfonos móviles para facilitar el uso vecinal en campo.

---

## 2. Estructura del Repositorio

```text
red-chasqui/
├── index.html                   → Portal de inicio de Red Chasqui (Menú de módulos)
├── server.py                    → Servidor HTTP de desarrollo en Python + Seeder SQLite
├── propuesta_tecnica_chasqui.md → Propuesta técnica formal para la hackatón
├── pitch_chasqui.md             → Guía y estructura del pitch de 3 minutos (Presentación)
├── css/
│   └── styles.css               → Estilos CSS unificados (Ecológicos / Oscuro y Claro)
├── js/
│   ├── particles.js             → Animación del fondo de red de sensores
│   ├── landing.js               → Contadores y navegación del Hero
│   ├── ui.js                    → Navegación interna, sonidos sintéticos y toasts
│   ├── map.js                   → Renderizado de Leaflet GPS y lógica de camiones
│   ├── containers.js            → Barras de progreso de contenedores
│   ├── reports.js               → Envío y persistencia de reportes vecinales
│   └── app.js                   → Coordinador del ciclo de vida del módulo
├── residuos/                    → MÓDULO ACTIVO: Gestión de Residuos
│   ├── index.html               → Interfaz del mapa y reportes ciudadanos
│   └── config.js                → Configuración local del mapa y geocercas
├── coordenadas/                 → DATASETS: Coordenadas adquiridas y trazadas
│   ├── contenedores.txt         → Ubicaciones de los 22 contenedores de Sopocachi
│   ├── ruta1.txt                → Ruta de recolección Centro-Sopocachi
│   ├── ruta2.txt                → Ruta de recolección San Pedro-Miraflores
│   └── ruta3.txt                → Ruta de recolección Sopocachi Auxiliar
├── hardware/                    → HARDWARE: Firmwares de prototipado y scripts
│   ├── firmware_emisor/         → Firmware V1 del emisor (T-Beam GPS + LoRa)
│   ├── firmware_emisor_v2/      → Firmware V2 del emisor (Optimizado con FEC)
│   ├── firmware_receptor/       → Firmware V1 del receptor (ESP32 + LoRa Gateway)
│   ├── firmware_receptor_v2/    → Firmware V2 del receptor (Optimizado con Bluetooth SPP)
│   └── clean_gps.py             → Script Python de filtrado de picos (Outliers) GPS
├── php/                         → Código de referencia del Backend PHP
└── data/                        → Almacenamiento local de base de datos SQLite
```

---

## 3. Hardware y Firmwares de Prototipado
El prototipo funcional de emisor-receptor se construyó con un costo combinado de **850 Bs.**, comparándose favorablemente frente a los altos costos operativos mensuales de los rastreadores GSM comerciales.

### Especificaciones de los Componentes
* **Nodo Emisor (T-Beam V1.2):** Microcontrolador ESP32, transceptor LoRa SX1276 (915 MHz), módulo GPS NEO-6M, chip de control de energía AXP2101 y pantalla OLED SSD1306.
* **Nodo Receptor (Gateway Local):** ESP32 genérico conectado vía SPI al transceptor LoRa SX1276.

### Versiones de Firmware (`/hardware/`)
* **Versión 1 (Básica):** Enlace LoRa simple para transmisión de datos seriales.
* **Versión 2 (Optimización para Entorno Urbano):**
  * **Forward Error Correction (FEC):** Reconstrucción física de paquetes corruptos en el aire, garantizando enlaces estables a **2.0 km** a través de edificios altos de La Paz.
  * **Suma de Verificación XOR y CRC:** Descarte de bytes corruptos por interferencias eléctricas.
  * **Bluetooth SPP Datalogger:** Volcado inalámbrico de tramas al smartphone del operario, eliminando el ruido y desgaste físico de cables.

---

## 4. Ejecución del Proyecto

### A. Ejecución Local (Con Servidor de Desarrollo Python)
El archivo `server.py` emula todos los servicios del backend PHP y crea de forma dinámica la base de datos SQLite sembrando los contenedores y rutas desde la carpeta `coordenadas/`:

1. Asegúrate de tener Python 3 instalado.
2. Corre el servidor en la raíz del proyecto:
   ```bash
   python3 server.py
   ```
3. Abre en tu navegador: **[http://localhost:8000](http://localhost:8000)**

### B. Ejecución Estática (GitHub Pages / Sin Servidor)
La aplicación web cuenta con un **fallback de contingencia estática**. Si las peticiones al servidor fallan (por ejemplo, al hospedar el código en GitHub Pages), el sistema:
1. Carga las rutas y contenedores directamente desde arrays internos en Javascript.
2. Utiliza la memoria **`localStorage`** del navegador del vecino para guardar, consultar e interactuar con los reportes comunitarios de forma persistente sin perder los datos al refrescar la página.

---

## 5. Licencia
Este proyecto es de código abierto y cumple con los requerimientos de licenciamiento libre estipulados en las bases de la hackatón del GAMLP.
