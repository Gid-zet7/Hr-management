import { NextResponse } from 'next/server';
import { dbConnect, Employee } from '@/models';

// Admin: List employees
export async function GET() {
  await dbConnect();
  // TODO: Add authentication check here
  const employees = await Employee.find().sort({ createdAt: -1 });
  return NextResponse.json(employees);
}

// Admin: Create employee
export async function POST(request: Request) {
  await dbConnect();
  // TODO: Add authentication check here
  const body = await request.json();
  const employee = new Employee({ ...body });
  await employee.save();
  return NextResponse.json(employee, { status: 201 });
}
