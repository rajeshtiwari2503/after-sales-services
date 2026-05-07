import mqtt from "mqtt";

const client = mqtt.connect(
  "mqtt://broker.hivemq.com"
);

client.on("connect", () => {
  console.log("MQTT Connected");

  client.subscribe("crm/devices");
});

client.on("message", (topic, message) => {
  console.log(
    "IoT Data:",
    message.toString()
  );
});