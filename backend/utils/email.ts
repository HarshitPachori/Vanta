import logger from "@backend/utils/logger";

export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  key: string;
  domain: string;
}

/**
 * Send email using Mailgun API
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const { from, to, subject, html, key, domain } = params;

  const auth = Buffer.from(`api:${key}`).toString('base64');
  const endpoint = `https://api.mailgun.net/v3/${domain}/messages`;

  const bodyParams = new URLSearchParams();
  bodyParams.append('from', from);
  bodyParams.append('to', to);
  bodyParams.append('subject', subject);
  bodyParams.append('html', html);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams,
    });

    const responseText = await response.text();

    if (!response.ok) {
      logger.error('Failed to send email:', responseText);
      throw new Error(`Mailgun failed: ${responseText}`);
    }

    logger.info('Mail sent successfully');

    return true;
  } catch (error: unknown) {
    logger.error('Error while sending email', error);
    return false;
  }
}

export function getEmailDomain(email: string): string | null {
  const atIndex = email.lastIndexOf('@');

  if (atIndex === -1 || atIndex === email.length - 1) {
    return null;
  }

  return email.slice(atIndex);
}
