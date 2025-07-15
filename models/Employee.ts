import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  salary?: number;
  employmentStatus?: 'active' | 'terminated' | 'on_leave';
  personalInfo?: {
    address?: string;
    dob?: Date;
    emergencyContacts?: Array<{
      name: string;
      phone: string;
      relation: string;
    }>;
  };
  createdAt?: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  department: String,
  position: String,
  hireDate: Date,
  salary: Number,
  employmentStatus: { type: String, enum: ['active', 'terminated', 'on_leave'], default: 'active' },
  personalInfo: {
    address: String,
    dob: Date,
    emergencyContacts: [{
      name: String,
      phone: String,
      relation: String,
    }],
  },
  createdAt: { type: Date, default: Date.now },
});

export const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
