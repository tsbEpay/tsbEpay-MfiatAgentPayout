import prisma from '../../lib/prisma'
import { BadRequestError, NotFoundError } from '../../types'
import { KycStatus } from '@prisma/client'
import { SubmitKycDto, ReviewKycDto } from '../../types/kyc/kyc'
import { enqueueKycReviewJob } from '../../utils/jobQueue'


export const submitKyc = async (dto: SubmitKycDto) => {
  const agent = await prisma.agent.findUnique({
    where: { id: dto.agentId },
  });

  if (!agent) throw new NotFoundError('Agent not found', 404)
  if (!agent.isPhoneVerified) throw new BadRequestError('Please verify your email address before submitting KYC', 400)

  const existing = await prisma.kycDocument.findUnique({where: { agentId: dto.agentId },})

  if (existing && existing.status === 'APPROVED') throw new BadRequestError('Your KYC is already approved', 400)
    
  // if already submitted and pending, do not allow duplicate
  if (existing && existing.status === 'SUBMITTED') throw new BadRequestError('Your KYC is already under review. Please wait', 400)

  // if rejected, delete old submission so they can resubmit
  if (existing && existing.status === 'REJECTED') {
    await prisma.kycDocument.delete({
      where: { agentId: dto.agentId },
    })
  }

  // create the KYC document record
  const kyc = await prisma.$transaction(async (tx) => {
    const kycDoc = await tx.kycDocument.create({
      data: {
        agentId: dto.agentId,
        docType: dto.docType,
        idNumber: dto.idNumber,
        issuedDate: dto.issuedDate,
        expiryDate: dto.expiryDate,
        frontUrl: dto.frontUrl,
        backUrl: dto.backUrl,
        selfieUrl: dto.selfieUrl,
        bankStatement: dto.bankStatement,
        bankReceipt: dto.bankReceipt,
        bankAccount: dto.bankAccount,
        status: 'SUBMITTED',
      },
    })

    // update agent KYC status to SUBMITTED
    await tx.agent.update({
      where: { id: dto.agentId },
      data: { kycStatus: 'SUBMITTED' },
    })

    // create a notification for the agent
    await tx.notification.create({
      data: {
        agentId: dto.agentId,
        type: 'KYC_SUBMITTED',
        title: 'KYC Submitted',
        body: 'Your documents have been submitted successfully. We will review them and notify you within 24 hours.',
      },
    })

    return kycDoc
  })

  return {
    id: kyc.id,
    status: kyc.status,
    submittedAt: kyc.submittedAt,
  }
}


export const getKycStatus = async (agentId: string) => {
  const kyc = await prisma.kycDocument.findUnique({
    where: { agentId },
    select: {
      id: true,
      docType: true,
      status: true,
      reviewNote: true,
      submittedAt: true,
      reviewedAt: true,
    },
  })

  if (!kyc) {
    return { status: 'NOT_SUBMITTED' as const }
  }

  return kyc
}


export const reviewKyc = async (dto: ReviewKycDto) => {
  // find the KYC document
  const kyc = await prisma.kycDocument.findUnique({
    where: { id: dto.kycId },
    include: { agent: true },
  })

  if (!kyc) {
    throw new NotFoundError('KYC document not found', 404)
  }

  if (kyc.status !== 'SUBMITTED') {
    throw new BadRequestError('This KYC document is not pending review', 400)
  }

  // if rejecting, a note is required so agent knows what to fix
  if (dto.status === 'REJECTED' && !dto.reviewNote) {
    throw new BadRequestError('A review note is required when rejecting KYC', 400)
  }

  const newStatus = dto.status as KycStatus

  await prisma.$transaction(async (tx) => {
    await tx.kycDocument.update({
      where: { id: dto.kycId },
      data: {
        status: newStatus,
        reviewNote: dto.reviewNote,
        reviewedBy: dto.adminId,
        reviewedAt: new Date(),
      },
    })

    // update the agent's KYC status
    await tx.agent.update({
      where: { id: kyc.agentId },
      data: { kycStatus: newStatus },
    })
  })

  enqueueKycReviewJob({
    agentId: kyc.agentId,
    email: kyc.agent.email,
    name: `${kyc.agent.firstName} ${kyc.agent.lastName}`,
    type: dto.status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
    reviewNote: dto.reviewNote,
  })

  return {
    message: `KYC ${dto.status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
  }
}
export const getKycById =async (kycId: string) => {
  const kyc = await prisma.kycDocument.findUnique({
    where: { id: kycId },
  })

  if (!kyc) {
    throw new NotFoundError('KYC document not found', 404)
  }
  return kyc
}


export const getPendingKyc = async () => {
  const pending = await prisma.kycDocument.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { submittedAt: 'asc' }, 
    select: {
      id: true,
      docType: true,
      idNumber: true,
      frontUrl: true,
      backUrl: true,
      selfieUrl: true,
      bankStatement: true,
      bankReceipt: true,
      bankAccount: true,
      issuedDate: true,
      expiryDate: true,
      submittedAt: true,
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
        },
      },
    },
  })

  return pending
}