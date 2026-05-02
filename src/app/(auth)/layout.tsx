export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import Link from "next/link"
import { getAuthStatus } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
const { loggedIn, onboarded } = await getAuthStatus()
if (loggedIn) redirect(onboarded ? "/dashboard" : "/onboarding")

  return (
    <div className="min-h-dvh bg-(--color-base) flex flex-col">
      <header className="px-6 py-4">
        <Link
          href="/"
          aria-label="Vanta home"
          className="flex items-center gap-2 w-fit group"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent) text-white text-sm font-bold font-display transition-all duration-200 group-hover:scale-110"
          >
            V
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-(--color-text-primary)">
            Vanta
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-(--color-text-muted)">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors duration-150">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors duration-150">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}