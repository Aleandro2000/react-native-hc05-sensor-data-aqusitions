#include <dht.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <math.h>

#define MODULATION_RATE 9600
#define DHT_PIN 7
#define LED_PIN 8
#define ACTION_1_PIN 9  // Negative Action
#define ACTION_2_PIN 10 // Positive Action

dht DHT;
SoftwareSerial BT(2, 3);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup()
{
  Serial.begin(MODULATION_RATE);
  BT.begin(MODULATION_RATE);
  pinMode(LED_PIN, OUTPUT);
  pinMode(ACTION_1_PIN, OUTPUT);
  pinMode(ACTION_2_PIN, OUTPUT);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  delay(1000);
  lcd.clear();
}

void loop()
{
  // Check if Bluethoot is available
  if (BT.available())
  {
    char cmd = BT.read();
    digitalWrite(LED_PIN, cmd == '1' ? HIGH : LOW);
    Serial.println(cmd == '1' ? "LED On" : "LED Off");
  }

  // Check if Bluethoot is readable
  int chk = DHT.read11(DHT_PIN);
  if (chk != DHTLIB_OK)
  {
    Serial.println("DHT read failed");
    return;
  }

  // Get temperature and humidity from DHT sensor
  float temp = DHT.temperature;
  float hum = DHT.humidity;

  // Calculate Heat Index
  float heatIndex = -8.784695 + 1.61139411 * temp + 2.338549 * hum - 0.14611605 * temp * hum - 0.01230809 * pow(temp, 2) - 0.01642482 * pow(hum, 2) + 0.00221173 * pow(temp, 2) * hum + 0.00072546 * temp * pow(hum, 2) - 0.00000358 * pow(temp, 2) * pow(hum, 2);

  // Calculate Dew Point
  float dewPoint = temp - ((100 - hum) / 5.0);

  // Calculate Absolute Humidity
  float absHumidity = 6.112 * exp((17.67 * temp) / (temp + 243.5));
  absHumidity = absHumidity * hum * 2.1674 / (273.15 + temp);

  // Activate execution element
  if (temp >= 24.0 || hum >= 56.0)
  {
    digitalWrite(ACTION_1_PIN, LOW);
    digitalWrite(ACTION_2_PIN, HIGH);
  }
  else
  {
    digitalWrite(ACTION_1_PIN, LOW);
    digitalWrite(ACTION_2_PIN, LOW);
  }

  // Get data for sending on Bluethoot
  unsigned long timestamp = millis();
  String data = "{\"temperature\":" + String(temp, 2) +
                ",\"humidity\":" + String(hum, 2) +
                ",\"heatIndex\":" + String(heatIndex, 2) +
                ",\"dewPoint\":" + String(dewPoint, 2) +
                ",\"absHumidity\":" + String(absHumidity, 2) +
                ",\"status\":\"" + (temp >= 24.0 || hum >= 56.0 ? "ALERT" : "NORMAL") +
                ",\"timestamp\":" + String(timestamp) + "}";

  // Send data on Bluethoot
  BT.println(data);
  Serial.println(data);
  
  // Print results on LCD
  lcd.setCursor(0, 0);
  lcd.print("T:" + String(temp, 1) + "C H:" + String(hum, 0) + "% ");
  lcd.setCursor(0, 1);
  lcd.print("HI:" + String(heatIndex, 1) + " DP:" + String(dewPoint, 1));

  // Delay data acquisition by 1s
  delay(1000);
}
