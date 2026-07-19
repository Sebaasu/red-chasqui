# RED CHASQUI · PROPUESTA TÉCNICA Y FINANCIERA MULTI-SISTEMA
**Convocatoria: Hackatón "Soluciones para mi Ciudad" (GAMLP)**  
**Ejes de Alineación:**  
1. **Ciudad Verde:** Gestión Integral de Residuos Sólidos (Eje Impulsor Principal).  
2. **Movilidad Urbana Sostenible:** Movilidad Eficiente y Responsable (Monitoreo y seguridad del transporte público/privado).  
3. **Ciudad Inteligente y Conectada:** Sistema Circulatorio de Datos Abiertos y Decisiones de Tránsito Basadas en Evidencia (Telemetría urbana masiva para planificación vial).  

**Proyecto:** Plataforma IoT y Red de Telemetría Municipal de Espectro Libre (Red Chasqui)  

---

## 1. Introducción y Visión del Proyecto
La **Red Chasqui** es una propuesta de **infraestructura inteligente y soberanía tecnológica municipal** diseñada específicamente para la accidentada topografía del Municipio de La Paz. 

El proyecto propone la **implementación de una red de gateways LoRaWAN propios de la alcaldía** para desplegar un sistema de telemetría urbana de espectro libre (915 MHz). Aunque la red tiene el potencial técnico de resolver problemas en múltiples categorías de la hackatón (prevención de desastres, tráfico vehicular o alumbrado), **el equipo ha seleccionado la categoría de "Gestión Integral de Residuos Sólidos" como nuestro catalizador estratégico y punto de partida**. 

Esta decisión responde al **efecto de impacto inmediato** que tiene la recolección de basura sobre el día a día de la población paceña, a diferencia de los otros módulos (como planes integrales de tránsito o geología de laderas) que requieren largos periodos de planificación, normativas y desarrollo a largo plazo. 

---

## 2. Eje Impulsor: Gestión de Residuos Sólidos
El monitoreo de la basura es el vehículo idóneo para desplegar la Red Chasqui en el territorio paceño:

* **Despliegue Rápido y Visible:** Instalar sensores en contenedores y rastreadores en los camiones de basura municipales es una intervención rápida y visible para la comunidad. Los vecinos experimentan de inmediato el beneficio de no tener basura expuesta a la intemperie gracias a las alertas de proximidad.
* **Sembrado de la Infraestructura Troncal:** Al justificar e instalar los gateways LoRa en los miradores de la hoyada para resolver el problema de la basura, **se deja instalada la red inalámbrica municipal de forma permanente**. Una vez que los camiones transmiten y la infraestructura está activa, habilitar los módulos de movilidad, riesgos y telegestión de luces tiene un costo de comunicación de **0 Bs**, convirtiendo una solución sectorial en un cerebro urbano integral.

---

## 3. Sinergia Topográfica: Los Miradores como Activos de Cobertura
La geografía paceña, caracterizada por una hoyada profunda rodeada de laderas empinadas, suele ser un obstáculo para las comunicaciones tradicionales de telefonía móvil. Sin embargo, para la tecnología LoRaWAN, esta topografía se convierte en una **ventaja de ingeniería estratégica**:

