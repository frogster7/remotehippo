import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niche Tech Job Board",
  description:
    "Remote-friendly tech jobs, EU timezone. For Balkan developers and companies hiring remote talent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
