"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useDashboardStats } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";

const BAR_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DepartmentChart() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const chartData = (stats?.byDepartment ?? []).map(
    (d: { code: string; count: number }, i: number) => ({
      name: d.code,
      total: d.count,
      color: BAR_COLORS[i % BAR_COLORS.length],
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
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {chartData.map((entry: { color: string }, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
