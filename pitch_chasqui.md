# RED CHASQUI · GUÍA Y ESTRUCTURA DEL PITCH DE ALTO IMPACTO (3 MINUTOS)
**Estrategia de presentación y defensa técnica ante el Jurado de la Hackatón (GAMLP)**  

---

## ⏱️ Estructura del Pitch Minuto a Minuto (Límite Estricto: 3 Minutos)

### Diapositiva 1: El Desafío Paceño e Infraestructura LoRa (0:45 min)
* **Visual:** Mapa topográfico de La Paz (hoyada, miradores altos) mostrando el colapso del relleno sanitario de Alpacoma y basura en las laderas.
* **Guión narrativo:**  
  *"En La Paz, la topografía accidentada y la inminente rescisión del contrato con el relleno de Alpacoma nos exigen soluciones inmediatas. La acumulación de residuos provoca inundaciones y riesgos sanitarios, pero la alcaldía carece de datos en tiempo real. Presentamos la **Red Chasqui**, una infraestructura de telecomunicaciones IoT propia del municipio. Al instalar un Gateway LoRa en miradores clave como Killi Killi o Jach'a Kollo, logramos una cobertura de espectro libre (915 MHz) para **más del 90% de la urbe paceña** con una línea de vista natural directa."*

### Diapositiva 2: El Catalizador: Recolección y Clasificación en Origen (0:45 min)
* **Visual:** Capturas de la app móvil mostrando el mapa en tiempo real, el camión circulando, los contenedores clasificados y el menú de filtros desplegado.
* **Guión narrativo:**  
  *"Elegimos la **Gestión de Residuos** como nuestro eje impulsor por su impacto social diario. Desarrollamos una aplicación web ciudadana donde los vecinos reciben notificaciones cuando el camión está a 250 metros. Para combatir la crisis de Alpacoma, la app incorpora un sistema de **Separación en Origen**, permitiendo a los vecinos ubicar y filtrar en tiempo real 4 tipos de contenedores: Basura Común ⚪, Envases Plásticos 🟡, Papel y Cartón 🔵, e Islas Verdes 🟢. Además, la interfaz cuenta con un panel rotativo de eco-consejos de concientización y está optimizada para celulares mediante tarjetas colapsables."*

### Diapositiva 3: Viabilidad Técnica y Ahorro Municipal (0:45 min)
* **Visual:** Fotos del prototipo físico (T-Beam V1.2 y ESP32) y gráfico comparativo de OpEx a 5 años (GSM vs LoRa).
* **Guión narrativo:**  
  *"Nuestra solución ya funciona en el entorno real de La Paz. Construimos un prototipo físico emisor-receptor con una inversión de **850 Bs**, dotado de un firmware resiliente con Corrección de Errores (FEC) que garantiza enlaces estables a **2.0 km** cruzando edificios densos. Financieramente, rastrear una flota municipal de 300 vehículos usando redes celulares tradicionales (GSM) le costaría a la alcaldía **180.000 Bs al año (900.000 Bs en 5 años)** en planes de telefonía. Con la Red Chasqui de frecuencia libre, el costo de transmisión es de **0 Bs**, recuperando la inversión en pocos meses."*

### Diapositiva 4: Sostenibilidad y Futuro Multi-sistema (0:45 min)
* **Visual:** Diagrama de red troncal conectando múltiples sensores (ríos, deslizamientos, parqueos) y flotas particulares.
* **Guión narrativo:**  
  *"Hacemos este proyecto autosostenible permitiendo que vehículos particulares, radiotaxis o transporte escolar usen nuestra red de rastreo mediante una suscripción a **precio justo**, financiando el mantenimiento de la red. Una vez desplegada esta autopista de datos en los miradores, el municipio puede conectar sin costo de transmisión adicional: sensores de cauce de ríos en Choqueyapu para prevenir inundaciones, acelerómetros para monitorear deslizamientos en laderas y parqueos inteligentes. La Paz no necesita contratar planes móviles comerciales; necesita activar la Red Chasqui. Muchas gracias."*

---

## 💬 Respuestas Clave para la Defensa en Q&A (Preguntas y Respuestas)

### 1. ¿Por qué se optó por una interfaz colapsable en la aplicación móvil?
* **Respuesta:** *"Durante nuestras pruebas en Sopocachi, notamos que en la pantalla de un celular los paneles informativos bloqueaban la visibilidad del mapa. Implementamos tarjetas colapsables que en pantallas móviles se pliegan automáticamente al cargar la página. Esto da prioridad al mapa Leaflet para que el vecino localice su camión rápidamente y solo despliegue los paneles de reciclaje y GPS con un toque simple."*

### 2. ¿Cómo responde el proyecto directamente al jurado de la Unidad de Gestión de Residuos?
* **Respuesta:** *"El proyecto ataca la raíz del problema de la basura en La Paz: la falta de clasificación que acelera el colapso de Alpacoma. En lugar de tratar los residuos de forma indiferenciada, nuestra plataforma mapea, clasifica y enseña al vecino a reciclar a través de consejos dinámicos integrados en el mapa, fomentando la separación en origen de plásticos y cartón directamente en los contenedores amarillos y azules distribuidos por el barrio."*

### 3. ¿Qué tan costoso es desplegar la red física de gateways LoRa?
* **Respuesta:** *"Sumamente económico. La Paz cuenta con la mayor ventaja para LoRaWAN: su topología. En lugar de instalar antenas cada 500 metros como exige la telefonía celular, solo requerimos un gateway LoRa en miradores principales. Con menos de 10 estaciones cubrimos más del 90% de la hoyada paceña, operando de forma 100% gratuita y bajo total soberanía de datos de la alcaldía."*
