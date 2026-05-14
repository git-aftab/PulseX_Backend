import 'dotenv/config';
import mongoose from 'mongoose';
import { Hospital } from '../src/models/hospital.model.js';

async function run(){
  await mongoose.connect(process.env.MONGO_URI);
  const regs = ['REG-BEDS-1','REG-BEDS-2','REG123'];
  for(const reg of regs){
    const doc = await Hospital.findOne({ registrationNumber: reg });
    console.log(reg, '->', !!doc);
    if(doc){
      console.log(JSON.stringify({ id: doc._id.toString(), coords: doc.location?.coordinates, availableBeds: doc.availableBeds, totalBeds: doc.totalBeds }, null, 2));
    }
  }
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
