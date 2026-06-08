import { env } from "../config/env"

export const startSelfPing = () => {
  const url = `http://127.0.0.1:${env.PORT}/health`
  const intervalMs = 14 * 60 * 1000

  const ping = async () => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Unexpected response status: ${response.status}`)
      }
      console.log(`Self-ping successful: ${response.status}`)
    } catch (error) {
      console.warn('Self-ping failed:', error)
    }
  }

  setTimeout(ping, 10_000)
  setInterval(ping, intervalMs)
}