"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Edit, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import type { PaginationMeta } from "@/types";

interface Teacher {
  id: string;
  employeeId: string;
  salary: number | null;
  isActive: boolean;
  joinDate: Date;
  qualification: string | null;
  user: { name: string; email: string; image: string | null };
  subjects: Array<{
    subject: { name: string; class: { name: string } };
  }>;
  classTeacher: Array<{ name: string; class: { name: string } }>;
}

interface TeachersTableProps {
  data: Teacher[];
  meta: PaginationMeta;
}

export function TeachersTable({ data, meta }: TeachersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subjects</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qualification</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Salary</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    No teachers found
                  </td>
                </tr>
              ) : (
                data.map((teacher, i) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={teacher.user.image || ""} />
                          <AvatarFallback className="text-xs bg-green-100 text-green-800">
                            {getInitials(teacher.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{teacher.user.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{teacher.employeeId}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.slice(0, 2).map((ts, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {ts.subject.name}
                          </Badge>
                        ))}
                        {teacher.subjects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{teacher.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {teacher.classTeacher.length > 0 ? (
                        <span className="text-sm">
                          {teacher.classTeacher[0].class.name}-{teacher.classTeacher[0].name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{teacher.qualification || "—"}</td>
                    <td className="px-4 py-3 font-medium">
                      {teacher.salary ? formatCurrency(teacher.salary) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={teacher.isActive ? "success" : "destructive"}>
                        {teacher.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/teachers/${teacher.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((meta.page - 1) * meta.limit + 1, meta.total)}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} teachers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
