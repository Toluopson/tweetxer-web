import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TweetXer Web",
  description: "Clean up your own X account securely.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}