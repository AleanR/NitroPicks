import dotenv from 'dotenv';
dotenv.config();

// Email sending is disabled — reset links are returned directly in the API response.
// To enable email, integrate an SMTP or API-based email provider here.

export const sendPassResetToken = async (_userEmail: string, _url: string) => {
  // no-op: link is returned in API response instead
};

export const sendSupportEmail = async (
  _fromName: string,
  _fromEmail: string,
  _subject: string,
  _message: string,
) => {
  // no-op: email delivery not available on this host
};

export const sendEmailVerifOTP = async (_userEmail: string, _url: string) => {
  // no-op: link is returned in API response instead
};
