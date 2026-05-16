type UrlInput = {
	baseUrl: string;
	url: string;
};
export const generateResetPasswordHtml = ({ baseUrl, url }: UrlInput) => `
 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>Reset Your Password – Solvative</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #eef1fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eef1fb;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 0 0 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                          <img src="https://assets.connect-algolia-klaviyo.com/logo.png"  alt="" style="display: block; margin: 9px auto;" />
                      </tr>
                    </table>
                  </td>
          
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
              
              <!-- Accent Bar -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td height="4" style="background-color: #3B5BDB;"></td>
                </tr>
              </table>
              
              <!-- Hero Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 30px 32px;">
                    
                    <!-- Eyebrow (Orange/Amber) -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #fff4e6; border: 1px solid #fdd9a0; border-radius: 999px; padding: 4px 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 6px;">
                                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f59e0b; vertical-align: middle;"></span>
                              </td>
                              <td>
                                <span style="font-size: 11px; font-weight: 600; color: #c27400; letter-spacing: 0.07em; text-transform: uppercase; vertical-align: middle;">PASSWORD RESET REQUEST</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Icon (Key) -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="68" height="68" style="background-color: #fff4e6; border: 1.5px solid #fdd9a0; border-radius: 16px; text-align: center; vertical-align: middle;">
                          <img src="https://assets.connect-algolia-klaviyo.com/key.png" width="30" height="30" alt="Key" style="display: block; margin: 19px auto;" />
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Title & Body -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <h1 style="margin: 0; font-size: 24px; font-weight: 700; line-height: 1.3; color: #1a2340; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            Forgot your password?<br/>
                            <span style="color: #3B5BDB;">Reset it in one click.</span>
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #5a6480; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            We received a request to reset the password for your account. Click the button below to choose a new password and regain access.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td height="1" style="background-color: #edf0f8;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Body Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 28px 30px 36px;">
                    
                    <!-- Warning Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #fff8f0; border: 1px solid #fdd9a0; border-left: 3px solid #f59e0b; border-radius: 8px; padding: 14px 16px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="28" style="vertical-align: top;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td width="28" height="28" style="background-color: #fde9c0; border-radius: 7px; text-align: center; vertical-align: middle;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/warn.png" width="15" height="15" alt="" style="display: block; margin: 6.5px auto;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.65; color: #7a5800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  <strong style="color: #5c4000;">Never share this link with anyone.</strong> Our team will never ask for your reset link. If you did not request this, your account is safe — just ignore this email.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center; padding: 0 0 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: #3B5BDB; border-radius: 10px;">
                                <a href="${url}" style="display: inline-block; padding: 15px 44px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Reset My Password</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding: 0 0 24px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: #fff8e6; border: 1px solid #fde68a; border-radius: 999px; padding: 4px 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="padding-right: 5px;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/clock.png" width="12" height="12" alt="" style="display: block; vertical-align: middle;" />
                                    </td>
                                    <td>
                                      <span style="font-size: 12px; font-weight: 500; color: #9e6c00; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">This link expires in 1 hour</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Fallback Link Block -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8f9fc; border: 1px solid #e4e9f5; border-radius: 12px; padding: 18px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #3B5BDB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">BUTTON NOT WORKING?</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 10px;">
                                <p style="margin: 0; font-size: 12px; color: #7a84a0; line-height: 1.65; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  Copy and paste the URL below directly into your browser. This link is unique to you — please do not share it with anyone.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #ffffff; border: 1px solid #dde6f8; border-radius: 7px; padding: 10px 14px;">
                                <p style="margin: 0; font-size: 11px; color: #3B5BDB; line-height: 1.7; word-break: break-all; font-family: 'Courier New', Courier, monospace;">
                                  <a href="${url}" style="color: #3B5BDB; text-decoration: underline;">${url}</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Didn't Request Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="background-color: #f5f8ff; border: 1px solid #dde6f8; border-left: 3px solid #3B5BDB; border-radius: 8px; padding: 14px 16px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="28" style="vertical-align: top;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td width="28" height="28" style="background-color: #dde6f8; border-radius: 7px; text-align: center; vertical-align: middle;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/info-circle.png" width="15" height="15" alt="" style="display: block; margin: 6.5px auto;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.65; color: #5a6480; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  <strong style="color: #1a2340;">Didn't request this?</strong> Your password has not been changed and your account remains secure. You can safely ignore this email. If you're concerned, <a target="_blank" href="mailto:support@solvative.com" style="color: #3B5BDB;">contact our support team</a>.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Footer Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td height="1" style="background-color: #edf0f8;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 24px 30px 28px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ba3be; line-height: 1.75; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      This password reset was requested from your account on Connect SFSC Klaviyo App. Reset links expire after 1 hour for your security. For help, <a target="_blank" href="mailto:support@solvative.com" style="color: #3B5BDB; text-decoration: underline;">contact support</a>.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 12px; font-weight: 600; color: #c5cce0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Solvative © 2026</span>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <a target="_blank" href="${baseUrl}/privacy-policy" style="font-size: 11px; color: #b0b9d4; text-decoration: none; padding: 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Privacy Policy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>

`;

