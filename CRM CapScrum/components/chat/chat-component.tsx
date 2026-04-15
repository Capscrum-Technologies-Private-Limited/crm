"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User as UserIcon, Circle, MoreVertical, Phone, Video } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export default function ChatComponent({ receiverId, receiverName }: { receiverId: string, receiverName: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track length for seamless scrolling
  const prevMessageCountRef = useRef(0);

  const fetchMessages = () => {
    fetch(`/api/messages?userId=${receiverId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        if (data.length > prevMessageCountRef.current) {
           prevMessageCountRef.current = data.length;
           setTimeout(() => {
             scrollRef.current?.scrollIntoView({ behavior: "smooth" });
           }, 100);
        }
      });
  };

  useEffect(() => {
    // Fetch immediately
    fetchMessages();

    // High frequency REST polling for Serverless compatibility (Replaces Sockets)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverId, session?.user?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session?.user?.id) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          content: input,
          receiverId,
        }),
      });

      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setInput("");
      prevMessageCountRef.current += 1;
      
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-slate-200 flex items-center justify-center text-primary font-black text-xl group-hover:scale-105 transition-transform">
              {receiverName.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-foreground tracking-tight leading-none mb-1 group-hover:text-primary transition-colors cursor-pointer capitalize">
              {receiverName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Secure Pulse Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-xl bg-white border border-slate-200 text-muted-foreground/60 hover:text-foreground hover:bg-slate-100 transition-all">
            <Phone size={18} />
          </button>
          <button className="p-3 rounded-xl bg-white border border-slate-200 text-muted-foreground/60 hover:text-foreground hover:bg-slate-100 transition-all">
            <Video size={18} />
          </button>
          <button className="p-3 rounded-xl bg-white border border-slate-200 text-muted-foreground/60 hover:text-foreground transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-gradient-to-b from-transparent to-slate-50/30">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn("flex w-full group", isMe ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "flex gap-4 max-w-[80%]",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  {!isMe && (
                    <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-black text-muted-foreground/60">
                      {receiverName.substring(0, 1)}
                    </div>
                  )}
                  <div className="space-y-1.5 flex flex-col items-start">
                    <div
                      className={cn(
                        "rounded-[2rem] px-6 py-4 text-sm font-medium shadow-lg transition-all border",
                        isMe
                          ? "premium-gradient text-white rounded-tr-none border-primary/20 shadow-primary/10"
                          : "bg-slate-100 text-foreground/90 rounded-tl-none border-slate-200"
                      )}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 px-2",
                      isMe ? "self-end" : "self-start"
                    )}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Chat Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/50 backdrop-blur-xl">
        <form onSubmit={sendMessage} className="flex gap-4 items-center">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-20 transition-opacity" />
            <input
              placeholder="Inject secure message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="relative w-full h-14 bg-white border border-slate-200 rounded-[2rem] px-8 text-sm text-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all font-medium placeholder:text-muted-foreground/30"
            />
          </div>
          <button 
            type="submit" 
            className="h-14 w-14 rounded-full premium-gradient text-white flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all group shrink-0"
          >
            <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform font-black" />
          </button>
        </form>
      </div>
    </div>
  );
}
