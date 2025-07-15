import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status?: 'applied' | 'interviewed' | 'hired' | 'rejected';
  consentToSave: boolean;
  createdAt?: Date;
  userId?: mongoose.Types.ObjectId;
}

const ApplicationSchema: Schema<IApplication> = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  resumeUrl: String,
  coverLetter: String,
  status: { type: String, enum: ['applied', 'interviewed', 'hired', 'rejected'], default: 'applied' },
  consentToSave: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
});

export const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
