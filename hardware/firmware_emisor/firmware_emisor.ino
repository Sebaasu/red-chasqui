
#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <TinyGPS++.h>
#include "SSD1306Wire.h"

// Manejo de Energia AXP2101
#define XPOWERS_CHIP_AXP2101
#include "XPowersLib.h"

// Definiciones de Pines para T-Beam V1.2
#define SCK         5
#define MISO        19
#define MOSI        27
#define SS          18
#define RST         23
#define DI0         26
#define BAND        915E6

// Pines del GPS NEO-6M
#define GPS_RX_PIN  34
#define GPS_TX_PIN  12

// Objetos globales
XPowersAXP2101 PMU;
SSD1306Wire display(0x3c, 21, 22);
TinyGPSPlus gps;

// Identificador unico del minibus (Ej. ID 1)
const uint16_t VEHICLE_ID = 1;

static void processGPS(unsigned long ms);

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  Serial.println("\n==========================================");
  Serial.println("  INICIALIZANDO T-BEAM EMISOR ANTITRAMEAJE");
  Serial.println("==========================================");

  // 1. Inicializar I2C y PMU AXP2101
  Wire.begin(21, 22);
  if (!PMU.begin(Wire, AXP2101_SLAVE_ADDRESS, 21, 22)) {
    Serial.println("[ERROR] No se pudo comunicar con la PMU AXP2101.");
    while (1);
  }

  // Activar canal DCDC1 (Pantalla OLED)
  PMU.setDC1Voltage(3300);
  PMU.enableDC1();

  // Activar canal ALDO2 (Modulo LoRa SX1276)
  PMU.setALDO2Voltage(3300);
  PMU.enableALDO2();

  // Activar canal ALDO3 (Modulo GPS NEO-6M)
  PMU.setALDO3Voltage(3300);
  PMU.enableALDO3();

  // 2. Diagnostico del modulo GPS NEO-6M por Puerto Serie
  Serial.println("[PMU] Canales de energia habilitados (OLED, LoRa, GPS).");
  Serial.print("[GPS] Inicializando puerto UART1 a 9600 baudios (RX: ");
  Serial.print(GPS_RX_PIN);
  Serial.print(", TX: ");
  Serial.print(GPS_TX_PIN);
  Serial.println(")...");

  Serial1.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // Esperar 1 segundo para verificar flujo de datos NMEA crudos desde el GPS
  delay(1000);
  if (Serial1.available()) {
    Serial.println("[GPS STATUS] ¡INICIALIZACION EXITOSA!");
    Serial.println("[GPS STATUS] El modulo NEO-6M responde y esta enviando tramas NMEA.");
  } else {
    Serial.println("[GPS STATUS] ALERTA: No se detectan datos en la UART del GPS.");
    Serial.println("[GPS STATUS] Verifique la alimentacion del canal ALDO3 en la AXP2101.");
  }

  // 3. Inicializar Pantalla OLED
  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);
  display.clear();
  display.drawString(0, 0, "Iniciando GPS & LoRa...");
  display.display();

  // 4. Inicializar Radio LoRa
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DI0);
  
  if (!LoRa.begin(BAND)) {
    Serial.println("[ERROR] No se pudo iniciar el chip LoRa SX1276.");
    display.clear();
    display.drawString(0, 0, "Error en LoRa!");
    display.display();
    while (1);
  }

  Serial.println("[LoRa] Transceptor listo operando en 915.0 MHz.");
  Serial.println("==========================================\n");
  
  display.clear();
  display.drawString(0, 0, "Sistema Listo");
  display.drawString(0, 20, "Buscando satelites...");
  display.display();
  delay(1500);
}

void loop() {
  // Procesar lecturas entrantes de la UART del GPS durante 5 segundos
  processGPS(5000);

  // Obtener datos del GPS (o ceros si no hay FIX)
  float lat = gps.location.isValid() ? gps.location.lat() : 0.0;
  float lng = gps.location.isValid() ? gps.location.lng() : 0.0;
  uint8_t speed = gps.speed.isValid() ? (uint8_t)gps.speed.kmph() : 0;
  uint8_t sats = gps.satellites.isValid() ? gps.satellites.value() : 0;

  // Actualizar Pantalla OLED
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_LEFT);
  display.setFont(ArialMT_Plain_10);
  
  display.drawString(0, 0, "Vehiculo ID: " + String(VEHICLE_ID));
  display.drawString(0, 16, "Sats: " + String(sats) + " | Vel: " + String(speed) + " km/h");
  
  if (gps.location.isValid()) {
    display.drawString(0, 32, "Lat: " + String(lat, 5));
    display.drawString(0, 48, "Lng: " + String(lng, 5));
  } else {
    display.drawString(0, 36, "GPS: Buscando FIX...");
  }
  display.display();

  // Transmitir Trama por LoRa (Texto claro por ahora)
  String payload = "ID:" + String(VEHICLE_ID) + 
                   "|Lat:" + String(lat, 6) + 
                   "|Lng:" + String(lng, 6) + 
                   "|Vel:" + String(speed) + 
                   "|Sats:" + String(sats);

  Serial.print("[LoRa Transmitiendo] ");
  Serial.println(payload);

  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();
}

// Lee de la UART1 del GPS mientras transcurre el tiempo indicado
static void processGPS(unsigned long ms) {
  unsigned long start = millis();
  do {
    while (Serial1.available()) {
      gps.encode(Serial1.read());
    }
  } while (millis() - start < ms);
}