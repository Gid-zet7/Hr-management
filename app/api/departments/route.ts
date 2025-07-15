import { NextResponse } from 'next/server';
import { dbConnect, Department } from '@/models';

// List all departments
export async function GET() {
  await dbConnect();
  const departments = await Department.find();
  return NextResponse.json(departments);
}

// Create a new department
export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const department = new Department({ ...body });
  await department.save();
  return NextResponse.json(department, { status: 201 });
}

// Update a department by _id
export async function PATCH(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { _id, ...update } = body;
  const department = await Department.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json(department);
}

// Delete a department by _id
export async function DELETE(request: Request) {
  await dbConnect();
  const { _id } = await request.json();
  await Department.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
} 