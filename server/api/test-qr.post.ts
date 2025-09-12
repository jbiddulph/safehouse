import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data = 'https://safehouse.app/access-request?property=test-123' } = body

  try {
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return {
      success: true,
      qr_code: data,
      qr_data_url: qrDataUrl,
      message: 'QR code generated successfully'
    }
  } catch (error) {
    console.error('QR code generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate QR code'
    })
  }
})
