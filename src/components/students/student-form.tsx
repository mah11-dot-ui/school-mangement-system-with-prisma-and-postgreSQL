"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { studentSchema, type StudentInput } from "@/lib/validations/student";
import { createStudent, updateStudent } from "@/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOOD_GROUPS, RELIGIONS, generateAdmissionNo } from "@/lib/utils";

interface Section {
  id: string;
  name: string;
  class: { name: string; grade: number };
}

interface Parent {
  id: string;
  user: { name: string; email: string };
}

interface StudentFormProps {
  sections: Section[];
  parents: Parent[];
  student?: {
    id: string;
    admissionNo: string;
    rollNumber: string | null;
    sectionId: string | null;
    parentId: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    bloodGroup: string | null;
    religion: string | null;
    nationality: string | null;
    phone: string | null;
    address: string | null;
    emergencyContact: string | null;
    medicalInfo: string | null;
    user: { name: string; email: string };
  };
}

export function StudentForm({ sections, parents, student }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!student;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema) as never,
    defaultValues: {
      name: student?.user.name || "",
      email: student?.user.email || "",
      admissionNo: student?.admissionNo || generateAdmissionNo(),
      rollNumber: student?.rollNumber || "",
      sectionId: student?.sectionId || "",
      parentId: student?.parentId || "",
      dateOfBirth: student?.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: (student?.gender as StudentInput["gender"]) || undefined,
      bloodGroup: student?.bloodGroup || "",
      religion: student?.religion || "",
      nationality: student?.nationality || "Bangladeshi",
      phone: student?.phone || "",
      address: student?.address || "",
      emergencyContact: student?.emergencyContact || "",
      medicalInfo: student?.medicalInfo || "",
    },
  });

  const onSubmit = async (data: StudentInput) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      const result = isEdit
        ? await updateStudent(student!.id, formData)
        : await createStudent(formData);

      if (result.success) {
        toast.success(isEdit ? "Student updated successfully" : "Student created successfully");
        router.push("/dashboard/students");
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" {...register("name")} placeholder="Enter full name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="student@school.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="Min 8 characters" />
              <p className="text-xs text-muted-foreground">Default: Student@123</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="admissionNo">Admission Number *</Label>
            <Input id="admissionNo" {...register("admissionNo")} placeholder="STU-2024-0001" />
            {errors.admissionNo && <p className="text-xs text-destructive">{errors.admissionNo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input id="rollNumber" {...register("rollNumber")} placeholder="01" />
          </div>

          <div className="space-y-2">
            <Label>Class & Section</Label>
            <Select
              value={watch("sectionId") || ""}
              onValueChange={(v) => setValue("sectionId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
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

          <div className="space-y-2">
            <Label>Parent/Guardian</Label>
            <Select
              value={watch("parentId") || ""}
              onValueChange={(v) => setValue("parentId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={watch("gender") || ""}
              onValueChange={(v) => setValue("gender", v as StudentInput["gender"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select
              value={watch("bloodGroup") || ""}
              onValueChange={(v) => setValue("bloodGroup", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Religion</Label>
            <Select
              value={watch("religion") || ""}
              onValueChange={(v) => setValue("religion", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" {...register("nationality")} placeholder="Bangladeshi" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} placeholder="+880 1XXX-XXXXXX" />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & Medical</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} placeholder="Full address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input id="emergencyContact" {...register("emergencyContact")} placeholder="+880 1XXX-XXXXXX" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalInfo">Medical Information</Label>
            <Input id="medicalInfo" {...register("medicalInfo")} placeholder="Any allergies, conditions..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> {isEdit ? "Update Student" : "Add Student"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
