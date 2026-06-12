import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as currencyController from '../controllers/currencyController'
import {
  validateConvertQuery,
  validateRatesQuery,
} from '../validators/agent/currencyValidator'

const currencyRoutes = Router();


currencyRoutes.use(authMiddleware)


currencyRoutes.get('/convert', validateConvertQuery, currencyController.convert)

currencyRoutes.get('/rates', validateRatesQuery, currencyController.getRates)

export default currencyRoutes