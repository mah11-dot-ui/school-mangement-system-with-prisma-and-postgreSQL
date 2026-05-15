import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "path";

// Load .env
config({ path: path.join(process.cwd(), ".env") });

// Create Prisma client with adapter
const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech") || connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create School
  const school = await prisma.school.upsert({
    where: { code: "DEMO-001" },
    update: {},
    create: {
      name: "EduManage Demo School",
      code: "DEMO-001",
      address: "123 School Street, Dhaka, Bangladesh",
      phone: "+880 1700-000000",
      email: "info@demoschool.edu.bd",
      website: "https://demoschool.edu.bd",
      established: 2000,
    },
  });
  console.log("✅ School created:", school.name);

  // Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: "academic-2024" },
    update: {},
    create: {
      id: "academic-2024",
      schoolId: school.id,
      name: "2024-2025",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      isCurrent: true,
    },
  });

  // Create Users
  const users = [
    { email: "superadmin@school.com", name: "Super Admin",    role: "SUPER_ADMIN" as const, password: "Admin@123" },
    { email: "admin@school.com",      name: "School Admin",   role: "ADMIN"       as const, password: "Admin@123" },
    { email: "teacher@school.com",    name: "John Teacher",   role: "TEACHER"     as const, password: "Teacher@123" },
    { email: "student@school.com",    name: "Alice Student",  role: "STUDENT"     as const, password: "Student@123" },
    { email: "parent@school.com",     name: "Bob Parent",     role: "PARENT"      as const, password: "Parent@123" },
    { email: "accountant@school.com", name: "Carol Accountant", role: "ACCOUNTANT" as const, password: "Account@123" },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed },
      create: { email: u.email, name: u.name, role: u.role, password: hashed },
    });
    createdUsers[u.role] = user.id;
    console.log(`✅ User: ${u.name} (${u.role}) — ${u.email} / ${u.password}`);
  }

  // Admin profile
  await prisma.admin.upsert({
    where: { userId: createdUsers.ADMIN },
    update: {},
    create: {
      userId: createdUsers.ADMIN,
      schoolId: school.id,
      employeeId: "EMP-2024-0001",
      phone: "+880 1700-000001",
    },
  });

  // Classes
  const classNames = [
    { name: "Class 6",  grade: 6 },
    { name: "Class 7",  grade: 7 },
    { name: "Class 8",  grade: 8 },
    { name: "Class 9",  grade: 9 },
    { name: "Class 10", grade: 10 },
  ];

  const classes: Record<string, string> = {};
  for (const c of classNames) {
    const cls = await prisma.class.upsert({
      where: { schoolId_name_academicYearId: { schoolId: school.id, name: c.name, academicYearId: academicYear.id } },
      update: {},
      create: { schoolId: school.id, academicYearId: academicYear.id, name: c.name, grade: c.grade, capacity: 40 },
    });
    classes[c.name] = cls.id;
  }
  console.log("✅ Classes created");

  // Sections
  const sectionDefs = [
    { classId: classes["Class 10"], name: "A" },
    { classId: classes["Class 10"], name: "B" },
    { classId: classes["Class 9"],  name: "A" },
    { classId: classes["Class 9"],  name: "B" },
  ];

  const sectionIds: string[] = [];
  for (const s of sectionDefs) {
    const sec = await prisma.section.upsert({
      where: { classId_name: { classId: s.classId, name: s.name } },
      update: {},
      create: { classId: s.classId, name: s.name, capacity: 40 },
    });
    sectionIds.push(sec.id);
  }
  console.log("✅ Sections created");

  // Subjects for Class 10
  const subjectDefs = [
    { name: "Mathematics", code: "MATH-10" },
    { name: "English",     code: "ENG-10"  },
    { name: "Physics",     code: "PHY-10"  },
    { name: "Chemistry",   code: "CHEM-10" },
    { name: "Biology",     code: "BIO-10"  },
    { name: "History",     code: "HIST-10" },
  ];

  const subjectIds: string[] = [];
  for (const s of subjectDefs) {
    const sub = await prisma.subject.upsert({
      where: { classId_code: { classId: classes["Class 10"], code: s.code } },
      update: {},
      create: { classId: classes["Class 10"], name: s.name, code: s.code, creditHours: 1 },
    });
    subjectIds.push(sub.id);
  }
  console.log("✅ Subjects created");

  // Teacher profile
  const teacher = await prisma.teacher.upsert({
    where: { userId: createdUsers.TEACHER },
    update: {},
    create: {
      userId: createdUsers.TEACHER,
      employeeId: "EMP-2024-0002",
      phone: "+880 1700-000002",
      qualification: "M.Sc. Mathematics",
      experience: 5,
      salary: 30000,
      gender: "MALE",
    },
  });

  // Assign 2 subjects to teacher
  for (const subId of subjectIds.slice(0, 2)) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: subId } },
      update: {},
      create: { teacherId: teacher.id, subjectId: subId },
    });
  }

  // Parent profile
  const parent = await prisma.parent.upsert({
    where: { userId: createdUsers.PARENT },
    update: {},
    create: {
      userId: createdUsers.PARENT,
      phone: "+880 1700-000003",
      occupation: "Business",
      relationship: "Father",
    },
  });

  // Student profile
  const student = await prisma.student.upsert({
    where: { admissionNo: "STU-2024-0001" },
    update: {},
    create: {
      userId: createdUsers.STUDENT,
      admissionNo: "STU-2024-0001",
      rollNumber: "01",
      sectionId: sectionIds[0],
      parentId: parent.id,
      gender: "FEMALE",
      bloodGroup: "A+",
      religion: "Islam",
      nationality: "Bangladeshi",
      phone: "+880 1700-000004",
      address: "456 Student Lane, Dhaka",
    },
  });
  console.log("✅ Student profile created");

  // Fee Structure
  const feeStructure = await prisma.feeStructure.upsert({
    where: { id: "fee-monthly-2024" },
    update: {},
    create: {
      id: "fee-monthly-2024",
      schoolId: school.id,
      classId: classes["Class 10"],
      academicYearId: academicYear.id,
      name: "Monthly Tuition Fee",
      amount: 2000,
      dueDate: 10,
      frequency: "MONTHLY",
      description: "Monthly tuition fee for Class 10",
    },
  });

  // Fees for student (5 months)
  for (let month = 1; month <= 5; month++) {
    const dueDate = new Date(2024, month - 1, 10);
    const feeId = `fee-${student.id.slice(0, 8)}-${month}-2024`;
    const status = month <= 3 ? "PAID" : month === 4 ? "PARTIAL" : "PENDING";

    const fee = await prisma.fee.upsert({
      where: { id: feeId },
      update: {},
      create: {
        id: feeId,
        studentId: student.id,
        feeStructureId: feeStructure.id,
        amount: 2000,
        dueDate,
        status,
        month,
        year: 2024,
      },
    });

    if (month <= 3) {
      const receiptNo = `RCP-2024-${month.toString().padStart(3, "0")}`;
      const existing = await prisma.payment.findUnique({ where: { receiptNo } });
      if (!existing) {
        await prisma.payment.create({
          data: {
            feeId: fee.id,
            amount: 2000,
            method: "CASH",
            receiptNo,
            paidAt: new Date(2024, month - 1, 8),
          },
        });
      }
    } else if (month === 4) {
      const receiptNo = "RCP-2024-004";
      const existing = await prisma.payment.findUnique({ where: { receiptNo } });
      if (!existing) {
        await prisma.payment.create({
          data: {
            feeId: fee.id,
            amount: 1000,
            method: "BANK_TRANSFER",
            receiptNo,
            paidAt: new Date(2024, 3, 12),
          },
        });
      }
    }
  }
  console.log("✅ Fees and payments created");

  // Notices
  const noticeData = [
    { title: "Annual Sports Day",    content: "Sports Day on December 15, 2024. All students participate.", visibility: "ALL"     as const, isPublished: true },
    { title: "Exam Schedule",        content: "Final exam schedule for 2024 has been released.",            visibility: "STUDENT" as const, isPublished: true },
    { title: "Teacher Meeting",      content: "Monthly meeting on December 5, 2024 at 10 AM.",             visibility: "TEACHER" as const, isPublished: true },
    { title: "Fee Reminder",         content: "December fees due by December 10, 2024.",                   visibility: "PARENT"  as const, isPublished: true },
  ];

  for (const n of noticeData) {
    await prisma.notice.create({
      data: { schoolId: school.id, ...n, createdBy: createdUsers.ADMIN, publishedAt: new Date() },
    });
  }
  console.log("✅ Notices created");

  // Attendance (last 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date } },
      update: {},
      create: {
        studentId: student.id,
        sectionId: sectionIds[0],
        date,
        status: i === 2 ? "ABSENT" : i === 4 ? "LATE" : "PRESENT",
        takenBy: createdUsers.TEACHER,
      },
    });
  }
  console.log("✅ Attendance created");

  // Exam + Results
  const exam = await prisma.exam.create({
    data: {
      academicYearId: academicYear.id,
      name: "Final Examination 2024",
      type: "FINAL",
      startDate: new Date("2024-12-01"),
      endDate: new Date("2024-12-15"),
      isPublished: true,
    },
  });

  const gradeMap = (pct: number) => {
    if (pct >= 80) return { grade: "A+", point: 5.0 };
    if (pct >= 70) return { grade: "A",  point: 4.0 };
    if (pct >= 60) return { grade: "A-", point: 3.5 };
    if (pct >= 50) return { grade: "B",  point: 3.0 };
    if (pct >= 40) return { grade: "C",  point: 2.0 };
    if (pct >= 33) return { grade: "D",  point: 1.0 };
    return { grade: "F", point: 0.0 };
  };

  for (const subId of subjectIds.slice(0, 3)) {
    const es = await prisma.examSubject.create({
      data: {
        examId: exam.id,
        subjectId: subId,
        date: new Date("2024-12-01"),
        startTime: "09:00",
        endTime: "12:00",
        totalMarks: 100,
        passMarks: 33,
      },
    });
    const marks = Math.floor(Math.random() * 40) + 55;
    const { grade, point } = gradeMap(marks);
    await prisma.result.create({
      data: { studentId: student.id, examId: exam.id, examSubjectId: es.id, marksObtained: marks, grade, gradePoint: point },
    });
  }
  console.log("✅ Exam and results created");

  // Library Books
  const books = [
    { title: "Advanced Mathematics", author: "R.D. Sharma",  isbn: "978-0-123456-78-9", category: "Mathematics" },
    { title: "English Grammar",      author: "Wren & Martin", isbn: "978-0-234567-89-0", category: "English"     },
    { title: "Physics Fundamentals", author: "H.C. Verma",   isbn: "978-0-345678-90-1", category: "Science"     },
    { title: "World History",        author: "E.H. Carr",    isbn: "978-0-456789-01-2", category: "History"     },
    { title: "Chemistry Concepts",   author: "P. Bahadur",   isbn: "978-0-567890-12-3", category: "Science"     },
  ];
  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: { ...b, quantity: 5, available: 4, status: "AVAILABLE" },
    });
  }
  console.log("✅ Library books created");

  // Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: createdUsers.ADMIN,      action: "created",          entity: "Student", entityId: student.id, description: "Added new student Alice Student" },
      { userId: createdUsers.TEACHER,    action: "took attendance",  entity: "Attendance", description: "Took attendance for Class 10-A" },
      { userId: createdUsers.ACCOUNTANT, action: "collected payment", entity: "Payment", description: "Collected monthly fee from Alice Student" },
    ],
  });
  console.log("✅ Activity logs created");

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 LOGIN CREDENTIALS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Super Admin  →  superadmin@school.com  /  Admin@123");
  console.log("  Admin        →  admin@school.com       /  Admin@123");
  console.log("  Teacher      →  teacher@school.com     /  Teacher@123");
  console.log("  Student      →  student@school.com     /  Student@123");
  console.log("  Parent       →  parent@school.com      /  Parent@123");
  console.log("  Accountant   →  accountant@school.com  /  Account@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
