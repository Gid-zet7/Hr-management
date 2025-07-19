import { NextResponse } from "next/server";
import { dbConnect, PerformanceReview } from "@/models";

// Admin: List performance reviews
export async function GET() {
  try {
    await dbConnect();
    // TODO: Add authentication check here
    const reviews = await PerformanceReview.find()
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email")
      .sort({ date: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching performance reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance reviews" },
      { status: 500 }
    );
  }
}

// Admin: Create performance review
export async function POST(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here
    const body = await request.json();

    const review = new PerformanceReview({
      ...body,
      date: body.date || new Date(),
    });

    // The pre-save middleware will automatically calculate the score
    await review.save();

    // Populate the employee and reviewer information
    await review.populate("employeeId", "firstName lastName email");
    await review.populate("reviewerId", "firstName lastName email");

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating performance review:", error);
    return NextResponse.json(
      { error: "Failed to create performance review" },
      { status: 500 }
    );
  }
}
