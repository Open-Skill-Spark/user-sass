
# Auth SaaS Integration Guide

This guide explains how to use the **SaaS User Management** system as an external Authentication Provider for your applications.

## Overview

Your specialized "SaaS User Management" app now exposes a REST API that allows other applications (Web, Mobile, CLI) to authenticate users.

- **Frontend URL**: `https://your-saas-app.com` (Used for email verification links)
- **API URL**: `https://your-saas-app.com/api`

## Integration Steps

### 1. Login

Send a `POST` request to authenticate a user.

**Endpoint**: `POST /api/auth/login`
**Content-Type**: `application/json`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (Success)**:
```json
{
  "token": "eyJh... (JWT Token)",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Response (If 2FA is required)**:
```json
{
  "twoFactor": true
}
```
*If you receive `twoFactor: true`, prompt the user for the code and call `/login` again with `"code": "123456"` included in the body.*

### 2. Verify Session

On your client application, store the `token`. To validate the token or fetch current user details, call the verify endpoint.

**Endpoint**: `GET /api/auth/verify`
**Headers**: `Authorization: Bearer <your-token>`

**Response**:
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 3. Registration

To register new users from your external app, call the register endpoint.

**Endpoint**: `POST /api/auth/register`
**Body**:
```json
{
  "email": "new@example.com",
  "password": "password",
  "terms": true,
  "privacy": true
}
```

**Flow**:
1. API sends a verification email to the user.
2. User clicks the link in the email.
3. The link opens the **SaaS User Management** hosted page to confirm email.
4. Once verified, the user can log in via your external app.

## CORS Configuration

The API is configured to accept requests from ANY origin (`*`). If you deploy this to production, you should update `next.config.mjs` in the SaaS provider codebase to restrict `Access-Control-Allow-Origin` to your specific client domains.
