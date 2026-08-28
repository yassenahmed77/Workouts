import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GymProvider } from "@/context/GymContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PULSE | Professional Coach & Trainee Workout Platform",
  description: "High-performance training portal for coaches and dedicated athletes. Program assignment, live workout execution, and volume metrics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f6]">
        <GymProvider>
          {children}
        </GymProvider>
      </body>
    </html>
  );
}
