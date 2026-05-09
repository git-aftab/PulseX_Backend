import "dotenv/config";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// import models (relative to scripts folder)
import { User } from '../src/models/user.model.js';
import { Ambulance } from '../src/models/ambulance.model.js';
import { Hospital } from '../src/models/hospital.model.js';
import { Incident } from '../src/models/incident.model.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set');
  process.exit(1);
}

const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret';

await mongoose.connect(MONGO_URI, {  });
console.log('Mongo connected');

// cleanup any existing test users with these emails to avoid duplicates
await User.deleteMany({ email: { $in: ['test.user@example.com','test.driver@example.com','test.hospital@example.com'] } });
await Ambulance.deleteMany({ vehicleNumber: 'TEST-123' });
await Hospital.deleteMany({ registrationNumber: 'TEST-HOSP-123' });
await Incident.deleteMany({ deviceId: 'TEST-DEVICE-1' });

const user = await User.create({
  fullname: 'Test User',
  email: 'test.user@example.com',
  username: 'test.user@example.com',
  password: 'password',
  phone: '9111111111',
  role: 'user'
});

const driver = await User.create({
  fullname: 'Driver User',
  email: 'test.driver@example.com',
  username: 'test.driver@example.com',
  password: 'password',
  phone: '9222222222',
  role: 'ambulance_driver'
});

const hospUser = await User.create({
  fullname: 'Hospital User',
  email: 'test.hospital@example.com',
  username: 'test.hospital@example.com',
  password: 'password',
  phone: '9333333333',
  role: 'hospital'
});

const hospital = await Hospital.create({
  user: hospUser._id,
  hospitalName: 'Test Hospital',
  registrationNumber: 'TEST-HOSP-123',
  location: { type: 'Point', coordinates: [77.5946, 12.9716] },
  contactNumber: '9999999999',
  traumaLevel: 'LEVEL_1',
  availableBeds: 5,
});

const ambulance = await Ambulance.create({
  user: driver._id,
  vehicleNumber: 'TEST-123',
  driverLicenseNumber: 'DL-TEST-123',
  hospital: hospital._id,
  currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
  availabilityStatus: 'AVAILABLE'
});

const incident = await Incident.create({
  reporter: user._id,
  deviceId: 'TEST-DEVICE-1',
  location: { type: 'Point', coordinates: [77.595, 12.971] },
  vitals: { heartRate: 30, spo2: 90 }
});

const userToken = jwt.sign({ _id: user._id.toString(), role: user.role, email: user.email }, accessSecret, { expiresIn: '7d' });
const driverToken = jwt.sign({ _id: driver._id.toString(), role: driver.role, email: driver.email }, accessSecret, { expiresIn: '7d' });
const hospToken = jwt.sign({ _id: hospUser._id.toString(), role: hospUser.role, email: hospUser.email }, accessSecret, { expiresIn: '7d' });

fs.writeFileSync('/tmp/test_user_token.txt', userToken);
fs.writeFileSync('/tmp/test_driver_token.txt', driverToken);
fs.writeFileSync('/tmp/test_hosp_token.txt', hospToken);
fs.writeFileSync('/tmp/test_ids.json', JSON.stringify({ userId: user._id, driverId: driver._id, hospId: hospUser._id, ambulanceId: ambulance._id, hospitalId: hospital._id, incidentId: incident._id }));

console.log('Created test data:');
console.log(' userId=', user._id.toString());
console.log(' driverId=', driver._id.toString());
console.log(' hospitalUserId=', hospUser._id.toString());
console.log(' ambulanceId=', ambulance._id.toString());
console.log(' incidentId=', incident._id.toString());
console.log('\nTokens written to /tmp/test_*_token.txt');

await mongoose.disconnect();
