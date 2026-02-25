import type { Metadata } from "next";
import { Open_Sans, Work_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
});

const title = "Niche Tech Job Board";
const description =
  "Remote-friendly tech jobs. For Balkan developers and companies hiring remote talent.";

export const metadata: Metadata = {
  title: { default: title, template: "%s | Niche Tech Job Board" },
  description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
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
    <html
      lang="en"
      className={`${openSans.variable} ${workSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${openSans.className} antialiased`}
        suppressHydrationWarning
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
  try {
    const key = "theme";
    const stored = localStorage.getItem(key);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme =
      stored === "light" || stored === "dark"
        ? stored
        : systemDark
          ? "dark"
          : "light";
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", systemDark);
    document.documentElement.style.colorScheme = systemDark ? "dark" : "light";
  }
})();`}
        </Script>
        <div className="flex min-h-screen flex-col" suppressHydrationWarning>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
