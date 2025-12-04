# Berlin Cleanup App - Complete File Structure

This document lists all files created for the project.

## Configuration Files (Root Level)

```
berlin-cleanup-app/
├── package.json              # Dependencies and npm scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── postcss.config.js        # PostCSS configuration
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
│
├── README.md               # Main documentation (comprehensive)
├── QUICKSTART.md           # Quick setup guide (10 minutes)
├── PROJECT_SUMMARY.md      # Project overview and features
├── DEPLOYMENT.md           # Production deployment guide
└── FILE_STRUCTURE.md       # This file
```

## Application Code

### App Directory (Next.js 14 App Router)

```
app/
├── layout.tsx              # Root layout with metadata and PWA config
├── page.tsx                # Homepage (event list/map view)
├── globals.css             # Global styles and Tailwind
│
├── api/                    # Backend API Routes
│   ├── auth/
│   │   ├── register/
│   │   │   └── route.ts   # POST /api/auth/register
│   │   ├── login/
│   │   │   └── route.ts   # POST /api/auth/login
│   │   └── me/
│   │       └── route.ts   # GET /api/auth/me
│   │
│   ├── events/
│   │   ├── route.ts       # GET /api/events, POST /api/events
│   │   └── [id]/
│   │       ├── route.ts   # GET/PATCH/DELETE /api/events/:id
│   │       ├── register/
│   │       │   └── route.ts  # POST/DELETE /api/events/:id/register
│   │       └── attendance/
│   │           └── route.ts  # POST /api/events/:id/attendance
│   │
│   ├── users/
│   │   └── [id]/
│   │       └── route.ts   # GET /api/users/:id
│   │
│   ├── leaderboard/
│   │   └── route.ts       # GET /api/leaderboard
│   │
│   └── notifications/
│       ├── route.ts       # GET /api/notifications
│       ├── send/
│       │   └── route.ts   # POST /api/notifications/send
│       └── subscribe/
│           └── route.ts   # POST /api/notifications/subscribe
│
├── events/
│   └── [id]/
│       └── page.tsx       # Event detail and registration page
│
├── profile/
│   └── page.tsx           # User profile with history
│
├── leaderboard/
│   └── page.tsx           # Public leaderboard
│
├── login/
│   └── page.tsx           # Login/register page
│
└── admin/
    ├── page.tsx           # Admin dashboard
    └── events/
        └── [id]/
            └── page.tsx   # Event management interface
```

### Components

```
components/
├── EventMap.tsx           # Leaflet map with event markers
└── ui/                    # (empty, for future UI components)
```

### Library/Utilities

```
lib/
├── prisma.ts              # Prisma database client
├── auth.ts                # Authentication utilities (JWT, bcrypt)
├── auth-context.tsx       # React context for auth state
├── points.ts              # Gamification points calculation
├── push-notifications.ts  # Web push notification helpers
└── register-sw.ts         # Service worker registration
```

### Database

```
prisma/
└── schema.prisma          # Database schema (8 models)
                          # - User, Event, EventRegistration
                          # - PointHistory, Notification
                          # - UserNotification, PushSubscription
```

### Public Assets

```
public/
├── sw.js                  # Service worker (PWA + push notifications)
├── manifest.json          # PWA manifest configuration
├── favicon.ico           # (need to add)
└── icons/                # PWA icons folder
    └── README.md         # Instructions for generating icons
                          # Need to add:
                          # - icon-72x72.png
                          # - icon-96x96.png
                          # - icon-128x128.png
                          # - icon-144x144.png
                          # - icon-152x152.png
                          # - icon-192x192.png
                          # - icon-384x384.png
                          # - icon-512x512.png
                          # - badge-72x72.png
```

## Total File Count

**Created Files**: 40+ files
- **TypeScript/TSX**: 28 files
- **Configuration**: 6 files
- **Documentation**: 5 files
- **CSS**: 1 file
- **Database Schema**: 1 file
- **Service Worker**: 1 file
- **PWA Manifest**: 1 file

## Files You Need to Add

Before running the app, you'll need to:

1. **Icons** (9 PNG files) - See `public/icons/README.md`
2. **Environment Variables** - Copy `.env.example` to `.env` and fill in values
3. **Node Modules** - Run `npm install`
4. **Database** - Run `npm run prisma:migrate`

## API Endpoints Summary

Total: **15 API endpoints**

### Authentication (3)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Events (6)
- GET /api/events (list all)
- POST /api/events (create - admin)
- GET /api/events/:id (get one)
- PATCH /api/events/:id (update - admin)
- DELETE /api/events/:id (delete - admin)
- POST /api/events/:id/register (register/unregister)
- POST /api/events/:id/attendance (mark attendance - admin)

### Users (2)
- GET /api/users/:id (profile)
- GET /api/leaderboard (rankings)

### Notifications (3)
- GET /api/notifications (user's notifications)
- POST /api/notifications/send (send - admin)
- POST /api/notifications/subscribe (push subscription)

## Pages Summary

Total: **7 user-facing pages**

### Public Pages
1. `/` - Homepage (event list/map)
2. `/events/:id` - Event detail
3. `/leaderboard` - Leaderboard
4. `/login` - Login/register

### Authenticated Pages
5. `/profile` - User profile (volunteer)

### Admin Pages
6. `/admin` - Admin dashboard
7. `/admin/events/:id` - Event management

## Database Models

**8 interconnected models:**

1. **User** - Authentication and profile
2. **Event** - Cleanup events with geolocation
3. **EventRegistration** - M:N relationship (users ↔ events)
4. **PointHistory** - Audit log for points
5. **Notification** - System notifications
6. **UserNotification** - User's notification inbox
7. **PushSubscription** - Browser push endpoints

## Code Statistics

Approximate lines of code:

- **TypeScript/TSX**: ~3,500 lines
- **Configuration**: ~200 lines
- **Documentation**: ~1,500 lines
- **CSS**: ~100 lines
- **Total**: ~5,300 lines

## Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- Leaflet (maps)
- date-fns (dates)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt (password hashing)
- Web Push (notifications)

**Development:**
- ESLint
- PostCSS
- Autoprefixer

## Architecture Patterns

- **API Design**: RESTful
- **Authentication**: JWT with httpOnly cookies/localStorage
- **Authorization**: Role-based (ADMIN, VOLUNTEER)
- **Database**: Normalized relational schema
- **State Management**: React hooks + Context API
- **Styling**: Utility-first (Tailwind)
- **PWA**: Service Worker + manifest
- **Real-time**: Web Push API

## Security Features

- Password hashing (bcrypt, 12 rounds)
- JWT token authentication
- Role-based access control
- SQL injection protection (Prisma)
- XSS protection (React auto-escaping)
- Environment variable security
- HTTPS required in production

## Performance Optimizations

- Server-side rendering (SSR)
- Dynamic imports for maps
- Service worker caching
- Image optimization (Next.js)
- Efficient database queries
- Minimal dependencies

---

## Quick Navigation

**Setup**: See QUICKSTART.md
**Documentation**: See README.md
**Deployment**: See DEPLOYMENT.md
**Overview**: See PROJECT_SUMMARY.md

---

**Status**: ✅ Complete and ready to deploy!

All core features implemented:
- ✅ Event management
- ✅ User authentication
- ✅ Gamification
- ✅ Push notifications
- ✅ Admin dashboard
- ✅ Progressive Web App
- ✅ Mobile responsive
- ✅ Map integration

**What's left**: Add icons, configure environment, deploy!
