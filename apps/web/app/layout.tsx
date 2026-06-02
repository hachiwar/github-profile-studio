import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Profile Studio",
  description: "Generate GitHub Profile READMEs, GitHub Pages sites, dynamic cards, and achievement walls."
};

const navItems = [
  ["Generate", "/generate"],
  ["Templates", "/templates"],
  ["Cards", "/cards"],
  ["Achievements", "/achievements"],
  ["Pricing", "/pricing"],
  ["Docs", "/docs"],
  ["Dashboard", "/dashboard"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              GitHub Profile Studio
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-slate-950">
                  {label}
                </Link>
              ))}
            </nav>
            <Link
              href="/login"
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Sign in
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
