"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  FileText, DollarSign, Bell, MessageSquare, Library, Bus, Home,
  Settings, ChevronDown, ChevronRight, School, Calendar, BarChart3,
  UserCheck, BookMarked, Wallet, Megaphone, Route, Building2,
  ShieldCheck, LogOut, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Role } from "@prisma/client";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
  roles?: Role[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
    children: [
      { title: "All Students", href: "/dashboard/students", icon: Users },
      { title: "Add Student", href: "/dashboard/students/new", icon: Users },
      { title: "Admissions", href: "/dashboard/students/admissions", icon: UserCheck },
    ],
  },
  {
    title: "Teachers",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { title: "All Teachers", href: "/dashboard/teachers", icon: Users },
      { title: "Add Teacher", href: "/dashboard/teachers/new", icon: Users },
      { title: "Salary", href: "/dashboard/teachers/salary", icon: Wallet },
    ],
  },
  {
    title: "Classes",
    icon: School,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
    children: [
      { title: "All Classes", href: "/dashboard/classes", icon: School },
      { title: "Sections", href: "/dashboard/classes/sections", icon: BookMarked },
      { title: "Subjects", href: "/dashboard/classes/subjects", icon: BookOpen },
      { title: "Routine", href: "/dashboard/classes/routine", icon: Calendar },
    ],
  },
  {
    title: "Attendance",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
    children: [
      { title: "Take Attendance", href: "/dashboard/attendance", icon: ClipboardList },
      { title: "Reports", href: "/dashboard/attendance/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Exams",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
    children: [
      { title: "All Exams", href: "/dashboard/exams", icon: FileText },
      { title: "Results", href: "/dashboard/exams/results", icon: BarChart3 },
      { title: "Report Cards", href: "/dashboard/exams/report-cards", icon: FileText },
    ],
  },
  {
    title: "Fees",
    icon: DollarSign,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    children: [
      { title: "Fee Structure", href: "/dashboard/fees", icon: DollarSign },
      { title: "Collect Fee", href: "/dashboard/fees/collect", icon: Wallet },
      { title: "Reports", href: "/dashboard/fees/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Library",
    icon: Library,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"],
    children: [
      { title: "Books", href: "/dashboard/library", icon: BookOpen },
      { title: "Borrow/Return", href: "/dashboard/library/borrow", icon: BookMarked },
    ],
  },
  {
    title: "Transport",
    icon: Bus,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { title: "Routes", href: "/dashboard/transport", icon: Route },
      { title: "Vehicles", href: "/dashboard/transport/vehicles", icon: Bus },
    ],
  },
  {
    title: "Hostel",
    icon: Building2,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { title: "Hostels", href: "/dashboard/hostel", icon: Home },
      { title: "Rooms", href: "/dashboard/hostel/rooms", icon: Building2 },
    ],
  },
  {
    title: "Notices",
    icon: Megaphone,
    href: "/dashboard/notices",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
    badge: 3,
  },
  {
    title: "Settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
    href: "/dashboard/settings",
  },
];

interface SidebarProps {
  userRole: Role;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ userRole, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.children?.some((child) => isActive(child.href)) || false;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-card border-r transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-sm truncate"
              >
                EduManage Pro
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto flex-shrink-0"
            onClick={() => onCollapse?.(!collapsed)}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {filteredItems.map((item) => (
              <NavItemComponent
                key={item.title}
                item={item}
                collapsed={collapsed}
                isActive={isActive}
                isParentActive={isParentActive}
                expandedItems={expandedItems}
                onToggle={toggleExpand}
              />
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  collapsed: boolean;
  isActive: (href?: string) => boolean;
  isParentActive: (item: NavItem) => boolean;
  expandedItems: string[];
  onToggle: (title: string) => void;
  depth?: number;
}

function NavItemComponent({
  item,
  collapsed,
  isActive,
  isParentActive,
  expandedItems,
  onToggle,
  depth = 0,
}: NavItemComponentProps) {
  const active = isParentActive(item);
  const expanded = expandedItems.includes(item.title);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        depth > 0 && "pl-9",
        collapsed && depth === 0 && "justify-center px-2"
      )}
      onClick={() => {
        if (hasChildren) onToggle(item.title);
      }}
    >
      <Icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 opacity-50" />
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  if (item.href && !hasChildren) {
    const linkContent = (
      <Link href={item.href}>
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            depth > 0 && "pl-9",
            collapsed && depth === 0 && "justify-center px-2"
          )}
        >
          <Icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    );

    if (collapsed && depth === 0) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  }

  if (collapsed && depth === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      {content}
      <AnimatePresence>
        {expanded && hasChildren && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => (
                <NavItemComponent
                  key={child.title}
                  item={child}
                  collapsed={collapsed}
                  isActive={isActive}
                  isParentActive={isParentActive}
                  expandedItems={expandedItems}
                  onToggle={onToggle}
                  depth={depth + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
