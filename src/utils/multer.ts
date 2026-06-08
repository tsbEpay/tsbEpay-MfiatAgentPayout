import multer from "multer"
import { env } from "../config/env"

export const storage = multer.memoryStorage()

export const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, WEBP and PDF files are allowed'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
})


export const kycUpload = upload.fields([
  { name: 'front', maxCount: 1 },         
  { name: 'back', maxCount: 1 },         
  { name: 'selfie', maxCount: 1 },        
  { name: 'bankStatement', maxCount: 1 }, 
  { name: 'bankReceipt', maxCount: 1 },  
])
