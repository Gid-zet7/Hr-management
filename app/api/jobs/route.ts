import { NextResponse } from 'next/server';
import { dbConnect, Job } from '@/models';

export async function GET() {
  await dbConnect();
  const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 });
  return NextResponse.json(jobs);
}

// Admin: Create new job (authentication required)
export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  // TODO: Add authentication check here
  const job = new Job({ ...body });
  await job.save();
  return NextResponse.json(job, { status: 201 });
}
