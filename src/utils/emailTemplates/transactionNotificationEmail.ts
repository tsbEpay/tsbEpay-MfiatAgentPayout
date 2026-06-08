import { EmailTemplate } from "./types";

export const getTransactionNotificationEmail = (
  amount: string,
  transactionType: string,
  balance: string,
  details?: string
): EmailTemplate => ({
  subject: "Transaction notification",
  text: `Your ${transactionType} transaction of ${amount} was successful. Current balance: ${balance}.${details ? ` Details: ${details}` : ""}`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #0d6efd;">Transaction Notification</h1>
      <p>Your <strong>${transactionType}</strong> transaction for <strong>${amount}</strong> was successful.</p>
      <p>Current balance: <strong>${balance}</strong>.</p>
      ${details ? `<p>Details: ${details}</p>` : ""}
      <p>If you did not authorize this transaction, contact support immediately.</p>
    </div>
  `.trim(),
});
