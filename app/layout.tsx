import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider session={session}>
        <body
          className={`${ibmPlexSans.variable} ${sourceSerif.variable} ${ibmPlexSans.className} antialiased`}
          suppressHydrationWarning
        >
          {children}

          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
};

export default RootLayout;
