"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { School, Users, BookOpen, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Section {
  id: string;
  name: string;
  capacity: number;
  roomNo: string | null;
  teacher: { user: { name: string } } | null;
  _count: { students: number };
}

interface Class {
  id: string;
  name: string;
  grade: number;
  capacity: number;
  sections: Section[];
  subjects: Array<{ id: string; name: string; code: string }>;
  _count: { sections: number; subjects: number };
}

interface ClassesManagerProps {
  classes: Class[];
  canManage: boolean;
}

export function ClassesManager({ classes, canManage }: ClassesManagerProps) {
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {classes.map((cls, i) => {
          const isExpanded = expandedClasses.includes(cls.id);
          const totalStudents = cls.sections.reduce((sum, s) => sum + s._count.students, 0);

          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => toggleExpand(cls.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <School className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{cls.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Grade {cls.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold">{cls._count.sections}</p>
                        <p className="text-xs text-muted-foreground">Sections</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold">{totalStudents}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold">{cls._count.subjects}</p>
                        <p className="text-xs text-muted-foreground">Subjects</p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />

                    {/* Sections */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Sections
                        </h4>
                        {canManage && (
                          <Button variant="ghost" size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Section
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cls.sections.map((section) => (
                          <div
                            key={section.id}
                            className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">Section {section.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {section._count.students}/{section.capacity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Teacher: {section.teacher?.user.name || "Not assigned"}
                            </p>
                            {section.roomNo && (
                              <p className="text-xs text-muted-foreground">Room: {section.roomNo}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subjects */}
                    {cls.subjects.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Subjects
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cls.subjects.map((subject) => (
                            <Badge key={subject.id} variant="outline">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
