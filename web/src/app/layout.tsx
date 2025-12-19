import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryCheck | Instagram Story Monitor",
  description: "Monitor and capture Instagram stories from your favorite creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
