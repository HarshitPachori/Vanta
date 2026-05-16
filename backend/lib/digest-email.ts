type DigestItem = {
	from: string;
	subject: string;
	date: string;
	url: string;
	summary?: string;
};

type BuildDigestEmailParams = {
	userName: string | null;
	digestName: string;
	items: DigestItem[];
	deliveryDate: string;
	clientBaseUrl: string;
};

export const buildDigestEmail = ({
	userName,
	digestName,
	items,
	deliveryDate,
	clientBaseUrl,
}: BuildDigestEmailParams): { html: string; text: string } => {
	const greeting = userName ? `Hi ${userName.split(' ')[0]}` : 'Hi there';

	const itemsHtml = items
		.map(
			(item) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #27272B;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin: 0 0 4px 0; font-family: sans-serif; font-size: 11px; color: #71717A; text-transform: uppercase; letter-spacing: 0.08em;">
                ${escapeHtml(item.from)}
              </p>
              <a
                href="${item.url}"
                style="font-family: sans-serif; font-size: 15px; font-weight: 600; color: #F4F4F5; text-decoration: none; line-height: 1.4;"
              >
                ${escapeHtml(item.subject)}
              </a>
              ${item.summary ? `<p style="margin: 6px 0 0 0; font-family: sans-serif; font-size: 13px; color: #A1A1AA; line-height: 1.5;">${escapeHtml(item.summary)}</p>` : ''}
              <p style="margin: 4px 0 0 0; font-family: sans-serif; font-size: 12px; color: #71717A;">
                ${item.date}
              </p>
            </td>
            <td style="width: 80px; text-align: right; vertical-align: middle;">
              <a
                href="${item.url}"
                style="display: inline-block; padding: 6px 12px; background: #1C1C1F; border: 1px solid #27272B; border-radius: 6px; font-family: sans-serif; font-size: 11px; color: #A1A1AA; text-decoration: none;"
              >
                Read →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `,
		)
		.join('');

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(digestName)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090B; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background: #F97316; border-radius: 8px; text-align: center; vertical-align: middle;">
                          <span style="font-family: sans-serif; font-size: 16px; font-weight: 800; color: white; line-height: 32px;">V</span>
                        </td>
                        <td style="padding-left: 10px;">
                          <span style="font-family: sans-serif; font-size: 18px; font-weight: 700; color: #F4F4F5; letter-spacing: -0.02em;">InboxRift</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-family: monospace; font-size: 11px; color: #71717A;">${deliveryDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="margin: 0; font-family: sans-serif; font-size: 24px; font-weight: 700; color: #F4F4F5; letter-spacing: -0.03em;">
                ${greeting},
              </p>
              <p style="margin: 6px 0 0 0; font-family: sans-serif; font-size: 14px; color: #71717A;">
                Here's your ${escapeHtml(digestName)} — ${items.length} ${items.length === 1 ? 'email' : 'emails'} worth reading.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 20px 0;">
              <hr style="border: none; border-top: 1px solid #27272B; margin: 0;" />
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px;">
              <p style="margin: 0; font-family: monospace; font-size: 11px; color: #3F3F46; text-align: center;">
                Sent by InboxRift · <a href="${clientBaseUrl}/dashboard/digest" style="color: #3F3F46;">Manage digest</a>
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
		`${greeting},`,
		`Your ${digestName} — ${items.length} emails:`,
		'',
		...items.map((i) => `• ${i.from}: ${i.subject}${i.summary ? `\n  ${i.summary}` : ''}\n  ${i.url}`),
		'',
		'Sent by InboxRift',
	].join('\n');

	return { html, text };
};

const escapeHtml = (str: string) =>
	str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
