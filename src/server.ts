import app from './app'
import { env } from './config/env'
import prisma from './lib/prisma'
import { startSelfPing } from './utils/ping'


const start = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected')

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`)
      console.log(`Environment: ${env.NODE_ENV}`)

      if (env.NODE_ENV === 'production' && env.KEEP_ALIVE_ENABLED) {
        startSelfPing()
      }
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// when the server is stopped, close the DB connection cleanly
process.on('SIGINT', async () => {
  console.log('Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})



start()