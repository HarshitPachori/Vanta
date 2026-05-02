import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Vanta account.",
}

const AUTH_ERRORS: Record<string, string> = {
  oauth_denied:  "Google sign-in was cancelled.",
  oauth_failed:  "Google sign-in failed. Please try again.",
  profile_failed: "Could not fetch your Google profile. Please try again.",
  user_failed:   "Could not create your account. Please try again.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error ? (AUTH_ERRORS[error] ?? "Something went wrong. Please try again.") : null

  return (
    <article className="w-full max-w-sm">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-(--color-text-primary) tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Log in to your Vanta account
        </p>
      </header>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 mb-6 px-4 py-3 rounded-lg bg-(--color-danger-muted) border border-(--color-danger)/20 text-sm text-(--color-danger)"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <LoginForm />

      <footer className="mt-6 text-center">
        <p className="text-sm text-(--color-text-muted)">
          No account?{" "}
          <Link
            href="/signup"
            className="text-(--color-accent) hover:text-(--color-accent-hover) transition-colors duration-150 font-medium"
          >
            Sign up free
          </Link>
        </p>
      </footer>
    </article>
  )
}