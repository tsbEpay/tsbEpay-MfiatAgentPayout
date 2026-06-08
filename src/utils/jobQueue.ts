import prisma from "../lib/prisma";
import { sendEmail } from "./email";
import { env } from "../config/env";

export type KycReviewJob = {
  type: 'KYC_APPROVED' | 'KYC_REJECTED';
  agentId: string;
  email: string;
  name: string;
  reviewNote?: string;
};

export type PasswordResetEmailJob = {
  type: 'PASSWORD_RESET';
  email: string;
  subject: string;
  text: string;
  html?: string;
};

type Job = KycReviewJob | PasswordResetEmailJob;

const queue: Job[] = [];
let isProcessing = false;

export const enqueueKycReviewJob = (job: KycReviewJob) => {
  queue.push(job);
  processQueue().catch((error) => {
    console.error("Failed to process KYC review queue:", error);
  });
};

export const enqueueEmailJob = (job: PasswordResetEmailJob) => {
  queue.push(job);
  processQueue().catch((error) => {
    console.error("Failed to process email queue:", error);
  });
};

const processQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const job = queue.shift();
    if (!job) continue;

    try {
      await processJob(job);
    } catch (error) {
      console.error("Job failed:", error, job);
    }
  }

  isProcessing = false;
};

const processJob = async (job: Job) => {
  if (job.type === 'PASSWORD_RESET') {
    if (env.NODE_ENV === "test") {
      console.log("[Email Job] Email skipped in test mode", {
        to: job.email,
        subject: job.subject,
      });
      return;
    }

    await sendEmail(job.email, job.subject, job.text, job.html);
    return;
  }

  const title = job.type === 'KYC_APPROVED' ? "KYC Approved" : "KYC Rejected";
  const body =
    job.type === 'KYC_APPROVED'
      ? "Congratulations! Your KYC has been approved. You can now start receiving payout orders."
      : `Your KYC submission was rejected. Reason: ${job.reviewNote ?? "Not specified"}. Please resubmit with the correct documents.`;

  await prisma.notification.create({
    data: {
      agentId: job.agentId,
      type: job.type,
      title,
      body,
    },
  });

  const subject = job.type === 'KYC_APPROVED' ? "KYC Approved" : "KYC Rejected";
  const text =
    job.type === 'KYC_APPROVED'
      ? `Hi ${job.name},\n\nYour KYC has been approved. You can now start receiving payout orders.\n\nThank you.`
      : `Hi ${job.name},\n\nYour KYC submission was rejected. Reason: ${job.reviewNote ?? "Not specified"}. Please resubmit with the correct documents.\n\nThank you.`;

  if (env.NODE_ENV === "test") {
    console.log("[KYC Job] Email skipped in test mode", {
      to: job.email,
      subject,
    });
    return;
  }

  await sendEmail(job.email, subject, text);
};
