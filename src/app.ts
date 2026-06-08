import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './docs/swagger'
import { env } from './config/env'
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware'
import agentRoutes from './routes/agent/authRoute'
import kycRoutes from './routes/agent/kycRoute'
import notificationRoutes from './routes/agent/notificationRoute'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? 'https://mfiat.com' : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// rate limiting — max 100 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
)


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Agent Payout API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/v1/auth', agentRoutes)
app.use('/api/v1/kyc', kycRoutes)
app.use('/api/v1/notifications', notificationRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app