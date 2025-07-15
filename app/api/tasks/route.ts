import { NextResponse } from 'next/server';
import { dbConnect, Task } from '@/models';

// List all tasks
export async function GET() {
  await dbConnect();
  const tasks = await Task.find();
  return NextResponse.json(tasks);
}

// Create a new task
export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const task = new Task({ ...body });
  await task.save();
  return NextResponse.json(task, { status: 201 });
}

// Update a task (e.g., mark as completed)
export async function PATCH(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { _id, ...update } = body;
  const task = await Task.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json(task);
} 