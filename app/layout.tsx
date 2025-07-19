import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "HR Management App",
  description: "Corporate HR management and job board application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-gray-50 min-h-screen`}>
        <header className="w-full py-4 bg-white shadow mb-8">
          <nav className="max-w-5xl mx-auto flex items-center justify-between px-4">
            <a href="/" className="text-2xl font-bold text-blue-700">
              HR Portal
            </a>
            <div>
              <a href="/jobs" className="mr-6 text-blue-700 hover:underline">
                Jobs
              </a>
              <a href="/admin" className="text-blue-700 hover:underline">
                Admin
              </a>
              <LoginLink>Sign in</LoginLink>
              <RegisterLink>Sign up</RegisterLink>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
