"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/actions/auth-action";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = (loginEmail: string, loginPassword: string) => {
    setErrorMsg("");
    startTransition(async () => {
      const result = await signInAction(loginEmail, loginPassword);
      // If result is returned (not redirected), it means error
      if (result?.error) {
        setErrorMsg(result.error);
      }
      // On success, NextAuth throws NEXT_REDIRECT → page navigates automatically
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }
    doLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          ⚠ {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@school.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full h-11" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
        ) : (
          <><LogIn className="h-4 w-4 mr-2" /> Sign in</>
        )}
      </Button>

      {/* Quick demo buttons */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground mb-2 text-center">Quick demo login:</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Admin",   email: "admin@school.com",   pass: "Admin@123"   },
            { label: "Teacher", email: "teacher@school.com", pass: "Teacher@123" },
            { label: "Student", email: "student@school.com", pass: "Student@123" },
          ].map((d) => (
            <button
              key={d.label}
              type="button"
              disabled={isPending}
              onClick={() => doLogin(d.email, d.pass)}
              className="text-xs py-1.5 px-2 rounded border border-input hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isPending ? "..." : d.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
