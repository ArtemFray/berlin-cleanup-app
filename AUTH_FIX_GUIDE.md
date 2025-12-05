# Authentication Fix Guide

## Problem Summary
Login was failing due to bcrypt salt rounds mismatch and email case-sensitivity issues. Admin routes were unprotected.

## Root Causes Identified

### 1. **Bcrypt Rounds Mismatch** ❌
- **Your app**: Hashes passwords with 12 rounds (`lib/auth.ts:15`)
- **Your manual hash**: Created with 10 rounds (from bcrypt-generator.com)
- **Result**: Password comparison fails

### 2. **Case-Sensitive Email** ❌
- Login used `findUnique({ where: { email }})` - case-sensitive
- If DB has "Admin@test.com" but you type "admin@test.com" → no match

### 3. **No Route Protection** ❌
- Anyone could access `/admin` routes without authentication

### 4. **Navigation Shows Everything** ❌
- Admin button visible to everyone regardless of login state

---

## Fixes Implemented ✅

### 1. **Login Route** (`app/api/auth/login/route.ts`)
**Changes:**
- ✅ Case-insensitive email search using `findFirst()` with `mode: 'insensitive'`
- ✅ Added detailed console logging for debugging
- ✅ Logs: email, user found status, password hash format, verification result

**Before:**
```typescript
const user = await prisma.user.findUnique({
  where: { email },
});
```

**After:**
```typescript
const user = await prisma.user.findFirst({
  where: {
    email: {
      equals: email,
      mode: 'insensitive'
    }
  },
});
console.log('[Login] User found:', user.id, 'Role:', user.role);
```

### 2. **Register Route** (`app/api/auth/register/route.ts`)
**Changes:**
- ✅ Case-insensitive email check for existing users

### 3. **Middleware** (`middleware.ts`) - NEW FILE
**Features:**
- ✅ Protects all `/admin/*` routes
- ✅ Checks for JWT token in Authorization header or cookie
- ✅ Verifies token is valid
- ✅ Ensures user has ADMIN role
- ✅ Redirects unauthorized users to login
- ✅ Redirects non-admins to home with error

### 4. **Header Component** (`components/Header.tsx`) - NEW FILE
**Features:**
- ✅ Checks authentication state on mount
- ✅ Shows "Login" button when not authenticated
- ✅ Shows user name and points when logged in
- ✅ Shows "Admin" button ONLY for ADMIN role
- ✅ Includes "Logout" button for authenticated users
- ✅ Logout clears localStorage and redirects to home

### 5. **Home Page** (`app/page.tsx`)
**Changes:**
- ✅ Uses new `<Header />` component instead of inline header

### 6. **Admin Creation Script** (`scripts/create-admin.ts`) - NEW FILE
**Features:**
- ✅ Creates admin user with proper 12-round bcrypt hash
- ✅ Can update existing user's password
- ✅ Outputs hash for manual DB entry if needed
- ✅ Uses environment variables or defaults

---

## How To Fix Your Admin User

You have **3 options** to fix your admin login:

### Option 1: Run the Admin Creation Script (RECOMMENDED)

```bash
# Set environment variables (optional)
export ADMIN_EMAIL="your@email.com"
export ADMIN_PASSWORD="yourpassword"

# Run the script
npx ts-node scripts/create-admin.ts
```

This will:
1. Hash your password with 12 rounds (matching your app)
2. Create or update the admin user in the database
3. Output the credentials and hash

### Option 2: Update Password Manually in Supabase

1. Run this locally to get a properly hashed password:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('yourpassword', 12));"
```

2. Copy the output (starts with `$2a$12$`)
3. Go to Supabase → Table Editor → User table
4. Find your admin user
5. Update the `password` field with the new hash

### Option 3: Register a New Admin via UI (Quick Fix)

1. Go to your deployed app's `/login` page
2. Click "Register" tab
3. Create a new account
4. Go to Supabase → Table Editor → User table
5. Find the newly created user
6. Change `role` from `VOLUNTEER` to `ADMIN`
7. Login with those credentials

---

## Testing the Fix

### 1. **Test Login**

1. Go to `/login`
2. Enter admin email and password
3. Watch browser console for:
   - Network request to `/api/auth/login`
   - Response should include `{ token: "...", user: {...} }`
4. Should redirect to `/admin` after successful login

### 2. **Test Route Protection**

1. **Without login**: Try to access `/admin` directly
   - ✅ Should redirect to `/login`

2. **As VOLUNTEER**: Login as regular user, try to access `/admin`
   - ✅ Should redirect to home with error

3. **As ADMIN**: Login as admin
   - ✅ Should access `/admin` successfully

### 3. **Test Navigation**

1. **Not logged in**:
   - ✅ See: Leaderboard, Login
   - ❌ Don't see: Admin, Profile, Logout

2. **Logged in as VOLUNTEER**:
   - ✅ See: Leaderboard, Profile (with name & points), Logout
   - ❌ Don't see: Admin, Login

3. **Logged in as ADMIN**:
   - ✅ See: Leaderboard, Admin, Profile (with name & points), Logout
   - ❌ Don't see: Login

### 4. **Test Logout**

1. Login as any user
2. Click "Logout" button
3. ✅ Should redirect to home
4. ✅ Navigation should show "Login" again
5. ✅ Trying to access `/admin` should redirect to login

---

## Debugging Tips

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment → "Functions" tab
3. Look for `/api/auth/login` logs
4. You should see:
   ```
   [Login] Attempt for email: admin@test.com
   [Login] User found: cm... Role: ADMIN
   [Login] Password hash starts with: $2a$12$...
   [Login] Password valid: true
   ```

### Common Issues

**"User not found"** in logs:
- Email doesn't exist in database
- Check Supabase User table for exact email

**"Password valid: false"** in logs:
- Password hash was created with wrong rounds
- Use Option 1 or 2 above to fix

**"CORS error"** in browser:
- Usually not an issue with Next.js API routes
- Check if `/api/auth/login` endpoint exists

**Token not saved**:
- Check browser console for localStorage errors
- Make sure response includes `token` field

---

## Environment Variables Required

Make sure these are set in Vercel:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-secret-key-here
```

Optional (for admin script):
```env
ADMIN_EMAIL=admin@berlin-cleanup.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```

---

## Deployment Fix (ESLint Conflict)

**Issue**: Vercel build was failing with:
```
npm error ERESOLVE could not resolve
npm error peer eslint@">=9.0.0" from eslint-config-next@16.0.7
```

**Fix Applied**:
- Changed `eslint-config-next` from `^16.0.7` to `14.2.5` (matches Next.js version)
- Locked `next` to `14.2.5` (no caret)

This is now fixed and committed.

## Next Steps

1. ✅ Push the committed changes to GitHub
2. ✅ Vercel will auto-deploy
3. ⚠️ Fix your admin user using Option 1, 2, or 3 above
4. ✅ Test login at `your-app.vercel.app/login`
5. ✅ Verify admin access works

---

## Files Changed

```
app/api/auth/login/route.ts       - Case-insensitive email, debug logs
app/api/auth/register/route.ts    - Case-insensitive email check
app/page.tsx                      - Use Header component
components/Header.tsx             - NEW: Auth-aware navigation
middleware.ts                     - NEW: Protect admin routes
scripts/create-admin.ts           - NEW: Create admin with proper hash
```

---

## Questions?

If login still fails after deploying:

1. Check Vercel function logs for `[Login]` messages
2. Share the console output from browser Network tab
3. Verify your database actually has a user with that email
4. Confirm JWT_SECRET is set in Vercel environment variables

Good luck! 🚀
