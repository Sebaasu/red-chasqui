#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include "SSD1306Wire.h" // De la libreria ThingPulse

// Manejo de Energia AXP2101
#define XPOWERS_CHIP_AXP2101
#include "XPowersLib.h"

// Definiciones de Pines para T-Beam V1.2
#define SCK     5
#define MISO    19
#define MOSI    27
#define SS      18
#define RST     23   // GPIO23 en T-Beam V1.2
#define DI0     26
#define BAND    915E6 // Banda libre de 915 MHz para Bolivia

XPowersAXP2101 PMU;
SSD1306Wire display(0x3c, 21, 22);

unsigned int counter = 0;

void setup() {
  Serial.begin(115200);
  
  // 1. Inicializar I2C y PMU para encender LoRa y OLED
  Wire.begin(21, 22);
  if (!PMU.begin(Wire, AXP2101_SLAVE_ADDRESS, 21, 22)) {
    Serial.println("Error AXP2101");
    while (1);
  }

  // Encender pantalla OLED (DCDC1) y radio LoRa (ALDO2)
  PMU.setDC1Voltage(3300);
  PMU.enableDC1();

  PMU.setALDO2Voltage(3300);
  PMU.enableALDO2();

  // 2. Inicializar Pantalla OLED
  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);
  display.clear();
  display.drawString(0, 0, "Iniciando LoRa...");
  display.display();

  // 3. Inicializar Radio LoRa
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DI0);
  
  if (!LoRa.begin(BAND)) {
    Serial.println("Error: No se pudo iniciar el chip LoRa!");
    display.clear();
    display.drawString(0, 0, "Error LoRa!");
    display.display();
    while (1);
  }

  Serial.println("LoRa Inicializado Correctamente en 915 MHz!");
  display.clear();
  display.drawString(0, 0, "LoRa Listo (915MHz)");
  display.display();
  delay(1000);
}

void loop() {
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_LEFT);
  display.setFont(ArialMT_Plain_10);
  
  display.drawString(0, 0, "Enviando Paquete:");
  display.drawString(0, 20, "Contador: " + String(counter));
  display.display();

  Serial.print("Enviando paquete: ");
  Serial.println(counter);

  // Transmitir trama por LoRa
  LoRa.beginPacket();
  LoRa.print("Minibus_01 | Trama: ");
  LoRa.print(counter);
  LoRa.endPacket();

  counter++;
  delay(2000);
}
