"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import GoogleButton from "@/components/auth/google-button";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const body: { error: string } = await res.json();
        setError(body.error ?? "Could not create account.");
        return;
      }

    const body = await res.json<{ redirect?: string }>()
window.location.href = body.redirect ?? "/dashboard"
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeUp()}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4">
      <GoogleButton action="signup" />

      <div className="relative flex items-center gap-3" role="separator">
        <div className="flex-1 h-px bg-(--color-border)" />
        <span className="text-xs text-(--color-text-muted) shrink-0">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-(--color-border)" />
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Sign up form"
        className="flex flex-col gap-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            aria-live="assertive"
            className="rounded-lg px-4 py-3 text-sm bg-(--color-danger-muted) text-(--color-danger) border border-(--color-danger)/20">
            {error}
          </motion.div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="name"
            className="text-sm text-(--color-text-secondary)">
            Name
          </Label>
          <div className="relative">
            <User
              aria-hidden="true"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
            />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Alex Johnson"
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-sm text-(--color-text-secondary)">
            Email
          </Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="password"
            className="text-sm text-(--color-text-secondary)">
            Password
          </Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="pl-9 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-(--color-text-muted) hover:text-(--color-text-secondary)",
                "transition-colors duration-150",
              )}>
              {showPassword ? (
                <EyeOff size={15} aria-hidden="true" />
              ) : (
                <Eye size={15} aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="text-xs text-(--color-text-muted)">
            Minimum 8 characters
          </p>
        </div>

        <Button
          type="submit"
          className="w-full mt-1"
          disabled={loading}
          aria-busy={loading}>
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />{" "}
              Creating account…
            </>
          ) : (
            "Create free account"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
