import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chatterbox.app"),
  title: "Chatterbox | Conversations that stay close",
  description:
    "A simple, thoughtful place to message, connect, and keep meaningful conversations flowing.",
  openGraph: {
    title: "Chatterbox",
    description:
      "Simple messaging built for real conversations and lasting connections.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F8F7FF] text-[#201A4B]">{children}</body>
    </html>
  );
}
