import type { Metadata } from "next"
import Link from "next/link"
import ResetPasswordForm from "@/components/auth/reset-password-form"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Reset password",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <article className="w-full max-w-sm text-center">
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-(--color-danger-muted) border border-(--color-danger)/20 text-sm text-(--color-danger) mb-6"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>Invalid or missing reset link. Please request a new one.</span>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-(--color-accent) hover:text-(--color-accent-hover) transition-colors duration-150 font-medium"
        >
          Request new link
        </Link>
      </article>
    )
  }

  return (
    <article className="w-full max-w-sm">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-(--color-text-primary) tracking-tight">
          Set new password
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Choose a strong password for your account.
        </p>
      </header>

      <ResetPasswordForm token={token} />
    </article>
  )
}