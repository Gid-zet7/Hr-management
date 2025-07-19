import mongoose from "mongoose";
import { Job } from "./Job";
import { Applicant } from "./Applicant";
import { Employee } from "./Employee";
import { Admin } from "./Admin";
import { PerformanceReview } from "./PerformanceReview";
import { Payroll } from "./Payroll";
import { Attendance } from "./Attendance";
import { Task } from "./Task";
import { Department } from "./Department";
import { Interview } from "./Interview";
import { Offer } from "./Offer";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export {
  Job,
  Applicant,
  Employee,
  Admin,
  PerformanceReview,
  Payroll,
  Attendance,
  Task,
  Department,
  Interview,
  Offer,
};
