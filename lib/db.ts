 
// import mongoose from "mongoose";

// const MONGODB_URI =
//   process.env.MONGODB_URI!;

// if (!MONGODB_URI) {
//   throw new Error(
//     "MONGODB_URI missing"
//   );
// }

// export async function connectDB() {
//   try {
//     await mongoose.connect(
//       MONGODB_URI
//     );

//     console.log("MongoDB Connected");
//   } catch (error) {
//     console.log(error);

//     throw new Error(
//       "Database connection failed"
//     );
//   }
// }

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/power-india-crm'

interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
declare global { var _mongoose: MongooseCache | undefined }

const cache: MongooseCache = global._mongoose ?? { conn: null, promise: null }
if (!global._mongoose) global._mongoose = cache

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cache.conn = await cache.promise
  return cache.conn
}