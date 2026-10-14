import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GymProvider } from "@/context/GymContext";
import { ToastProvider } from "@/context/ToastContext";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export const metadata = {
    title: "WORKOUTS PRO | Athlete & Coach OS",
    description: "High-performance training app for Coach Yassen Ahmed and athletes.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "WORKOUTS PRO"
    },
    icons: {
        icon: "/icon.svg",
        apple: "/icon.svg"
    }
};
export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#0a0a0c"
};
export default function RootLayout({ children, }) {
    return (<html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-slate-100">
        <ToastProvider>
          <GymProvider>
            {children}
          </GymProvider>
        </ToastProvider>
      </body>
    </html>);
}
