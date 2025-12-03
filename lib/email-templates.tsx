export const emailTemplates = {
  welcome: (name: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to SaaS App!</h1>
      <p>Hi ${name},</p>
      <p>We're excited to have you on board. Your account has been successfully created.</p>
      <p>You can now log in to your dashboard and start exploring our features.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Login to Dashboard</a>
    </div>
  `,
  passwordReset: (resetLink: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Reset your password</h1>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `,
  passwordChanged: () => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Password Changed</h1>
      <p>Your password has been successfully changed.</p>
      <p>If you did not perform this action, please contact support immediately.</p>
    </div>
  `,
  emailVerification: (token: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/new-verification?token=${token}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
    </div>
  `,
  twoFactorToken: (token: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Two-Factor Authentication</h1>
      <p>Your 2FA code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${token}</p>
      <p>This code will expire in 1 hour.</p>
    </div>
  `,
}
