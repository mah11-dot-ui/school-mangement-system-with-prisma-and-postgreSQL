"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BLOOD_GROUPS, RELIGIONS, generateEmployeeId } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
  class: { name: string };
}

interface TeacherFormProps {
  subjects: Subject[];
  teacher?: {
    id: string;
    employeeId: string;
    phone: string | null;
    qualification: string | null;
    experience: number | null;
    salary: number | null;
    gender: string | null;
    bloodGroup: string | null;
    religion: string | null;
    address: string | null;
    user: { name: string; email: string };
  };
}

export function TeacherForm({ subjects, teacher }: TeacherFormProps) {
  const router = useRouter();
  const isEdit = !!teacher;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: teacher?.user.name || "",
    email: teacher?.user.email || "",
    password: "",
    employeeId: teacher?.employeeId || generateEmployeeId(),
    phone: teacher?.phone || "",
    qualification: teacher?.qualification || "",
    experience: teacher?.experience?.toString() || "",
    salary: teacher?.salary?.toString() || "",
    gender: teacher?.gender || "",
    bloodGroup: teacher?.bloodGroup || "",
    religion: teacher?.religion || "",
    address: teacher?.address || "",
  });

  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/teachers/${teacher!.id}` : "/api/teachers",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(isEdit ? "Teacher updated" : "Teacher added");
        router.push("/dashboard/teachers");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Teacher name" required />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="teacher@school.com" required />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 8 characters" />
              <p className="text-xs text-muted-foreground">Default: Teacher@123</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Employee ID *</Label>
            <Input value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+880 1XXX-XXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="M.Sc. Mathematics" />
          </div>
          <div className="space-y-2">
            <Label>Experience (years)</Label>
            <Input type="number" value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="5" />
          </div>
          <div className="space-y-2">
            <Label>Salary (BDT)</Label>
            <Input type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="30000" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
              <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Religion</Label>
            <Select value={form.religion} onValueChange={(v) => set("religion", v)}>
              <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />{isEdit ? "Update" : "Add Teacher"}</>}
        </Button>
      </div>
    </form>
  );
}
