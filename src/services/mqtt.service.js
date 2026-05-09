import mqtt from "mqtt";
import logger from "../utils/logger.js";
import { Incident } from "../models/incident.model.js";
import { Device } from "../models/device.model.js";

const MQTT_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "devices/+/sos"; // subscribe to device sos topics

export const initMqtt = () => {
  try {
    const client = mqtt.connect(MQTT_URL, {
      reconnectPeriod: 5000,
    });

    client.on("connect", () => {
      logger.info(`MQTT connected to ${MQTT_URL}`);
      client.subscribe(MQTT_TOPIC, (err) => {
        if (err) logger.error("MQTT subscribe error", err);
        else logger.info(`Subscribed to MQTT topic ${MQTT_TOPIC}`);
      });
    });

    client.on("error", (err) => {
      logger.error("MQTT error", err);
    });

    client.on("message", async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        // expected payload: { deviceId, lng, lat, vitals: { heartRate, spo2, ... }, meta }
        const { deviceId, lng, lat, vitals = {}, meta = {} } = payload;

        if (!deviceId || typeof lng === "undefined" || typeof lat === "undefined") {
          logger.warn("MQTT message missing required fields", { topic, payload });
          return;
        }

        // upsert device
        const device = await Device.findOneAndUpdate(
          { deviceId },
          { $set: { lastSeen: new Date(), metadata: meta }, $setOnInsert: { deviceId } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        // create incident immediately (hardware handles cancel)
        const incident = await Incident.create({
          reporter: device.owner || null,
          deviceId,
          location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          vitals,
        });

        logger.info("MQTT incident created", { incidentId: incident._id.toString(), deviceId });
      } catch (err) {
        logger.error("Failed processing MQTT message", err);
      }
    });

    return client;
  } catch (err) {
    logger.error("Failed to init MQTT", err);
    return null;
  }
};
