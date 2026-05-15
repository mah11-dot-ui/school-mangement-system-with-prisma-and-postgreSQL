"use client";

import React, { useState } from "react";
import { Save, School, Bell, Shield, Database, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SettingsPanel() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <Tabs defaultValue="school">
      <TabsList className="mb-6">
        <TabsTrigger value="school">
          <School className="h-4 w-4 mr-2" />
          School
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="system">
          <Database className="h-4 w-4 mr-2" />
          System
        </TabsTrigger>
      </TabsList>

      <TabsContent value="school">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Basic information about your school</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input defaultValue="EduManage Demo School" />
              </div>
              <div className="space-y-2">
                <Label>School Code</Label>
                <Input defaultValue="DEMO-001" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue="info@demoschool.edu.bd" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+880 1700-000000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input defaultValue="123 School Street, Dhaka, Bangladesh" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input defaultValue="https://demoschool.edu.bd" />
              </div>
              <div className="space-y-2">
                <Label>Established Year</Label>
                <Input type="number" defaultValue="2000" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
              <CardDescription>Configure academic year and grading</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input defaultValue="BDT" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input defaultValue="Asia/Dhaka" />
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Input defaultValue="DD/MM/YYYY" />
              </div>
              <div className="space-y-2">
                <Label>Academic Year Start Month</Label>
                <Input type="number" min="1" max="12" defaultValue="1" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure email and SMS notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Email Notifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Provider</Label>
                  <Input placeholder="resend / smtp" />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Enter API key" />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input type="email" placeholder="noreply@school.com" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">SMS Notifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMS Provider</Label>
                  <Input placeholder="twilio / nexmo" />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Enter API key" />
                </div>
                <div className="space-y-2">
                  <Label>Sender ID</Label>
                  <Input placeholder="SCHOOL" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage security and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Input className="w-24" defaultValue="30" type="number" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Password Policy</p>
                  <p className="text-sm text-muted-foreground">Minimum 8 characters required</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>View system status and database info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Application Version", value: "1.0.0" },
              { label: "Next.js Version", value: "15.x" },
              { label: "Database", value: "PostgreSQL" },
              { label: "ORM", value: "Prisma 7.x" },
              { label: "Node.js", value: "20.x" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Badge variant="secondary">{item.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
