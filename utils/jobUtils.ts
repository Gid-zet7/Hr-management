import { Job, Department, Applicant } from "@/models";
import { dbConnect } from "@/models";
import mongoose from "mongoose";

/**
 * Utility functions for job management
 */

export interface JobStats {
  _id: string;
  title: string;
  department?: {
    _id: string;
    name: string;
  };
  location?: string;
  status: "open" | "closed";
  applicantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobWithDetails {
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
  applicants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    createdAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all jobs with applicant statistics
 */
export async function getAllJobsWithStats(): Promise<JobStats[]> {
  await dbConnect();

  const jobs = await Job.find()
    .populate("department", "name")
    .populate("applicants", "firstName lastName email")
    .sort({ createdAt: -1 });

  return jobs.map((job) => ({
    _id: (job._id as mongoose.Types.ObjectId).toString(),
    title: job.title,
    department: job.department
      ? {
          _id: (job.department._id as mongoose.Types.ObjectId).toString(),
          name: (job.department as any).name,
        }
      : undefined,
    location: job.location,
    status: job.status || "open",
    applicantCount: job.applicants?.length || 0,
    createdAt: job.createdAt || new Date(),
    updatedAt: job.updatedAt || new Date(),
  }));
}

/**
 * Get a specific job with all details
 */
export async function getJobWithDetails(
  jobId: string
): Promise<JobWithDetails | null> {
  await dbConnect();

  const job = await Job.findById(jobId)
    .populate("department", "name")
    .populate(
      "applicants",
      "firstName lastName email phone resumeUrl createdAt"
    );

  if (!job) return null;

  return {
    _id: (job._id as mongoose.Types.ObjectId).toString(),
    title: job.title,
    department: job.department
      ? {
          _id: (job.department._id as mongoose.Types.ObjectId).toString(),
          name: (job.department as any).name,
        }
      : undefined,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    status: job.status || "open",
    applicants:
      job.applicants?.map((applicant) => ({
        _id: (applicant._id as mongoose.Types.ObjectId).toString(),
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        resumeUrl: applicant.resumeUrl,
        createdAt: applicant.createdAt,
      })) || [],
    createdAt: job.createdAt || new Date(),
    updatedAt: job.updatedAt || new Date(),
  };
}

/**
 * Get jobs by department
 */
export async function getJobsByDepartment(
  departmentId: string
): Promise<JobStats[]> {
  await dbConnect();

  const jobs = await Job.find({ department: departmentId })
    .populate("department", "name")
    .populate("applicants", "firstName lastName email")
    .sort({ createdAt: -1 });

  return jobs.map((job) => ({
    _id: (job._id as mongoose.Types.ObjectId).toString(),
    title: job.title,
    department: job.department
      ? {
          _id: (job.department._id as mongoose.Types.ObjectId).toString(),
          name: (job.department as any).name,
        }
      : undefined,
    location: job.location,
    status: job.status || "open",
    applicantCount: job.applicants?.length || 0,
    createdAt: job.createdAt || new Date(),
    updatedAt: job.updatedAt || new Date(),
  }));
}

/**
 * Get jobs by status
 */
export async function getJobsByStatus(
  status: "open" | "closed"
): Promise<JobStats[]> {
  await dbConnect();

  const jobs = await Job.find({ status })
    .populate("department", "name")
    .populate("applicants", "firstName lastName email")
    .sort({ createdAt: -1 });

  return jobs.map((job) => ({
    _id: (job._id as mongoose.Types.ObjectId).toString(),
    title: job.title,
    department: job.department
      ? {
          _id: (job.department._id as mongoose.Types.ObjectId).toString(),
          name: (job.department as any).name,
        }
      : undefined,
    location: job.location,
    status: job.status || "open",
    applicantCount: job.applicants?.length || 0,
    createdAt: job.createdAt || new Date(),
    updatedAt: job.updatedAt || new Date(),
  }));
}

/**
 * Search jobs by title, description, or location
 */
export async function searchJobs(query: string): Promise<JobStats[]> {
  await dbConnect();

  const jobs = await Job.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
    ],
  })
    .populate("department", "name")
    .populate("applicants", "firstName lastName email")
    .sort({ createdAt: -1 });

  return jobs.map((job) => ({
    _id: (job._id as mongoose.Types.ObjectId).toString(),
    title: job.title,
    department: job.department
      ? {
          _id: (job.department._id as mongoose.Types.ObjectId).toString(),
          name: (job.department as any).name,
        }
      : undefined,
    location: job.location,
    status: job.status || "open",
    applicantCount: job.applicants?.length || 0,
    createdAt: job.createdAt || new Date(),
    updatedAt: job.updatedAt || new Date(),
  }));
}

/**
 * Get job statistics for dashboard
 */
