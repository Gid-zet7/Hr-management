import mongoose, { Document, Schema, Model } from "mongoose";

export interface IApplicant extends Document {
  jobId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  workExperience?: {
    companyName: string;
    jobTitle: string;
    startDate: Date;
    endDate: Date;
    responsibilitiesAndAchievements: string;
  }[];
  education?: {
    school: string;
    certificate: string;
    startDate: string;
    endDate: string;
  }[];
  status?: "applied" | "interviewed" | "offer_sent" | "hired" | "rejected";
  consentToSave: boolean;
  createdAt?: Date;
  userId?: mongoose.Types.ObjectId;
}

const ApplicantSchema: Schema<IApplicant> = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  resumeUrl: String,
  coverLetter: String,
  workExperience: [
    {
      companyName: { type: String },
      jobTitle: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      responsibilitiesAndAchievements: { type: String },
    },
  ],
  education: [
    {
      school: String,
      certificate: String,
      startDate: String,
      endDate: String,
    },
  ],
  status: {
    type: String,
    enum: ["applied", "interviewed", "offer_sent", "hired", "rejected"],
    default: "applied",
  },
  consentToSave: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "Employee", required: false },
});

export const Applicant: Model<IApplicant> =
  mongoose.models.Applicant ||
  mongoose.model<IApplicant>("Applicant", ApplicantSchema);
