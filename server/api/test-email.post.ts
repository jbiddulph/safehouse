import { sendAccessRequestConfirmation } from '../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { toEmail, testType = 'confirmation' } = body

  if (!toEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing toEmail parameter'
    })
  }

  try {
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
          email: toEmail
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
        'TEST-REQUEST-123'
      )

      if (success) {
        return {
          success: true,
          message: 'Test notification email sent successfully!',
          email: toEmail
        }
      } else {
        throw new Error('Failed to send test email')
      }
    }
  } catch (error) {
    console.error('Test email error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to send test email: ${error.message}`
    })
  }
})
