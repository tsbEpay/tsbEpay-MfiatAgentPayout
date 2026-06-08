import { EmailTemplate } from "./types";

export const getVerificationEmail = (code: string): EmailTemplate => ({
  subject: "Your verification code",
  text: `Your verification code is ${code}. It expires in 10 minutes.`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #0d6efd;">Verification Code</h1>
      <p>Your verification code is <strong>${code}</strong>.</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  `.trim(),
});
