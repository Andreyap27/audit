"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useDashboardStats } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function OfficeDistributionChart() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const data = (stats?.byOffice ?? []).filter((o) => o.count > 0).map(
    (
      o: { version: string; licenseType: string; count: number },
      i: number,
    ) => ({
      name: `Office ${o.version} ${o.licenseType}`,
      value: o.count,
      color: COLORS[i % COLORS.length],
    }),
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <PieChartIcon className="h-8 w-8 opacity-40" />
        <p className="text-sm">Belum ada data</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry: { color: string }, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
