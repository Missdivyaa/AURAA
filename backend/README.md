# AURAA Backend API

A comprehensive backend API for the AURAA Health Platform, built with Node.js, Express, GraphQL, Prisma, and Clerk authentication.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication and authorization
- 📊 **GraphQL API** - Flexible and efficient data querying
- 🗄️ **PostgreSQL Database** - Robust data storage with Prisma ORM
- 👥 **User-Specific Data** - Each user has their own isolated data
- 🏥 **Health Management** - Family members, appointments, medications, reminders
- 🤖 **AI Insights** - Health trend analysis and recommendations
- 📋 **Symptom Analysis** - AI-powered symptom checking
- 📄 **Health Reports** - Document upload and analysis

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Security**: Helmet, CORS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/auraa_health_db"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   PORT=4000
   ```

3. **Set up the database**:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:4000` with GraphQL Playground available at `http://localhost:4000/graphql`.

## API Documentation

### GraphQL Endpoint

- **URL**: `http://localhost:4000/graphql`
- **Playground**: `http://localhost:4000/graphql` (development only)

### Authentication

All GraphQL operations require authentication via Clerk. Include the Clerk session token in your requests.

### Key Queries

- `me` - Get current user profile
- `familyMembers` - Get all family members
- `appointments` - Get all appointments
- `medications` - Get all medications
- `reminders` - Get all reminders
- `healthReports` - Get all health reports
- `aiInsights` - Get all AI insights

### Key Mutations

- `createFamilyMember` - Add a new family member
- `updateFamilyMember` - Update family member details
- `deleteFamilyMember` - Remove a family member
- `createAppointment` - Schedule an appointment
- `createMedication` - Add a medication
- `createReminder` - Set a health reminder
- `createHealthReport` - Upload a health report
- `createAIInsight` - Generate AI health insights

## Database Schema

The database includes the following main entities:

- **User** - User profiles linked to Clerk authentication
- **FamilyMember** - Family member profiles with health data
- **Appointment** - Medical appointments and schedules
- **Medication** - Medication tracking and management
- **Reminder** - Health reminders and notifications
- **HealthReport** - Uploaded health documents
- **AIInsight** - AI-generated health insights
- **SymptomAnalysis** - Symptom analysis results

## User-Specific Data

Each user's data is completely isolated:
- All queries automatically filter by the authenticated user
- Users can only access their own family members, appointments, etc.
- Data is secured at the database level through user relationships

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with demo data

### Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication logic
│   ├── graphql/        # GraphQL schema and resolvers
│   ├── database/       # Database connection
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Main server file
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seed file
└── package.json
```

## Security

- **Authentication**: Clerk handles user authentication
- **Authorization**: All operations require valid authentication
- **Data Isolation**: Users can only access their own data
- **Input Validation**: GraphQL schema validation
- **Security Headers**: Helmet middleware for security headers
- **CORS**: Configured for frontend origin

## Health Check

The API includes a health check endpoint at `/health` that returns:
- Service status
- Timestamp
- Service name

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the AURAA Health Platform.




