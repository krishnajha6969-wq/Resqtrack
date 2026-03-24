import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "ResQTrack — Smart Disaster Response Coordination",
  description: "Real-time disaster response coordination platform with live tracking, congestion-aware routing, offline-first architecture, and command center dashboards.",
  keywords: "disaster response, rescue coordination, emergency management, real-time tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-slate-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