export const verifyEmailHtml = ({ baseUrl, url }: UrlInput) => `
 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>Verify your email – Solvative</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #eef1fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eef1fb;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 0 0 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                          <img src="https://assets.connect-algolia-klaviyo.com/logo.png"  alt="" style="display: block; margin: 9px auto;" />
                      </tr>
                    </table>
                  </td>
          
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
              
              <!-- Accent Bar -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td height="4" style="background-color: #3B5BDB;"></td>
                </tr>
              </table>
              
              <!-- Hero Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 30px 32px;">
                    
                    <!-- Eyebrow (Orange/Amber) -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #fff4e6; border: 1px solid #fdd9a0; border-radius: 999px; padding: 4px 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 6px;">
                                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f59e0b; vertical-align: middle;"></span>
                              </td>
                              <td>
                                <span style="font-size: 11px; font-weight: 600; color: #c27400; letter-spacing: 0.07em; text-transform: uppercase; vertical-align: middle;">VERIFY YOUR EMAIL</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Icon (Key) -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="68" height="68" style="background-color: #fff4e6; border: 1.5px solid #fdd9a0; border-radius: 16px; text-align: center; vertical-align: middle;">
                          <img src="https://assets.connect-algolia-klaviyo.com/key.png" width="30" height="30" alt="Key" style="display: block; margin: 19px auto;" />
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Title & Body -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <h1 style="margin: 0; font-size: 24px; font-weight: 700; line-height: 1.3; color: #1a2340; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                           Verify your email
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #5a6480; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            You have just created your account. Click the button below to verify your email address.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td height="1" style="background-color: #edf0f8;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Body Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 28px 30px 36px;">
                    
                    <!-- Warning Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #fff8f0; border: 1px solid #fdd9a0; border-left: 3px solid #f59e0b; border-radius: 8px; padding: 14px 16px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="28" style="vertical-align: top;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td width="28" height="28" style="background-color: #fde9c0; border-radius: 7px; text-align: center; vertical-align: middle;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/warn.png" width="15" height="15" alt="" style="display: block; margin: 6.5px auto;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.65; color: #7a5800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  <strong style="color: #5c4000;">Never share this link with anyone.</strong> Our team will never ask for your verify email link. If you did not request this, your account is safe — just ignore this email.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center; padding: 0 0 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: #3B5BDB; border-radius: 10px;">
                                <a href="${url}" style="display: inline-block; padding: 15px 44px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Reset My Password</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding: 0 0 24px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: #fff8e6; border: 1px solid #fde68a; border-radius: 999px; padding: 4px 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="padding-right: 5px;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/clock.png" width="12" height="12" alt="" style="display: block; vertical-align: middle;" />
                                    </td>
                                    <td>
                                      <span style="font-size: 12px; font-weight: 500; color: #9e6c00; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">This link expires in 1 hour</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Fallback Link Block -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8f9fc; border: 1px solid #e4e9f5; border-radius: 12px; padding: 18px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #3B5BDB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">BUTTON NOT WORKING?</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 10px;">
                                <p style="margin: 0; font-size: 12px; color: #7a84a0; line-height: 1.65; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  Copy and paste the URL below directly into your browser. This link is unique to you — please do not share it with anyone.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #ffffff; border: 1px solid #dde6f8; border-radius: 7px; padding: 10px 14px;">
                                <p style="margin: 0; font-size: 11px; color: #3B5BDB; line-height: 1.7; word-break: break-all; font-family: 'Courier New', Courier, monospace;">
                                  <a href="${url}" style="color: #3B5BDB; text-decoration: underline;">${url}</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Didn't Request Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="background-color: #f5f8ff; border: 1px solid #dde6f8; border-left: 3px solid #3B5BDB; border-radius: 8px; padding: 14px 16px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="28" style="vertical-align: top;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td width="28" height="28" style="background-color: #dde6f8; border-radius: 7px; text-align: center; vertical-align: middle;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/info-circle.png" width="15" height="15" alt="" style="display: block; margin: 6.5px auto;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.65; color: #5a6480; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  <strong style="color: #1a2340;">Didn't request this?</strong> No worries, your account remains secure. You can safely ignore this email. If you're concerned, <a target="_blank" href="mailto:support@solvative.com" style="color: #3B5BDB;">contact our support team</a>.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Footer Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td height="1" style="background-color: #edf0f8;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 24px 30px 28px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ba3be; line-height: 1.75; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      This password reset was requested from your account on Connect SFSC Klaviyo App. Reset links expire after 1 hour for your security. For help, <a target="_blank" href="mailto:support@solvative.com" style="color: #3B5BDB; text-decoration: underline;">contact support</a>.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 12px; font-weight: 600; color: #c5cce0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Solvative © 2026</span>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <a target="_blank" href="${baseUrl}/privacy-policy" style="font-size: 11px; color: #b0b9d4; text-decoration: none; padding: 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Privacy Policy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>

`;

