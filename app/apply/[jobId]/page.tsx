"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Job {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  description?: string;
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
    consentToSave: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((jobs: Job[]) => {
        const found = jobs.find((j) => j._id === jobId);
        setJob(found || null);
        setLoading(false);
      });
  }, [jobId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = { ...form, jobId };
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Submission failed");
    }
    setSubmitting(false);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!job) return <div className="p-8 text-center text-red-600">Job not found.</div>;

  if (success)
    return (
      <div className="max-w-xl mx-auto p-8 mt-12 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-2">Thank you for applying!</h2>
        <p>We have received your application for <span className="font-semibold">{job.title}</span>.</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-4 text-blue-900">Apply for {job.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input name="firstName" required placeholder="First Name" className="input input-bordered flex-1" value={form.firstName} onChange={handleChange} />
            <input name="lastName" required placeholder="Last Name" className="input input-bordered flex-1" value={form.lastName} onChange={handleChange} />
          </div>
          <input name="email" type="email" required placeholder="Email" className="input input-bordered w-full" value={form.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone" className="input input-bordered w-full" value={form.phone} onChange={handleChange} />
          <input name="resumeUrl" placeholder="Resume URL" className="input input-bordered w-full" value={form.resumeUrl} onChange={handleChange} />
          <textarea name="coverLetter" placeholder="Cover Letter" className="textarea textarea-bordered w-full" value={form.coverLetter} onChange={handleChange} />
          <div className="flex items-center">
            <input id="consentToSave" name="consentToSave" type="checkbox" checked={form.consentToSave} onChange={handleChange} className="mr-2" required />
            <label htmlFor="consentToSave" className="text-gray-700">I consent to my data being saved for future job opportunities (GDPR compliance).</label>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </main>
  );
}
