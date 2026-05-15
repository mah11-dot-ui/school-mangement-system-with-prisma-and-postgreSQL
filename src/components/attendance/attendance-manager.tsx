"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Clock, ChevronDown, Save, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAttendanceBySection, saveAttendance } from "@/actions/attendance";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { AttendanceStatus } from "@prisma/client";

interface Section {
  id: string;
  name: string;
  class: { name: string; grade: number };
}

interface AttendanceRecord {
  studentId: string;
  name: string;
  image: string | null;
  rollNumber: string | null;
  status: AttendanceStatus | null;
  attendanceId: string | null;
}

interface AttendanceManagerProps {
  sections: Section[];
}

const statusConfig = {
  PRESENT: { label: "Present", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Check },
  ABSENT: { label: "Absent", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: X },
  LATE: { label: "Late", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  EXCUSED: { label: "Excused", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Check },
};

export function AttendanceManager({ sections }: AttendanceManagerProps) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedSection && selectedDate) {
      loadAttendance();
    }
  }, [selectedSection, selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceBySection(selectedSection, new Date(selectedDate));
      setRecords(data);
      const initial: Record<string, AttendanceStatus> = {};
      data.forEach((r) => {
        if (r.status) initial[r.studentId] = r.status;
      });
      setAttendance(initial);
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    records.forEach((r) => { all[r.studentId] = status; });
    setAttendance(all);
  };

  const handleSave = async () => {
    if (!selectedSection) return;
    setSaving(true);
    try {
      const attendanceRecords = records.map((r) => ({
        studentId: r.studentId,
        status: attendance[r.studentId] || "ABSENT",
      }));

      const result = await saveAttendance(
        selectedSection,
        new Date(selectedDate),
        attendanceRecords
      );

      if (result.success) {
        toast.success("Attendance saved successfully");
      } else {
        toast.error(result.error || "Failed to save attendance");
      }
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    present: Object.values(attendance).filter((s) => s === "PRESENT").length,
    absent: Object.values(attendance).filter((s) => s === "ABSENT").length,
    late: Object.values(attendance).filter((s) => s === "LATE").length,
    total: records.length,
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class & section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.class.name} - Section {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {records.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAll("PRESENT")}>
                  All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAll("ABSENT")}>
                  All Absent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Present", value: stats.present, color: "text-green-600" },
            { label: "Absent", value: stats.absent, color: "text-red-600" },
            { label: "Late", value: stats.late, color: "text-yellow-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : records.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {sections.find((s) => s.id === selectedSection)?.class.name} - Section{" "}
              {sections.find((s) => s.id === selectedSection)?.name} |{" "}
              {formatDate(selectedDate)}
            </CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Attendance</>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.map((record, i) => {
                const currentStatus = attendance[record.studentId];
                return (
                  <motion.div
                    key={record.studentId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground w-8 text-center font-mono">
                      {record.rollNumber || i + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={record.image || ""} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(record.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-medium">{record.name}</span>

                    {/* Status Buttons */}
                    <div className="flex gap-2">
                      {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as AttendanceStatus[]).map((status) => {
                        const config = statusConfig[status];
                        const Icon = config.icon;
                        const isSelected = currentStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => setStatus(record.studentId, status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              isSelected
                                ? config.color
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : selectedSection ? (
        <div className="text-center py-12 text-muted-foreground">
          No students found in this section
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a class and date to take attendance
        </div>
      )}
    </div>
  );
}
