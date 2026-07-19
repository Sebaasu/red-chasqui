# RED CHASQUI · GUÍA Y ESTRUCTURA DEL PITCH MEJORADA (5 MINUTOS)
**Estrategia de presentación y defensa técnica ante el Jurado de la Hackatón (GAMLP)**  

---

## ⏱️ Estructura del Pitch Minuto a Minuto (Límite Estricto: 5 Minutos)

### Diapositiva 1: El Desafío Paceño (1:00 min)
* **Visual:** Imagen contrastante de La Paz (topografía accidentada, laderas de alto riesgo, tráfico congestionado y basura en las esquinas).
* **Guión narrativo:**  
  *"En La Paz, la geografía nos define, pero también nos desafía. La acumulación de basura en sumideros provoca inundaciones, la topografía causa 'sombras' en la cobertura celular, y el tráfico vehicular se planifica sin datos reales en tiempo real. ¿Cómo resolvemos estos tres grandes problemas urbanos con una sola infraestructura? Presentamos la **Red Chasqui**, el sistema circulatorio de datos inteligentes para La Paz."*

### Diapositiva 2: El Eje Impulsor: Gestión de Residuos (1:00 min)
* **Visual:** Diagrama del flujo de recolección inteligente. Contenedores miden nivel y camiones notifican paso a geocercas vecinales de 250 metros.
* **Guión narrativo:**  
  *"Aunque la Red Chasqui tiene potencial multi-categoría, elegimos **Gestión de Residuos Sólidos** como nuestro punto de partida estratégico. ¿Por qué? Porque tiene un **impacto vecinal inmediato** en el día a día. Otras soluciones (como rutas de tráfico o sensores de deslizamiento) exigen años de planificación y normativas. La basura es un reto cotidiano que resolvemos hoy mismo, dejando instalada la red LoRa en los miradores para habilitar todos los demás servicios gratis."*

### Diapositiva 3: Viabilidad Técnica Comprobada (1:00 min)
* **Visual:** Fotos del prototipo físico (T-Beam + ESP32) y captura de la consola IoT recibiendo datos del camión.
* **Guión narrativo:**  
  *"Nuestra solución ya fue probada físicamente en el entorno real de La Paz. El prototipo que construimos con una inversión de **850 Bs** superó la atenuación física y electromagnética del centro urbano. Programamos un firmware de alta resiliencia que reconstruye paquetes perdidos en el aire y descarta interferencias, logrando un enlace inalámbrico robusto y estable a **2.0 kilómetros de distancia** en zonas de alta densidad como Sopocachi."*

### Diapositiva 4: Impacto Económico: El Ahorro de 900.000 Bs (1:00 min)
* **Visual:** Gráfico comparativo de OpEx a 5 años (GSM celular vs. Red Chasqui).
* **Guión narrativo:**  
  *"Hablemos de números. Un rastreador celular convencional (GSM) cuesta entre 300 y 400 Bs, pero requiere un plan de datos telefónicos de ~50 Bs mensuales. Para una flota municipal pequeña de 300 vehículos, usar redes celulares le cuesta al municipio **180.000 Bs al año y casi un millón de Bs (900.000 Bs) en 5 años**.  
  La Red Chasqui transmite de manera **completamente gratuita (0 Bs)** sobre la frecuencia libre municipal, haciendo que la inversión en hardware se recupere sola en los primeros meses de operación."*

### Diapositiva 5: Autosostenibilidad y Escalabilidad Multioficio (1:00 min)
* **Visual:** El mapa modular mostrando alertas de ríos, estacionamientos inteligentes y el modelo de negocio para particulares.
* **Guión narrativo:**  
  *"Para hacer el proyecto autosostenible, la alcaldía puede ofrecer servicios de rastreo y seguridad a flotas de transporte escolar, camiones comerciales y particulares, cobrando una suscripción a **precio justo**. Los ingresos generados financiarán el mantenimiento de toda la infraestructura.  
  Instalada esta red troncal de datos en los miradores, podemos conectar de inmediato sensores de nivel de ríos para prevenir inundaciones, estacionamiento inteligente y alumbrado público con costo de transmisión cero. La Paz no necesita contratar planes móviles comerciales; necesita activar la Red Chasqui. Muchas gracias."*

---

## 💬 Respuestas Clave para la Defensa en Q&A (Preguntas y Respuestas)

### 1. ¿Cómo se justifica la inversión de gateways si la alcaldía no los tiene instalados actualmente?
* **Respuesta:** *"La instalación de gateways LoRa es la propuesta central de infraestructura de Red Chasqui. Gracias a la topografía de La Paz, no necesitamos instalar cientos de antenas como las telefónicas móviles. Colocando una antena en cada mirador clave (como Killi Killi, Jach'a Kollo, etc.), resolvemos el problema de cobertura para más del 90% del municipio con una inversión marginal en comparación a lo que la alcaldía gastaría en suscripciones de datos móviles comerciales."*

### 2. ¿Cómo se logra la autosostenibilidad con particulares?
* **Respuesta:** *"Hoy en día, una empresa de distribución o un padre de familia paga tarifas elevadas por rastrear un vehículo comercial con sistemas privados. Al ofrecerles rastreo de bajo costo a través de la Red Chasqui a un **precio justo**, les damos una solución accesible y generamos un canal de ingresos estable para el municipio. Estos recursos se canalizan directamente para expandir y mantener la red de sensores de riesgos y servicios públicos."*

### 3. ¿Qué otros sensores se benefician de la misma red?
* **Respuesta:** *"Cualquier sensor compatible con LoRaWAN. Podemos conectar transductores de presión y ultrasonido para medir el cauce de los ríos paceños y alertar sobre desbordes; sensores magnéticos de estacionamiento en Sopocachi para dinamizar el tráfico; y acelerómetros en laderas de riesgo geológico. Todos estos datos fluirán por el mismo sistema de datos abiertos sin añadir un solo centavo a los gastos de red del municipio."*
