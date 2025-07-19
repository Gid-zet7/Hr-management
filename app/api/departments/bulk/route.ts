import { NextResponse } from "next/server";
import { dbConnect, Department, Employee } from "@/models";

// Bulk operations on departments
export async function POST(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();
    const { operation, departmentIds, data } = body;

    if (!operation || !departmentIds || !Array.isArray(departmentIds)) {
      return NextResponse.json(
        {
          error:
            "Invalid request. Operation and departmentIds array are required.",
        },
        { status: 400 }
      );
    }

    switch (operation) {
      case "delete":
        return await handleBulkDelete(departmentIds);

      case "update":
        if (!data) {
          return NextResponse.json(
            { error: "Data is required for update operation" },
            { status: 400 }
          );
        }
        return await handleBulkUpdate(departmentIds, data);

      default:
        return NextResponse.json(
          { error: "Invalid operation. Supported operations: delete, update" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk department operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

async function handleBulkDelete(departmentIds: string[]) {
  const results = {
    deleted: [] as string[],
    failed: [] as Array<{ id: string; reason: string }>,
    skipped: [] as Array<{ id: string; reason: string }>,
  };

  for (const departmentId of departmentIds) {
    try {
      // Check if department exists
      const department = await Department.findById(departmentId);
      if (!department) {
        results.skipped.push({
          id: departmentId,
          reason: "Department not found",
        });
        continue;
      }

      // Check if there are employees assigned to this department
      const employeeCount = await Employee.countDocuments({
        department: departmentId,
        employmentStatus: "active",
      });

      if (employeeCount > 0) {
        results.skipped.push({
          id: departmentId,
          reason: `Cannot delete. ${employeeCount} employee(s) assigned to this department`,
        });
        continue;
      }

      await Department.findByIdAndDelete(departmentId);
      results.deleted.push(departmentId);
    } catch (error) {
      results.failed.push({ id: departmentId, reason: "Database error" });
    }
  }

  return NextResponse.json({
    message: `Bulk delete completed. Deleted: ${results.deleted.length}, Failed: ${results.failed.length}, Skipped: ${results.skipped.length}`,
    results,
  });
}

async function handleBulkUpdate(departmentIds: string[], data: any) {
  const results = {
    updated: [] as string[],
    failed: [] as Array<{ id: string; reason: string }>,
    skipped: [] as Array<{ id: string; reason: string }>,
  };

  for (const departmentId of departmentIds) {
    try {
      // Check if department exists
      const department = await Department.findById(departmentId);
      if (!department) {
        results.skipped.push({
          id: departmentId,
          reason: "Department not found",
        });
        continue;
      }

      // Validate data
      if (data.name && data.name.trim() === "") {
        results.failed.push({
          id: departmentId,
          reason: "Department name cannot be empty",
        });
        continue;
      }

      // Check for duplicate names if name is being updated
      if (data.name) {
        const duplicateDepartment = await Department.findOne({
          _id: { $ne: departmentId },
          name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
        });

        if (duplicateDepartment) {
          results.failed.push({
            id: departmentId,
            reason: "Department with this name already exists",
          });
          continue;
        }
      }

      // Update the department
      const updateData: any = {};
      if (data.name) updateData.name = data.name.trim();
      if (data.description !== undefined)
        updateData.description = data.description.trim();

      await Department.findByIdAndUpdate(departmentId, updateData, {
        runValidators: true,
      });
      results.updated.push(departmentId);
    } catch (error) {
      results.failed.push({ id: departmentId, reason: "Database error" });
    }
  }

  return NextResponse.json({
    message: `Bulk update completed. Updated: ${results.updated.length}, Failed: ${results.failed.length}, Skipped: ${results.skipped.length}`,
    results,
  });
}
