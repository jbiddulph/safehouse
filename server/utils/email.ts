import nodemailer from 'nodemailer'

// Email configuration
let transporter: nodemailer.Transporter | null = null

export function initializeEmail() {
  if (transporter) {
    return transporter
  }

  const config = useRuntimeConfig()
  
  // Check if we have email credentials
  if (!config.mailtrapUser || !config.mailtrapPass) {
    console.warn('Email credentials not found. Email notifications will be disabled.')
    return null
  }

  try {
    transporter = nodemailer.createTransporter({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: config.mailtrapUser,
        pass: config.mailtrapPass
      }
    })

    console.log('Email service initialized successfully')
    return transporter
  } catch (error) {
    console.error('Failed to initialize email service:', error)
    return null
  }
}

export async function sendAccessRequestNotification(
  toEmail: string,
  requesterName: string,
  requesterEmail: string,
  propertyName: string,
  propertyAddress: string,
  requestId: string
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send notification.')
    return false
  }

  try {
    const mailOptions = {
      from: 'SafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: `🚨 Emergency Access Request - ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Emergency Access Request</h2>
          
          <p><strong>Property:</strong> ${propertyName}</p>
          <p><strong>Address:</strong> ${propertyAddress}</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin-top: 0;">Requester Details:</h3>
            <p><strong>Name:</strong> ${requesterName || 'Not provided'}</p>
            <p><strong>Email:</strong> ${requesterEmail}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Please review this request and take appropriate action.</p>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from SafeHouse Emergency Access System.
            </p>
          </div>
        </div>
      `
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending email notification:', error)
    return false
  }
}

export async function sendAccessRequestConfirmation(
  toEmail: string,
  requesterName: string,
  propertyName: string,
  propertyAddress: string,
  requestId: string,
  accessCode: string
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send confirmation.')
    return false
  }

  try {
    const mailOptions = {
      from: 'SafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: `Access Code for ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Access Code Sent</h2>
          
          <p>Hello ${requesterName || 'there'},</p>
          
          <p>You have requested emergency access to:</p>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Property:</strong> ${propertyName}</p>
            <p><strong>Address:</strong> ${propertyAddress}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Requested:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #92400e;">Your Access Code</h3>
            <div style="font-size: 24px; font-weight: bold; color: #92400e; font-family: monospace; letter-spacing: 2px; background-color: #fbbf24; padding: 12px; border-radius: 6px; display: inline-block;">
              ${accessCode}
            </div>
            <p style="margin-bottom: 0; color: #92400e; font-size: 14px;">
              Use this code to complete your access request
            </p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol style="color: #374151;">
            <li>Return to the QR code scanning page</li>
            <li>Enter the access code above when prompted</li>
            <li>Your request will be processed and you'll be notified of the result</li>
          </ol>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from SafeHouse Emergency Access System.
            </p>
          </div>
        </div>
      `
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Access code email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending access code email:', error)
    return false
  }
}
