import { EmailTemplate } from "./types";

export const getPasswordResetEmail = (code: string): EmailTemplate => ({
  subject: "Reset your password",
  text: `You requested a password reset. Use the code below to reset your password:\n\n${code}\n\nThis code expires in 10 minutes.`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #0d6efd;">Password Reset</h1>
      <p>You requested a password reset.</p>
      <p style="font-size: 1.2rem; font-weight: bold;">Your reset code is: ${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `.trim(),
});
