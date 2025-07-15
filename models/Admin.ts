import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
