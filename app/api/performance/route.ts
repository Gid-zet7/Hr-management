import { NextResponse } from 'next/server';
import { dbConnect, PerformanceReview } from '@/models';

// Admin: List performance reviews
export async function GET() {
  await dbConnect();
  // TODO: Add authentication check here
  const reviews = await PerformanceReview.find();
  return NextResponse.json(reviews);
}

// Admin: Create performance review
export async function POST(request: Request) {
  await dbConnect();
  // TODO: Add authentication check here
  const body = await request.json();
  const review = new PerformanceReview({ ...body });
  await review.save();
  return NextResponse.json(review, { status: 201 });
}
