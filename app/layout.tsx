import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Workout Generator",
  description: "Generate personalized, client-ready workout plans in seconds.",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        {/* iframe-resizer child script: lets the Webflow embed auto-size to content */}
        <Script
          src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
