import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8).optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  salary: z.number().min(0).optional(),
  subjectIds: z.array(z.string()).optional(),
});

export const teacherUpdateSchema = teacherSchema.partial().omit({ password: true });

export type TeacherInput = z.infer<typeof teacherSchema>;
export type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>;
