# HomeShine - Cleaner Booking Platform

## Overview

HomeShine is a full-stack web application that connects customers with professional home cleaners. Users can browse cleaner profiles, view their specialties and rates, and book cleaning services. Cleaners can create profiles, manage their availability, and handle booking requests through a dashboard.

The application follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

Key frontend patterns:
- Custom hooks for data fetching (`use-auth`, `use-cleaners`, `use-bookings`)
- Shared API route definitions between frontend and backend via `@shared/routes`
- Component-based architecture with reusable UI primitives

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Dual auth system - Passport.js with local strategy (email/password) and Replit Auth integration via OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Hashing**: bcrypt with 12 salt rounds

Key backend patterns:
- Storage interface pattern (`IStorage`) for database operations
- Centralized route definitions with Zod schema validation
- Session-based authentication with secure cookie configuration

### Database Schema
Located in `shared/schema.ts`:
- **users**: User accounts with email/password authentication
- **sessions**: Session storage for authentication
- **cleaners**: Cleaner profiles linked to users (1:1 relationship)
- **bookings**: Booking records linking customers to cleaners

Relationships:
- Users can have one cleaner profile (optional)
- Users can make multiple bookings as customers
- Cleaners receive multiple bookings

### API Structure
Routes defined in `shared/routes.ts` with Zod schemas:
- `GET /api/cleaners` - List cleaners with optional city/search filters
- `GET /api/cleaners/:id` - Get single cleaner profile
- `POST /api/cleaners` - Create cleaner profile (authenticated)
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new account

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Passport.js**: Authentication middleware with local strategy
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **bcrypt**: Password hashing

### Replit Integration (Optional)
- **Replit Auth**: OpenID Connect integration for Replit-hosted deployments
- **@replit/vite-plugin-***: Development tools for Replit environment

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for signing session cookies
- `ISSUER_URL` (optional): OpenID Connect issuer for Replit Auth

### UI/Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities