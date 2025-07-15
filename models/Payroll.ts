import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  periodStart?: Date;
  periodEnd?: Date;
  grossPay?: number;
  deductions?: number;
  netPay?: number;
  status?: 'paid' | 'pending';
  payDate?: Date;
}

const PayrollSchema: Schema<IPayroll> = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  periodStart: Date,
  periodEnd: Date,
  grossPay: Number,
  deductions: Number,
  netPay: Number,
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  payDate: Date,
});

export const Payroll: Model<IPayroll> = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
