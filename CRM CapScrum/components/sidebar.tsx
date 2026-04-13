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
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface SidebarProps {
  role: "ADMIN" | "TEAM" | "CLIENT";
}

const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const adminLinks = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Clients", icon: Users, href: "/dashboard/clients" },
    { label: "Projects", icon: Briefcase, href: "/dashboard/projects" },
    { label: "Pipeline", icon: GitGraph, href: "/dashboard/pipeline" },
    { label: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
  ];

  const clientLinks = [
    { label: "Portal", icon: LayoutDashboard, href: "/portal" },
    { label: "Projects", icon: Briefcase, href: "/portal/projects" },
    { label: "Chat", icon: MessageSquare, href: "/portal/chat" },
  ];

  const links = role === "CLIENT" ? clientLinks : adminLinks;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="block">
          <img 
            src="/logo-full.jpg" 
            alt="CapScrum CRM" 
            className="w-full h-auto max-h-12 object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
              pathname === link.href
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-xl border border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <UserIcon size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
