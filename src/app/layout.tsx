import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import GoogleScriptLoader from "@/components/GoogleScriptLoader";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ODR Lab",
  description: "Online Dispute Resolution Platform ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <TooltipProvider delayDuration={0}>
            <Navbar/>
            <GoogleScriptLoader />
            {children}
            <Footer/>
          </TooltipProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

