"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStats } from "@/hooks/use-reports";

const actionColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  IMPORT: "outline",
};

export function RecentActivityTable() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const activities: Array<{
    id: number;
    action: string;
    tableName: string;
    recordId: number | null;
    createdAt: string;
    user: { username: string };
  }> = stats?.recentActivity ?? [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Aksi</TableHead>
          <TableHead>Tabel</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Waktu</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8"
            >
              Belum ada aktivitas
            </TableCell>
          </TableRow>
        )}
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell>
              <Badge variant={actionColors[activity.action] ?? "outline"}>
                {activity.action}
              </Badge>
            </TableCell>
            <TableCell>{activity.tableName}</TableCell>
            <TableCell>{activity.recordId ?? "-"}</TableCell>
            <TableCell>{activity.user?.username ?? "-"}</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {new Date(activity.createdAt).toLocaleString("id-ID")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
