import 'dotenv/config';
import mongoose from 'mongoose';
import assert from 'assert';
import { Hospital } from '../src/models/hospital.model.js';
import { findNearestAvailableHospital } from '../src/services/hospital.service.js';

async function run(){
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const reg = 'UNIT-TEST-HOSP-' + Date.now();
  const coords = [80.2707,13.0827];

  // create hospital with available beds
  const h = await Hospital.create({
    user: null,
    hospitalName: 'UT Hospital',
    registrationNumber: reg,
    location: { type: 'Point', coordinates: coords },
    contactNumber: '000',
    totalBeds: 5,
    availableBeds: 3,
    emergencyAvailable: true,
  });

  try{
    const found = await findNearestAvailableHospital(coords[0], coords[1], 5000);
    assert(found, 'No hospital found by findNearestAvailableHospital');
    assert.strictEqual(found.registrationNumber, reg);
    console.log('Test passed: hospital assignment function returned created hospital');
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  } finally {
    // cleanup
    await Hospital.deleteOne({ _id: h._id });
    await mongoose.disconnect();
  }
  process.exit(0);
}

run();
