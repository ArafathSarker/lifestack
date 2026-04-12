import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageLoadingBar from "@/components/PageLoadingBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeStack - Your Personal Life Management Hub",
  description:
    "Manage your fitness, finances, and productivity all in one place with LifeStack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans antialiased">
        <PageLoadingBar />
        {children}
      </body>
    </html>
  );
}
