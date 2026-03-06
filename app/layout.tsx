import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MM Admin Panel",
  description: "Makeup Mystery Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="flex min-h-screen">
          
          {/* Sidebar */}
          <div className="w-64 bg-black text-white p-5">
            <h2 className="text-xl font-bold mb-6">
              MM Admin
            </h2>

            <nav className="space-y-3">
              <a href="/sections" className="block hover:text-pink-400">
                Sections
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}