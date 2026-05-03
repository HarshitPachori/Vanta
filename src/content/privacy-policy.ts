const content = `# Privacy Policy

**Last Updated: May 3, 2026**

---

## 1. Overview

This Privacy Policy describes how **Vanta** ("we", "us", or "our") collects, uses, stores, and protects your data when you use our service. Vanta is an AI-powered Gmail inbox manager that helps you identify senders, bulk unsubscribe from unwanted emails, and receive curated digest emails.

By creating an account and connecting your Gmail, you agree to the practices described in this policy.

---

## 2. Data We Collect

### Account Data
- Email address, display name, and password (hashed — never stored in plain text)
- Session tokens for maintaining your login state

### Gmail Data (via Google OAuth 2.0 — Read-Only)
- Email headers: sender address, sender display name, subject line, date received
- The \`List-Unsubscribe\` header from emails (used to process unsubscribe requests on your behalf)
- Email counts per sender (to show you volume statistics)

> **We do not read the body or content of your emails.** We only access email headers to identify senders and categorize them.

### Usage Data
- Scan status, last scanned timestamp
- Sender categories and unsubscribe job status
- Digest configuration (delivery time, timezone, frequency, sender list)

---

## 3. How We Use Your Data

Data collected by Vanta is used exclusively for:

- Authenticating you and maintaining secure sessions
- Scanning your Gmail inbox to identify and categorize senders (newsletters, promotions, transactional, etc.)
- Processing unsubscribe requests on your behalf via \`List-Unsubscribe\` headers or Gmail filters
- Sending digest emails containing summaries of emails from senders you choose
- Improving the reliability and performance of the service

We do not use your data for advertising, profiling, or any purpose not described here.

---

## 4. Gmail API Usage

Vanta uses the **Gmail API** with read-only scope (\`gmail.readonly\`) to scan your inbox. We also use the Gmail API to create inbox filters when processing unsubscribe requests (\`gmail.settings.basic\` scope).

Our use of Gmail data complies with the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:
- Gmail data is used only to provide the Vanta service features described above
- We do not transfer your Gmail data to third parties except as necessary to provide the service
- We do not use Gmail data for serving ads or for any other purpose unrelated to the service
- We do not allow humans to read your Gmail data unless you explicitly grant us access for support purposes or we are required to do so by law

---

## 5. Data Sharing

We do not sell, rent, or share your personal data with third parties except:

- **Google** — OAuth tokens are used to call Gmail APIs on your behalf
- **Resend** — our email delivery provider, used to send your digest emails
- **Cloudflare** — our hosting and infrastructure provider (Workers, D1 database, CDN)

All data transfers occur over encrypted HTTPS connections.

---

## 6. Authentication & Security

- Passwords are hashed using PBKDF2 — never stored in plain text
- Google OAuth tokens are stored encrypted and scoped to minimum required permissions
- Sessions expire after **7 days** of inactivity
- All API communication is over TLS-encrypted connections
- OAuth tokens are never logged or exposed in application output

---

## 7. Data Retention

- Your account data and Gmail scan results are retained as long as your account is active
- When you delete your account, all personal data is permanently removed: email address, OAuth tokens, password hash, and all associated scan data, senders, digests, and jobs
- Operational logs are retained for a maximum of **30 days** for error handling and do not contain email content

---

## 8. Your Rights

You have the right to:

- **Access** your data — all your data is visible within the Vanta dashboard
- **Delete your account** — permanently removes all your data from our systems
- **Revoke Gmail access** — you can revoke Vanta's access to your Gmail at any time from your [Google Account permissions](https://myaccount.google.com/permissions). This will disable Gmail-dependent features
- **Export your data** — contact us at the email below to request a data export

For GDPR or CCPA requests, contact: [privacy@vanta.app](mailto:privacy@vanta.app)

---

## 9. Children's Privacy

Vanta is not intended for use by children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has created an account, contact us immediately at [privacy@vanta.app](mailto:privacy@vanta.app).

---

## 10. Cookies

We use a single session cookie (\`session\`) to keep you logged in. This is a strictly necessary cookie — it contains only a signed session token and no personal data. We do not use advertising, tracking, or analytics cookies.

---

## 11. Changes to This Policy

We may update this Privacy Policy as the service evolves. Material changes will be communicated via email to your registered address. Continued use of Vanta after the effective date of changes constitutes acceptance of the updated policy.

---

## 12. Contact

For privacy-related questions or data requests:

**Vanta**

Email: [privacy@vanta.app](mailto:privacy@vanta.app)
`;

export default content;
