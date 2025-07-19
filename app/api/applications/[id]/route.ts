import { NextResponse } from "next/server";
import { dbConnect, Applicant } from "@/models";

// Update application status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      "applied",
      "interviewed",
      "offer_sent",
      "hired",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const application = await Applicant.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}

// Get specific application
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const application = await Applicant.findById(params.id).populate(
      "jobId",
      "title department location"
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
