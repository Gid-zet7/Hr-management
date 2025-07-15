import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  employeeId: mongoose.Types.ObjectId;
  dueDate?: Date;
  completed?: boolean;
  createdAt?: Date;
}

const TaskSchema: Schema<ITask> = new Schema({
  title: { type: String, required: true },
  description: String,
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema); 