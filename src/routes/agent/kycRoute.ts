import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as kycController from '../../controllers/agent/kycController'
import { kycUpload } from '../../utils/multer'
import { reviewSchema } from '../../validators/agent/kycValidator'

const kycRoutes = Router()


kycRoutes.use(authMiddleware)
kycRoutes.post('/submit', kycUpload, kycController.submitKyc)
kycRoutes.get('/status', kycController.getKycStatus);
kycRoutes.get('/id/:kycId', kycController.getKycById);
kycRoutes.get('/pending', kycController.getPendingKyc)
kycRoutes.patch('/:kycId/review', validate(reviewSchema), kycController.reviewKyc)

export default kycRoutes