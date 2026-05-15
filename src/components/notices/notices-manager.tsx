"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Bell, Trash2, Edit, Eye, EyeOff, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createNotice, deleteNotice, updateNotice } from "@/actions/notices";
import { formatDate, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { NoticeVisibility } from "@prisma/client";
import type { Role } from "@prisma/client";

interface Notice {
  id: string;
  title: string;
  content: string;
  visibility: NoticeVisibility;
  isPublished: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

interface NoticesManagerProps {
  initialData: Notice[];
  canCreate: boolean;
  userRole: Role;
}

const visibilityColors: Record<NoticeVisibility, string> = {
  ALL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  TEACHER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  STUDENT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PARENT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export function NoticesManager({ initialData, canCreate, userRole }: NoticesManagerProps) {
  const router = useRouter();
  const [notices, setNotices] = useState(initialData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    visibility: "ALL" as NoticeVisibility,
    isPublished: true,
  });

  const openCreate = () => {
    setEditingNotice(null);
    setForm({ title: "", content: "", visibility: "ALL", isPublished: true });
    setShowDialog(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      visibility: notice.visibility,
      isPublished: notice.isPublished,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      if (editingNotice) {
        const result = await updateNotice(editingNotice.id, form);
        if (result.success) {
          setNotices((prev) =>
            prev.map((n) => (n.id === editingNotice.id ? { ...n, ...form } : n))
          );
          toast.success("Notice updated");
        } else {
          toast.error(result.error || "Failed to update notice");
        }
      } else {
        const result = await createNotice({
          schoolId: "default", // TODO: get from session
          ...form,
        });
        if (result.success && result.data) {
          setNotices((prev) => [result.data as Notice, ...prev]);
          toast.success("Notice created");
        } else {
          toast.error(result.error || "Failed to create notice");
        }
      }
      setShowDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    const result = await deleteNotice(id);
    if (result.success) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notice deleted");
    } else {
      toast.error(result.error || "Failed to delete notice");
    }
  };

  const handleTogglePublish = async (notice: Notice) => {
    const result = await updateNotice(notice.id, { isPublished: !notice.isPublished });
    if (result.success) {
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, isPublished: !n.isPublished } : n))
      );
      toast.success(notice.isPublished ? "Notice unpublished" : "Notice published");
    }
  };

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Notice
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {notices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No notices yet</p>
            </div>
          ) : (
            notices.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={!notice.isPublished ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notice.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visibilityColors[notice.visibility]}`}>
                              {notice.visibility}
                            </span>
                            {!notice.isPublished && (
                              <Badge variant="outline" className="text-xs">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notice.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {timeAgo(notice.createdAt)}
                          </p>
                        </div>
                      </div>

                      {canCreate && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleTogglePublish(notice)}
                            title={notice.isPublished ? "Unpublish" : "Publish"}
                          >
                            {notice.isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(notice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(notice.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "Edit Notice" : "Create Notice"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Notice title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Notice content..."
                rows={5}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) => setForm((p) => ({ ...p, visibility: v as NoticeVisibility }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEACHER">Teachers</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="PARENT">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.isPublished ? "published" : "draft"}
                  onValueChange={(v) => setForm((p) => ({ ...p, isPublished: v === "published" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editingNotice ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
