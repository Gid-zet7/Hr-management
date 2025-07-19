# Department API Documentation

This document describes the Department API endpoints for managing departments in the HR Management system.

## Overview

The Department API provides comprehensive CRUD operations for managing departments, including:

- Creating new departments
- Retrieving department information
- Updating department details
- Deleting departments (with safety checks)
- Bulk operations
- Department statistics and analytics

## API Endpoints

### 1. List All Departments

**GET** `/api/departments`

Returns a list of all departments sorted alphabetically.

**Response:**

```json
[
  {
    "_id": "department_id",
    "name": "Engineering",
    "description": "Software development team",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### 2. Create New Department

**POST** `/api/departments`

Creates a new department.

**Request Body:**

```json
{
  "name": "Marketing",
  "description": "Marketing and communications team"
}
```

**Response:**

```json
{
  "_id": "new_department_id",
  "name": "Marketing",
  "description": "Marketing and communications team",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Validation:**

- `name` is required and cannot be empty
- Department names must be unique (case-insensitive)

### 3. Get Specific Department

**GET** `/api/departments/[id]`

Returns details of a specific department by ID.

**Response:**

```json
{
  "_id": "department_id",
  "name": "Engineering",
  "description": "Software development team",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Department

**PUT** `/api/departments/[id]`

Updates a specific department.

**Request Body:**

```json
{
  "name": "Software Engineering",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "_id": "department_id",
  "name": "Software Engineering",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Department

**DELETE** `/api/departments/[id]`

Deletes a department if it has no assigned employees.

**Response:**

```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

**Safety Checks:**

- Cannot delete departments with assigned employees
- Returns error if employees are still assigned

### 6. Department Statistics

**GET** `/api/departments/stats`

Returns comprehensive department statistics including employee counts.

**Response:**

```json
{
  "summary": {
    "totalDepartments": 5,
    "totalEmployees": 25,
    "departmentsWithEmployees": 4,
    "emptyDepartments": 1,
    "averageEmployeesPerDepartment": 5.0
  },
  "departments": [
    {
      "_id": "department_id",
      "name": "Engineering",
      "description": "Software development team",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "employeeCount": 8,
      "employees": [
        {
          "_id": "employee_id",
          "name": "John Doe",
          "email": "john@example.com",
          "position": "Senior Developer",
          "salary": 85000
        }
      ]
    }
  ]
}
```

### 7. Bulk Operations

**POST** `/api/departments/bulk`

Performs bulk operations on multiple departments.

**Request Body for Bulk Delete:**

```json
{
  "operation": "delete",
  "departmentIds": ["dept1", "dept2", "dept3"]
}
```

**Request Body for Bulk Update:**

```json
{
  "operation": "update",
  "departmentIds": ["dept1", "dept2"],
  "data": {
    "description": "Updated description for all departments"
  }
}
```

**Response:**

```json
{
  "message": "Bulk delete completed. Deleted: 2, Failed: 0, Skipped: 1",
  "results": {
    "deleted": ["dept1", "dept2"],
    "failed": [],
    "skipped": [
      {
        "id": "dept3",
        "reason": "Cannot delete. 5 employee(s) assigned to this department"
      }
    ]
  }
}
```

## Utility Functions

### Department Statistics

```typescript
import { getAllDepartmentsWithStats } from "@/utils/departmentUtils";

const stats = await getAllDepartmentsWithStats();
stats.forEach((dept) => {
  console.log(`${dept.name}: ${dept.employeeCount} employees`);
});
```

### Department with Employees

```typescript
import { getDepartmentWithEmployees } from "@/utils/departmentUtils";

const department = await getDepartmentWithEmployees("department_id");
if (department) {
  console.log(`Department: ${department.name}`);
  console.log(`Employees: ${department.employees.length}`);
}
```

### Safe Deletion Check

```typescript
import { getDeletableDepartments } from "@/utils/departmentUtils";

const deletable = await getDeletableDepartments();
console.log(`Departments that can be deleted: ${deletable.length}`);
```

### Employee Transfer

```typescript
import { moveEmployeesToDepartment } from "@/utils/departmentUtils";

const result = await moveEmployeesToDepartment(
  ["emp1", "emp2", "emp3"],
  "target_department_id"
);
console.log(`Moved: ${result.moved}, Failed: ${result.failed.length}`);
```

### Department Search

```typescript
import { searchDepartments } from "@/utils/departmentUtils";

const results = await searchDepartments("engineering");
console.log(`Found ${results.length} departments matching "engineering"`);
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **404**: Resource not found
- **409**: Conflict (e.g., duplicate name, cannot delete)
- **500**: Internal server error

**Error Response Format:**

```json
{
  "error": "Error message description"
}
```

## Validation Rules

### Department Name

- Required field
- Cannot be empty or whitespace only
- Must be unique (case-insensitive)
- Trimmed of leading/trailing whitespace

### Department Description

- Optional field
- Trimmed of leading/trailing whitespace
- Can be empty string

### Deletion Safety

- Cannot delete departments with active employees
- Must reassign or remove employees first
- Returns detailed error message with employee count

## Best Practices

1. **Naming Conventions**: Use clear, descriptive department names
2. **Employee Management**: Always check employee assignments before deletion
3. **Bulk Operations**: Use bulk endpoints for multiple operations
4. **Error Handling**: Always handle potential errors in client applications
5. **Validation**: Validate data on both client and server side

## Usage Examples

### Creating a Department

```javascript
const response = await fetch("/api/departments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Human Resources",
    description: "HR and recruitment team",
  }),
});

const department = await response.json();
```

### Updating a Department

```javascript
const response = await fetch(`/api/departments/${departmentId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "People Operations",
    description: "Updated HR team description",
  }),
});

const updatedDepartment = await response.json();
```

### Deleting a Department

```javascript
const response = await fetch(`/api/departments/${departmentId}`, {
  method: "DELETE",
});

const result = await response.json();
if (result.success) {
  console.log("Department deleted successfully");
}
```

### Getting Department Statistics

```javascript
const response = await fetch("/api/departments/stats");
const stats = await response.json();

console.log(`Total departments: ${stats.summary.totalDepartments}`);
console.log(`Total employees: ${stats.summary.totalEmployees}`);
```

## Future Enhancements

Potential improvements to consider:

1. **Department Hierarchy**: Support for parent-child department relationships
2. **Department Managers**: Assign managers to departments
3. **Department Budgets**: Track department budgets and expenses
4. **Department Performance**: Track department-level performance metrics
5. **Department Templates**: Predefined department structures
6. **Audit Trail**: Track changes to department information
