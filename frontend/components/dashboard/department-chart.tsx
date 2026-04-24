"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useDashboardStats } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";

export function DepartmentChart() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const chartData = (stats?.byDepartment ?? []).map(
    (d: { code: string; count: number }) => ({
      name: d.code,
      total: d.count,
    }),
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 20 }}
      >
        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
