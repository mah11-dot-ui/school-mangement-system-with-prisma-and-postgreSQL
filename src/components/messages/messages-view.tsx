"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Inbox, Plus, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getInitials, timeAgo, ROLES } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

interface Message {
  id: string;
  subject: string | null;
  content: string;
  status: string;
  createdAt: Date;
  readAt: Date | null;
}

interface ReceivedMessage extends Message {
  sender: { name: string; image: string | null; role: Role };
}

interface SentMessage extends Message {
  receiver: { name: string; image: string | null; role: Role };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image: string | null;
}

interface MessagesViewProps {
  received: ReceivedMessage[];
  sent: SentMessage[];
  users: User[];
  currentUserId: string;
}

export function MessagesView({ received, sent, users, currentUserId }: MessagesViewProps) {
  const router = useRouter();
  const [showCompose, setShowCompose] = useState(false);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({
    receiverId: "",
    subject: "",
    content: "",
  });

  const handleSend = async () => {
    if (!form.receiverId || !form.content.trim()) {
      toast.error("Please select a recipient and enter a message");
      return;
    }

    setComposing(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success("Message sent successfully");
        setShowCompose(false);
        setForm({ receiverId: "", subject: "", content: "" });
        router.refresh();
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setComposing(false);
    }
  };

  const unreadCount = received.filter((m) => m.status === "SENT").length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardContent className="p-0">
              {received.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {received.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                        msg.status === "SENT" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={msg.sender.image || ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(msg.sender.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${msg.status === "SENT" ? "font-semibold" : ""}`}>
                              {msg.sender.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {ROLES[msg.sender.role]}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {timeAgo(msg.createdAt)}
                          </span>
                        </div>
                        {msg.subject && (
                          <p className="text-sm font-medium mt-0.5">{msg.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {msg.content}
                        </p>
                      </div>
                      {msg.status === "SENT" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardContent className="p-0">
              {sent.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No sent messages</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sent.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={msg.receiver.image || ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(msg.receiver.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">To: {msg.receiver.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {ROLES[msg.receiver.role]}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {timeAgo(msg.createdAt)}
                          </span>
                        </div>
                        {msg.subject && (
                          <p className="text-sm font-medium mt-0.5">{msg.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>To *</Label>
              <Select
                value={form.receiverId}
                onValueChange={(v) => setForm((p) => ({ ...p, receiverId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({ROLES[user.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject (optional)</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Message subject"
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Type your message..."
                rows={5}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={composing}>
              {composing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
