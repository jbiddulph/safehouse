import { createError } from 'h3'

/**
 * Block debug / diagnostic endpoints outside local development.
 * These routes must never be reachable in production.
 */
export function assertDebugEndpointAllowed(event?: any) {
  const nodeEnv = process.env.NODE_ENV
  const isProd = nodeEnv === 'production'
  const isNetlify = !!(process.env.NETLIFY || process.env.CONTEXT)

  if (isProd || isNetlify) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  }
}
