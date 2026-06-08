import { Response, NextFunction } from "express";
import { AuthRequest, successResponse, BadRequestError } from "../../types";
import * as kycService from "../../services/agent/kycService";
import { DocumentType } from "../../generated/prisma/enums";
import { FOLDERS, uploadToCloudinary } from "../../utils/upload";

export const submitKyc = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent!.agentId;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files.front?.[0])
      throw new BadRequestError("Front side of ID is required", 400);
    if (!files.back?.[0])
      throw new BadRequestError("Back side of ID is required", 400);
    if (!files.selfie?.[0])
      throw new BadRequestError("Passport photograph is required", 400);
    if (!files.bankStatement?.[0])
      throw new BadRequestError("Bank statement is required", 400);
    if (!files.bankReceipt?.[0])
      throw new BadRequestError("Bank sample receipt is required", 400);

    const { docType, idNumber, issuedDate, expiryDate, bankAccount } = req.body;

    const validDocTypes = ["PASSPORT", "DRIVERS_LICENSE"] as const;
    if (!validDocTypes.includes(docType as any)) {
      throw new BadRequestError("Document type must be PASSPORT or DRIVERS_LICENSE",400,);
    }
    if (!idNumber) throw new BadRequestError("ID number is required", 400);
    if (!issuedDate) throw new BadRequestError("Issued date is required", 400);
    if (!bankAccount)
      throw new BadRequestError("Bank account number is required", 400);

    const timestamp = Date.now();

    const [front, back, selfie, bankStatement, bankReceipt] = await Promise.all(
      [
        uploadToCloudinary(
          files.front[0].buffer,
          FOLDERS.KYC_ID,
          `${agentId}-front-${timestamp}`,
        ),
        uploadToCloudinary(
          files.back[0].buffer,
          FOLDERS.KYC_ID,
          `${agentId}-back-${timestamp}`,
        ),
        uploadToCloudinary(
          files.selfie[0].buffer,
          FOLDERS.KYC_SELFIE,
          `${agentId}-selfie-${timestamp}`,
        ),
        uploadToCloudinary(
          files.bankStatement[0].buffer,
          FOLDERS.KYC_BANK,
          `${agentId}-statement-${timestamp}`,
        ),
        uploadToCloudinary(
          files.bankReceipt[0].buffer,
          FOLDERS.KYC_BANK,
          `${agentId}-receipt-${timestamp}`,
        ),
      ],
    );

    // save the Cloudinary secure URLs to the database
    const data = await kycService.submitKyc({
      agentId,
      docType: docType as DocumentType,
      idNumber,
      issuedDate: new Date(issuedDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      frontUrl: front.secure_url,
      backUrl: back.secure_url,
      selfieUrl: selfie.secure_url,
      bankStatement: bankStatement.secure_url,
      bankReceipt: bankReceipt.secure_url,
      bankAccount,
    });
    res.status(201).json(successResponse("KYC submitted successfully", data));
  } catch (err) {
    next(err);
  }
};

export const getKycStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kycService.getKycStatus(req.agent!.agentId);
    res.json(successResponse("KYC status retrieved", data));
  } catch (err) {
    next(err);
  }
};

export const reviewKyc = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kycService.reviewKyc({
      kycId: req.params.kycId as string,
      adminId: req.agent!.agentId,
      status: req.body.status,
      reviewNote: req.body.reviewNote,
    });
    res.json(successResponse(data.message));
  } catch (err) {
    next(err);
  }
};

export const getKycById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {    const data = await kycService.getKycById(req.params.kycId as string);
    res.json(successResponse("KYC document retrieved", data));
  } catch (err) {
    next(err);
  }
};

export const getPendingKyc = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await kycService.getPendingKyc();
    res.json(successResponse("Pending KYC submissions", data));
  } catch (err) {
    next(err);
  }
};
