import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  createdAt?: Date;
}

const DepartmentSchema: Schema<IDepartment> = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema); 