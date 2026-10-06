import crypto from 'crypto'

/**
 * Create a requester-only status token for polling access request decisions.
 * Separate from the owner verification_token so requesters cannot approve/deny.
 */
export function createAccessRequestStatusToken(
  requestId: string,
  requesterEmail: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${requestId}:${requesterEmail.toLowerCase()}:status`)
    .digest('hex')
}

export function verifyAccessRequestStatusToken(
  requestId: string,
  requesterEmail: string,
  token: string,
  secret: string
): boolean {
  if (!token || !requestId || !requesterEmail || !secret) return false

  const expected = createAccessRequestStatusToken(requestId, requesterEmail, secret)

  try {
    const expectedBuf = Buffer.from(expected, 'hex')
    const actualBuf = Buffer.from(token, 'hex')
    if (expectedBuf.length !== actualBuf.length) return false
    return crypto.timingSafeEqual(expectedBuf, actualBuf)
  } catch {
    return false
  }
}
