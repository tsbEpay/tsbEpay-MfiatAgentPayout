import Twilio from "twilio";
import { env } from "../config/env";

const getTwilioClient = () => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new Error(
      "Twilio configuration missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
    );
  }

  return Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
};

export const sendSms = async (to: string, body: string) => {
  if (env.NODE_ENV === "test") {
    return { sid: "test" };
  }

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_FROM) {
    if (env.NODE_ENV === "development") {
      console.warn(
        "Twilio not configured. SMS skipped in development.",
        { to, body }
      );
      return { sid: "dev" };
    }

    throw new Error(
      "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_FROM."
    );
  }

  const client = getTwilioClient();

  return client.messages.create({
    from: env.TWILIO_PHONE_FROM,
    to,
    body,
  });
};
