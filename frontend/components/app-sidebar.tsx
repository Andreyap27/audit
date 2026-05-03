"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  FileUp,
  FileDown,
  Building2,
  HardDrive,
  Package,
  Boxes,
  BarChart3,
  FileText,
  ClipboardList,
  Users,
  Settings,
  ChevronRight,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type LeafItem = { title: string; url: string; icon: LucideIcon };
type GroupItem = { title: string; icon: LucideIcon; items: LeafItem[] };
type SubItem = LeafItem | GroupItem;
type MenuItem =
  | { title: string; url: string; icon: LucideIcon; items?: never }
  | { title: string; icon: LucideIcon; url?: never; items: SubItem[] };

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    icon: Monitor,
    items: [
      { title: "Perangkat IT", url: "/devices", icon: Monitor },
      { title: "Import Excel", url: "/import", icon: FileUp },
      { title: "Export Excel", url: "/export", icon: FileDown },
    ],
  },
  {
    title: "Peminjaman",
    url: "/loans",
    icon: ClipboardCheck,
  },
  {
    title: "Master Data",
    icon: Package,
    items: [
      { title: "Departemen", url: "/master/departments", icon: Building2 },
      {
        title: "Operating System",
        url: "/master/operating-systems",
        icon: HardDrive,
      },
      {
        title: "Microsoft Software",
        icon: Boxes,
        items: [
          { title: "Office", url: "/master/microsoft/office", icon: Boxes },
          { title: "Visio", url: "/master/microsoft/visio", icon: Boxes },
          { title: "Project", url: "/master/microsoft/project", icon: Boxes },
          { title: "Access", url: "/master/microsoft/access", icon: Boxes },
        ],
      },
      { title: "Unit Type", url: "/master/unit-types", icon: Monitor },
    ],
  },
  {
    title: "Laporan",
    icon: BarChart3,
    items: [
      { title: "Per Departemen", url: "/reports/departments", icon: FileText },
      {
        title: "Lisensi Software",
        url: "/reports/software",
        icon: ClipboardList,
      },
      { title: "Peminjaman", url: "/reports/loans", icon: ClipboardCheck },
      { title: "Audit Log", url: "/reports/audit-log", icon: ClipboardList },
    ],
  },
  {
    title: "Pengaturan",
    icon: Settings,
    items: [{ title: "Manajemen User", url: "/settings/users", icon: Users }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Monitor className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">IT Inventory</span>
            <span className="text-xs text-muted-foreground">
              Management System
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.items.some((subItem) =>
                      "items" in subItem
                        ? subItem.items.some((s) => pathname === s.url || pathname.startsWith(s.url + "/"))
                        : pathname === subItem.url || pathname.startsWith(subItem.url + "/"),
                    )}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) =>
                            "items" in subItem ? (
                              <Collapsible
                                key={subItem.title}
                                asChild
                                defaultOpen={subItem.items.some((s) =>
                                  pathname === s.url || pathname.startsWith(s.url + "/"),
                                )}
                              >
                                <SidebarMenuSubItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton
                                      isActive={subItem.items.some((s) =>
                                        pathname === s.url || pathname.startsWith(s.url + "/"),
                                      )}
                                    >
                                      <subItem.icon className="h-4 w-4" />
                                      <span>{subItem.title}</span>
                                      <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {subItem.items.map((leaf) => (
                                        <SidebarMenuSubItem key={leaf.title}>
                                          <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                              pathname === leaf.url ||
                                              pathname.startsWith(leaf.url + "/")
                                            }
                                          >
                                            <Link href={leaf.url}>
                                              <span>{leaf.title}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </SidebarMenuSubItem>
                              </Collapsible>
                            ) : (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    pathname === subItem.url ||
                                    pathname.startsWith(subItem.url + "/")
                                  }
                                >
                                  <Link href={subItem.url}>
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ),
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
