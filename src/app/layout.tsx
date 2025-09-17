import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { SimpleLoader } from "@/components/SimpleLoader";

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
  title: "PixelCode - Interactive Code Editor",
  description: "Share and run code snippets",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/pixelcode.png",
    apple: "/pixelcode.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .initial-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .initial-loader .spinner {
                width: 64px;
                height: 64px;
                border: 4px solid #374151;
                border-top: 4px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .initial-loader.hidden {
                display: none;
              }
            `,
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col`}
          suppressHydrationWarning={true}
        >
          {/* Initial CSS loader - shows immediately */}
          <div id="initial-loader" className="initial-loader">
            <div className="spinner"></div>
          </div>

          <SimpleLoader />
          <ConvexClientProvider>
            <SocketProvider>{children}</SocketProvider>
          </ConvexClientProvider>

          <Footer />

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

// https://emkc.org/api/v2/piston/runtimes
