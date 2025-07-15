"use client";
import Link from "next/link";

export default function AdminJobsPage() {
  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Jobs</h1>
      {/* TODO: List jobs, edit/delete/add actions */}
      <Link href="/admin/jobs/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add New Job</Link>
    </main>
  );
}
