"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

function statusColor(status: string) {
  switch (status) {
    case "applied":
      return "bg-blue-100 text-blue-800";
    case "interviewed":
      return "bg-yellow-100 text-yellow-800";
    case "hired":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
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

      await res.json();

      setShowInterviewModal(false);
      alert("Interview scheduled successfully! Email invitation sent.");
    } catch (err: any) {
      setError(err.message || "Error scheduling interview");
    } finally {
      setSchedulingInterview(false);
    }
  }

  async function handleSendOffer(app: Application) {
    // Update status to offer_sent
    await fetch(`/api/applications/${app._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "offer_sent" }),
    });
    // Send offer email
    await fetch("/api/mail/mailgun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailTo: app.email,
        subject: `Offer Letter - ${getJobTitle(app.jobId)}`,
        htmlContent: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'><h2 style='color: #2563eb;'>Offer Letter</h2><p>Dear ${
          app.firstName
        } ${
          app.lastName
        },</p><p>Congratulations! We are pleased to offer you the position of <strong>${getJobTitle(
          app.jobId
        )}</strong> at our company. Please reply to this email to confirm your acceptance.</p><p>Best regards,<br>HR Team</p></div>`,
      }),
    });
    alert("Offer letter sent!");
  }

  async function handleReject(app: Application) {
    // Update status to rejected
    await fetch(`/api/applications/${app._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    // Send rejection email
    await fetch("/api/mail/mailgun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailTo: app.email,
        subject: `Application Update - ${getJobTitle(app.jobId)}`,
        htmlContent: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'><h2 style='color: #ef4444;'>Application Update</h2><p>Dear ${
          app.firstName
        } ${
          app.lastName
        },</p><p>Thank you for interviewing for the <strong>${getJobTitle(
          app.jobId
        )}</strong> position. We appreciate your time and interest, but we have decided not to move forward with your application. We wish you the best in your job search.</p><p>Best regards,<br>HR Team</p></div>`,
      }),
    });
    alert("Rejection email sent.");
  }

  function getJobTitle(jobId: string): string {
    const job = jobs.find((j) => j._id === jobId);
    return job ? job.title : "Unknown Job";
  }

  // Filter applications based on statusFilter
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Applications</h1>
      <div className="mb-4 flex items-center gap-4">
        <Label htmlFor="status-filter" className="mr-2">
          Filter by Status:
        </Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="status-filter" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : filteredApplications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border bg-background shadow-sm">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">
                      {app.firstName} {app.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate max-w-[180px]">
                      {app.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate max-w-[180px]">
                      {getJobTitle(app.jobId)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "capitalize",
                        statusColor(app.status || "")
                      )}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => openModal(app)}
                    >
                      Manage
                    </Button>
                    {app.status === "applied" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openInterviewModal(app)}
                      >
                        Invite for Interview
                      </Button>
                    )}
                    {app.status === "interviewed" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleSendOffer(app)}
                        >
                          Send Offer
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(app)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal for status update and interview invite */}
      <Dialog open={showModal && !!selected} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Application</DialogTitle>
            <DialogDescription>
              Update the status or send a Calendly invite link.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <form
            onSubmit={handleUpdate}
            className="space-y-4"
            id="update-application-form"
          >
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="mt-1 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="calendly">Calendly Invite Link (optional)</Label>
              <Input
                id="calendly"
                type="url"
                value={calendly}
                onChange={(e) => setCalendly(e.target.value)}
                placeholder="https://calendly.com/your-link"
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              form="update-application-form"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Application"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Scheduling Modal */}
      <Dialog
        open={showInterviewModal && !!selected}
        onOpenChange={setShowInterviewModal}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Scheduling interview for {selected?.firstName}{" "}
              {selected?.lastName} - {selected && getJobTitle(selected.jobId)}
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <form
            onSubmit={handleScheduleInterview}
            className="space-y-4"
            id="schedule-interview-form"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview-date">Date *</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interview-time">Time *</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview-duration">Duration (minutes)</Label>
                <Select
                  value={String(interviewDuration)}
                  onValueChange={(val) => setInterviewDuration(Number(val))}
                >
                  <SelectTrigger
                    id="interview-duration"
                    className="mt-1 w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interview-type">Type</Label>
                <Select
                  value={interviewType}
                  onValueChange={(val) =>
                    setInterviewType(val as "phone" | "video" | "in-person")
                  }
                >
                  <SelectTrigger id="interview-type" className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {interviewType === "in-person" && (
              <div>
                <Label htmlFor="interview-location">Location</Label>
                <Input
                  id="interview-location"
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  placeholder="Office address or meeting room"
                />
              </div>
            )}
            {interviewType === "video" && (
              <div>
                <Label htmlFor="interview-video-link">Video Link</Label>
                <Input
                  id="interview-video-link"
                  type="url"
                  value={interviewVideoLink}
                  onChange={(e) => setInterviewVideoLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </div>
            )}
            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="Interviewer name"
              />
            </div>
            <div>
              <Label htmlFor="interview-notes">Notes</Label>
              <Textarea
                id="interview-notes"
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Additional notes for the candidate"
                rows={3}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              form="schedule-interview-form"
              disabled={schedulingInterview}
              variant="default"
            >
              {schedulingInterview
                ? "Scheduling..."
                : "Schedule Interview & Send Email"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
