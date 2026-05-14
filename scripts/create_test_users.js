import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";

const MONGO = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO);
  console.log("DB connected");

  const users = [
    { fullname: "Test User", email: "user1@local.test", phone: "9000000001", password: "UserPass1!", role: "user" },
    { fullname: "Ambulance Driver", email: "ambulance1@local.test", phone: "9000000002", password: "AmbPass1!", role: "user" },
    { fullname: "Hospital Account", email: "hospital1@local.test", phone: "9000000003", password: "HospPass1!", role: "user" },
  ];

  for (const u of users) {
    let existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User exists: ${u.email} -> ${existing._id}`);
      continue;
    }
    const created = await User.create({ fullname: u.fullname, email: u.email, username: u.email, phone: u.phone, password: u.password });
    console.log(`Created ${u.email} -> ${created._id}`);
  }

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
