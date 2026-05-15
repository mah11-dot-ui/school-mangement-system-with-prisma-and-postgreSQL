import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt = "dd MMM yyyy") {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "BDT") {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateAdmissionNo(prefix = "STU") {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}-${random}`;
}

export function generateEmployeeId(prefix = "EMP") {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}-${random}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateGrade(marks: number, total: number) {
  const percentage = (marks / total) * 100;
  if (percentage >= 80) return { grade: "A+", point: 5.0 };
  if (percentage >= 70) return { grade: "A", point: 4.0 };
  if (percentage >= 60) return { grade: "A-", point: 3.5 };
  if (percentage >= 50) return { grade: "B", point: 3.0 };
  if (percentage >= 40) return { grade: "C", point: 2.0 };
  if (percentage >= 33) return { grade: "D", point: 1.0 };
  return { grade: "F", point: 0.0 };
}

export function getAttendancePercentage(present: number, total: number) {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
  ACCOUNTANT: "Accountant",
} as const;

export const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  TEACHER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  STUDENT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PARENT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ACCOUNTANT: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
} as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const RELIGIONS = ["Islam", "Hinduism", "Christianity", "Buddhism", "Other"];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
