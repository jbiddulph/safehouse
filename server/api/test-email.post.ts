import { sendAccessRequestConfirmation } from '../utils/email'
import { initializeEmail } from '../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { toEmail, testType = 'confirmation' } = body
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'http://localhost:3000'

  if (!toEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing toEmail parameter'
    })
  }

  try {
    // First, test email initialization
    const emailTransporter = initializeEmail()
    if (!emailTransporter) {
      return {
        success: false,
        error: 'Email transporter not initialized. Check credentials.',
        debug: {
          hasUsername: !!process.env.MAILTRAP_USERNAME,
          hasPassword: !!process.env.MAILTRAP_PASSWORD,
          username: process.env.MAILTRAP_USERNAME ? process.env.MAILTRAP_USERNAME.substring(0, 3) + '***' : 'Not set'
        }
      }
    }

    // Test the transporter directly
    try {
      await emailTransporter.verify()
      console.log('Email transporter verified successfully')
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError)
      return {
        success: false,
        error: 'Email transporter verification failed',
        details: verifyError.message
      }
    }

    if (testType === 'confirmation') {
      // Test access code confirmation email
      const success = await sendAccessRequestConfirmation(
        toEmail,
        'Test User',
        'Test Property',
        '123 Test Street, Test City, TC 12345',
        'TEST-REQUEST-123',
        'ABCD1234'
      )

      if (success) {
        return {
          success: true,
          message: 'Test confirmation email sent successfully!',
          email: toEmail,
          timestamp: new Date().toISOString()
        }
      } else {
        throw new Error('Failed to send test email')
      }
    } else {
      // Test notification email
      const { sendAccessRequestNotification } = await import('../utils/email')
      const success = await sendAccessRequestNotification(
        toEmail,
        'Test Requester',
        'test@example.com',
        'Test Property',
        '123 Test Street, Test City, TC 12345',
        'TEST-REQUEST-123',
        `${baseUrl}/api/access-requests/owner-action?request=TEST-REQUEST-123&token=TEST-TOKEN&action=approve`,
        `${baseUrl}/api/access-requests/owner-action?request=TEST-REQUEST-123&token=TEST-TOKEN&action=deny`
      )

      if (success) {
        return {
          success: true,
          message: 'Test notification email sent successfully!',
          email: toEmail,
          timestamp: new Date().toISOString()
        }
      } else {
        throw new Error('Failed to send test email')
      }
    }
  } catch (error) {
    console.error('Test email error:', error)
    return {
      success: false,
      error: error.message,
      details: error.toString(),
      timestamp: new Date().toISOString()
    }
  }
})
