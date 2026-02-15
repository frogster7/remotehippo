import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./_components/header";

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
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
