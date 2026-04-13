"use client";

import { useEffect, useState } from "react";
import ChatComponent from "@/components/chat/chat-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function PortalChat() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    fetch("/api/users/team")
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data);
        if (data.length > 0) setSelectedMember(data[0]);
      });
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
       <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <MessageSquare className="text-primary" size={32} />
          Support Chat
        </h2>
        <p className="text-muted-foreground font-medium">Message our team for any project-related queries. We usually reply within a few hours.</p>
      </div>

      <div className="flex-1 min-h-0">
        {selectedMember ? (
          <ChatComponent 
            receiverId={selectedMember.id} 
            receiverName={"Team Support"} 
          />
        ) : (
          <Card className="h-full bg-card border-border border-dashed flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="font-semibold uppercase tracking-widest text-xs">Connecting to support team...</p>
              </div>
          </Card>
        )}
      </div>
    </div>
  );
}
