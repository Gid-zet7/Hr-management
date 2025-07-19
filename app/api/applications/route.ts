import { NextResponse } from "next/server";
import { dbConnect, Applicant, Job } from "@/models";

// Public: Submit application
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400 }
      );
    }

    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    // Consent is required
    if (typeof body.consentToSave !== "boolean") {
      return NextResponse.json(
        { error: "Consent is required." },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await Job.findById(body.jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Check if job is still open
    if (job.status === "closed") {
      return NextResponse.json(
        { error: "This job is no longer accepting applications." },
        { status: 400 }
      );
    }

    // Create the application
    const application = new Applicant({ ...body });
    await application.save();

    // Add the applicant to the job's applicants array
    await Job.findByIdAndUpdate(
      body.jobId,
      { $push: { applicants: application._id } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application._id,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}

// Admin: List applications (authentication required)
export async function GET(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const applications = await Applicant.find()
      .populate("jobId", "title department location status")
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
