import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CapScrum CRM | Premium SaaS Platform",
  description: "Next-generation custom CRM for peak performance",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body className={`${outfit.variable} font-sans bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary`}>
        <NextAuthProvider session={session}>
          <div className="relative min-h-screen">
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
