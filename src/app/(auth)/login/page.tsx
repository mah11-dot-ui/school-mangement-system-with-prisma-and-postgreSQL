import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Login | EduManage Pro",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">EduManage Pro</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Complete School Management Solution
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Manage students, teachers, attendance, exams, fees, and more — all in one powerful platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Students", value: "10,000+" },
              { label: "Schools", value: "500+" },
              { label: "Teachers", value: "2,000+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-sm">
          © 2024 EduManage Pro. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6 lg:hidden">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">EduManage Pro</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Demo credentials: admin@school.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}
