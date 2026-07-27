import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PixelCode — Online Code Editor & Collaboration Platform",
  description:
    "Write, run, and collaborate on code in 10+ languages. Real-time pair programming, community snippets, and a premium coding experience.",
  keywords: [
    "online code editor",
    "code compiler",
    "real-time collaboration",
    "pair programming",
    "code snippets",
    "pixelcode",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/pixelcode.png",
    apple: "/pixelcode.png",
  },
  openGraph: {
    title: "PixelCode — Online Code Editor & Collaboration Platform",
    description:
      "Write, run, and collaborate on code in 10+ languages with a premium developer experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </AuthProvider>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-canvas-elevated)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "var(--font-geist-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
