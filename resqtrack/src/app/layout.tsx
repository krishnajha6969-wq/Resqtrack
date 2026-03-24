import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ResQTrack — Smart Disaster Response Coordination",
  description: "Real-time rescue team tracking, route optimization, and coordination platform for disaster response operations. Monitor vehicles, detect congestion, and optimize rescue routes.",
  keywords: "disaster response, rescue tracking, emergency coordination, real-time monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
