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
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
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
  } else {
    // Default to Nodemailer (Gmail)
    return transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to,
      subject,
      html,
    })
  }
}
