import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { describe, it, expect, beforeEach, afterAll } from "@jest/globals";
describe("Auth integration tests", () => {
  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "notifications", "kyc_documents", "sessions", "otps", "agents" RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers an agent, verifies OTP, logs in, refreshes token, and fetches profile", async () => {
    const payload = {
      firstName: "Test",
      lastName: "Agent",
      email: "test.agent@example.com",
      phone: "08012345678",
      gender: "MALE",
      username: "testagent",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
      country: "NG",
      agreedToTerms: true,
    };
    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send(payload)
      .expect(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.agent).toBeDefined();
    expect(registerRes.body.data.otpCode).toBeDefined();

    const agentId = registerRes.body.data.agent.id;
    const otpCode = registerRes.body.data.otpCode;

    const verifyRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ agentId, code: otpCode })
      .expect(200);
    expect(verifyRes.body.success).toBe(true);

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ phone: payload.phone, password: payload.password })
      .expect(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeTruthy();
    expect(loginRes.body.data.refreshToken).toBeTruthy();

    const accessToken = loginRes.body.data.accessToken;
    const refreshToken = loginRes.body.data.refreshToken;

    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.username).toBe(payload.username);

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeTruthy();

    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(logoutRes.body.success).toBe(true);

    await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(401);
  });
});
