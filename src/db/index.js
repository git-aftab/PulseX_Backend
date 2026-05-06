import "dotenv/config";
import chalk from "chalk";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green("Database connected Successfully."));
  } catch (error) {
    console.log(chalk.red("Connection Failed =>", error));
    process.exit(1);
  }
};

export default connectDB;
