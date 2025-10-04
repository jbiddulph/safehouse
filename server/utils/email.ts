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
    // Determine email service based on username format
    const isGmail = config.mailtrapUser.includes('@gmail.com')
    
    if (isGmail) {
      // Gmail SMTP configuration
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.mailtrapUser,
          pass: config.mailtrapPass // Should be Gmail App Password
        }
      })
      console.log('Gmail SMTP email service initialized')
    } else {
      // Mailtrap configuration (testing/development)
      transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io', // Mailtrap testing sandbox
        port: 2525,
        secure: false,
        auth: {
          user: config.mailtrapUser,
          pass: config.mailtrapPass
        }
      })
      console.log('Mailtrap testing email service initialized')
    }

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

export async function sendAccessRequestEmail(
  toEmail: string,
  propertyName: string,
  propertyAddress: string,
  accessLink: string
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send access request email.')
    return false
  }

  try {
    const mailOptions = {
      from: 'SafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: `🔓 Emergency Access Request - ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Emergency Access Request</h2>
          
          <p>You have requested emergency access to:</p>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>Property:</strong> ${propertyName}</p>
            <p style="margin: 8px 0 0 0;"><strong>Address:</strong> ${propertyAddress}</p>
            <p style="margin: 8px 0 0 0;"><strong>Requested:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${accessLink}" 
               style="background-color: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              Complete Access Request
            </a>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #374151;">What happens next?</h3>
            <ol style="color: #374151; margin: 0;">
              <li>Click the button above to complete your access request</li>
              <li>If your email domain is authorized, access will be granted immediately</li>
              <li>If not, you'll need to enter an access code (similar to QR code scanning)</li>
              <li>You'll receive confirmation once your request is processed</li>
            </ol>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            <strong>Note:</strong> This link will expire in 15 minutes for security reasons.
          </p>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from SafeHouse Emergency Access System.
            </p>
          </div>
        </div>
      `
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Access request email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending access request email:', error)
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
