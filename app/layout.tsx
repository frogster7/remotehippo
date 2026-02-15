import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./_components/header";

const title = "Niche Tech Job Board";
const description =
  "Remote-friendly tech jobs, EU timezone. For Balkan developers and companies hiring remote talent.";

export const metadata: Metadata = {
  title: { default: title, template: "%s | Niche Tech Job Board" },
  description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
