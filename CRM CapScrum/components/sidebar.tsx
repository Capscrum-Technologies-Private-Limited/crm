"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GitGraph,
  MessageSquare,
  LogOut,
  User as UserIcon,
  UsersRound,
  CalendarDays,
  X,
  Banknote,
  ChevronRight
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";

interface SidebarProps {
  role: "ADMIN" | "TEAM" | "CLIENT";
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ role, isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const adminLinks = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Clients", icon: Users, href: "/dashboard/clients" },
    { label: "Projects", icon: Briefcase, href: "/dashboard/projects" },
    { label: "Invoices", icon: Banknote, href: "/dashboard/invoices" },
    { label: "Pipeline", icon: GitGraph, href: "/dashboard/pipeline" },
    { label: "Calendar", icon: CalendarDays, href: "/dashboard/calendar" },
    { label: "Team", icon: UsersRound, href: "/dashboard/team" },
    { label: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
  ];

  const clientLinks = [
    { label: "Portal", icon: LayoutDashboard, href: "/portal" },
    { label: "Projects", icon: Briefcase, href: "/portal/projects" },
    { label: "Billing", icon: Banknote, href: "/portal/invoices" },
    { label: "Chat", icon: MessageSquare, href: "/portal/chat" },
  ];

  const links = role === "CLIENT" ? clientLinks : adminLinks;

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "w-72 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 overflow-hidden shadow-sm transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Mobile Close Button */}
      {isOpen && onClose && (
        <button 
          onClick={onClose}
          className="md:hidden absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-muted-foreground transition-all"
        >
          <X size={20} />
        </button>
      )}

      {/* Brand Section */}
      <div className="p-6 pb-8">
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo-full.jpg"
            alt="CapScrum"
            width={160}
            height={48}
            priority
            className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold px-4 mb-4">
          Core Management
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100"
                )}
              >
                <link.icon 
                  size={20} 
                  className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground/70"
                  )} 
                />
                <span className="font-semibold text-sm flex-1">{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                  />
                )}
                <ChevronRight 
                  size={14} 
                  className={cn(
                    "transition-all duration-300 opacity-0 group-hover:opacity-100",
                    isActive ? "text-primary" : "text-muted-foreground/40"
                  )} 
                />
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-100 border border-slate-200 mb-4 group cursor-pointer transition-colors hover:bg-slate-200/60">
          <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/10">
            <UserIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{session?.user?.name || "Premium User"}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-medium opacity-60">
              {role} Account
            </p>
          </div>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300 border border-transparent hover:border-destructive/20"
        >
          <LogOut size={16} />
          <span>Logout Session</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
