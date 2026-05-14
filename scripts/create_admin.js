import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";

const MONGO = process.env.MONGO_URI;

async function run() {
  if (!MONGO) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGO, { dbName: process.env.MONGO_DB || undefined });
  console.log("DB connected");

  const email = process.env.DEV_ADMIN_EMAIL || "admin@local.test";
  const phone = process.env.DEV_ADMIN_PHONE || "9999999999";
  const fullname = process.env.DEV_ADMIN_NAME || "Dev Admin";
  const password = process.env.DEV_ADMIN_PASSWORD || "Password123!";

  let admin = await User.findOne({ email });
  if (admin) {
    console.log("Admin already exists");
    process.exit(0);
  }

  admin = await User.create({ fullname, email, phone, password, role: "admin", isVerified: true });
  console.log("Admin created:", admin._id.toString());
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
