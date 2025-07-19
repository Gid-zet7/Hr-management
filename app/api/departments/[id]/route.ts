import { NextResponse } from "next/server";
import { dbConnect, Department, Employee } from "@/models";

// Get a specific department by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const department = await Department.findById(params.id);

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

// Update a specific department by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if department exists
    const existingDepartment = await Department.findById(params.id);
    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if another department with the same name already exists
    const duplicateDepartment = await Department.findOne({
      _id: { $ne: params.id },
      name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
    });

    if (duplicateDepartment) {
      return NextResponse.json(
        { error: "Department with this name already exists" },
        { status: 409 }
      );
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      params.id,
      {
        name: body.name.trim(),
        description: body.description?.trim() || "",
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

// Delete a specific department by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    // Check if department exists
    const department = await Department.findById(params.id);
    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if there are employees assigned to this department
    const employeesInDepartment = await Employee.countDocuments({
      department: params.id,
    });

    if (employeesInDepartment > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete department. There are ${employeesInDepartment} employee(s) assigned to this department. Please reassign or remove employees first.`,
        },
        { status: 409 }
      );
    }

    await Department.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
