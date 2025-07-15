import { NextResponse } from 'next/server';
import { dbConnect, Attendance } from '@/models';

// Admin: List attendance records
export async function GET() {
  await dbConnect();
  // TODO: Add authentication check here
  const records = await Attendance.find();
  return NextResponse.json(records);
}

// Admin: Create attendance record
export async function POST(request: Request) {
  await dbConnect();
  // TODO: Add authentication check here
  const body = await request.json();
  const record = new Attendance({ ...body });
  await record.save();
  return NextResponse.json(record, { status: 201 });
}
