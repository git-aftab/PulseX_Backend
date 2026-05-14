import 'dotenv/config';
import mongoose from 'mongoose';
import { Hospital } from '../src/models/hospital.model.js';

async function run(){
  await mongoose.connect(process.env.MONGO_URI);
  const reg = process.env.TARGET_HOSP_REG || 'REG123';
  const beds = Number(process.env.TARGET_HOSP_BEDS || 5);
  const h = await Hospital.findOne({ registrationNumber: reg });
  if(!h){
    console.error('Hospital not found:', reg); process.exit(1);
  }
  h.availableBeds = beds;
  h.totalBeds = h.totalBeds || beds;
  h.hospitalCapacityStatus = beds <= 0 ? 'FULL' : beds <=2 ? 'LIMITED' : 'AVAILABLE';
  await h.save({ validateBeforeSave: false });
  console.log('Updated', reg, 'availableBeds=', h.availableBeds);
  process.exit(0);
}
run().catch(err=>{ console.error(err); process.exit(1); });
