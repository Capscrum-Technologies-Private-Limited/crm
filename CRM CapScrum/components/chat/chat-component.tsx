"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/messages?userId=${receiverId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));

    // Initialize socket
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || "", {
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket");
    });

    socketInstance.on(`message:${session?.user?.id}`, (msg: Message) => {
      if (msg.senderId === receiverId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [receiverId, session?.user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
      
      socket?.emit("send-message", msg);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card border-border shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border py-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {receiverName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-sm font-bold text-foreground">{receiverName}</CardTitle>
              <div className="flex items-center gap-1.5 pt-0.5">
                <Circle className="fill-emerald-500 text-emerald-500" size={8} />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Active Now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Phone size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Video size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 bg-background/50">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm font-medium shadow-sm transition-all ${
                  msg.senderId === session?.user?.id
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none border border-border/50"
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1.5 ${
                  msg.senderId === session?.user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t border-border bg-card">
        <form onSubmit={sendMessage} className="flex w-full gap-3">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-muted/50 border-input text-foreground h-11 px-5 rounded-full ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-11 rounded-full shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
