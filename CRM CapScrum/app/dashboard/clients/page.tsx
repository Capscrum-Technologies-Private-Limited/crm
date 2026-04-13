"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clients</h2>
          <p className="text-muted-foreground">Manage your business relationships and pipeline.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Clients</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
                className="pl-10 bg-background border-input text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Company</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Contact Person</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Revenue</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                       <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
                       Loading clients...
                    </div>
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-foreground">{client.companyName}</TableCell>
                    <TableCell className="text-foreground">{client.contactPerson}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        client.status === "Onboarded" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-blue-50 text-blue-700 border-blue-200"
                      }>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">₹{client.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
