"use server";

import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function signInAction(email: string, password: string) {
  try {
    // signIn with redirect:false doesn't set cookie properly in server actions
    // Use redirectTo so NextAuth sets the session cookie via redirect
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // NextAuth throws a redirect — that's the success case, re-throw it
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // let Next.js handle the redirect
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
        case "CallbackRouteError":
          return { error: "Invalid email or password." };
        default:
          return { error: `Login error: ${error.type}` };
      }
    }

    console.error("[signInAction] unexpected error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
