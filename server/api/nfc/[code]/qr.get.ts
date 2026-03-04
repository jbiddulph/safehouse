import QRCode from 'qrcode'
import { resolvePublicBaseUrl } from '../../../../utils/base-url'
import { buildNfcUrl } from '../../../../utils/qr'

function isValidNfcCode(code: string) {
  const match = /^26-(\d+)$/.exec(code)
  if (!match) return false
  const codeNumber = Number(match[1])
  return Number.isInteger(codeNumber) && codeNumber >= 1 && codeNumber <= 10000
}

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code || !isValidNfcCode(code)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid NFC code'
    })
  }

  const baseUrl = await resolvePublicBaseUrl()
  const targetUrl = buildNfcUrl(baseUrl, code)

  try {
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 220,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
    return qrBuffer
  } catch (error) {
    console.error('Failed to generate NFC QR image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate QR code'
    })
  }
})
