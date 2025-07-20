"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendar,
  FaUsers,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Job {
  _id: string;
  title: string;
  department?: {
    _id: string;
    name: string;
  };
  location?: string;
  description?: string;
  requirements?: string[];
  status: "open" | "closed";
  applicants?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  _id: string;
  name: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
    requirements: [""],
    status: "open" as "open" | "closed",
  });

  const router = useRouter();

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      setJobs(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingJob ? `/api/jobs/${editingJob._id}` : "/api/jobs";

      const method = editingJob ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.filter(
            (req) => req.trim() !== ""
          ),
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setEditingJob(null);
        setFormData({
          title: "",
          department: "",
          location: "",
          description: "",
          requirements: [""],
          status: "open",
        });
        fetchJobs();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save job");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job");
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department?._id || "",
      location: job.location || "",
      description: job.description || "",
      requirements:
        job.requirements && job.requirements.length > 0
          ? job.requirements
          : [""],
      status: job.status,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteConfirm(null);
        fetchJobs();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  const handleStatusChange = async (
    jobId: string,
    newStatus: "open" | "closed"
  ) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchJobs();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status");
    }
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? value : req
      ),
    }));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description &&
        job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.location &&
        job.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    open: jobs.filter((job) => job.status === "open").length,
    closed: jobs.filter((job) => job.status === "closed").length,
    totalApplicants: jobs.reduce(
      (sum, job) => sum + (job.applicants?.length || 0),
      0
    ),
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
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
              <FaBriefcase className="mr-3 text-blue-600" />
              Job Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, manage, and track job postings
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingJob(null);
              setFormData({
                title: "",
                department: "",
                location: "",
                description: "",
                requirements: [""],
                status: "open",
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2"
          >
            <FaPlus />
            Post New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FaBriefcase className="text-blue-600 text-2xl" />
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Jobs
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FaBriefcase className="text-green-600 text-2xl" />
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Open Positions
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.open}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FaBriefcase className="text-yellow-600 text-2xl" />
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Closed Positions
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.closed}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FaUsers className="text-purple-600 text-2xl" />
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Applicants
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalApplicants}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "open" | "closed")
            }
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <Badge
                      variant={
                        job.status === "open" ? "default" : "destructive"
                      }
                      className={`capitalize ${
                        job.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {job.department && (
                      <div className="flex items-center">
                        <FaBuilding className="mr-2" />
                        <span>{job.department.name}</span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaCalendar className="mr-2" />
                      <span>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-2" />
                      <span>{job.applicants?.length || 0} applicants</span>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(job)}
                    title="Edit job"
                  >
                    <FaEdit className="text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(job._id)}
                    title="Delete job"
                  >
                    <FaTrash className="text-red-600" />
                  </Button>
                </div>

                <div className="flex space-x-2">
                  {job.status === "open" ? (
                    <Button
                      variant="outline"
                      className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800"
                      onClick={() => handleStatusChange(job._id, "closed")}
                    >
                      Close Job
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-600 hover:bg-green-50 hover:text-green-800"
                      onClick={() => handleStatusChange(job._id, "open")}
                    >
                      Reopen Job
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-800 flex items-center"
                    onClick={() =>
                      router.push(`/admin/jobs/${job._id}/applicants`)
                    }
                    title="View Applicants"
                  >
                    <FaEye className="mr-1" />
                    View Applicants
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <FaBriefcase className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all"
              ? "No jobs found"
              : "No jobs posted yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search terms or filters"
              : "Get started by posting your first job"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button
              onClick={() => {
                setEditingJob(null);
                setFormData({
                  title: "",
                  department: "",
                  location: "",
                  description: "",
                  requirements: [""],
                  status: "open",
                });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Post First Job
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job" : "Post New Job"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="job-title" className="mb-2">
                  Job Title *
                </Label>
                <Input
                  id="job-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="department" className="mb-2">
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="location" className="mb-2">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div>
                <Label htmlFor="status" className="mb-2">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as "open" | "closed",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="description" className="mb-2">
                Job Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Detailed job description, responsibilities, and expectations..."
              />
            </div>
            <div className="mb-6">
              <Label className="mb-2">Requirements</Label>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeRequirement(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  onClick={addRequirement}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-0"
                >
                  + Add Requirement
                </Button>
              </div>
            </div>
            <DialogFooter className="flex flex-row gap-3">
              <Button type="submit" className="flex-1">
                {editingJob ? "Update Job" : "Post Job"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingJob(null);
                  setFormData({
                    title: "",
                    department: "",
                    location: "",
                    description: "",
                    requirements: [""],
                    status: "open",
                  });
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <FaTrash className="text-red-600 text-xl" />
                </div>
                Delete Job
              </div>
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this job posting? This will remove
            it from the system and all associated applications.
          </p>
          <DialogFooter className="flex flex-row gap-3">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleDelete(deleteConfirm!)}
            >
              Delete Job
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
