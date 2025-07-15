import { NextResponse } from 'next/server';
import { dbConnect, Application } from '@/models';

// Public: Submit application
export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  // Consent is required
  if (typeof body.consentToSave !== 'boolean') {
    return NextResponse.json({ error: 'Consent is required.' }, { status: 400 });
  }
  const app = new Application({ ...body });
  await app.save();
  return NextResponse.json({ success: true });
}

// Admin: List applications (authentication required)
export async function GET(request: Request) {
  await dbConnect();
  // TODO: Add authentication check here
  const apps = await Application.find().sort({ createdAt: -1 });
  return NextResponse.json(apps);
}
