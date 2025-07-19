import { NextResponse } from "next/server";
import { dbConnect, Department, Employee } from "@/models";

// Get department statistics
export async function GET() {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    // Get all departments with employee counts
    const departments = await Department.find().sort({ name: 1 });
    const departmentStats = [];

    for (const department of departments) {
      // Count employees in this department
      const employeeCount = await Employee.countDocuments({
        department: department._id,
        employmentStatus: "active",
      });

      // Get employee details for this department
      const employees = await Employee.find({
        department: department._id,
        employmentStatus: "active",
      }).select("firstName lastName email position salary");

      departmentStats.push({
        _id: department._id,
        name: department.name,
        description: department.description,
        createdAt: department.createdAt,
        employeeCount,
        employees: employees.map((emp) => ({
          _id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          position: emp.position,
          salary: emp.salary,
        })),
      });
    }

    // Calculate overall statistics
    const totalDepartments = departments.length;
    const totalEmployees = await Employee.countDocuments({
      employmentStatus: "active",
    });
    const departmentsWithEmployees = departmentStats.filter(
      (dept) => dept.employeeCount > 0
    ).length;
    const emptyDepartments = totalDepartments - departmentsWithEmployees;

    return NextResponse.json({
      summary: {
        totalDepartments,
        totalEmployees,
        departmentsWithEmployees,
        emptyDepartments,
        averageEmployeesPerDepartment:
          totalDepartments > 0
            ? Math.round((totalEmployees / totalDepartments) * 100) / 100
            : 0,
      },
      departments: departmentStats,
    });
  } catch (error) {
    console.error("Error fetching department statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch department statistics" },
      { status: 500 }
    );
  }
}
