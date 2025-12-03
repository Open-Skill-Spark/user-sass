# Multi-Factor Authentication (MFA) Email Verification Process

## 📋 Overview

The MFA system adds an extra layer of security by requiring users to enter a 6-digit code sent to their email during login.

## 🔄 Complete Flow

### **Step 1: Enable MFA in Settings**

1. **User Action**: Navigate to Dashboard → Settings
2. **Toggle MFA**: Click the "Two-factor Authentication" switch
3. **Backend Process**:
   - API call to `PATCH /api/user/settings`
   - Database update: `is_two_factor_enabled = true`
   - User record updated in database

```typescript
// Settings Form (Client)
async function onToggleTwoFactor(checked: boolean) {
  const response = await fetch("/api/user/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isTwoFactorEnabled: checked }),
  })
}
```

### **Step 2: Login with MFA Enabled**

#### **2.1 Initial Login Attempt**

1. **User Action**: Enter email and password at `/login`
2. **Backend Process** (`/api/auth/login`):
   - Verify email and password
   - Check if `is_two_factor_enabled = true` AND `email_verified` exists
   - If yes, generate 6-digit code

```typescript
// Check if MFA is enabled
if (user.is_two_factor_enabled && user.email_verified) {
  if (!code) {
    // First login attempt - generate and send code
    const twoFactorToken = await generateTwoFactorToken(user.email)
    await sendEmail(
      user.email,
      "2FA Code",
      emailTemplates.twoFactorToken(twoFactorToken)
    )
    return NextResponse.json({ twoFactor: true })
  }
}
```

#### **2.2 Code Generation**

The `generateTwoFactorToken()` function:

```typescript
export async function generateTwoFactorToken(email: string) {
  // Generate random 6-digit code
  const token = crypto.getRandomValues(new Uint32Array(1))[0]
    .toString()
    .slice(0, 6)
  
  // Set expiration to 1 hour from now
  const expires = new Date(new Date().getTime() + 3600 * 1000)
  
  // Delete any existing token for this email
  await sql`DELETE FROM two_factor_tokens WHERE email = ${email}`
  
  // Insert new token
  await sql`
    INSERT INTO two_factor_tokens (email, token, expires)
    VALUES (${email}, ${token}, ${expires})
  `
  
  return token // e.g., "123456"
}
```

#### **2.3 Email Sent**

Email template sent to user:

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1>Two-Factor Authentication</h1>
  <p>Your 2FA code is:</p>
  <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">
    123456
  </p>
  <p>This code will expire in 1 hour.</p>
</div>
```

#### **2.4 UI Updates**

The login page detects `twoFactor: true` response:

```typescript
// Login Page (Client)
const responseData = await response.json()

if (responseData.twoFactor) {
  setShowTwoFactor(true) // Show code input field
} else {
  // Normal login - redirect to dashboard
  router.push("/dashboard")
}
```

### **Step 3: Enter 2FA Code**

1. **User Action**: Check email and enter the 6-digit code
2. **UI**: Login form now shows code input field instead of email/password
3. **Submit**: User clicks "Confirm" button

```tsx
// Login Form UI
{showTwoFactor && (
  <div className="space-y-2">
    <Label htmlFor="code">Two Factor Code</Label>
    <Input
      id="code"
      placeholder="123456"
      {...register("code")}
    />
  </div>
)}
```

### **Step 4: Code Verification**

1. **API Call**: Second login attempt with code
   ```typescript
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123",
     "code": "123456"
   }
   ```

2. **Backend Verification**:

```typescript
if (user.is_two_factor_enabled && user.email_verified) {
  if (code) {
    // Fetch token from database
    const twoFactorToken = await sql`
      SELECT * FROM two_factor_tokens WHERE email = ${user.email}
    `
    
    // Validate token exists
    if (twoFactorToken.length === 0) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }
    
    // Validate code matches
    if (twoFactorToken[0].token !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }
    
    // Check expiration
    const hasExpired = new Date(twoFactorToken[0].expires) < new Date()
    if (hasExpired) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 })
    }
    
    // Delete used token
    await sql`DELETE FROM two_factor_tokens WHERE id = ${twoFactorToken[0].id}`
    
    // Create confirmation record
    await sql`
      INSERT INTO two_factor_confirmations (user_id) 
      VALUES (${user.id})
    `
  }
}

// Create session and log in user
await login({
  id: user.id,
  email: user.email,
  role: user.role,
})
```

### **Step 5: Successful Login**

1. **Session Created**: JWT token stored in httpOnly cookie
2. **Redirect**: User redirected to `/dashboard`
3. **Activity Logged**: Login action recorded in `activity_logs` table

## 🗄️ Database Tables Involved

### `users` table
```sql
is_two_factor_enabled BOOLEAN DEFAULT FALSE
email_verified TIMESTAMP WITH TIME ZONE
```

### `two_factor_tokens` table
```sql
id UUID PRIMARY KEY
email TEXT NOT NULL
token TEXT NOT NULL  -- 6-digit code
expires TIMESTAMP WITH TIME ZONE NOT NULL
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

### `two_factor_confirmations` table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

## 🔐 Security Features

1. **Token Expiration**: Codes expire after 1 hour
2. **Single Use**: Tokens are deleted after successful verification
3. **Email Requirement**: MFA only works if email is verified
4. **Database Cleanup**: Old tokens are deleted when new ones are generated
5. **Secure Storage**: Tokens stored in database, not in client

## 🧪 Testing the Flow

### **Manual Test Steps:**

1. **Setup**:
   ```bash
   # Ensure dev server is running
   npm run dev
   ```

2. **Register & Verify Email**:
   - Go to `/register`
   - Create account
   - Check email for verification link
   - Click verification link

3. **Enable MFA**:
   - Login to account
   - Go to `/dashboard/settings`
   - Toggle "Two-factor Authentication" ON
   - Logout

4. **Test MFA Login**:
   - Go to `/login`
   - Enter email and password
   - Click "Sign In"
   - **Expected**: Form changes to show code input
   - Check your email for 6-digit code
   - Enter code in the form
   - Click "Confirm"
   - **Expected**: Redirected to dashboard

5. **Test Invalid Code**:
   - Try logging in with wrong code
   - **Expected**: Error message "Invalid code"

6. **Test Expired Code**:
   - Wait 1 hour after code generation
   - Try to use the code
   - **Expected**: Error message "Code expired"

## 📧 Email Configuration

Ensure your email provider is configured in `.env.local`:

### Option 1: AWS SES
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Option 2: Gmail
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## 🐛 Troubleshooting

### Code Not Received
- Check spam/junk folder
- Verify email configuration in `.env.local`
- Check server logs for email sending errors

### "Invalid code" Error
- Ensure you're entering the exact 6-digit code
- Check if code has expired (1 hour limit)
- Try requesting a new code (logout and login again)

### MFA Toggle Not Working
- Ensure user's email is verified first
- Check database connection
- Verify `is_two_factor_enabled` column exists in users table

## 🔄 Disable MFA

1. Login with MFA code
2. Go to `/dashboard/settings`
3. Toggle "Two-factor Authentication" OFF
4. Next login will not require code

## 📊 Activity Logging

All MFA-related actions are logged:
- MFA enable/disable in settings
- Login attempts with 2FA
- Failed code verification attempts

View logs at `/admin/activity` (admin only)

---

**Security Note**: This implementation uses email-based 2FA. For production, consider adding:
- SMS-based 2FA
- Authenticator app support (TOTP)
- Backup codes
- Rate limiting on code attempts
