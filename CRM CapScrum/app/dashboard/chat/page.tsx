"use client";

import { useEffect, useState } from "react";
import ChatComponent from "@/components/chat/chat-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardChat() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data.filter((c: any) => c.userId));
        setLoading(false);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-160px)]">
      <Card className="col-span-1 bg-card border-border flex flex-col overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border py-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Messages</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="New chat">
               <UserPlus size={16} className="text-muted-foreground" />
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-background border-input text-foreground h-9 text-sm" 
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
          {loading ? (
             <div className="flex justify-center p-8">
               <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></span>
             </div>
          ) : clients.length === 0 ? (
             <div className="p-8 text-center space-y-2">
               <p className="text-sm font-medium text-foreground">No chats yet</p>
               <p className="text-xs text-muted-foreground">Client accounts will appear here.</p>
             </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedClient(client)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedClient(client);
                  }
                }}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-l-2 focus-visible:outline-none focus-visible:bg-primary/5 ${
                  selectedClient?.id === client.id 
                  ? "bg-primary/5 border-primary" 
                  : "border-transparent hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-11 w-11 border border-border/50">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {client.contactPerson.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold truncate text-foreground">{client.contactPerson}</p>
                    <span className="text-[10px] text-muted-foreground">12:45 PM</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium">{client.companyName}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="col-span-3">
        {selectedClient ? (
          <ChatComponent 
            receiverId={selectedClient.userId} 
            receiverName={selectedClient.contactPerson} 
          />
        ) : (
          <Card className="h-full bg-card border-border border-dashed flex items-center justify-center">
            <div className="text-center space-y-6 max-w-sm px-4">
              <div className="w-24 h-24 bg-primary/5 rounded-full mx-auto flex items-center justify-center">
                <Search size={40} className="text-primary/30" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-foreground">Open a conversation</p>
                <p className="text-sm text-muted-foreground">Select a client from the sidebar to view your message history and start chatting.</p>
              </div>
              <Button variant="outline" className="text-primary border-primary/20 hover:bg-primary/5">
                New Message
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
