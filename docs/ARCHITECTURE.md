# TrustHub Architecture

## Overview

TrustHub is a modern regulatory compliance and reporting platform built with Next.js 15.5, tRPC, Prisma, and PostgreSQL.

## Tech Stack

### Frontend
- **Next.js 15.5**: React framework with App Router and Server Components
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Headless UI primitives

### Backend
- **Next.js API Routes**: Serverless functions
- **tRPC**: End-to-end typesafe APIs
- **Zod**: Schema validation

### Database
- **PostgreSQL**: Relational database
- **Prisma ORM**: Type-safe database client

### Authentication
- **NextAuth.js**: Authentication framework
- **JWT**: JSON Web Tokens for session management

### File Storage
- **MinIO**: S3-compatible object storage

### Security
- **CSRF Protection**: Token-based validation
- **Rate Limiting**: Request throttling
- **RBAC**: Role-based access control

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├──── Next.js App (RSC)
       │     ├── Pages (Server Components)
       │     ├── Components (Client Components)
       │     └── tRPC Client
       │
       ├──── API Routes
       │     ├── /api/trpc/* (tRPC endpoints)
       │     └── /api/auth/* (NextAuth)
       │
       ├──── tRPC Server
       │     ├── Routers
       │     ├── Middleware (Auth, RBAC)
       │     └── Procedures
       │
       ├──── Prisma ORM
       │     └── PostgreSQL Database
       │
       └──── MinIO (File Storage)
```

## Data Flow

1. **Client Request**: User interacts with UI
2. **tRPC Call**: Type-safe RPC call to server
3. **Middleware**: Authentication & authorization checks
4. **Validation**: Zod schema validation
5. **Business Logic**: Process request
6. **Database**: Prisma query execution
7. **Response**: Type-safe response to client

## Security Layers

1. **Authentication**: JWT-based session via NextAuth
2. **Authorization**: Role-based access control (4 roles)
3. **CSRF Protection**: Token validation for mutations
4. **Rate Limiting**: Request throttling
5. **Input Validation**: Zod schemas
6. **Audit Logging**: Track all critical actions

## Database Schema

### Core Models
- **User**: Authentication and profiles
- **Entity**: Organizations/companies
- **Report**: Regulatory reports with workflow
- **MessageThread & Message**: Communication
- **Case**: Support/compliance cases with timeline
- **Announcement**: System announcements
- **LibraryFile**: Document management
- **FAQ**: Q&A with ratings
- **AuditLog**: Activity tracking

## Module Structure

### Reports Module
- Upload XLSX files
- Validation with Zod
- Status workflow: DRAFT → PROCESSING → SUCCESS/ERROR
- Export capabilities (CSV/JSON)

### Messages Module
- Threaded conversations
- Attachments support
- Real-time updates

### Cases Module
- Status workflow: NEW → IN_PROGRESS → DONE/CANCELLED
- Assignment system
- Timeline tracking

### Announcements Module
- Publish/unpublish
- Read tracking
- User notifications

### Library Module
- Document upload/download
- Version management
- Search functionality

### FAQ Module
- Q&A management
- Rating system
- Category organization
- Search

### Entities Module
- CRUD operations
- User association
- Activity tracking

### Admin Module
- User management
- Role assignment
- Audit log viewing

## Deployment

### Development
```bash
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Production
- Docker containers for PostgreSQL and MinIO
- Next.js app deployed to Vercel/your platform
- Environment variables configured
- Database migrations applied

## Performance Considerations

- **Server Components**: Reduce client-side JavaScript
- **tRPC Batching**: Batch multiple requests
- **Database Indexing**: Optimize queries
- **Caching**: React Query cache management
- **Code Splitting**: Automatic with Next.js

## Scalability

- **Horizontal Scaling**: Stateless Next.js instances
- **Database**: PostgreSQL read replicas
- **File Storage**: MinIO distributed mode
- **CDN**: Static assets via CDN
- **Rate Limiting**: Distributed rate limiting with Redis
