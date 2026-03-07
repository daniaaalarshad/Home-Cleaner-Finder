# HomeShine - Cleaner Booking Platform

## Overview

HomeShine is a full-stack web application that connects customers with professional home cleaners. Users can browse cleaner profiles, view their specialties and rates, and book cleaning services. Cleaners can create profiles, manage their availability, and handle booking requests through a dashboard.

The application uses Next.js 16 with App Router architecture, PostgreSQL database with Drizzle ORM, and iron-session for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Lighter blue color scheme (HSL: 199 89% 48%) for a trustworthy, clean aesthetic.

## System Architecture

### Framework
- **Next.js 16**: Full-stack React framework with App Router
- **TypeScript**: Type-safe development
- **TanStack React Query**: Server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Forms**: React Hook Form with Zod validation

### Directory Structure
```
app/
├── api/                    # API routes
│   ├── auth/               # Authentication endpoints
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   ├── logout/route.ts
│   │   └── user/route.ts
│   ├── cleaners/           # Cleaner endpoints
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── bookings/           # Booking endpoints
│       └── route.ts
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   ├── Navbar.tsx
│   ├── CleanerCard.tsx
│   └── BookingDialog.tsx
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts
│   ├── use-cleaners.ts
│   ├── use-bookings.ts
│   └── use-toast.ts
├── cleaners/               # Cleaner pages
│   ├── page.tsx            # /cleaners - list all cleaners
│   └── [id]/page.tsx       # /cleaners/:id - cleaner profile
├── login/page.tsx          # /login
├── signup/page.tsx         # /signup
├── dashboard/page.tsx      # /dashboard
├── layout.tsx              # Root layout
├── providers.tsx           # Client providers (Query, Toast)
├── page.tsx                # Homepage
└── globals.css             # Global styles
lib/
├── auth.ts                 # iron-session configuration
├── db.ts                   # Database connection
├── storage.ts              # Storage interface for DB operations
└── utils.ts                # Utility functions
shared/
└── schema.ts               # Drizzle ORM schema
public/
├── images/                 # Static images
└── hero-living-room.jpg
```

### Authentication
- **iron-session**: Secure, stateless session management using encrypted cookies
- **bcrypt**: Password hashing with 12 salt rounds
- Traditional email/password authentication (no third-party OAuth)

### Database Schema
Located in `shared/schema.ts`:
- **users**: User accounts with email/password authentication
- **cleaners**: Cleaner profiles linked to users (1:1 relationship)
- **bookings**: Booking records linking customers to cleaners

Relationships:
- Users can have one cleaner profile (optional)
- Users can make multiple bookings as customers
- Cleaners receive multiple bookings

### API Endpoints
- `GET /api/cleaners` - List cleaners with optional search filter
- `GET /api/cleaners/:id` - Get single cleaner profile
- `POST /api/cleaners` - Create cleaner profile (authenticated)
- `PATCH /api/cleaners/:id` - Update cleaner profile (authenticated)
- `GET /api/bookings` - List user's bookings (authenticated)
- `POST /api/bookings` - Create new booking (authenticated)
- `PATCH /api/bookings/:id/status` - Update booking status (authenticated)
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new account
- `POST /api/auth/logout` - Log out current user

### Key Patterns
- Custom hooks for data fetching (`use-auth`, `use-cleaners`, `use-bookings`)
- Storage interface pattern (`IStorage`) for database operations
- Zod schema validation on all API inputs
- React Query for server state with automatic cache invalidation

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for signing session cookies (32+ characters)

### Key Libraries
- **iron-session**: Encrypted cookie-based sessions
- **bcrypt**: Password hashing
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities

## Development

### Commands
- `npm run dev`: Start Next.js development server on port 5000
- `npm run build`: Build for production
- `npm run db:push`: Push schema changes to database
- `npx tsx lib/seed.ts`: Seed database with sample data (3 cleaners, 1 customer, 1 booking)

### Import Path Aliases
- `@/*`: Resolves to project root
- `@/app/*`: App directory (pages, components, hooks)
- `@/lib/*`: Library utilities
- `@/shared/*`: Shared code (schema)
