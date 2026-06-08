import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import prisma from "../../lib/prisma";
import {
  BadRequestError,
  ConflictError,
  JwtPayload,
  NotFoundError,
  UnauthorizedError,
} from "../../types";
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../../types/auth/authTypes";
import { generateOtpCode } from "../../utils/otp";
import { sendEmail } from "../../utils/email";
import { getVerificationEmail, getPasswordResetEmail } from "../../utils/emailTemplates";
import { enqueueEmailJob } from "../../utils/jobQueue";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";

export const register = async (dto: RegisterDto) => {
  const existingEmail = await prisma.agent.findUnique({
    where: { email: dto.email },
  });
  if (existingEmail) {
    throw new ConflictError("An account with this email already exists");
  }

  const existingPhone = await prisma.agent.findUnique({
    where: { phone: dto.phone },
  });
  if (existingPhone) {
    throw new ConflictError("An account with this phone number already exists");
  }

  const existingUsername = await prisma.agent.findUnique({
    where: { username: dto.username },
  });
  if (existingUsername) {
    throw new ConflictError("This username is already taken");
  }

  const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

  const agent = await prisma.agent.create({
    data: {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      username: dto.username,
      passwordHash,
      referredBy: dto.referredBy,
      country: dto.country,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      username: true,
      kycStatus: true,
      isPhoneVerified: true,
      createdAt: true,
    },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otp.create({
    data: {
      agentId: agent.id,
      code,
      purpose: "EMAIL_VERIFY",
      expiresAt,
    },
  });

  const verificationEmail = getVerificationEmail(code);
  await sendEmail(
    dto.email,
    verificationEmail.subject,
    verificationEmail.text,
    verificationEmail.html
  );

  return {
    agent,
    otpCode:
      env.NODE_ENV === "development" || env.NODE_ENV === "test"
        ? code
        : undefined,
  };
};

export const verifyOtp = async (agentId: string, code: string) => {
  const otp = await prisma.otp.findFirst({
    where: {
      agentId,
      purpose: "EMAIL_VERIFY",
      used: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new BadRequestError("No OTP found. Please request a new one");
  }

  if (otp.expiresAt < new Date()) {
    throw new BadRequestError("OTP has expired. Please request a new one");
  }

  // check the code matches
  if (otp.code !== code) {
    throw new BadRequestError("Invalid OTP code");
  }

  // mark OTP as used and mark email as verified
  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    }),
    prisma.agent.update({
      where: { id: agentId },
      data: { isPhoneVerified: true },
    }),
  ]);

  return { message: "Email verified successfully" };
};

export const resendOtp = async (agentId: string) => {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    throw new NotFoundError("Agent not found");
  }

  if (agent.isPhoneVerified) {
    throw new BadRequestError("Email is already verified");
  }

  await prisma.otp.updateMany({
    where: {
      agentId,
      purpose: "EMAIL_VERIFY",
      used: false,
    },
    data: { used: true },
  });

  // create a new OTP
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
    data: {
      agentId,
      code,
      purpose: "EMAIL_VERIFY",
      expiresAt,
    },
  });

  const verificationEmail = getVerificationEmail(code);
  await sendEmail(
    agent.email,
    verificationEmail.subject,
    verificationEmail.text,
    verificationEmail.html
  );

  return {
    otpCode: env.NODE_ENV === "development" ? "code" : undefined,
  };
};

export const forgotPassword = async (dto: ForgotPasswordDto) => {
  const agent = await prisma.agent.findUnique({
    where: { email: dto.email },
  });
  if (!agent) {
    return {
      message:
        "If your email is registered, a password reset code will be sent.",
    };
  }

  await prisma.otp.updateMany({
    where: {
      agentId: agent.id,
      purpose: "PASSWORD_RESET",
      used: false,
    },
    data: { used: true },
  });

  const code = generateOtpCode();
  console.log("code", code)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
    data: {
      agentId: agent.id,
      code,
      purpose: "PASSWORD_RESET",
      expiresAt,
    },
  });

  const passwordResetEmail = getPasswordResetEmail(code);
  enqueueEmailJob({
    type: "PASSWORD_RESET",
    email: agent.email,
    subject: passwordResetEmail.subject,
    text: passwordResetEmail.text,
    html: passwordResetEmail.html,
  });

  return {
    message:
      "If your email is registered, a password reset code will be sent.",
  };
};

export const resetPassword = async (dto: ResetPasswordDto) => {
  const agent = await prisma.agent.findUnique({
    where: { email: dto.email },
  });

  if (!agent) {
    throw new BadRequestError("Invalid reset code or email");
  }

  const otp = await prisma.otp.findFirst({
    where: {
      agentId: agent.id,
      purpose: "PASSWORD_RESET",
      code: dto.code,
      used: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.expiresAt < new Date()) {
    throw new BadRequestError("Invalid or expired reset code");
  }

  const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    }),
    prisma.agent.update({
      where: { id: agent.id },
      data: { passwordHash },
    }),
  ]);

  return { message: "Password has been reset successfully" };
};

export const login = async (dto: LoginDto) => {
  const lookupKey = dto.email
    ? { email: dto.email.toLowerCase().trim() }
    : { phone: dto.phone }

  const agent = await prisma.agent.findUnique({
    where: lookupKey,
  })

  if (!agent) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const passwordMatch = await bcrypt.compare(dto.password, agent.passwordHash);

  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid credentials')
  }

  await prisma.session.deleteMany({
    where: { agentId: agent.id },
  });

  const session = await prisma.session.create({
    data: {
      agentId: agent.id,
      refreshToken: "temp",
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const tokenPayload: JwtPayload = {
    agentId: agent.id,
    sessionId: session.id,
  };

  const accessToken = signAccessToken(tokenPayload);

  const refreshToken = signRefreshToken(tokenPayload);

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken },
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (
  token: string
): Promise<{ accessToken: string }> => {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const session = await prisma.session.findUnique({
    where: {
      id: payload.sessionId,
      refreshToken: token,
    },
  });

  if (!session) {
    throw new UnauthorizedError("Session not found. Please login again");
  }

  if (session.expiresAt < new Date()) {
    throw new UnauthorizedError("Session has expired. Please login again");
  }

  const accessToken = signAccessToken({
    agentId: payload.agentId,
    sessionId: payload.sessionId,
  });

  return { accessToken };
};

export const logout = async (sessionId: string) => {
  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
};

export const getProfile = async (agentId: string) => {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gender: true,
      username: true,
      country: true,
      kycStatus: true,
      isPhoneVerified: true,
      createdAt: true,
      kyc: {
        select: {
          status: true,
          docType: true,
          submittedAt: true,
          reviewNote: true,
        },
      },
    },
  });

  if (!agent) {
    throw new NotFoundError("Agent not found");
  }

  return agent;
};
