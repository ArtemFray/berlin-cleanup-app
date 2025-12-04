# Berlin Cleanup App - Volunteer Street Cleaning Events

A Progressive Web App (PWA) for organizing and participating in volunteer street cleaning events in Berlin. Features include event management, real-time notifications, gamification with leaderboards, and mobile-friendly design.

## Features

### For Volunteers
- 📅 **Browse Events** - View upcoming street cleaning events on a list or interactive map
- 📍 **Interactive Map** - See all events on an OpenStreetMap with markers
- ✅ **Register for Events** - Sign up for events and earn points
- 👤 **User Profiles** - Track your participation history and accumulated points
- 🏆 **Leaderboard** - Compete with other volunteers for the top spot
- 🎮 **Gamification** - Earn points for registering, attending, and collecting trash
- 🔔 **Push Notifications** - Receive real-time updates about your events
- 📱 **Mobile-Friendly** - Install as a PWA on your phone

### For Admins
- 🎯 **Create Events** - Set up new cleanup events with location, date, and description
- 📊 **Manage Events** - Update event status, view participants, mark attendance
- ✅ **Track Attendance** - Record volunteer hours and trash collected
- 📢 **Send Notifications** - Push notifications to specific events or all users
- 📈 **View Statistics** - See registration numbers and event outcomes
- 📸 **Upload Photos** - Share event results and photos

## Tech Stack

