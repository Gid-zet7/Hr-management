import { Department, Employee } from "@/models";
import { dbConnect } from "@/models";

/**
 * Utility functions for department management
 */

export interface DepartmentStats {
  _id: string;
  name: string;
  description?: string;
  employeeCount: number;
  averageSalary?: number;
  positions: string[];
  createdAt: Date;
}

export interface DepartmentWithEmployees {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  employees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    position?: string;
    salary?: number;
    hireDate?: Date;
  }>;
}

/**
 * Get all departments with employee statistics
 */
export async function getAllDepartmentsWithStats(): Promise<DepartmentStats[]> {
  await dbConnect();

  const departments = await Department.find().sort({ name: 1 });
  const departmentStats: DepartmentStats[] = [];

  for (const department of departments) {
    const employees = await Employee.find({
      department: department._id,
      employmentStatus: "active",
    }).select("salary position");

    const employeeCount = employees.length;
    const salaries = employees
      .map((emp) => emp.salary)
      .filter((salary) => salary !== undefined);
    const averageSalary =
      salaries.length > 0
        ? salaries.reduce((sum, salary) => sum + (salary || 0), 0) /
          salaries.length
        : undefined;

    const positions = [
      ...new Set(
        employees.map((emp) => emp.position).filter(Boolean) as string[]
      ),
    ];

    departmentStats.push({
      _id: (department._id as any).toString(),
      name: department.name,
      description: department.description,
      employeeCount,
      averageSalary: averageSalary
        ? Math.round(averageSalary * 100) / 100
        : undefined,
      positions,
      createdAt: department.createdAt || new Date(),
    });
  }

  return departmentStats;
}

/**
 * Get a specific department with all its employees
 */
export async function getDepartmentWithEmployees(
  departmentId: string
): Promise<DepartmentWithEmployees | null> {
  await dbConnect();

  const department = await Department.findById(departmentId);
  if (!department) return null;

  const employees = await Employee.find({
    department: departmentId,
    employmentStatus: "active",
  }).select("firstName lastName email position salary hireDate");

  return {
    _id: (department._id as any).toString(),
    name: department.name,
    description: department.description,
    createdAt: department.createdAt || new Date(),
    employees: employees.map((emp) => ({
      _id: (emp._id as any).toString(),
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      position: emp.position,
      salary: emp.salary,
      hireDate: emp.hireDate,
    })),
  };
}

/**
 * Get departments that can be safely deleted (no employees assigned)
 */
export async function getDeletableDepartments(): Promise<
  Array<{ _id: string; name: string; employeeCount: number }>
> {
  await dbConnect();

  const departments = await Department.find().sort({ name: 1 });
  const deletableDepartments = [];

  for (const department of departments) {
    const employeeCount = await Employee.countDocuments({
      department: department._id,
      employmentStatus: "active",
    });

    if (employeeCount === 0) {
      deletableDepartments.push({
        _id: (department._id as any).toString(),
        name: department.name,
        employeeCount,
      });
    }
  }

  return deletableDepartments;
}

/**
 * Move employees from one department to another
 */
export async function moveEmployeesToDepartment(
  employeeIds: string[],
  targetDepartmentId: string
): Promise<{
  moved: number;
  failed: Array<{ id: string; reason: string }>;
  skipped: Array<{ id: string; reason: string }>;
}> {
  await dbConnect();

  // Validate target department exists
  const targetDepartment = await Department.findById(targetDepartmentId);
  if (!targetDepartment) {
    throw new Error("Target department not found");
  }

  const results = {
    moved: 0,
    failed: [] as Array<{ id: string; reason: string }>,
    skipped: [] as Array<{ id: string; reason: string }>,
  };

  for (const employeeId of employeeIds) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        results.skipped.push({ id: employeeId, reason: "Employee not found" });
        continue;
      }

      if (employee.employmentStatus !== "active") {
        results.skipped.push({
          id: employeeId,
          reason: "Employee is not active",
        });
        continue;
      }

      await Employee.findByIdAndUpdate(employeeId, {
        department: targetDepartmentId,
      });

      results.moved++;
    } catch (error) {
      results.failed.push({ id: employeeId, reason: "Database error" });
    }
  }

  return results;
}

/**
 * Get department hierarchy and structure
 */
export async function getDepartmentHierarchy(): Promise<{
  totalDepartments: number;
  totalEmployees: number;
  departments: Array<{
    _id: string;
    name: string;
    employeeCount: number;
    positions: string[];
    averageSalary?: number;
  }>;
}> {
  await dbConnect();

  const departments = await Department.find().sort({ name: 1 });
  const totalEmployees = await Employee.countDocuments({
    employmentStatus: "active",
  });

  const departmentData = [];

  for (const department of departments) {
    const employees = await Employee.find({
      department: department._id,
      employmentStatus: "active",
    }).select("position salary");

    const employeeCount = employees.length;
    const positions = [
      ...new Set(
        employees.map((emp) => emp.position).filter(Boolean) as string[]
      ),
    ];
    const salaries = employees
      .map((emp) => emp.salary)
      .filter((salary) => salary !== undefined);
    const averageSalary =
      salaries.length > 0
        ? salaries.reduce((sum, salary) => sum + (salary || 0), 0) /
          salaries.length
        : undefined;

    departmentData.push({
      _id: (department._id as any).toString(),
      name: department.name,
      employeeCount,
      positions: positions as string[],
      averageSalary: averageSalary
        ? Math.round(averageSalary * 100) / 100
        : undefined,
    });
  }

  return {
    totalDepartments: departments.length,
    totalEmployees,
    departments: departmentData,
  };
}

/**
 * Search departments by name or description
 */
export async function searchDepartments(
  query: string
): Promise<DepartmentStats[]> {
  await dbConnect();

  const departments = await Department.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  }).sort({ name: 1 });

  const departmentStats: DepartmentStats[] = [];

  for (const department of departments) {
    const employeeCount = await Employee.countDocuments({
      department: department._id,
      employmentStatus: "active",
    });

    departmentStats.push({
      _id: (department._id as any).toString(),
      name: department.name,
      description: department.description,
      employeeCount,
      positions: [],
      createdAt: department.createdAt || new Date(),
    });
  }

  return departmentStats;
}
