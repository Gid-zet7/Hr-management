import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPerformanceReview extends Document {
  employeeId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  date: Date;
  score?: number;
  comments?: string;
  goals?: string;
}

const PerformanceReviewSchema: Schema<IPerformanceReview> = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  date: { type: Date, required: true },
  score: Number,
  comments: String,
  goals: String,
});

export const PerformanceReview: Model<IPerformanceReview> = mongoose.models.PerformanceReview || mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);