- **Frontend**: Next.js 14 (React 18, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Leaflet + OpenStreetMap
- **Authentication**: JWT (JSON Web Tokens)
- **Notifications**: Web Push API (browser push notifications)
- **Deployment**: Vercel (frontend) + Supabase (database)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **PostgreSQL** database - You can use:
  - [Supabase](https://supabase.com/) (recommended, free tier available)
  - Local PostgreSQL installation
  - [Railway](https://railway.app/) or [Neon](https://neon.tech/)

## Installation & Setup

### 1. Install Dependencies

```bash
cd berlin-cleanup-app
npm install
```

### 2. Set Up Database

#### Option A: Using Supabase (Recommended - Free)

1. Go to [supabase.com](https://supabase.com/) and create a free account
2. Create a new project
3. Go to Settings > Database and copy the connection string
4. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

#### Option B: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```bash
createdb berlin_cleanup
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# Database URL from Supabase or your PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/berlin_cleanup"

# Generate a random secret for JWT (run: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# For Supabase storage (optional, for photo uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Generate VAPID keys for push notifications
# Run: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Generate VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
```

Copy the output into your `.env` file.

### 5. Set Up Database Schema

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Optional: Open Prisma Studio to view your database
npm run prisma:studio
```

### 6. Create an Admin User

Since the app uses role-based authentication, you'll need to create an admin user directly in the database:

1. Run Prisma Studio:
```bash
npm run prisma:studio
```

2. Go to the `User` table and create a new user with:
   - Email: your admin email
   - Password: Use a bcrypt-hashed password (you can generate one at https://bcrypt-generator.com/)
   - Name: Your name
   - Role: Select `ADMIN`

Alternatively, register a regular user through the app, then update their role to `ADMIN` in Prisma Studio.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### For Volunteers

1. **Register/Login**: Create an account or log in
2. **Browse Events**: View upcoming events in list or map view
3. **Register for Event**: Click on an event and click "Register" (+10 points)
4. **Attend Event**: Show up to the event
5. **Earn Points**: Admin will mark your attendance and you'll earn points
6. **View Leaderboard**: Check your ranking among volunteers
7. **Enable Notifications**: Allow browser notifications to get event updates

### For Admins

1. **Login**: Log in with your admin account
2. **Create Event**:
   - Go to Admin Dashboard
   - Click "Create New Event"
   - Fill in event details (title, description, location, date/time)
   - Use Berlin coordinates (lat: 52.52, lng: 13.405 as default)
3. **Manage Event**:
   - Click "Manage" on any event
   - Update event status (Upcoming → Ongoing → Completed)
   - View list of registered participants
4. **Mark Attendance**:
   - After event completion, enter hours worked and trash collected
   - Click "Mark as Attended" for each volunteer
   - Points are automatically calculated and awarded
5. **Send Notifications**:
   - From Admin Dashboard, scroll to "Send Notification"
   - Choose type: Event-specific or General announcement
   - Write message and send

## Points System

| Action | Points |
|--------|--------|
| Register for event | +10 |
| Attend event | +50 |
| Collect trash | +5 per kg |
| Work hours | +20 per hour |

**Example**: If you attend a 3-hour event and collect 10kg of trash:
- Registration: 10 pts
- Attendance: 50 pts
- Hours (3h × 20): 60 pts
- Trash (10kg × 5): 50 pts
- **Total**: 170 points

## PWA Installation

### On Mobile (iOS/Android)

1. Open the app in your mobile browser (Safari for iOS, Chrome for Android)
2. **iOS**: Tap the Share button → "Add to Home Screen"
3. **Android**: Tap the menu (3 dots) → "Add to Home Screen" or "Install App"
4. The app will appear on your home screen like a native app

### On Desktop

1. Open the app in Chrome, Edge, or Brave
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop

## Deployment

### Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/)
3. Click "New Project" and import your GitHub repository
4. Add your environment variables in Vercel's settings
5. Deploy!

Your app will be live at `https://your-project-name.vercel.app`

### Database (Supabase)

Supabase offers a generous free tier:
- Up to 500MB database
- Up to 1GB file storage
- Up to 2GB bandwidth

Perfect for starting out!

## Project Structure

```
berlin-cleanup-app/
├── app/                      # Next.js 14 App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── events/         # Event management
│   │   ├── notifications/  # Push notifications
│   │   ├── users/          # User profiles
│   │   └── leaderboard/    # Leaderboard data
│   ├── events/             # Event pages
│   ├── admin/              # Admin dashboard
│   ├── profile/            # User profile
│   ├── leaderboard/        # Leaderboard page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   ├── EventMap.tsx        # Leaflet map component
│   └── ui/                 # UI components
├── lib/                    # Utility functions
│   ├── prisma.ts          # Database client
│   ├── auth.ts            # Authentication utilities
│   ├── points.ts          # Gamification logic
│   ├── push-notifications.ts # Push notification helpers
│   └── register-sw.ts     # Service worker registration
├── prisma/
│   └── schema.prisma      # Database schema
├── public/
│   ├── sw.js             # Service worker
│   ├── manifest.json     # PWA manifest
│   └── icons/            # App icons
├── .env.example          # Environment variables template
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin)
- `GET /api/events/[id]` - Get single event
- `PATCH /api/events/[id]` - Update event (admin)
- `DELETE /api/events/[id]` - Delete event (admin)
- `POST /api/events/[id]/register` - Register for event
- `DELETE /api/events/[id]/register` - Unregister from event
- `POST /api/events/[id]/attendance` - Mark attendance (admin)

### Users & Leaderboard
- `GET /api/users/[id]` - Get user profile
- `GET /api/leaderboard` - Get leaderboard

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/send` - Send notification (admin)
- `POST /api/notifications/subscribe` - Subscribe to push notifications

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"
- Check your `DATABASE_URL` in `.env`
- Ensure your database is running
- For Supabase, check your project is active

### Push Notifications Not Working

**Issue**: Notifications not appearing
- Ensure VAPID keys are correctly set in `.env`
- Check browser permissions (must be granted)
- Push notifications require HTTPS in production
- Some browsers (Firefox, Safari) have limited support

### Map Not Loading

**Issue**: Map shows gray box
- Check internet connection (requires OpenStreetMap tiles)
- Verify coordinates are valid (Berlin: lat 52.52, lng 13.405)
- Check browser console for errors

### "Authentication required" errors

**Issue**: API calls failing with 401
- Ensure JWT_SECRET is set in `.env`
- Check token is stored in localStorage
- Try logging out and back in

## Future Enhancements

- [ ] Email notifications
- [ ] Photo upload functionality with cloud storage
- [ ] Social sharing features
- [ ] Event search and filtering
- [ ] Multi-language support (German/English)
- [ ] Weather integration for events
- [ ] Team/group creation
- [ ] Achievement badges
- [ ] Export participant lists to CSV
- [ ] Event check-in with QR codes

## Contributing

This is a community project! Contributions are welcome. Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - Feel free to use this project for your own volunteer initiatives!

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@berlin-cleanup.com (if available)

## Acknowledgments

- Berlin volunteer community
- OpenStreetMap contributors
- Supabase team for amazing database hosting
- Vercel for free hosting

---

Made with ❤️ for Berlin's volunteer community
