import { NextResponse } from "next/server";
import { dbConnect, Department, Employee } from "@/models";

// List all departments
export async function GET() {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const departments = await Department.find().sort({ name: 1 }).lean();

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// Create a new department
export async function POST(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }

    // Check if department with same name already exists
    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: "Department with this name already exists" },
        { status: 409 }
      );
    }

    const department = new Department({
      name: body.name.trim(),
      description: body.description?.trim() || "",
    });

    await department.save();

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}

// Update a department by _id
export async function PATCH(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { _id, ...update } = body;
  const department = await Department.findByIdAndUpdate(_id, update, {
    new: true,
  });
  return NextResponse.json(department);
}

// Delete a department by _id
export async function DELETE(request: Request) {
  await dbConnect();
  const { _id } = await request.json();
  await Department.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
}
