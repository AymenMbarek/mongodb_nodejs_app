#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>  // Inclure WiFiUdp pour le type WiFiUDP
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

#define WIFISSID "TurkTelekom_ZNJFC"
#define PASSWORD "6776163E2A9Fc"
#define TOKEN "BBUS-HWqZ81Bm8urybsEV8sdOh3DBfkYSUR"
#define MQTT_CLIENT_NAME "ESP8266Client"
#define VARIABLE_LABEL "ecg"
#define DEVICE_LABEL "ecg_monitoring_system"

const int SENSORPIN = A0;
#define ECG_RX_PIN RX
#define ECG_TX_PIN TX
#define GPS_RX_PIN D7
#define GPS_TX_PIN D8
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
TinyGPSPlus gps;

// Ubidots MQTT broker configuration
const char *mqttBroker = "industrial.api.ubidots.com";
WiFiClient espClient;
PubSubClient client(espClient);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

void setup() {
  Serial.begin(115200);
  delay(10);

  WiFi.begin(WIFISSID, PASSWORD);
  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  timeClient.begin();
  client.setServer(mqttBroker, 1883);

  gpsSerial.begin(9600); // Initialize serial communication with GPS module
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect(MQTT_CLIENT_NAME, TOKEN, "")) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed to connect to MQTT, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 2 seconds...");
      delay(2000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }

  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        float lat = gps.location.lat();
        float lng = gps.location.lng();

        float sensorValue = analogRead(SENSORPIN);
        unsigned long epochTime = timeClient.getEpochTime();

        // Format the payload with ECG data and GPS coordinates
        char payload[256];
        snprintf(payload, sizeof(payload),
                 "{\"%s\": [{\"value\": %.2f, \"timestamp\": %lu, \"context\": {\"lat\": %.6f, \"lng\": %.6f}}]}",
                 VARIABLE_LABEL, sensorValue, epochTime, lat, lng);

        char topic[150];
        snprintf(topic, sizeof(topic), "/v1.6/devices/%s", DEVICE_LABEL);

        Serial.println("Publishing data to Ubidots:");
        Serial.println(payload);

        // Convert topic and payload to char array for PubSubClient
        client.publish(topic, (uint8_t *)payload, strlen(payload));

        // Wait before sending next data (adjust as needed)
        delay(1000);
      }
    }
  }
}
