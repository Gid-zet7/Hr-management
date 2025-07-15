import { NextResponse } from 'next/server';
import { dbConnect, Payroll } from '@/models';

// Admin: List payroll records
export async function GET() {
  await dbConnect();
  // TODO: Add authentication check here
  const payrolls = await Payroll.find();
  return NextResponse.json(payrolls);
}

// Admin: Create payroll record
export async function POST(request: Request) {
  await dbConnect();
  // TODO: Add authentication check here
  const body = await request.json();
  const payroll = new Payroll({ ...body });
  await payroll.save();
  return NextResponse.json(payroll, { status: 201 });
}
