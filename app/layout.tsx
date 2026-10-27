import type { Metadata } from "next";
import "./lab.css";

export const metadata: Metadata = {
  title: "StateShift — test what your agent changes",
  description: "Replay multilingual requests. Inspect actual state changes. Export a regression test.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
