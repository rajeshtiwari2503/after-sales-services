 
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
 

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
