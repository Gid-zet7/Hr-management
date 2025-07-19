import { NextResponse } from "next/server";
import { dbConnect, Job } from "@/models";

// Get all applicants for a specific job
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const job = await Job.findById(params.id)
      .populate(
        "applicants",
        "firstName lastName email phone resumeUrl createdAt status coverLetter workExperience education"
      )
      .populate("department", "name");

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        _id: job._id,
        title: job.title,
        department: job.department,
        location: job.location,
        status: job.status,
      },
      applicants: job.applicants || [],
      totalApplicants: job.applicants?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching job applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch job applicants" },
      { status: 500 }
    );
  }
}
