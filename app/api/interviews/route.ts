import { NextResponse } from "next/server";
import { dbConnect, Interview, Applicant, Job } from "@/models";

// Create a new interview and send invitation email
export async function POST(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();
    const {
      applicantId,
      jobId,
      date,
      time,
      duration = 60,
      type = "video",
      location,
      videoLink,
      interviewer,
      notes,
    } = body;

    // Validate required fields
    if (!applicantId || !jobId || !date || !time) {
      return NextResponse.json(
        { error: "Applicant ID, Job ID, date, and time are required" },
        { status: 400 }
      );
    }

    // Check if applicant exists
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if interview already exists for this applicant and job
    const existingInterview = await Interview.findOne({
      applicant: applicantId,
      jobId: jobId,
      status: { $in: ["scheduled"] },
    });

    if (existingInterview) {
      return NextResponse.json(
        {
          error: "An interview is already scheduled for this applicant and job",
        },
        { status: 409 }
      );
    }

    // Create the interview
    const interview = new Interview({
      applicant: applicantId,
      jobId: jobId,
      jobTitle: job.title,
      date: new Date(date),
      time,
      duration,
      type,
      location,
      videoLink,
      interviewer,
      notes,
    });

    await interview.save();

    // Update applicant status to "interviewed"
    await Applicant.findByIdAndUpdate(applicantId, {
      status: "interviewed",
    });

    // Prepare email content
    const subject = `Interview Invitation - ${job.title}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Invitation</h2>
        <p>Dear ${applicant.firstName} ${applicant.lastName},</p>
        <p>We are pleased to invite you for an interview for the position of <strong>${
          job.title
        }</strong>.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Interview Details:</h3>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          <p><strong>Type:</strong> ${
            type.charAt(0).toUpperCase() + type.slice(1)
          }</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
          ${
            videoLink
              ? `<p><strong>Video Link:</strong> <a href="${videoLink}">${videoLink}</a></p>`
              : ""
          }
          ${
            interviewer
              ? `<p><strong>Interviewer:</strong> ${interviewer}</p>`
              : ""
          }
        </div>
        ${notes ? `<p><strong>Additional Notes:</strong><br>${notes}</p>` : ""}
        <p>Please confirm your attendance by replying to this email or contacting us at your earliest convenience.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `;

    // Send email using the mailgun API route
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/mail/mailgun`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailTo: applicant.email,
            subject,
            htmlContent,
          }),
        }
      );
    } catch (e) {
      // Log but do not fail the request if email fails
      console.error("Failed to send interview invitation email", e);
    }

    // Populate the interview with applicant and job details
    await interview.populate("applicant", "firstName lastName email");
    await interview.populate("jobId", "title department");

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
        interview,
        emailSent: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}

// Get all interviews
export async function GET(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const interviews = await Interview.find()
      .populate("applicant", "firstName lastName email")
      .populate("jobId", "title department")
      .sort({ date: -1 });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