* **Línea de Vista Natural (LOS):** Los miradores y puntos altos de La Paz (como Killi Killi, Jach'a Kollo, Pampahasi y otros) tienen una visibilidad panorámica directa y sin obstáculos hacia los valles y barrios residenciales.
* **Máxima Cobertura con Mínima Inversión:** Al instalar un gateway LoRa municipal en cada uno de estos miradores estratégicos, se aprovecha esta elevación natural para lograr una cobertura que abarca **más del 90% de la urbe paceña**. Un área metropolitana de esta complejidad, que requeriría cientos de radiobases celulares comerciales, puede ser cubierta con un puñado de estaciones municipales.

---

## 4. Evidencia y Demostración Funcional

Para validar la solidez del proyecto, se ha implementado tanto el prototipo de hardware físico como la aplicación interactiva para la ciudadanía:

### A. Prototipo de Hardware (Emisor-Receptor)
Se construyeron nodos emisores autónomos listos para camión y contenedor, así como un gateway de prueba. El firmware desarrollado permite recuperar paquetes perdidos por obstrucción de edificios y filtrar ruidos de la red eléctrica.

![Fotografía del prototipo del nodo emisor y receptor LoRa de desarrollo](images/foto_prototipo.jpg)

### B. Aplicación Web Ciudadana (Interfaz en Tiempo Real)
El portal web responsivo (Ecological Theme) renderiza los camiones activos moviéndose por calles paceñas reales y muestra el estado en "semáforo" (verde, amarillo y rojo parpadeante) de los 22 contenedores de Sopocachi en base a la telemetría real.

![Captura de pantalla de la interfaz de usuario en tiempo real y mapa de calor de contenedores](images/screenshot_app.png)

---

## 5. Arquitectura y Capacidades del Prototipo
El sistema combina hardware de bajo consumo de energía y firmware de alta resiliencia optimizado para entornos de interferencia electromagnética urbana:

* **Hardware Emisor (Nodo Camión/Contenedor):** Basado en el prototipo de desarrollo T-Beam V1.2 y ESP32. Integra geolocalización satelital (GPS NEO-6M), transmisión de largo alcance (LoRa SX1276) y gestión de baterías de litio de alta duración para campo.
* **Hardware Receptor (Gateway Local / Nodo de Pruebas):** Diseñado con placas microcontroladoras conectadas a módulos LoRa y interfaces Bluetooth Clásico (SPP) para volcado inalámbrico de tramas directo al smartphone del operario.
* **Capacidades del Firmware:**
  * **Corrección de Errores Hacia Adelante (FEC):** Reconstruye automáticamente paquetes de datos que sufran pérdidas físicas de señal en el aire por causa de edificios altos, garantizando cobertura de hasta **2.0 km** en zonas de alta densidad como Sopocachi.
  * **Suma de Verificación XOR y CRC por Hardware:** Descarta de forma instantánea cualquier byte de datos que se corrompa por interferencia de la red eléctrica o ruido de RF.
  * **Enlace SPP Inalámbrico:** Canal Bluetooth que elimina el desgaste físico de puertos seriales y cables en los camiones durante la calibración.

---

## 6. Análisis de Viabilidad Económica e Investigación de Mercado

Para demostrar el impacto financiero del proyecto, se ha realizado una comparación de costos de inversión (CapEx) y costos operativos (OpEx) entre la **Red Chasqui (LoRaWAN)** y la alternativa comercial tradicional basada en **redes celulares GSM (Chips SIM)**:

### Costos de Dispositivos (CapEx)
* **Prototipo Chasqui (Desarrollado a medida):** El costo de construcción de nuestro prototipo funcional completo de emisor y receptor integrados fue de **850 Bs**. En un despliegue a gran escala de producción industrializada de hardware, este costo se reducirá a aproximadamente **250 - 320 Bs por nodo**.
* **Rastreadores Comerciales GSM (SIM):** Equipos convencionales como el Coban GPS303 cuestan entre **300 y 400 Bs**.
* **Rastreadores Comerciales LoRaWAN:** Modelos profesionales como el *Dragino TrackerD* oscilan entre **310 a 830 Bs** ($45 y $120 USD), mientras que equipos industriales rugerizados (como el *Digital Matter Oyster3*) cuestan de **970+ Bs** ($140 USD) en adelante.

### Costos de Operación y Transmisión (OpEx) - El Núcleo del Ahorro
El factor determinante para la viabilidad es el costo de **transmisión de datos**. Mientras que las redes GSM exigen un abono mensual a una operadora telefónica (Entel, Tigo, Viva), la Red Chasqui transmite de manera **gratuita** sobre espectro de radiofrecuencia libre:

#### Simulación Financiera para una flota municipal de 300 vehículos (Camiones, PumaKatari, patrullas):

| Modelo de Red | Tarifa mensual de datos por móvil | Costo Mensual Flota (300) | Costo Anual | Costo a 5 Años |
| :--- | :--- | :--- | :--- | :--- |
| **Alternativa Celular GSM (SIM)** | ~50 Bs. *(Plan Mínimo M2M)* | **15,000 Bs.** | **180,000 Bs.** | **900,000 Bs.** |
| **Red Chasqui (LoRa Municipal)** | **0 Bs.** | **0 Bs.** | **0 Bs.** | **0 Bs.** |
| **Ahorro Neto Municipal** | | **15,000 Bs.** | **180,000 Bs.** | **900,000 Bs.** |

> [!TIP]
> **Conclusión Financiera:** En solo 5 años de operación, la Red Chasqui le ahorra al GAMLP **casi un millón de Bolivianos** en gastos recurrentes de telecomunicaciones, cubriendo sobradamente el CapEx inicial de adquisición de hardware.

---

## 7. Modelo de Autosostenibilidad: Servicio a Particulares
Para que el proyecto no dependa exclusivamente del presupuesto fiscal de la alcaldía, la Red Chasqui tiene el potencial de transformarse en una **fuente de ingresos propia y un servicio social**:

1. **Rastreo Vecinal y Comercial (Autosostenible):** El GAMLP puede ofrecer el servicio de rastreo de vehículos particulares (ej. transporte escolar, radiotaxis, camiones de distribución comercial o vehículos privados de ciudadanos) a través de la Red Chasqui cobrando una suscripción de **precio justo** (significativamente menor que cualquier plan celular o servicio de rastreo satelital privado).
2. **Potencial de Ingresos:** Los ingresos generados por este servicio de valor agregado a particulares se destinarán al mantenimiento preventivo de los gateways municipales y a financiar la expansión de nuevos nodos sin costo adicional para las arcas de la comuna.

---

## 8. Proyectos Sinergísticos Habilitados por la Red Chasqui
Al instalar la Red Chasqui como canal troncal de comunicación municipal, la alcaldía adquiere la capacidad de conectar de inmediato otros proyectos IoT con costo de transmisión cero:

* **Medición Preventiva de Ríos:** Instalación de sensores de nivel de agua por ultrasonido en los principales ríos de la cuenca paceña (Choqueyapu, Orkojahuira, Irpavi). Permite anticipar crecidas y enviar alertas automáticas de deslizamiento e inundaciones sin pagar enlaces de comunicación comerciales.
* **Estacionamientos Inteligentes:** Sensores geomagnéticos instalados en el asfalto que informan en tiempo real qué espacios de estacionamiento tarifado en la hoyada están libres, reduciendo el congestionamiento y emisiones de carbono.
* **Telegestión de Alumbrado Público:** Sensores de luz y relés conectados que permiten regular la intensidad de las luminarias urbanas según las condiciones climáticas, logrando un ahorro sustancial en la factura eléctrica de la alcaldía.
* **Sensores de Ladera (Prevención de Deslizamientos):** Acelerómetros de ultra bajo costo para monitorear el movimiento microscópico de suelos en zonas críticas de riesgo geológico.
