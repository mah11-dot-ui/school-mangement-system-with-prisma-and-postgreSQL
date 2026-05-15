"use client";

import React from "react";
import { BookOpen, Users, Clock, Bell } from "lucide-react";
import { StatsCard } from "./stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

interface TeacherDashboardProps {
  data: {
    teacher: {
      user: { name: string };
      subjects: Array<{ subject: { name: string; class: { name: string } } }>;
      classTeacher: Array<{ name: string; class: { name: string } }>;
    } | null;
    todayClasses: Array<{
      id: string;
      startTime: string;
      endTime: string;
      subject: { name: string };
      section: { name: string; class: { name: string } };
    }>;
    recentAttendance: Array<{ status: string; date: Date }>;
    notices: Array<{ id: string; title: string; createdAt: Date }>;
  };
}

export function TeacherDashboard({ data }: TeacherDashboardProps) {
  const { teacher, todayClasses, notices } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {teacher?.user.name}
        </h1>
        <p className="text-muted-foreground">
          {teacher?.subjects.length || 0} subjects assigned
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Subjects"
          value={teacher?.subjects.length || 0}
          icon={BookOpen}
          color="blue"
          index={0}
        />
        <StatsCard
          title="Today's Classes"
          value={todayClasses.length}
          icon={Clock}
          color="green"
          index={1}
        />
        <StatsCard
          title="Class Teacher"
          value={teacher?.classTeacher.length || 0}
          icon={Users}
          color="purple"
          index={2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No classes today</p>
            ) : (
              todayClasses.map((cls) => (
                <div key={cls.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-16 text-center">
                    <p className="text-xs font-bold text-primary">{cls.startTime}</p>
                    <p className="text-xs text-muted-foreground">{cls.endTime}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cls.subject.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.section.class.name} - {cls.section.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell className="h-4 w-4" />
            <CardTitle className="text-base">Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notices</p>
            ) : (
              notices.map((notice) => (
                <div key={notice.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <p className="text-sm font-medium">{notice.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(notice.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
