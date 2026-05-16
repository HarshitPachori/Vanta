const RESEND_API = 'https://api.resend.com/emails';

type SendEmailParams = {
	to: string;
	from: string;
	subject: string;
	html: string;
	text?: string;
};

export const sendEmail = async (params: SendEmailParams, apiKey: string): Promise<boolean> => {
	const res = await fetch(RESEND_API, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: params.from,
			to: [params.to],
			subject: params.subject,
			html: params.html,
			text: params.text,
		}),
	});
	console.log({ res });

	return res.ok;
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string, apiKey: string, from: string): Promise<boolean> => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Vanta password</title>
</head>
<body style="margin:0;padding:0;background:#09090B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090B;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;background:#F97316;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="font-family:sans-serif;font-size:16px;font-weight:800;color:white;line-height:32px;">V</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-family:sans-serif;font-size:18px;font-weight:700;color:#F4F4F5;letter-spacing:-0.02em;">Vanta</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111113;border:1px solid #27272B;border-radius:16px;padding:32px;">
              <p style="margin:0 0 8px 0;font-family:sans-serif;font-size:22px;font-weight:700;color:#F4F4F5;letter-spacing:-0.03em;">
                Reset your password
              </p>
              <p style="margin:0 0 28px 0;font-family:sans-serif;font-size:14px;color:#71717A;line-height:1.6;">
                We received a request to reset your Vanta password. Click the button below — this link expires in 1 hour.
              </p>
              
                href="${resetUrl}"
                style="display:inline-block;padding:12px 24px;background:#F97316;border-radius:8px;font-family:sans-serif;font-size:14px;font-weight:600;color:white;text-decoration:none;letter-spacing:-0.01em;"
              >
                Reset password
              </a>
              <p style="margin:24px 0 0 0;font-family:monospace;font-size:11px;color:#3F3F46;word-break:break-all;">
                Or copy this link: ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-family:monospace;font-size:11px;color:#3F3F46;">
                If you didn't request this, ignore this email. Your password won't change.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

	const text = [
		'Reset your Vanta password',
		'',
		'We received a request to reset your password.',
		'Click this link to reset it (expires in 1 hour):',
		'',
		resetUrl,
		'',
		"If you didn't request this, ignore this email.",
	].join('\n');

	return sendEmail({ to, from, subject: 'Reset your Vanta password', html, text }, apiKey);
};
