"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ChatComponent from "@/components/chat/chat-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardChat() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients?all=true")
      .then((res) => res.json())
      .then((data) => {
        setClients(data.filter((c: any) => c.userId));
        setLoading(false);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[calc(100vh-140px)]"
    >
      {/* Sidebar: Conversations */}
      <div className="col-span-1 glass-card rounded-lg flex flex-col overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-foreground tracking-tight">Messages</h3>
            <button className="p-2.5 rounded-md bg-white border border-slate-200 text-primary hover:bg-primary/10 transition-all">
               <UserPlus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input 
              placeholder="Search pulse..." 
              className="h-12 pl-12 bg-white border-slate-200 rounded-lg text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-12 opacity-30 gap-3">
               <Loader2 className="animate-spin text-primary" size={24} />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Syncing...</span>
             </div>
          ) : clients.length === 0 ? (
             <div className="p-12 text-center space-y-4">
               <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center text-muted-foreground/20 mx-auto">
                 <UserPlus size={24} />
               </div>
               <div>
                 <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Quiet Channels</p>
                 <p className="text-[10px] text-muted-foreground/30 font-medium mt-1 uppercase tracking-[0.1em]">No active pulse detected.</p>
               </div>
             </div>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all border border-transparent group",
                    selectedClient?.id === client.id 
                    ? "bg-primary/10 border-primary/20 shadow-lg shadow-primary/5" 
                    : "hover:bg-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-slate-200 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
                      {client.contactPerson.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className={cn(
                        "text-sm font-bold truncate transition-colors",
                        selectedClient?.id === client.id ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                      )}>
                        {client.contactPerson}
                      </p>
                      <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-tighter">12:45</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/40 font-bold truncate uppercase tracking-widest leading-none">
                      {client.companyName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="col-span-3">
        {selectedClient ? (
          <div className="h-full glass-card rounded-lg overflow-hidden flex flex-col shadow-2xl relative">
            <ChatComponent 
              receiverId={selectedClient.userId} 
              receiverName={selectedClient.contactPerson} 
            />
          </div>
        ) : (
          <div className="h-full glass-card rounded-lg flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="text-center space-y-8 max-w-sm px-8 relative z-10">
              <div className="w-28 h-28 bg-slate-50 border border-slate-200 rounded-lg mx-auto flex items-center justify-center shadow-2xl">
                <Search size={44} className="text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-black text-foreground tracking-tight">Open <span className="text-primary">Conversation</span></p>
                <p className="text-sm text-muted-foreground/60 font-medium leading-relaxed uppercase tracking-[0.05em]">
                  Select a secure channel from the sidebar to initialize encrypted communication.
                </p>
              </div>
              <button className="px-10 py-4 rounded-lg bg-slate-100 border border-slate-200 text-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 hover:border-primary/30 transition-all shadow-xl">
                Initialize New Pulse
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

