import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const DB_URL = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("connected to database");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;