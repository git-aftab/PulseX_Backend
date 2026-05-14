import 'dotenv/config';
import mongoose from 'mongoose';
import assert from 'assert';
import { Hospital } from '../src/models/hospital.model.js';
import { User } from '../src/models/user.model.js';
import { findNearestAvailableHospital } from '../src/services/hospital.service.js';

async function run(){
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const reg = 'UNIT-TEST-HOSP-' + Date.now();
  const coords = [80.2907,13.1027]; // use distinct coords to avoid matching existing test data

  // create a temp user to own the hospital
  const tempUser = await User.create({ fullname: 'TestHospUser', email: 'test-hosp-' + Date.now() + '@local.test', username: 'test-hosp-' + Date.now() + '@local.test', phone: '999900' + Math.floor(Math.random()*10000), password: 'TempPass1!' });

  // create hospital with available beds
  const h = await Hospital.create({
    user: tempUser._id,
    hospitalName: 'UT Hospital',
    registrationNumber: reg,
    location: { type: 'Point', coordinates: coords },
    contactNumber: '000',
    totalBeds: 5,
    availableBeds: 3,
    emergencyAvailable: true,
  });

  try{
    const found = await findNearestAvailableHospital(coords[0], coords[1], 1000);
    assert(found, 'No hospital found by findNearestAvailableHospital');
    assert.strictEqual(found.registrationNumber, reg);
    console.log('Test passed: hospital assignment function returned created hospital');
  } catch (err) {
    console.error('Test failed', err);
    // cleanup before exit
    await Hospital.deleteOne({ _id: h._id });
    await User.deleteOne({ _id: tempUser._id });
    await mongoose.disconnect();
    process.exit(1);
  } finally {
    // cleanup
    await Hospital.deleteOne({ _id: h._id });
    await User.deleteOne({ _id: tempUser._id });
    await mongoose.disconnect();
  }
  process.exit(0);
}

run();
