import { NextResponse } from "next/server";
import { dbConnect, Job } from "@/models";

// Get a specific job by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const job = await Job.findById(params.id)
      .populate("department", "name")
      .populate("applicants", "firstName lastName email");

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// Update a specific job by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();

    // Validate required fields
    if (body.title && body.title.trim() === "") {
      return NextResponse.json(
        { error: "Job title cannot be empty" },
        { status: 400 }
      );
    }

    // Check if job exists
    const existingJob = await Job.findById(params.id);
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.department !== undefined) updateData.department = body.department;
    if (body.location !== undefined)
      updateData.location = body.location?.trim() || "";
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || "";
    if (body.requirements !== undefined) {
      updateData.requirements = body.requirements.filter(
        (req: string) => req.trim() !== ""
      );
    }
    if (body.status !== undefined) updateData.status = body.status;
    updateData.updatedAt = new Date();

    const updatedJob = await Job.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("department", "name")
      .populate("applicants", "firstName lastName email");

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// Delete a specific job by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    // Check if job exists
    const job = await Job.findById(params.id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if job has applicants
    if (job.applicants && job.applicants.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete job. There are ${job.applicants.length} applicant(s) for this position. Please handle applications first.`,
        },
        { status: 409 }
      );
    }

    await Job.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
