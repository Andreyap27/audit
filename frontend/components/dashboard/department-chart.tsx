"use client";

import { useDashboardStats } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function DepartmentChart() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const departments: { id: string; code: string; name: string; count: number }[] =
    stats?.byDepartment ?? [];

  const max = Math.max(...departments.map((d) => d.count), 1);

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      {departments.map((dept) => (
        <div key={dept.id ?? dept.code} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium truncate">{dept.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{dept.code}</span>
            </div>
            <Badge variant="secondary" className="shrink-0 ml-2">
              {dept.count}
            </Badge>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(dept.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {departments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Belum ada data
        </p>
      )}
    </div>
  );
}
