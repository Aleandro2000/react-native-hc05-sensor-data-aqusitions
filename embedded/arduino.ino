#include <dht.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define MODULATION_RATE 9600

#define DHT_PIN 7
#define LED_PIN 8
#define FAN_PIN 9

dht DHT;
SoftwareSerial BT(2, 3);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(MODULATION_RATE);
  BT.begin(MODULATION_RATE);
  pinMode(LED_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  delay(2000);
  lcd.clear();
}

void loop() {
  if (BT.available()) {
    char cmd = BT.read();
    digitalWrite(LED_PIN, cmd == '1' ? HIGH : LOW);
    Serial.println(cmd == '1' ? "LED On" : "LED Off");
  }

  int chk = DHT.read11(DHT_PIN);
  if (chk != DHTLIB_OK) {
    Serial.println("DHT read failed");
    return;
  }

  float temp = DHT.temperature;
  float hum = DHT.humidity;

  if (temp >= 30.0 || hum >= 70.0) {
    digitalWrite(FAN_PIN, HIGH);
  } else {
    digitalWrite(FAN_PIN, LOW);
  }

  String data = "{\"temperature\":" + String(temp, 2) + ",\"humidity\":" + String(hum, 2) + "}";
  Serial.println(data);
  BT.println(data);

  lcd.setCursor(0, 0);
  lcd.print("Temp: " + String(temp, 1) + "C   ");
  lcd.setCursor(0, 1);
  lcd.print("Hum: " + String(hum, 1) + "%   ");

  delay(1000);
}
