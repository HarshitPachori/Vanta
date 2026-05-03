import ReactMarkdown from "react-markdown"
import content from "@/content/privacy-policy"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPolicyPage() {
  return (
    <article className="legal-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  )
}
