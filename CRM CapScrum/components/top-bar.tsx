"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface TopBarProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

export default function TopBar({ onMenuClick, isMobileMenuOpen }: TopBarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true })
    });
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-20 w-full flex items-center justify-between px-6 md:px-10 z-40 bg-background/80 backdrop-blur-lg border-b border-slate-200 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-foreground hover:bg-slate-100 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4" ref={dropdownRef}>
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/30 transition-all shadow-sm relative group"
          >
            <Bell size={20} className={cn(unreadCount > 0 && "animate-[wiggle_1s_ease-in-out_infinite]")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 w-[340px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden z-50 origin-top-right flex flex-col max-h-[500px]"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} />
                      Mark All Read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-muted-foreground/30">
                        <Bell size={20} />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground/60">You&apos;re all caught up!</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                        className={cn(
                          "p-4 rounded-2xl mb-1 cursor-pointer transition-all border",
                          notification.isRead 
                            ? "bg-transparent border-transparent hover:bg-slate-50 opacity-60" 
                            : "bg-primary/5 hover:bg-primary/10 border-primary/10 relative"
                        )}
                      >
                        {!notification.isRead && (
                          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <h4 className={cn("text-sm font-bold truncate pr-4", notification.isRead ? "text-foreground" : "text-primary")}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <span className="text-[9px] font-black uppercase text-muted-foreground/40 mt-3 block tracking-widest">
                          {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
