import mongoose, { Document, Schema, Model } from "mongoose";
import { IApplicant } from "./Applicant";
import { IDepartment } from "./Department";

export interface IJob extends Document {
  title: string;
  department?: IDepartment;
  location?: string;
  description?: string;
  requirements?: string[];
  status?: "open" | "closed";
  applicants?: IApplicant[];
  postedBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema: Schema<IJob> = new Schema({
  title: { type: String, required: true },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  location: String,
  description: String,
  requirements: [String],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  applicants: [
    {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
    },
  ],
  postedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
