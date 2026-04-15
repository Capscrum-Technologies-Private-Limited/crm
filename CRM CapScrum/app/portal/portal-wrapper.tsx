"use client";

import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { useState } from "react";
export default function PortalWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background w-full overflow-x-hidden">
      <Sidebar 
        role="CLIENT"
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 w-full md:ml-72 flex flex-col min-h-screen transition-all duration-300 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

        <TopBar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
        <div className="p-4 md:p-8 flex-1 w-full max-w-[100vw] md:max-w-7xl mx-auto relative z-10 text-[min(16px,4vw)]">
          {children}
        </div>
      </main>
    </div>
  );
}
