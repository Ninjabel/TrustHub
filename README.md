# 🛡️ TrustHub - Regulatory Compliance Platform (Demo)

A modern regulatory compliance and reporting platform built with Next.js 15.5, tRPC, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose

### Local Development

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Start infrastructure (PostgreSQL + MinIO)**
   ```bash
   docker compose up -d
   ```

3. **Setup database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Web: http://localhost:3000
   - MinIO Console: http://localhost:9001 (user: minioadmin, pass: minioadmin)
   - Prisma Studio: `npm run db:studio`

### Demo Accounts

After seeding, you can login with:

| Email | Password | Role |
|-------|----------|------|
| admin@trusthub.demo | password123 | ADMIN |
| staff@trusthub.demo | password123 | STAFF |
| entity.admin@company.demo | password123 | ENTITY_ADMIN |
| entity.user@company.demo | password123 | ENTITY_USER |

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.5 (App Router, RSC), TailwindCSS, shadcn/ui, Radix UI
- **Backend**: Next.js API routes with tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (JWT sessions)
- **Validation**: Zod schemas
- **File Storage**: MinIO (S3-compatible)
- **Infrastructure**: Docker Compose

## 📦 Features

### Core Modules
- **Reports**: Upload XLSX files, validation, status tracking, export
- **Messages**: Threaded conversations with attachments
- **Cases**: Workflow management with timeline
- **Announcements**: Publish and read tracking
- **Library**: Document management with versioning
- **FAQ**: Q&A with ratings and search
- **Entities**: CRUD for entity records
- **Admin**: User and role management (RBAC)

### Security
- CSRF token protection
- Rate limiting
- Role-based access control (RBAC)
- JWT session authentication

## 📁 Project Structure

```
trusthub/
├── apps/
│   └── web/                 # Next.js application
│       ├── app/             # App Router pages
│       │   ├── (auth)/      # Auth pages
│       │   ├── dashboard/   # Dashboard
│       │   ├── reports/     # Reports module
│       │   ├── messages/    # Messages module
│       │   ├── cases/       # Cases module
│       │   ├── announcements/
│       │   ├── library/     # Document library
│       │   ├── faq/         # FAQ module
│       │   ├── entities/    # Entity management
│       │   └── admin/       # Admin panel
│       ├── lib/             # Utilities
│       │   ├── auth/        # NextAuth config
│       │   ├── rbac/        # Role-based access
│       │   ├── csrf/        # CSRF protection
│       │   ├── rate-limit/  # Rate limiting
│       │   └── trpc/        # tRPC setup
│       ├── prisma/          # Database schema
│       └── public/          # Static assets
├── infrastructure/          # Docker configs
└── docs/                    # Documentation
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database commands
npm run db:push      # Push schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio

# Docker commands
docker compose up -d        # Start services
docker compose down         # Stop services
docker compose logs -f web  # View logs
```

## 🗄️ Database Schema

Key models:
- **User**: Authentication and profile
- **Entity**: Organizations/companies
- **Report**: Regulatory reports with status workflow
- **MessageThread**: Conversation threads
- **Message**: Individual messages
- **Case**: Support/compliance cases
- **Announcement**: System announcements
- **LibraryFile**: Document management
- **FAQ**: Frequently asked questions
- **AuditLog**: Activity tracking

## 🔐 Security Features

- **CSRF Protection**: Token-based validation for state-changing operations
- **Rate Limiting**: Prevents abuse of API endpoints
- **RBAC**: Role-based access control with 4 roles
- **JWT Sessions**: Secure stateless authentication
- **Input Validation**: Zod schemas for all inputs

## 📝 Environment Variables

Create `.env` file in `apps/web/`:

```env
DATABASE_URL="postgresql://trusthub:trusthub123@localhost:5432/trusthub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="trusthub-uploads"
```

## 🚢 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Update environment variables for production

3. Deploy with Docker Compose or your preferred platform

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

This is a demo project for showcasing regulatory compliance platform capabilities.

## 📄 License

MIT License - See LICENSE file for details
