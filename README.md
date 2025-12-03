# SaaS User Management System

A comprehensive user management system built with Next.js 14, featuring authentication, authorization, team management, and audit logging.

## 🚀 Features

### Authentication & Authorization
- **User Registration** with email verification
- **Login/Logout** with session management
- **Multi-Factor Authentication (MFA)** via email codes
- **Password Reset** flow
- **Role-Based Access Control (RBAC)** with admin, user, and moderator roles
- **JWT-based sessions** with secure httpOnly cookies

### User Management
- **User Profile** management (name, avatar)
- **Account Settings** with MFA toggle
- **Email Verification** required for account activation
- **Terms & Privacy** consent tracking
- **User Deactivation** and soft deletion support

### Team Management
- **Create Teams** with unique slugs
- **Invite Members** by email with role assignment
- **Manage Members** (add/remove)
- **Team Roles**: Owner, Admin, Member
- **Team-based Access Control**

### Admin Features
- **User Dashboard** - view all registered users
- **Activity Logs** - comprehensive audit trail
- **User Status Management** - activate/deactivate users
- **Role Management** - assign and modify user roles
- **Admin-only Routes** protected by middleware

### Audit & Compliance
- **Activity Logging** for all critical actions
- **IP Address Tracking**
- **Action Details** stored in JSON format
- **Admin Dashboard** for log viewing
- **Compliance-ready** audit trail

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon)
- **Authentication**: Custom JWT implementation
- **Email**: AWS SES / Nodemailer (Gmail)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- AWS SES credentials OR Gmail app password

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Open-Skill-Spark/user-sass.git
   cd user-sass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # JWT Secret (generate a random string)
   JWT_SECRET_KEY=your-super-secret-jwt-key
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Email Configuration (choose one)
   
   # Option 1: AWS SES
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   
   # Option 2: Gmail (Nodemailer)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── new-verification/
│   ├── admin/                     # Admin-only pages
│   │   ├── users/                 # User management
│   │   └── activity/              # Activity logs
│   ├── api/                       # API routes
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── user/                  # User management endpoints
│   │   ├── teams/                 # Team management endpoints
│   │   └── admin/                 # Admin endpoints
│   └── dashboard/                 # User dashboard
│       ├── teams/                 # Team management UI
│       └── settings/              # User settings
├── components/
│   ├── layouts/                   # Layout components
│   │   ├── auth-layout.tsx
│   │   └── dashboard-layout.tsx
│   └── ui/                        # UI components (shadcn/ui)
├── lib/
│   ├── auth.ts                    # Authentication utilities
│   ├── db.ts                      # Database connection
│   ├── email.ts                   # Email sending utilities
│   ├── email-templates.tsx        # Email templates
│   ├── tokens.ts                  # Token generation
│   └── logger.ts                  # Activity logging
├── scripts/
│   └── setup-database.ts          # Database setup script
└── middleware.ts                  # Route protection
```

## 🔐 Database Schema

### Users Table
- `id` - UUID primary key
- `name` - User's display name
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `role` - User role (admin, user, moderator)
- `email_verified` - Email verification timestamp
- `image` - Avatar URL
- `is_two_factor_enabled` - MFA status
- `is_active` - Account active status
- `deleted_at` - Soft deletion timestamp
- `terms_accepted_at` - Terms acceptance timestamp
- `privacy_accepted_at` - Privacy policy acceptance timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Verification Tokens
- `id` - UUID primary key
- `identifier` - Email address
- `token` - Verification token
- `expires` - Token expiration

### Two-Factor Tokens
- `id` - UUID primary key
- `email` - User email
- `token` - 6-digit code
- `expires` - Token expiration

### Two-Factor Confirmations
- `id` - UUID primary key
- `user_id` - Reference to users table

### Teams
- `id` - UUID primary key
- `name` - Team name
- `slug` - Unique URL-friendly identifier
- `created_at` - Creation timestamp

### Team Members
- `id` - UUID primary key
- `team_id` - Reference to teams table
- `user_id` - Reference to users table
- `role` - Member role (owner, admin, member)
- `created_at` - Join timestamp

### Activity Logs
- `id` - UUID primary key
- `user_id` - Reference to users table
- `action` - Action type (login, update_settings, etc.)
- `details` - JSON details
- `ip_address` - User's IP address
- `created_at` - Action timestamp

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/new-verification` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management
- `PATCH /api/user/settings` - Update user settings

### Team Management
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `POST /api/teams/[slug]/invite` - Invite member to team
- `DELETE /api/teams/[slug]/members/[userId]` - Remove team member

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/activity` - View activity logs (admin only)

## 🎨 UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) components:
- Button, Input, Label
- Card, Avatar, Separator
- Sidebar, Switch, Select
- Toast notifications (Sonner)

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Encryption**: Secure session tokens
- **HTTP-only Cookies**: Prevents XSS attacks
- **CSRF Protection**: SameSite cookie policy
- **Email Verification**: Required for account activation
- **MFA Support**: Two-factor authentication via email
- **Rate Limiting**: (Recommended to add)
- **SQL Injection Protection**: Parameterized queries

## 📧 Email Templates

The system includes pre-built email templates for:
- Welcome email
- Email verification
- Password reset
- Two-factor authentication codes

## 🚦 Getting Started

### Create Your First Admin User

1. Register a new account at `/register`
2. Verify your email using the link sent
3. Manually update the database to set role to 'admin':
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
4. Log out and log back in to access admin features

### Create a Team

1. Navigate to Dashboard → Teams
2. Click "Create Team"
3. Enter team name and slug
4. Invite members by email

### Enable MFA

1. Navigate to Dashboard → Settings
2. Toggle "Two-factor Authentication"
3. On next login, you'll receive a code via email

## 📊 Activity Logging

The following actions are automatically logged:
- User login
- Settings updates
- Team creation
- Member invitations
- Member removals

Admins can view all logs at `/admin/activity`

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with email verification
- [ ] Login/logout flow
- [ ] Password reset flow
- [ ] MFA enable/disable
- [ ] Profile updates
- [ ] Team creation
- [ ] Team member invitation
- [ ] Team member removal
- [ ] Admin user list view
- [ ] Admin activity logs view

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`
- Email provider credentials

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 14 and TypeScript**
