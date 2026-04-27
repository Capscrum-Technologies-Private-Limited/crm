"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ChatComponent from "@/components/chat/chat-component";
import { MessageSquare, Loader2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
}

export default function PortalChat() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetch("/api/users/team")
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data);
        if (data.length > 0) setSelectedMember(data[0]);
      })
      .catch((err) => console.error("Error fetching team members:", err));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-10"
    >
       <div className="flex flex-col space-y-4 px-2">
        <h2 className="text-5xl font-black tracking-tight text-foreground flex items-center gap-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 shadow-xl text-primary">
            <MessageSquare size={36} />
          </div>
          Support <span className="text-primary">Ops</span>
        </h2>
        <p className="text-lg text-muted-foreground/60 font-medium max-w-2xl leading-relaxed">
          Establish a secure connection with your strategic lead. Standard response latency is within 120 minutes.
        </p>
      </div>

      <div className="flex-1 min-h-0 glass-card single-sided-gradient rounded-lg overflow-hidden shadow-2xl shadow-primary/5 relative">
        {selectedMember ? (
          <ChatComponent 
            receiverId={selectedMember.id} 
            receiverName={"Global Support"} 
          />
        ) : (
          <div className="h-full flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-20" />
             <div className="flex flex-col items-center gap-6 relative z-10 opacity-40">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-foreground">Initializing Uplink...</p>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
