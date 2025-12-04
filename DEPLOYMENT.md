# Deployment Guide - Berlin Cleanup App

Step-by-step guide to deploy your app to production (completely free!).

## Prerequisites

- [ ] GitHub account
- [ ] Your code pushed to GitHub
- [ ] Supabase account with database set up
- [ ] Environment variables ready

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Berlin Cleanup App"

# Create GitHub repo and push
# Go to github.com/new and create a repository
git remote add origin https://github.com/YOUR_USERNAME/berlin-cleanup-app.git
git branch -M main
git push -u origin main
```

### 1.2 Generate App Icons

Before deploying, you need icons for the PWA:

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload a logo (512x512px recommended)
3. Download the generated icons
4. Place them in `public/icons/` folder
5. Commit and push:

```bash
git add public/icons/
git commit -m "Add PWA icons"
git push
```

## Step 2: Set Up Production Database

### Using Supabase (Recommended - Free)

1. **Go to** https://supabase.com/
2. **Create account** (sign in with GitHub)
3. **Create new project**
   - Name: `berlin-cleanup-production`
   - Password: Strong password (save it!)
   - Region: `eu-central-1` (for Europe) or closest to you
4. **Wait 2 minutes** for setup
5. **Get connection string**:
   - Go to Settings > Database
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the string (looks like: `postgresql://postgres.xxx:[PASSWORD]@xxx.supabase.co:5432/postgres`)
   - Replace `[PASSWORD]` with your actual password

6. **Save this URL** - you'll need it for Vercel!

## Step 3: Deploy to Vercel

### 3.1 Create Vercel Account

1. Go to https://vercel.com/
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### 3.2 Import Project

1. Click "Add New..." > "Project"
2. Find your `berlin-cleanup-app` repository
3. Click "Import"

### 3.3 Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (keep default)

**Build Command**: `npm run build` (auto-filled)

### 3.4 Add Environment Variables

Click "Environment Variables" and add these:

```env
DATABASE_URL
Value: [Your Supabase connection string]

JWT_SECRET
Value: [Generate with: openssl rand -base64 32]

NEXTAUTH_SECRET
Value: [Same as JWT_SECRET or generate another]

NEXTAUTH_URL
Value: https://your-app-name.vercel.app (Vercel will show you this URL)

NEXT_PUBLIC_VAPID_PUBLIC_KEY
Value: [From: npx web-push generate-vapid-keys]

VAPID_PRIVATE_KEY
Value: [From: npx web-push generate-vapid-keys]

VAPID_SUBJECT
Value: mailto:your-email@example.com

NEXT_PUBLIC_APP_URL
Value: https://your-app-name.vercel.app
```

**How to generate secrets:**

```bash
# JWT Secret
openssl rand -base64 32

# VAPID Keys
npx web-push generate-vapid-keys
```

### 3.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app is live! 🎉

You'll get a URL like: `https://berlin-cleanup-app.vercel.app`

## Step 4: Set Up Database Schema in Production

After deployment, you need to create the database tables:

### 4.1 Run Migrations Locally Against Production DB

1. **Temporarily update your local `.env`**:
   ```bash
   # Backup your local .env first!
   cp .env .env.local.backup

   # Update DATABASE_URL to production Supabase URL
   ```

2. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```

3. **Restore local .env**:
   ```bash
   cp .env.local.backup .env
   ```

### 4.2 Create Admin User

1. **Open Prisma Studio against production**:
   ```bash
   # With production DATABASE_URL in .env
   npm run prisma:studio
   ```

2. **Add admin user**:
   - Go to User table
   - Click "Add record"
   - Fill in:
     - email: your-admin@example.com
     - password: [bcrypt hash from https://bcrypt-generator.com/]
     - name: Admin Name
     - role: ADMIN
     - points: 0
   - Click "Save"

## Step 5: Test Production App

### 5.1 Basic Testing

1. Visit your Vercel URL
2. Test navigation (all pages load)
3. Try login (may need to create regular user first)
4. Test map (should show OpenStreetMap)

### 5.2 PWA Testing

**On Mobile:**
1. Open your Vercel URL in Safari (iOS) or Chrome (Android)
2. Add to home screen
3. Open the installed app
4. Test offline mode (turn off wifi)

**On Desktop:**
1. Open in Chrome
2. Look for install icon in address bar
3. Click "Install"
4. App opens in its own window

### 5.3 Push Notifications

**Important**: Push notifications only work on HTTPS (production), not localhost!

1. Allow notifications when prompted
2. Test as admin: Send a notification
3. Check if notification appears (browser and/or OS notification)

## Step 6: Custom Domain (Optional)

### 6.1 Buy Domain

Buy from:
- Namecheap (~$10/year)
- Google Domains
- Cloudflare

### 6.2 Add to Vercel

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `berlincleanup.com`)
4. Follow DNS setup instructions
5. Wait for DNS propagation (5-60 minutes)

### 6.3 Update Environment Variables

After domain is active:
1. Go to Vercel > Settings > Environment Variables
2. Update:
   - `NEXTAUTH_URL` → `https://berlincleanup.com`
   - `NEXT_PUBLIC_APP_URL` → `https://berlincleanup.com`
