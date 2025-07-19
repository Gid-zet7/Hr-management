"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";

interface Job {
  _id: string;
  title: string;
  department?:
    | {
        _id: string;
        name: string;
      }
    | string;
  location?: string;
  description?: string;
  requirements?: string[];
}

interface WorkExperience {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  responsibilitiesAndAchievements: string;
}

interface Education {
  school: string;
  certificate: string;
  startDate: string;
  endDate: string;
}

export default function ApplyPage({ params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
    linkedin: "",
    portfolio: "",
    github: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    consentToSave: false,
  });
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      companyName: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      responsibilitiesAndAchievements: "",
    },
  ]);
  const [education, setEducation] = useState<Education[]>([
    {
      school: "",
      certificate: "",
      startDate: "",
      endDate: "",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError("Job not found");
          setLoading(false);
        } else {
          setJob(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Failed to load job details");
        setLoading(false);
      });
  }, [jobId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleWorkExperienceChange(
    index: number,
    field: keyof WorkExperience,
    value: string
  ) {
    setWorkExperience((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  }

  function handleEducationChange(
    index: number,
    field: keyof Education,
    value: string
  ) {
    setEducation((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    );
  }

  function addWorkExperience() {
    setWorkExperience((prev) => [
      ...prev,
      {
        companyName: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        responsibilitiesAndAchievements: "",
      },
    ]);
  }

  function removeWorkExperience(index: number) {
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));
  }

  function addEducation() {
    setEducation((prev) => [
      ...prev,
      {
        school: "",
        certificate: "",
        startDate: "",
        endDate: "",
      },
    ]);
  }

  function removeEducation(index: number) {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Filter out empty work experience and education entries
    const filteredWorkExperience = workExperience.filter(
      (exp) => exp.companyName.trim() && exp.jobTitle.trim()
    );
    const filteredEducation = education.filter(
      (edu) => edu.school.trim() && edu.certificate.trim()
    );

    const payload = {
      ...form,
      jobId,
      workExperience: filteredWorkExperience,
      education: filteredEducation,
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // You could also store the applicationId for future reference
        console.log("Application submitted successfully:", data.applicationId);
      } else {
        setError(data.error || "Submission failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to{" "}
            <span className="font-semibold">{job.title}</span>. Your application
            has been received and added to our system.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Our hiring team will review your application and contact you if
              you're selected for an interview.
            </p>
            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Apply for Position
              </h1>
              <p className="text-gray-600 mt-1">
                Complete your application below
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Jobs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Details
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                </div>

                {job.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaBuilding className="mr-2" />
                    <span>
                      {typeof job.department === "object" &&
                      job.department !== null &&
                      "name" in job.department
                        ? job.department.name
                        : job.department}
                    </span>
                  </div>
                )}

                {job.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{job.location}</span>
                  </div>
                )}

                {job.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">{job.description}</p>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Requirements
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Application Form
                </h2>
                <p className="text-gray-600 mt-1">
                  Please fill out all required fields
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        name="firstName"
                        required
                        placeholder="Enter your first name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        name="lastName"
                        required
                        placeholder="Enter your last name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        name="address"
                        placeholder="Enter your street address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          name="city"
                          placeholder="Enter your city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          name="state"
                          placeholder="Enter your state/province"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.state}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP/Postal Code
                        </label>
                        <input
                          name="zip"
                          placeholder="Enter your ZIP/postal code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.zip}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          name="country"
                          placeholder="Enter your country"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.country}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Links */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Professional Links
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume URL *
                      </label>
                      <input
                        name="resumeUrl"
                        type="url"
                        required
                        placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form.resumeUrl}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload your resume to Google Drive, Dropbox, or similar
                        service and paste the link here
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn Profile
                        </label>
                        <input
                          name="linkedin"
                          type="url"
                          placeholder="Your LinkedIn profile URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.linkedin}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Portfolio Website
                        </label>
                        <input
                          name="portfolio"
                          type="url"
                          placeholder="Your portfolio website URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.portfolio}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub Profile
                        </label>
                        <input
                          name="github"
                          type="url"
                          placeholder="Your GitHub profile URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form.github}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaBriefcase className="mr-2" />
                      Work Experience
                    </h3>
                    <button
                      type="button"
                      onClick={addWorkExperience}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FaPlus className="mr-1" />
                      Add Experience
                    </button>
                  </div>

                  <div className="space-y-6">
                    {workExperience.map((exp, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Experience #{index + 1}
                          </h4>
                          {workExperience.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWorkExperience(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <FaTrash className="mr-1" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter company name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={exp.companyName}
                              onChange={(e) =>
                                handleWorkExperienceChange(
                                  index,
                                  "companyName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Job Title
                            </label>
                            <input
                              type="text"
                              placeholder="Enter job title"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={exp.jobTitle}
                              onChange={(e) =>
                                handleWorkExperienceChange(
                                  index,
                                  "jobTitle",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={exp.startDate}
                              onChange={(e) =>
                                handleWorkExperienceChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={exp.endDate}
                              onChange={(e) =>
                                handleWorkExperienceChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Responsibilities & Achievements
                          </label>
                          <textarea
                            placeholder="Describe your responsibilities and key achievements"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={exp.responsibilitiesAndAchievements}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "responsibilitiesAndAchievements",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaGraduationCap className="mr-2" />
                      Education
                    </h3>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FaPlus className="mr-1" />
                      Add Education
                    </button>
                  </div>

                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Education #{index + 1}
                          </h4>
                          {education.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <FaTrash className="mr-1" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              School/University
                            </label>
                            <input
                              type="text"
                              placeholder="Enter school/university name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={edu.school}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "school",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Degree/Certificate
                            </label>
                            <input
                              type="text"
                              placeholder="Enter degree or certificate"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={edu.certificate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "certificate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={edu.startDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={edu.endDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Cover Letter
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Why are you interested in this position?
                    </label>
                    <textarea
                      name="coverLetter"
                      placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={form.coverLetter}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Consent */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      id="consentToSave"
                      name="consentToSave"
                      type="checkbox"
                      checked={form.consentToSave}
                      onChange={handleChange}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label
                      htmlFor="consentToSave"
                      className="text-sm text-gray-700"
                    >
                      I consent to my data being saved for future job
                      opportunities and understand that this information will be
                      processed in accordance with our privacy policy (GDPR
                      compliance).
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
