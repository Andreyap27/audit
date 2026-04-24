"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Laptop, Server, Activity } from "lucide-react";
import { DepartmentChart } from "@/components/dashboard/department-chart";
import { OsDistributionChart } from "@/components/dashboard/os-distribution-chart";
import { OfficeDistributionChart } from "@/components/dashboard/office-distribution-chart";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { useDashboardStats } from "@/hooks/use-reports";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const total = stats?.totalDevices ?? 0;
  const nb = stats?.totalNB ?? 0;
  const ws = stats?.totalWS ?? 0;

  const summaryCards = [
    {
      title: "Total Device",
      value: total.toLocaleString(),
      description: `${nb} NB + ${ws} WS`,
      icon: Monitor,
    },
    {
      title: "Total Notebook",
      value: nb.toLocaleString(),
      description:
        total > 0 ? `${((nb / total) * 100).toFixed(1)}% dari total` : "-",
      icon: Laptop,
    },
    {
      title: "Total Workstation",
      value: ws.toLocaleString(),
      description:
        total > 0 ? `${((ws / total) * 100).toFixed(1)}% dari total` : "-",
      icon: Server,
    },
    {
      title: "Aktivitas Terbaru",
      value: (stats?.recentActivity?.length ?? 0).toString(),
      description: "10 entri terakhir",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan data inventaris perangkat IT
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Device per Departemen</CardTitle>
            <CardDescription>
              Jumlah perangkat di setiap departemen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribusi OS</CardTitle>
            <CardDescription>Versi Operating System</CardDescription>
          </CardHeader>
          <CardContent>
            <OsDistributionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Office</CardTitle>
            <CardDescription>Versi Microsoft Office</CardDescription>
          </CardHeader>
          <CardContent>
            <OfficeDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Log aktivitas dari audit log</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivityTable />
        </CardContent>
      </Card>
    </div>
  );
}
