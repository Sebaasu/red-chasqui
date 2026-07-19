#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include "BluetoothSerial.h" // Librería de Bluetooth Clásico integrada

// Definición de pines para el ESP32 receptor genérico + SX1276
#define SCK     18
#define MISO    19
#define MOSI    23
#define SS      5
#define RST     14
#define DIO0    2  // Pin DIO0 del módulo LoRa
#define BAND    915E6

// LED integrado para indicador físico
#define LED_PIN 2

BluetoothSerial SerialBT;

byte calcularChecksum(String str);

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  Serial.println("\n==========================================");
  Serial.println(" INICIALIZANDO ESP32 RECEPTOR V2 + BT (NO-T-BEAM)");
  Serial.println("==========================================");

  // Configurar LED integrado
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // 1. Inicializar Bluetooth Clásico
  if (!SerialBT.begin("Chasqui_Receptor")) {
    Serial.println("[ERROR] No se pudo inicializar el Bluetooth.");
    while(1);
  }
  Serial.println("[Bluetooth] Transmisor SPP listo: 'Chasqui_Receptor'");

  // 2. Inicializar Radio LoRa
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DIO0);
  
  if (!LoRa.begin(BAND)) {
    Serial.println("[ERROR] ¡Error al iniciar el chip LoRa SX1276!");
    while (1);
  }

  // Configuración de robustez LoRa matching con el emisor v2
  LoRa.enableCrc();          // Habilitar descarte por hardware CRC
  LoRa.setCodingRate4(8);    // Tasa de codificación 4/8 (FEC)

  Serial.println("[LoRa] Receptor listo en 915.0 MHz con CRC y FEC 4/8.");
  Serial.println("==========================================\n");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String payload = "";
    while (LoRa.available()) {
      payload += (char)LoRa.read();
    }

    int rssi = LoRa.packetRssi();

    // Buscar delimitador de checksum '*'
    int asteriskIdx = payload.indexOf('*');
    if (asteriskIdx != -1) {
      String mensaje = payload.substring(0, asteriskIdx);
      String csRecibidoHex = payload.substring(asteriskIdx + 1);

      // Recalcular Checksum localmente
      byte csCalculado = calcularChecksum(mensaje);
      String csCalculadoHex = String(csCalculado, HEX);

      // Normalizar a mayúsculas para comparar
      csCalculadoHex.toUpperCase();
      csRecibidoHex.toUpperCase();

      if (csCalculadoHex == csRecibidoHex) {
        // --- TRAMA VÁLIDA ---
        // Construir mensaje de log delimitado por '$' e inyectar RSSI
        String cleanMessage = "$" + mensaje + "|RSSI:" + String(rssi) + "$";

        // Enviar por USB y Bluetooth
        Serial.println(cleanMessage);
        SerialBT.println(cleanMessage);

        // Destello rápido en el LED para indicar recepción exitosa
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
      } else {
        // --- ERROR DE VALIDACION (TRAMA CORRUPTA) ---
        Serial.println("[CHECKSUM ERROR] Esperado: " + csCalculadoHex + ", Recibido: " + csRecibidoHex);
        SerialBT.println("$ERROR:Checksum_Invalid$");

        // Destello triple rápido de error en el LED
        for (int i = 0; i < 3; i++) {
          digitalWrite(LED_PIN, HIGH);
          delay(80);
          digitalWrite(LED_PIN, LOW);
          delay(80);
        }
      }
    } else {
      // --- TRAMA SIN CHECKSUM ---
      Serial.println("[ERROR] Trama recibida sin formato de Checksum.");
    }
  }
}

// Calcula el checksum XOR acumulativo de un string
byte calcularChecksum(String str) {
  byte check = 0;
  for (unsigned int i = 0; i < str.length(); i++) {
    check ^= str[i];
  }
  return check;
}
