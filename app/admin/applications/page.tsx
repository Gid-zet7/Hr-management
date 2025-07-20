"use client";
import { useEffect, useState } from "react";

interface Application {
  _id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status?: "applied" | "interviewed" | "hired" | "rejected";
  createdAt?: string;
}

interface Job {
  _id: string;
  title: string;
  department?: {
    _id: string;
    name: string;
  };
}

const STATUS_OPTIONS = ["applied", "interviewed", "hired", "rejected"];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [calendly, setCalendly] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Interview form state
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewDuration, setInterviewDuration] = useState(60);
  const [interviewType, setInterviewType] = useState<
    "phone" | "video" | "in-person"
  >("video");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewVideoLink, setInterviewVideoLink] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      });

    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data);
      });
  }, []);

  function openModal(app: Application) {
    setSelected(app);
    setStatus(app.status || "applied");
    setCalendly("");
    setShowModal(true);
    setError("");
  }

  function openInterviewModal(app: Application) {
    setSelected(app);
    setShowInterviewModal(true);
    setError("");
    // Set default values
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split("T")[0]);
    setInterviewTime("10:00");
    setInterviewDuration(60);
    setInterviewType("video");
    setInterviewLocation("");
    setInterviewVideoLink("");
    setInterviewer("");
    setInterviewNotes("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/applications/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, calendlyInvite: calendly }),
      });
      if (!res.ok) throw new Error("Failed to update application");
      const updated = await res.json();
      setApplications(
        applications.map((a) => (a._id === updated._id ? updated : a))
      );
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleScheduleInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSchedulingInterview(true);
    setError("");

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: selected._id,
          jobId: selected.jobId,
          date: interviewDate,
          time: interviewTime,
          duration: interviewDuration,
          type: interviewType,
          location: interviewLocation,
          videoLink: interviewVideoLink,
          interviewer: interviewer,
          notes: interviewNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to schedule interview");
      }

      const result = await res.json();

      // Update the application status to "interviewed"
      setApplications(
        applications.map((a) =>
          a._id === selected._id ? { ...a, status: "interviewed" } : a
        )
      );

      setShowInterviewModal(false);
      alert("Interview scheduled successfully! Email invitation sent.");
    } catch (err: any) {
      setError(err.message || "Error scheduling interview");
    } finally {
      setSchedulingInterview(false);
    }
  }

  function getJobTitle(jobId: string): string {
    const job = jobs.find((j) => j._id === jobId);
    return job ? job.title : "Unknown Job";
  }

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Applications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Job</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Applied</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    {app.firstName} {app.lastName}
                  </td>
                  <td className="py-2 px-4">{app.email}</td>
                  <td className="py-2 px-4">{getJobTitle(app.jobId)}</td>
                  <td className="py-2 px-4 capitalize">{app.status}</td>
                  <td className="py-2 px-4">
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => openModal(app)}
                    >
                      Manage
                    </button>
                    {app.status === "applied" && (
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => openInterviewModal(app)}
                      >
                        Invite for Interview
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for status update and interview invite */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Manage Application</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Calendly Invite Link (optional)
                </label>
                <input
                  type="url"
                  value={calendly}
                  onChange={(e) => setCalendly(e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowInterviewModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Schedule Interview</h2>
            <p className="text-gray-600 mb-4">
              Scheduling interview for {selected.firstName} {selected.lastName}{" "}
              - {getJobTitle(selected.jobId)}
            </p>
            {error && <p className="text-red-600 mb-2">{error}</p>}

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Date *</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Time *</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">
                    Duration (minutes)
                  </label>
                  <select
                    value={interviewDuration}
                    onChange={(e) =>
                      setInterviewDuration(Number(e.target.value))
                    }
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) =>
                      setInterviewType(
                        e.target.value as "phone" | "video" | "in-person"
                      )
                    }
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
              </div>

              {interviewType === "in-person" && (
                <div>
                  <label className="block mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="Office address or meeting room"
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
              )}

              {interviewType === "video" && (
                <div>
                  <label className="block mb-1 font-medium">Video Link</label>
                  <input
                    type="url"
                    value={interviewVideoLink}
                    onChange={(e) => setInterviewVideoLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 font-medium">Interviewer</label>
                <input
                  type="text"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  placeholder="Interviewer name"
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Notes</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Additional notes for the candidate"
                  rows={3}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                disabled={schedulingInterview}
              >
                {schedulingInterview
                  ? "Scheduling..."
                  : "Schedule Interview & Send Email"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
