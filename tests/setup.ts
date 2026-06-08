import dotenv from 'dotenv'
import path from 'path'

process.env.NODE_ENV = process.env.NODE_ENV || 'test'
const envPath = process.env.NODE_ENV === 'test' ? path.resolve(process.cwd(), '.env.test') : path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath })
