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

const STATUS_OPTIONS = ["applied", "interviewed", "hired", "rejected"];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [calendly, setCalendly] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      });
  }, []);

  function openModal(app: Application) {
    setSelected(app);
    setStatus(app.status || "applied");
    setCalendly("");
    setShowModal(true);
    setError("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      // PATCH endpoint not implemented, so use POST to a custom endpoint or extend API as needed
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
    </main>
  );
}
