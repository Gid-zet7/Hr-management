import mongoose, { Document, Schema, Model } from "mongoose";

export interface IInterview extends Document {
  applicant: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  jobTitle: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  type: "phone" | "video" | "in-person";
  location?: string; // for in-person interviews
  videoLink?: string; // for video interviews
  interviewer?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  conducted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const InterviewSchema: Schema<IInterview> = new Schema({
  applicant: { type: Schema.Types.ObjectId, ref: "Applicant", required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  jobTitle: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 }, // default 60 minutes
  type: {
    type: String,
    enum: ["phone", "video", "in-person"],
    default: "video",
  },
  location: String,
  videoLink: String,
  interviewer: String,
  notes: String,
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "no-show"],
    default: "scheduled",
  },
  conducted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
InterviewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Interview: Model<IInterview> =
  mongoose.models.Interview ||
  mongoose.model<IInterview>("Interview", InterviewSchema);