3. Redeploy (Vercel > Deployments > menu > Redeploy)

## Step 7: Post-Deployment Setup

### 7.1 Create Initial Content

1. Login as admin
2. Create 2-3 test events
3. Test registration flow
4. Create a test volunteer account

### 7.2 Monitor

Vercel provides:
- **Analytics**: See page views and performance
- **Logs**: Check for errors in Functions tab
- **Speed Insights**: Monitor performance

Access via: Vercel project > tabs at top

### 7.3 Set Up Monitoring (Optional)

**Free Error Tracking:**
- [Sentry](https://sentry.io/) - 5,000 errors/month free
- Integration guide: https://vercel.com/integrations/sentry

## Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database schema migrated to production
- [ ] Admin user created
- [ ] App icons added
- [ ] PWA installable on mobile
- [ ] All pages load correctly
- [ ] Map displays properly
- [ ] Login/register works
- [ ] Event creation works (admin)
- [ ] Event registration works (volunteer)
- [ ] Push notifications enabled (test in production)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (auto with Vercel)

## Common Deployment Issues

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL in Vercel environment variables

### Issue: "Prisma Client not found"
**Solution**: Vercel runs `prisma generate` automatically. Check build logs.

### Issue: Map not loading
**Solution**:
- Check internet connection to OpenStreetMap
- Verify no CORS issues in browser console

### Issue: Push notifications not working
**Solution**:
- Only works on HTTPS (production)
- Check VAPID keys are correct
- Browser must grant permission
- iOS Safari has limited support

### Issue: Images/icons not found
**Solution**:
- Check files are in `public/` folder
- Verify paths in manifest.json
- Clear browser cache

## Continuous Deployment

Vercel automatically deploys when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys new version
# 4. Updates your URL
```

## Rollback

If something breaks:

1. Go to Vercel > Deployments
2. Find last working deployment
3. Click menu (3 dots) > "Promote to Production"
4. Your site rolls back instantly!

## Costs

**Free tier includes:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Analytics
- ✅ 1000s of serverless function invocations

**You only pay if you exceed free tier limits** (unlikely for small/medium apps)

## Upgrade Path

As your app grows:

1. **More traffic** → Vercel Pro ($20/month)
2. **Larger database** → Supabase Pro ($25/month)
3. **Email notifications** → Resend ($0 for 3,000/month)
4. **Error tracking** → Sentry paid plans
5. **Native apps** → Convert PWA with Capacitor

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: support@vercel.com
- **Status Pages**:
  - Vercel: https://www.vercel-status.com/
  - Supabase: https://status.supabase.com/

## Security Best Practices

1. **Never commit `.env` file** (in .gitignore)
2. **Use strong JWT secrets** (32+ characters)
3. **Rotate VAPID keys** if leaked
4. **Regular database backups** (Supabase auto-backup on paid plans)
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated**: `npm audit fix`

---

## You're Live! 🚀

Your Berlin Cleanup app is now accessible worldwide!

**Share your URL:**
- Social media
- Community groups
- Email lists
- Printed flyers

**Next steps:**
1. Create your first real events
2. Invite beta testers
3. Gather feedback
4. Iterate and improve

---

Questions? Check:
- README.md - Full documentation
- QUICKSTART.md - Setup guide
- PROJECT_SUMMARY.md - Architecture overview

Happy deploying! 🌱
