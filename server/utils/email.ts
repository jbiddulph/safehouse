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
  requestId: string,
  approveLink?: string,
  denyLink?: string,
  accessType: 'emergency' | 'standard' = 'emergency'
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send notification.')
    return false
  }

  try {
    const requesterDisplay = requesterName?.trim()
      ? `${requesterName} (${requesterEmail})`
      : requesterEmail

    const isEmergency = accessType === 'emergency'
    const subjectEmoji = isEmergency ? '🚨' : '📋'
    const subjectText = isEmergency ? 'Emergency' : 'Standard'
    const titleColor = isEmergency ? '#dc2626' : '#2563eb'
    const titleText = isEmergency ? 'Emergency Access Request' : 'Standard Access Request'

    const mailOptions = {
      from: 'MySafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: `${subjectEmoji} ${subjectText} Access Request - ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${titleColor};">${titleText}</h2>

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            A user with the email address <strong>${requesterDisplay}</strong> is requesting ${isEmergency ? 'emergency' : 'standard'} access to your property.
          </p>

          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${propertyName}</p>
            <p style="margin: 8px 0 0 0;"><strong>Address:</strong> ${propertyAddress}</p>
            <p style="margin: 8px 0 0 0;"><strong>Request ID:</strong> ${requestId}</p>
            <p style="margin: 8px 0 0 0;"><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
            Do you allow access?
          </p>

          ${(approveLink && denyLink) ? `
            <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
              <a href="${approveLink}" 
                 style="background-color: #047857; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Approve Access
              </a>
              <a href="${denyLink}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Deny Access
              </a>
            </div>
          ` : `
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
              Sign in to MySafeHouse to review and approve or deny this request.
            </p>
          `}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from MySafeHouse Emergency Access System.
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
      from: 'MySafeHouse <noreply@safehouse.app>',
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
              This is an automated message from MySafeHouse Emergency Access System.
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
      from: 'MySafeHouse <noreply@safehouse.app>',
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
              This is an automated message from MySafeHouse Emergency Access System.
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

export async function sendAccessRequestApprovedEmail(
  toEmail: string,
  propertyName: string,
  propertyAddress: string,
  requesterName?: string | null,
  keysafeInfo?: {
    location?: string | null
    code?: string | null
    what3words?: string | null
    latitude?: number | null
    longitude?: number | null
    notes?: string | null
    image_url?: string | null
  } | null
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send approval notification.')
    return false
  }

  try {
    const greetingName = requesterName?.trim() || 'there'
    
    // Build keysafe information section
    let keysafeSection = ''
    const hasKeysafeInfo = keysafeInfo && (
      keysafeInfo.location || 
      keysafeInfo.code || 
      keysafeInfo.what3words || 
      (keysafeInfo.latitude != null) || 
      keysafeInfo.notes ||
      keysafeInfo.image_url
    )

    if (hasKeysafeInfo) {
      keysafeSection = `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 16px; font-size: 18px;">🔑 Keysafe Information</h3>
          ${keysafeInfo.image_url ? `<div style="margin: 8px 0 16px 0;"><strong>Keysafe Image:</strong><br /><img src="${keysafeInfo.image_url}" alt="Keysafe location" style="max-width: 100%; height: auto; border: 1px solid #dbeafe; border-radius: 8px; margin-top: 8px;" /></div>` : ''}
          ${keysafeInfo.location ? `<p style="margin: 8px 0;"><strong>Location:</strong> ${keysafeInfo.location}</p>` : ''}
          ${keysafeInfo.code ? `<p style="margin: 8px 0;"><strong>Access Code:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold;">${keysafeInfo.code}</code></p>` : ''}
          ${keysafeInfo.what3words ? `<p style="margin: 8px 0;"><strong>What3Words:</strong> <a href="https://what3words.com/${keysafeInfo.what3words.replace(/\s+/g, '.')}" style="color: #3b82f6; text-decoration: none;">${keysafeInfo.what3words}</a></p>` : ''}
          ${keysafeInfo.latitude && keysafeInfo.longitude ? `<p style="margin: 8px 0;"><strong>Coordinates:</strong> ${keysafeInfo.latitude.toFixed(6)}, ${keysafeInfo.longitude.toFixed(6)}</p>` : ''}
          ${keysafeInfo.notes ? `<p style="margin: 8px 0; padding-top: 8px; border-top: 1px solid #dbeafe;"><strong>Additional Notes:</strong><br />${keysafeInfo.notes}</p>` : ''}
        </div>
      `
    }

    const mailOptions = {
      from: 'MySafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: `✅ Access Approved for ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #047857;">Emergency Access Approved</h2>

          <p style="font-size: 16px; color: #374151;">Hello ${greetingName},</p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Good news! The property owner has granted your emergency access request for <strong>${propertyName}</strong>.
          </p>

          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${propertyName}</p>
            <p style="margin: 8px 0 0 0;"><strong>Address:</strong> ${propertyAddress}</p>
          </div>

          ${keysafeSection}

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            ${hasKeysafeInfo ? 'Please use the keysafe information provided above to access the property safely.' : 'Please follow any additional instructions provided by the owner to access the property safely.'}
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Thank you,<br />
            The MySafeHouse Team
          </p>
        </div>
      `
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Access approval email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending access approval email:', error)
    return false
  }
}

export async function sendAccessRequestDeniedEmail(
  toEmail: string,
  propertyName: string,
  propertyAddress: string,
  requesterName?: string | null
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send denial notification.')
    return false
  }

  try {
    const greetingName = requesterName?.trim() || 'there'
    const mailOptions = {
      from: 'MySafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: `⚠️ Access Request Update for ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Emergency Access Request Declined</h2>

          <p style="font-size: 16px; color: #374151;">Hello ${greetingName},</p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Unfortunately, the property owner has declined your emergency access request for <strong>${propertyName}</strong>.
          </p>

          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${propertyName}</p>
            <p style="margin: 8px 0 0 0;"><strong>Address:</strong> ${propertyAddress}</p>
          </div>

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            If you believe this decision was made in error, please reach out to the property owner directly or submit a new request if circumstances change.
          </p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Thank you,<br />
            The MySafeHouse Team
          </p>
        </div>
      `
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Access denial email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending access denial email:', error)
    return false
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
) {
  const emailTransporter = initializeEmail()
  if (!emailTransporter) {
    console.warn('Email not initialized. Cannot send password reset email.')
    return false
  }

  try {
    const mailOptions = {
      from: 'MySafeHouse <noreply@safehouse.app>',
      to: toEmail,
      subject: '🔐 Reset Your MySafeHouse Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #03045e;">Reset Your Password</h2>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We received a request to reset your password for your MySafeHouse account.
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Click the button below to create a new secure password (minimum 6 characters):
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background-color: #03045e; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Or copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #8ee0ee; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 24px;">
            If you're having trouble clicking the button, copy and paste the URL above into your web browser.
          </p>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from MySafeHouse. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}
