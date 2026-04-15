"use client";

import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DashboardWrapper({ children, role }: { children: React.ReactNode, role: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background w-full overflow-x-hidden">
      <Sidebar 
        role={role as any} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 w-full md:ml-72 flex flex-col min-h-screen transition-all duration-300">
        <TopBar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <div className="p-4 md:p-8 flex-1 w-full max-w-[100vw] md:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
