"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, UserCheck, DollarSign, Bell, Calendar } from "lucide-react";
import { StatsCard } from "./stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";

interface StudentDashboardProps {
  data: {
    student: {
      user: { name: string };
      section: { name: string; class: { name: string } } | null;
      rollNumber: string | null;
    } | null;
    recentAttendance: Array<{ status: string; date: Date }>;
    recentResults: Array<{
      id: string;
      marksObtained: number;
      grade: string | null;
      exam: { name: string };
      examSubject: { subject: { name: string }; totalMarks: number };
    }>;
    pendingFees: Array<{
      id: string;
      amount: number;
      dueDate: Date;
      feeStructure: { name: string };
    }>;
    notices: Array<{ id: string; title: string; createdAt: Date }>;
    attendanceRate: number;
  };
}

export function StudentDashboard({ data }: StudentDashboardProps) {
  const { student, recentResults, pendingFees, notices, attendanceRate } = data;

  const totalPendingFees = pendingFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {student?.user.name}
        </h1>
        <p className="text-muted-foreground">
          {student?.section?.class.name} - Section {student?.section?.name} | Roll: {student?.rollNumber || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={UserCheck}
          color={attendanceRate >= 75 ? "green" : "red"}
          index={0}
        />
        <StatsCard
          title="Pending Fees"
          value={formatCurrency(totalPendingFees)}
          icon={DollarSign}
          color={totalPendingFees > 0 ? "red" : "green"}
          index={1}
        />
        <StatsCard
          title="Subjects"
          value={recentResults.length}
          icon={BookOpen}
          color="blue"
          index={2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No results yet</p>
            ) : (
              recentResults.slice(0, 5).map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{result.examSubject.subject.name}</p>
                    <p className="text-xs text-muted-foreground">{result.exam.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {result.marksObtained}/{result.examSubject.totalMarks}
                    </p>
                    <Badge variant={result.grade === "F" ? "destructive" : "success"} className="text-xs">
                      {result.grade || "N/A"}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingFees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending fees</p>
            ) : (
              pendingFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{fee.feeStructure.name}</p>
                    <p className="text-xs text-muted-foreground">Due: {formatDate(fee.dueDate)}</p>
                  </div>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(fee.amount)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notices */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="h-4 w-4" />
          <CardTitle className="text-base">Recent Notices</CardTitle>
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
  );
}
