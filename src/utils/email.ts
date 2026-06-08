import nodemailer from "nodemailer";
import { env } from "../config/env";

const createTransporter = () => {
  if (!env.SMTP_HOST || !env.EMAIL_FROM) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "Email is not configured. Set SMTP_HOST and EMAIL_FROM for SMTP transport."
      );
    }

    return null;
  }

  const transportOptions = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  } as any;

  return nodemailer.createTransport(transportOptions);
};

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("Email is not configured. Skipping email send.", {
      to,
      subject,
    });
    return {
      accepted: [to],
      rejected: [],
      envelope: {
        from: env.EMAIL_FROM,
        to: [to],
      },
      messageId: "dev",
    } as const;
  }

  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};
