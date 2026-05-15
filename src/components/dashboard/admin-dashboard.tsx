"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Users, School, DollarSign,
  UserCheck, AlertCircle, Bell, Calendar
} from "lucide-react";
import { StatsCard } from "./stats-card";
import { RevenueChart } from "./revenue-chart";
import { AttendanceChart } from "./attendance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials, timeAgo } from "@/lib/utils";

interface AdminDashboardProps {
  stats: {
    stats: {
      totalStudents: number;
      totalTeachers: number;
      totalClasses: number;
      attendanceRate: number;
      pendingFees: number;
      totalRevenue: number;
    };
    recentNotices: Array<{
      id: string;
      title: string;
      createdAt: Date;
      visibility: string;
    }>;
    upcomingExams: Array<{
      id: string;
      name: string;
      startDate: Date;
      type: string;
    }>;
    recentActivities: Array<{
      id: string;
      action: string;
      description: string | null;
      createdAt: Date;
      user: { name: string; image: string | null; role: string };
    }>;
    monthlyRevenue: Array<{ name: string; revenue: number }>;
    attendanceTrend: Array<{ name: string; present: number; absent: number; rate: number }>;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const { stats: s, recentNotices, upcomingExams, recentActivities, monthlyRevenue, attendanceTrend } = stats;

  const statsCards = [
    {
      title: "Total Students",
      value: s.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: "blue" as const,
      trend: { value: 5.2, label: "vs last month" },
    },
    {
      title: "Total Teachers",
      value: s.totalTeachers.toLocaleString(),
      icon: Users,
      color: "green" as const,
      trend: { value: 2.1, label: "vs last month" },
    },
    {
      title: "Total Classes",
      value: s.totalClasses.toLocaleString(),
      icon: School,
      color: "purple" as const,
    },
    {
      title: "Attendance Rate",
      value: `${s.attendanceRate}%`,
      icon: UserCheck,
      color: s.attendanceRate >= 80 ? "green" as const : "yellow" as const,
      trend: { value: 1.5, label: "vs yesterday" },
    },
    {
      title: "Total Revenue",
      value: formatCurrency(s.totalRevenue),
      icon: DollarSign,
      color: "orange" as const,
      trend: { value: 8.3, label: "vs last month" },
    },
    {
      title: "Pending Fees",
      value: formatCurrency(s.pendingFees),
      icon: AlertCircle,
      color: "red" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card, i) => (
          <StatsCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />
        <AttendanceChart data={attendanceTrend} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notices yet</p>
            ) : (
              recentNotices.map((notice) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(notice.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {notice.visibility}
                  </Badge>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming exams</p>
            ) : (
              upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exam.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exam.startDate)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {exam.type}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
