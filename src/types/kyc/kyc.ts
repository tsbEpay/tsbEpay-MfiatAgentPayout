import { DocumentType } from '../../generated/prisma/enums'

export interface SubmitKycDto {
  agentId: string
  docType: DocumentType
  idNumber: string
  issuedDate: Date
  expiryDate?: Date
  frontUrl: string
  backUrl: string
  selfieUrl: string
  bankStatement: string
  bankReceipt: string
  bankAccount: string
}

export interface ReviewKycDto {
  kycId: string
  adminId: string
  status: 'APPROVED' | 'REJECTED'
  reviewNote?: string
}
