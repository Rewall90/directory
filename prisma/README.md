# Database Layer - Golf Directory

This directory contains the database schema, migrations, and seed data for the Golf Directory application.

## Schema Overview

The database schema supports a comprehensive golf course directory with the following main entities:

- **Course**: Main course information (location, contact, specs)
- **Facility**: Practice facilities, amenities, equipment rentals
- **Pricing**: Green fees and rental pricing
- **MembershipPricing**: Membership categories and pricing
- **Rating**: Ratings from various sources (Google, Facebook, etc.)
- **CourseRating**: Official course/slope ratings by tee
- **PhoneNumber**: Multiple phone numbers per course
- **Source**: Data source tracking
- **AdditionalFeature**: Custom features
- **CourseRecord**: Course records (men/women)
- **NearbyCourse**: Course proximity relationships
- **Sponsor**: Course sponsors

## Available Commands

### Generate Prisma Client

```bash
pnpm db:generate
```

### Push Schema to Database (without migrations)

```bash
pnpm db:push
```

### Create and Run Migrations

```bash
pnpm db:migrate
```

### Deploy Migrations (production)

```bash
pnpm db:migrate:deploy
```

### Seed Database

```bash
pnpm db:seed
```

### Open Prisma Studio (database GUI)

```bash
pnpm db:studio
```

### Reset Database (⚠️ destructive)

```bash
pnpm db:reset
```

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

For local development:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/golf_directory"
```

For Vercel Postgres:

```env
DATABASE_URL="your-vercel-postgres-connection-string"
```

### 2. Generate Prisma Client

```bash
pnpm db:generate
```

### 3. Run Migrations

For development:

```bash
pnpm db:migrate
```

For production:

```bash
pnpm db:migrate:deploy
```

### 4. Seed the Database (optional)

```bash
pnpm db:seed
```

This will create 2 sample golf courses with facilities, pricing, and ratings.

## Using Prisma in Your Code

Import the Prisma client from the helper:

```typescript
import { prisma } from "@/lib/prisma";

// Example: Fetch all courses
const courses = await prisma.course.findMany({
  include: {
    facilities: true,
    pricing: true,
    ratings: true,
  },
});

// Example: Create a new course
const newCourse = await prisma.course.create({
  data: {
    slug: "new-golf-club",
    name: "New Golf Club",
    // ... other fields
  },
});
```

## API Example

A sample API route is available at `/api/courses` to demonstrate Prisma usage.

Test it:

```bash
curl http://localhost:3000/api/courses
```

## Notes

- The schema uses PostgreSQL-specific features
- PostGIS extension support is included but commented out (enable when available)
- All timestamps use `@default(now())` and `@updatedAt` for automatic tracking
- Cascade deletes are configured for related data
- Indexes are added for common query patterns
