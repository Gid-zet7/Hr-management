import Mailgun from "mailgun.js";
import FormData from "form-data";
import { NextResponse } from "next/server";

// Ensure API key and domain are set
const API_KEY = process.env.MAILGUN_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

if (!API_KEY || !DOMAIN) {
  throw new Error(
    "Mailgun API key or domain is not set in environment variables"
  );
}

export const POST = async (request: Request) => {
  try {
    const { emailTo, subject, htmlContent } = await request.json();

    if (!emailTo || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Missing required fields (emailTo, subject, htmlContent)" },
        { status: 400 }
      );
    }

    // Initialize Mailgun
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: API_KEY,
    });

    // Send email
    const result = await mg.messages.create(DOMAIN, {
      from: "Tillyn Clothings <no-reply@tillyn.store>",
      to: [emailTo],
      subject: subject,
      text: "Order",
      html: htmlContent,
    });

    // Log and return success response
    // console.log("Mail sent:", result);
    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    // console.error("Error sending email:", error);
    return NextResponse.json(
      { error: `Failed to send email: ${error.message || error}` },
      { status: 500 }
    );
  }
};
