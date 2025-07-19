"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16 px-4 shadow">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Welcome to Acme HR Portal
          </h1>
          <p className="text-lg md:text-2xl mb-6 font-medium">
            Empowering People. Driving Success.
            <br />
            Explore open roles and join our team.
          </p>
          <Link
            href="#jobs"
            className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded shadow hover:bg-blue-100 transition"
          >
            View Open Positions
          </Link>
        </div>
      </header>

      {/* Job Board Section */}
      <main id="jobs" className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-blue-900 text-center">
            Current Job Openings
          </h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-center text-gray-500">
              No jobs available at this time.
            </p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-8">
              {jobs.map((job) => (
                <li
                  key={job._id}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-xl border border-blue-100 transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-1">
                      {job.title}
                    </h3>
                    <div className="text-gray-600 mb-2 text-sm">
                      {typeof job.department === "object" &&
                      job.department !== null &&
                      "name" in job.department
                        ? job.department.name
                        : "No Department"}{" "}
                      | {job.location}
                    </div>
                    <p className="mb-4 text-gray-700 text-sm">
                      {job.description?.slice(0, 120)}...
                    </p>
                  </div>
                  <Link
                    href={`/apply/${job._id}`}
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-center"
                  >
                    Apply Now
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Acme Corporation. All rights
            reserved.
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