export const generateInviteHtml = ({ url, baseUrl }: UrlInput) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>Set Your Password – Solvative</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #eef1fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eef1fb;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 0 0 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                 <tr>
                  <td style="padding-right: 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                          <img src="https://assets.connect-algolia-klaviyo.com/logo.png"  alt="" style="display: block; margin: 9px auto;" />
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
              
              <!-- Accent Bar -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td height="4" style="background-color: #3B5BDB;"></td>
                </tr>
              </table>
              
              <!-- Hero Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 30px 32px;">
                    
                    <!-- Eyebrow -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #eef1fb; border: 1px solid #c5d0f0; border-radius: 999px; padding: 4px 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 6px;">
                                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #3B5BDB; vertical-align: middle;"></span>
                              </td>
                              <td>
                                <span style="font-size: 11px; font-weight: 600; color: #3B5BDB; letter-spacing: 0.07em; text-transform: uppercase; vertical-align: middle;">ACCOUNT INVITATION</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Icon -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="68" height="68" style="background-color: #eef1fb; border: 1.5px solid #c5d0f0; border-radius: 16px; text-align: center; vertical-align: middle;">
                          <img src="https://assets.connect-algolia-klaviyo.com/lock.png" width="30" height="30" alt="Lock" style="display: block; margin: 19px auto;" />
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Title & Body -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <h1 style="margin: 0; font-size: 24px; font-weight: 700; line-height: 1.3; color: #1a2340; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            You've been invited.<br/>
                            <span style="color: #3B5BDB;">Set your password</span> to get in.
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #5a6480; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            A workspace admin has added you to <strong style="color: #1a2340;">Connect Algolia Klaviyo App</strong>. Create a secure password to activate your account and start connecting your integrations.
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td height="1" style="background-color: #edf0f8;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Body Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 28px 30px 36px;">
                    
                    <!-- Security Info Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background-color: #f5f8ff; border: 1px solid #dde6f8; border-left: 3px solid #3B5BDB; border-radius: 8px; padding: 14px 16px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="28" style="vertical-align: top;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td width="28" height="28" style="background-color: #dde6f8; border-radius: 7px; text-align: center; vertical-align: middle;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/shield.png" width="15" height="15" alt="" style="display: block; margin: 6.5px auto;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.65; color: #5a6480; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  This link was sent securely. <strong style="color: #1a2340;">Only you</strong> should use it. If you weren't expecting this invitation, you can safely ignore this email — no account will be created.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center; padding: 0 0 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: #3B5BDB; border-radius: 10px;">
                                <a href="${url}" style="display: inline-block; padding: 15px 44px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">+ Set Password</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding: 0 0 24px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: #fff8e6; border: 1px solid #fde68a; border-radius: 999px; padding: 4px 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="padding-right: 5px;">
                                      <img src="https://assets.connect-algolia-klaviyo.com/clock.png" width="12" height="12" alt="" style="display: block; vertical-align: middle;" />
                                    </td>
                                    <td>
                                      <span style="font-size: 12px; font-weight: 500; color: #9e6c00; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">This link expires in 24 hours</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Fallback Link Block -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="background-color: #f8f9fc; border: 1px solid #e4e9f5; border-radius: 12px; padding: 18px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #3B5BDB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">BUTTON NOT WORKING?</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 10px;">
                                <p style="margin: 0; font-size: 12px; color: #7a84a0; line-height: 1.65; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                  Copy and paste the URL below directly into your browser. This link is unique to you — please do not share it with anyone.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #ffffff; border: 1px solid #dde6f8; border-radius: 7px; padding: 10px 14px;">
                                <p style="margin: 0; font-size: 11px; color: #3B5BDB; line-height: 1.7; word-break: break-all; font-family: 'Courier New', Courier, monospace;">
                                  <a href="${url}" style="color: #3B5BDB; text-decoration: underline;">${url}</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Footer Divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td height="1" style="background-color: #edf0f8;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 24px 30px 28px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ba3be; line-height: 1.75; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      You received this because your email was added to Connect Algolia Klaviyo App. If this wasn't you, please <a target="_blank" href="mailto:support@solvative.com" style="color: #3B5BDB; text-decoration: underline;">contact support</a> or simply disregard this message — no account will be created without completing this step..
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 12px; font-weight: 600; color: #c5cce0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Solvative © 2026</span>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <a target="_blank" href="${baseUrl}/privacy-policy" style="font-size: 11px; color: #b0b9d4; text-decoration: none; padding: 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Privacy Policy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
