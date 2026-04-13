import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp,
  Activity
} from "lucide-react";
import { prisma } from "@/lib/db";
import { RevenueChart } from "@/components/charts/revenue-chart";

async function getStats() {
  const [clientCount, pipelineCount, wonProjects] = await Promise.all([
    prisma.client.count(),
    prisma.pipeline.count(),
    prisma.project.count({ where: { status: "COMPLETED" } }),
  ]);

  const totalRevenue = await prisma.client.aggregate({
    _sum: {
      revenue: true,
    },
  });

  return {
    clientCount,
    pipelineCount,
    wonProjects,
    totalRevenue: totalRevenue._sum.revenue || 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Total Clients",
      value: stats.clientCount,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Project Wins",
      value: stats.wonProjects,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Pipeline Count",
      value: stats.pipelineCount,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={card.color} size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">New client onboarded</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
