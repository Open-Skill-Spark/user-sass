import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import nodemailer from "nodemailer"

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  // Development mode - just log the email instead of sending (unless SMTP is configured)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PROVIDER && !process.env.SMTP_USER) {
    console.log('📧 Email would be sent to:', to)
    console.log('📧 Subject:', subject)
    console.log('📧 Content:', html.substring(0, 200) + '...')
    console.log('---')
    return Promise.resolve()
  }

  try {
    if (process.env.EMAIL_PROVIDER === "ses") {
      const command = new SendEmailCommand({
        Destination: { ToAddresses: [to] },
        Message: {
          Body: { Html: { Data: html } },
          Subject: { Data: subject },
        },
        Source: process.env.EMAIL_FROM || "noreply@example.com",
      })
      return sesClient.send(command)
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use Nodemailer (SMTP)
      console.log('📧 Sending email via SMTP to:', to)
      const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      })
      console.log('✅ Email sent successfully:', result.messageId)
      return result
    } else {
      // No email provider configured - log to console
      console.log('⚠️  No email provider configured. Email content:')
      console.log('📧 To:', to)
      console.log('📧 Subject:', subject)
      console.log('📧 Content:', html.substring(0, 200) + '...')
      console.log('---')
      return Promise.resolve()
    }
  } catch (error) {
    console.error('❌ Email sending error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error name:', error.name)
    }
    // Don't throw - just log the error and continue
    return Promise.resolve()
  }
}
