import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_DB_URL;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
async function ConnectToDatabase() {
  try {
    await mongoose.connect(uri!);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(" Mongo connection failed", error);
    process.exit(1);
  }
}
export default ConnectToDatabase;