export async function getJobDashboardStats() {
  await dbConnect();

  const totalJobs = await Job.countDocuments();
  const openJobs = await Job.countDocuments({ status: "open" });
  const closedJobs = await Job.countDocuments({ status: "closed" });

  // Get total applicants across all jobs
  const jobsWithApplicants = await Job.find().populate("applicants");
  const totalApplicants = jobsWithApplicants.reduce(
    (sum, job) => sum + (job.applicants?.length || 0),
    0
  );

  // Get jobs by department
  const jobsByDepartment = await Job.aggregate([
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
        departmentName: {
          $first: { $arrayElemAt: ["$departmentInfo.name", 0] },
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // Get recent jobs
  const recentJobs = await Job.find()
    .populate("department", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    summary: {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplicants,
      averageApplicantsPerJob:
        totalJobs > 0
          ? Math.round((totalApplicants / totalJobs) * 100) / 100
          : 0,
    },
    jobsByDepartment: jobsByDepartment.map((item) => ({
      departmentId: item._id,
      departmentName: item.departmentName || "No Department",
      count: item.count,
    })),
    recentJobs: recentJobs.map((job) => ({
      _id: (job._id as mongoose.Types.ObjectId).toString(),
      title: job.title,
      department: (job.department as any)?.name,
      status: job.status || "open",
      applicantCount: job.applicants?.length || 0,
      createdAt: job.createdAt,
    })),
  };
}

/**
 * Close a job and notify applicants
 */
export async function closeJob(jobId: string): Promise<{
  success: boolean;
  message: string;
  affectedApplicants: number;
}> {
  await dbConnect();

  const job = await Job.findById(jobId).populate("applicants");
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status === "closed") {
    return {
      success: false,
      message: "Job is already closed",
      affectedApplicants: 0,
    };
  }

  job.status = "closed";
  job.updatedAt = new Date();
  await job.save();

  const affectedApplicants = job.applicants?.length || 0;

  return {
    success: true,
    message: `Job "${job.title}" has been closed successfully`,
    affectedApplicants,
  };
}

/**
 * Reopen a job
 */
export async function reopenJob(jobId: string): Promise<{
  success: boolean;
  message: string;
}> {
  await dbConnect();

  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status === "open") {
    return {
      success: false,
      message: "Job is already open",
    };
  }

  job.status = "open";
  job.updatedAt = new Date();
  await job.save();

  return {
    success: true,
    message: `Job "${job.title}" has been reopened successfully`,
  };
}

/**
 * Get jobs that can be safely deleted (no applicants)
 */
export async function getDeletableJobs(): Promise<
  Array<{
    _id: string;
    title: string;
    department?: string;
    applicantCount: number;
  }>
> {
  await dbConnect();

  const jobs = await Job.find()
    .populate("department", "name")
    .populate("applicants");

  return jobs
    .filter((job) => !job.applicants || job.applicants.length === 0)
    .map((job) => ({
      _id: (job._id as mongoose.Types.ObjectId).toString(),
      title: job.title,
      department: (job.department as any)?.name,
      applicantCount: job.applicants?.length || 0,
    }));
}

/**
 * Add applicant to job's applicants array
 */
export async function addApplicantToJob(
  jobId: string,
  applicantId: string
): Promise<{
  success: boolean;
  message: string;
  job?: any;
}> {
  await dbConnect();

  try {
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    // Check if job is still open
    if (job.status === "closed") {
      return {
        success: false,
        message: "This job is no longer accepting applications",
      };
    }

    // Check if applicant is already in the job's applicants array
    const existingApplicant = job.applicants?.find(
      (app) => app.toString() === applicantId
    );

    if (existingApplicant) {
      return {
        success: false,
        message: "You have already applied for this position",
      };
    }

    // Add applicant to job's applicants array
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $push: { applicants: applicantId } },
      { new: true }
    ).populate("applicants", "firstName lastName email");

    return {
      success: true,
      message: "Application added to job successfully",
      job: updatedJob,
    };
  } catch (error) {
    console.error("Error adding applicant to job:", error);
    return {
      success: false,
      message: "Failed to add applicant to job",
    };
  }
}

/**
 * Remove applicant from job's applicants array
 */
export async function removeApplicantFromJob(
  jobId: string,
  applicantId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  await dbConnect();

  try {
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $pull: { applicants: applicantId } },
      { new: true }
    );

    if (!updatedJob) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    return {
      success: true,
      message: "Applicant removed from job successfully",
    };
  } catch (error) {
    console.error("Error removing applicant from job:", error);
    return {
      success: false,
      message: "Failed to remove applicant from job",
    };
  }
}

/**
 * Get job with applicants details
 */
export async function getJobWithApplicants(jobId: string): Promise<{
  success: boolean;
  job?: any;
  message?: string;
}> {
  await dbConnect();

  try {
    const job = await Job.findById(jobId)
      .populate("department", "name")
      .populate(
        "applicants",
        "firstName lastName email phone resumeUrl createdAt status"
      );

    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    return {
      success: true,
      job,
    };
  } catch (error) {
    console.error("Error fetching job with applicants:", error);
    return {
      success: false,
      message: "Failed to fetch job details",
    };
  }
}

/**
 * Get applicants for a specific job
 */
export async function getJobApplicants(jobId: string): Promise<{
  success: boolean;
  applicants?: any[];
  message?: string;
}> {
  await dbConnect();

  try {
    const job = await Job.findById(jobId).populate(
      "applicants",
      "firstName lastName email phone resumeUrl createdAt status coverLetter workExperience education"
    );

    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    return {
      success: true,
      applicants: job.applicants || [],
    };
  } catch (error) {
    console.error("Error fetching job applicants:", error);
    return {
      success: false,
      message: "Failed to fetch applicants",
    };
  }
}
