import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  status?: 'open' | 'closed';
  postedBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema: Schema<IJob> = new Schema({
  title: { type: String, required: true },
  department: String,
  location: String,
  description: String,
  requirements: [String],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  postedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
