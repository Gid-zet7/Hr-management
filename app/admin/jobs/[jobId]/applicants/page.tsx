"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaBriefcase,
  FaGraduationCap,
  FaCalendar,
  FaUser,
} from "react-icons/fa";

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  workExperience?: Array<{
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    responsibilitiesAndAchievements: string;
  }>;
  education?: Array<{
    school: string;
    certificate: string;
    startDate: string;
    endDate: string;
  }>;
  status: "applied" | "interviewed" | "offer_sent" | "hired" | "rejected";
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
  department?: {
    _id: string;
    name: string;
  };
  location?: string;
  status: string;
}

export default function JobApplicantsPage({
  params,
}: {
  params: { jobId: string };
}) {
  const { jobId } = params;
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchJobApplicants();
  }, [jobId]);

  const fetchJobApplicants = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applicants`);
      const data = await response.json();

      if (response.ok) {
        setJob(data.job);
        setApplicants(data.applicants);
      } else {
        setError(data.error || "Failed to fetch applicants");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicantStatus = async (
    applicantId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the local state
        setApplicants((prev) =>
          prev.map((app) =>
            app._id === applicantId ? { ...app, status: newStatus as any } : app
          )
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "interviewed":
        return "bg-yellow-100 text-yellow-800";
      case "offer_sent":
        return "bg-purple-100 text-purple-800";
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/admin/jobs")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin/jobs")}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Back to Jobs
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Job Applicants
                </h1>
                <p className="text-gray-600">{job?.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Applicants</p>
              <p className="text-2xl font-bold text-blue-600">
                {applicants.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {applicants.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Applicants Yet
            </h3>
            <p className="text-gray-600">
              This job hasn't received any applications yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {applicants.map((applicant) => (
              <div
                key={applicant._id}
                className="bg-white rounded-lg shadow-sm border"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{applicant.email}</p>
                    </div>
                    <select
                      value={applicant.status}
                      onChange={(e) =>
                        updateApplicantStatus(applicant._id, e.target.value)
                      }
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(
                        applicant.status
                      )}`}
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="offer_sent">Offer Sent</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {applicant.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="mr-2 text-gray-400" />
                        {applicant.phone}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendar className="mr-2 text-gray-400" />
                      Applied{" "}
                      {new Date(applicant.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Professional Links */}
                  <div className="flex space-x-2 mb-4">
                    {applicant.resumeUrl && (
                      <a
                        href={applicant.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="View Resume"
                      >
                        <FaFileAlt />
                      </a>
                    )}
                    {applicant.linkedin && (
                      <a
                        href={applicant.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <FaLinkedin />
                      </a>
                    )}
                    {applicant.portfolio && (
                      <a
                        href={applicant.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Portfolio"
                      >
                        <FaGlobe />
                      </a>
                    )}
                    {applicant.github && (
                      <a
                        href={applicant.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="GitHub Profile"
                      >
                        <FaGithub />
                      </a>
                    )}
                  </div>

                  {/* Work Experience */}
                  {applicant.workExperience &&
                    applicant.workExperience.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <FaBriefcase className="mr-1" />
                          Work Experience
                        </h4>
                        <div className="space-y-2">
                          {applicant.workExperience
                            .slice(0, 2)
                            .map((exp, index) => (
                              <div
                                key={index}
                                className="text-xs text-gray-600"
                              >
                                <div className="font-medium">
                                  {exp.jobTitle}
                                </div>
                                <div>{exp.companyName}</div>
                              </div>
                            ))}
                          {applicant.workExperience.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{applicant.workExperience.length - 2} more
                              positions
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Education */}
                  {applicant.education && applicant.education.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <FaGraduationCap className="mr-1" />
                        Education
                      </h4>
                      <div className="space-y-2">
                        {applicant.education.slice(0, 2).map((edu, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <div className="font-medium">{edu.certificate}</div>
                            <div>{edu.school}</div>
                          </div>
                        ))}
                        {applicant.education.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{applicant.education.length - 2} more degrees
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter Preview */}
                  {applicant.coverLetter && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Cover Letter
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {applicant.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
