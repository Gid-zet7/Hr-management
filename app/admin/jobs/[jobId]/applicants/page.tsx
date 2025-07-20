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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
    // eslint-disable-next-line
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
          <Button
            onClick={() => router.push("/admin/jobs")}
            className="bg-blue-600 text-white"
          >
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/jobs")}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center px-2"
              >
                <FaArrowLeft className="mr-2" />
                Back to Jobs
              </Button>
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
              <Card
                key={applicant._id}
                className="bg-white rounded-lg shadow-sm border"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {applicant.email}
                      </CardDescription>
                    </div>
                    <Select
                      value={applicant.status}
                      onValueChange={(value) =>
                        updateApplicantStatus(applicant._id, value)
                      }
                    >
                      <SelectTrigger
                        className={`w-[130px] h-8 rounded-full text-xs font-medium border-0 ${getStatusColor(
                          applicant.status
                        )}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="offer_sent">Offer Sent</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
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
                  <div className="flex space-x-2 mb-4">
                    {applicant.resumeUrl && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                        title="View Resume"
                      >
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaFileAlt />
                        </a>
                      </Button>
                    )}
                    {applicant.linkedin && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <a
                          href={applicant.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaLinkedin />
                        </a>
                      </Button>
                    )}
                    {applicant.portfolio && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                        title="Portfolio"
                      >
                        <a
                          href={applicant.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaGlobe />
                        </a>
                      </Button>
                    )}
                    {applicant.github && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                        title="GitHub Profile"
                      >
                        <a
                          href={applicant.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaGithub />
                        </a>
                      </Button>
                    )}
                  </div>
                  <Separator className="mb-4" />
                  <Accordion
                    type="multiple"
                    className="space-y-2"
                    defaultValue={[]}
                  >
                    {/* Work Experience */}
                    {applicant.workExperience &&
                      applicant.workExperience.length > 0 && (
                        <AccordionItem value="work-experience">
                          <AccordionTrigger className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <FaBriefcase className="mr-1" />
                            Work Experience
                          </AccordionTrigger>
                          <AccordionContent>
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
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    {/* Education */}
                    {applicant.education && applicant.education.length > 0 && (
                      <AccordionItem value="education">
                        <AccordionTrigger className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <FaGraduationCap className="mr-1" />
                          Education
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {applicant.education
                              .slice(0, 2)
                              .map((edu, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-gray-600"
                                >
                                  <div className="font-medium">
                                    {edu.certificate}
                                  </div>
                                  <div>{edu.school}</div>
                                </div>
                              ))}
                            {applicant.education.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{applicant.education.length - 2} more degrees
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {/* Cover Letter */}
                    {applicant.coverLetter && (
                      <AccordionItem value="cover-letter">
                        <AccordionTrigger className="text-sm font-medium text-gray-900">
                          Cover Letter
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-xs text-gray-600 whitespace-pre-line">
                            {applicant.coverLetter}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
