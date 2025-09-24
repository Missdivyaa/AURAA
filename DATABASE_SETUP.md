# 🗄️ Database Setup Guide

## Prerequisites
- Node.js installed
- PostgreSQL database (local or cloud)

## Quick Setup

### 1. Choose Your Database Option

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Create database
createdb auraa_health_db
```

#### Option B: Cloud Database (Recommended)
- **Supabase**: https://supabase.com (Free tier)
- **Railway**: https://railway.app (Free tier)
- **Neon**: https://neon.tech (Free tier)

### 2. Create Environment File
Create `.env` file in project root:

```bash
# For local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/auraa_health_db?schema=public"

# For Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# For Railway
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/[database]"

# For Neon
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

### 3. Run Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Run database migration
npm run db:migrate

# Seed database with demo data
npm run db:seed
```

### 4. Verify Setup
```bash
# Open Prisma Studio to view data
npm run db:studio

# Start development server
npm run dev
```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with demo data

## Database Schema

The database includes the following models:
- **User** - Main user account
- **FamilyMember** - Family member profiles
- **HealthReport** - Uploaded health reports
- **Appointment** - Medical appointments
- **Medication** - Medication tracking
- **Reminder** - Health reminders
- **AIInsight** - AI-generated insights
- **SymptomAnalysis** - Symptom analysis results

## API Endpoints

- `GET/POST /api/family-members` - Family member management
- `GET/POST /api/reports` - Health report management
- `GET/POST /api/appointments` - Appointment management
- `GET/POST /api/medications` - Medication management
- `GET/POST /api/reminders` - Reminder management

## Next Steps

1. Set up your database connection
2. Run migrations and seed data
3. Update your components to use real API endpoints
4. Implement file upload functionality
5. Add AI integration for report analysis

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your DATABASE_URL format
2. **Migration Error**: Ensure database exists and is accessible
3. **Seed Error**: Run migrations first, then seed

### Getting Help

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction




