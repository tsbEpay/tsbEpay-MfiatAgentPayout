import { UploadApiResponse } from 'cloudinary'
import cloudinary from '../config/cloudinary'
import { BadRequestError } from '../types'


export const FOLDERS = {
  KYC_ID: 'agent-payout/kyc/id',
  KYC_SELFIE: 'agent-payout/kyc/selfie',
  KYC_BANK: 'agent-payout/kyc/bank',
}

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      },
      (error : any, result : any) => {
        if (error || !result) {
          reject(new BadRequestError('File upload failed. Please try again', 500))
        } else {
          resolve(result)
        }
      }
    )
    uploadStream.end(fileBuffer)
  })
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}