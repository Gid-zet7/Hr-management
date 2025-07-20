"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaBuilding,
  FaSearch,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface DepartmentStats {
  summary: {
    totalDepartments: number;
    totalEmployees: number;
    departmentsWithEmployees: number;
    emptyDepartments: number;
    averageEmployeesPerDepartment: number;
  };
  departments: Array<{
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    employeeCount: number;
    employees: Array<{
      _id: string;
      name: string;
      email: string;
      position?: string;
      salary?: number;
    }>;
  }>;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/departments/stats");
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingDepartment
        ? `/api/departments/${editingDepartment._id}`
        : "/api/departments";

      const method = editingDepartment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setEditingDepartment(null);
        setFormData({ name: "", description: "" });
        fetchDepartments();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save department");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to save department");
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteConfirm(null);
        fetchDepartments();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description &&
        dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaBuilding className="mr-3 text-blue-600" />
              Departments
            </h1>
            <p className="text-gray-600 mt-2">
              Manage company departments and organizational structure
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingDepartment(null);
              setFormData({ name: "", description: "" });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2"
          >
            <FaPlus />
            Add Department
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FaBuilding className="text-blue-600 text-2xl" />
                <div>
                  <CardDescription>Total Departments</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats.summary.totalDepartments}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FaUsers className="text-green-600 text-2xl" />
                <div>
                  <CardDescription>Total Employees</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats.summary.totalEmployees}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FaUsers className="text-yellow-600 text-2xl" />
                <div>
                  <CardDescription>Active Departments</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats.summary.departmentsWithEmployees}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FaUsers className="text-purple-600 text-2xl" />
                <div>
                  <CardDescription>Avg. Employees/Dept</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats.summary.averageEmployeesPerDepartment}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => {
          const departmentStats = stats?.departments.find(
            (d) => d._id === department._id
          );
          return (
            <Card
              key={department._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {department.name}
                    </h3>
                    {department.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {department.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUsers className="mr-1" />
                      <span>
                        {departmentStats?.employeeCount || 0} employees
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(department)}
                      title="Edit department"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(department._id)}
                      title="Delete department"
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>

                {departmentStats && departmentStats.employees.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Recent Employees:
                    </p>
                    <div className="space-y-1">
                      {departmentStats.employees.slice(0, 3).map((employee) => (
                        <div
                          key={employee._id}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span>{employee.name}</span>
                          {employee.position && (
                            <span className="text-gray-400 ml-1">
                              • {employee.position}
                            </span>
                          )}
                        </div>
                      ))}
                      {departmentStats.employees.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{departmentStats.employees.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <FaBuilding className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? "No departments found" : "No departments yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first department"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingDepartment(null);
                setFormData({ name: "", description: "" });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Create First Department
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Edit Department" : "Create New Department"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Update the department details below."
                : "Fill in the details to create a new department."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            id="department-form"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Engineering, Marketing, HR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Brief description of the department's role and responsibilities"
              />
            </div>
          </form>
          <DialogFooter className="flex flex-row gap-2">
            <Button type="submit" form="department-form" className="flex-1">
              {editingDepartment ? "Update Department" : "Create Department"}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDepartment(null);
                  setFormData({ name: "", description: "" });
                }}
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <span className="bg-red-100 rounded-full p-2">
                <FaTrash className="text-red-600 text-xl" />
              </span>
              Delete Department
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              department? This will remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-2">
            <AlertDialogAction
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete Department
            </AlertDialogAction>
            <AlertDialogCancel
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
