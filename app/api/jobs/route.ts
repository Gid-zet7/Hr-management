import { NextResponse } from "next/server";
import { dbConnect, Job } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const jobs = await Job.find()
      .populate("department", "name")
      .populate("applicants", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// Admin: Create new job (authentication required)
export async function POST(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();

    // Validate required fields
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Job title is required" },
        { status: 400 }
      );
    }

    const job = new Job({
      ...body,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      location: body.location?.trim() || "",
      requirements:
        body.requirements?.filter((req: string) => req.trim() !== "") || [],
      status: body.status || "open",
    });

    await job.save();

    // Populate the department and applicants
    await job.populate("department", "name");
    await job.populate("applicants", "firstName lastName email");

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
