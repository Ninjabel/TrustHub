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

### Uruchomienie lokalnie bez Dockera (Windows PowerShell)

Jeśli chcesz uruchomić cały projekt lokalnie bez użycia Dockera, wykonaj poniższe kroki. Instrukcja zakłada Windows i PowerShell. W skrócie: zainstaluj PostgreSQL i MinIO lokalnie, ustaw zmienne środowiskowe w `apps/web/.env`, wypchaj schemat Prisma i uruchom serwer deweloperski.

1. Zainstaluj wymagane oprogramowanie (jeśli jeszcze nie masz):

   - Node.js 18+ i npm
   - PostgreSQL (uruchomiony lokalnie, nasłuch na porcie 5432)
   - MinIO (lokalny serwer S3) — można pobrać binarkę dla Windows i uruchomić jako proces

2. Sklonuj repozytorium i zainstaluj zależności (z katalogu głównego projektu):

```powershell
npm install
```

3. Przygotuj bazę danych Postgres:

- Utwórz użytkownika i bazę (przykład):

```powershell
# uruchom w psql lub skorzystaj z pgAdmin/GUI
# przykład SQL:
# CREATE USER trusthub WITH PASSWORD 'trusthub123';
# CREATE DATABASE trusthub OWNER trusthub;
# ALTER ROLE trusthub SET search_path = public;
```

4. Zainstaluj/uruchom MinIO lokalnie (przykład dla Windows):

- Pobierz `minio.exe` i rozpakuj np. do `C:\minio`.

- W PowerShell w katalogu z `minio.exe` ustaw zmienne środowiskowe i uruchom serwer:

```powershell
#$env:MINIO_ROOT_USER = 'minioadmin'
#$env:MINIO_ROOT_PASSWORD = 'minioadmin'
# (jeśli Twoja wersja MinIO używa MINIO_ROOT_* zamiast MINIO_ACCESS_KEY/SECRET_KEY)
# Alternatywnie ustaw zmienne, których projekt oczekuje:
$env:MINIO_ACCESS_KEY = 'minioadmin'
$env:MINIO_SECRET_KEY = 'minioadmin'
.\minio.exe server .\data --address ":9000" --console-address ":9001"
```

Uwaga: Uruchamianie MinIO jako usługi lub inna konfiguracja jest dozwolona — ważne, żeby MinIO był dostępny na porcie 9000 (API) i 9001 (konsola) lub aby odpowiednio dopasować zmienne środowiskowe.

5. Utwórz plik `.env` w `apps/web/` (przykład):

```env
DATABASE_URL="postgresql://trusthub:trusthub123@localhost:5432/trusthub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-random-secret"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="trusthub-uploads"
```

6. Wypchnij schemat Prisma i zainicjuj dane (z katalogu głównego projektu):

```powershell
npm run db:push
npm run db:seed
```

7. Uruchom aplikację w trybie deweloperskim:

```powershell
npm run dev
```

Po uruchomieniu aplikacji otwórz `http://localhost:3000` w przeglądarce. Prisma Studio dostępna jest przez `npm run db:studio`.

Wskazówki i debugowanie:

- Jeśli połączenie z Postgres się nie łączy, sprawdź `DATABASE_URL` i czy serwer Postgres nasłuchuje na porcie 5432.
- Jeśli aplikacja zgłasza błędy związane z brakującym klientem Prisma, uruchom `npx prisma generate` w `apps/web/`.
- Jeżeli nie chcesz uruchamiać MinIO, możesz skonfigurować projekt żeby korzystał z innego S3‑kompatybilnego endpointu lub dostosować kod (łatwiejsze i szybsze jest jednak lokalne MinIO).

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
- **Regulatory Reporting**: 📊 Complete reporting module with XLSX upload, validation, corrections, status tracking, calendar, and export (XLSX/CSV/JSON)
- **Reports** (Legacy): Upload XLSX files, validation, status tracking, export
- **Messages**: Threaded conversations with attachments
- **Cases**: Workflow management with timeline
- **Bulletins/Announcements**: Publish and read tracking
- **Library**: Document management with versioning
- **FAQ**: Q&A with ratings and search
- **Entities**: CRUD for entity records
- **Admin**: User and role management (RBAC)
- **Access Requests**: User access request workflow

### Regulatory Reporting Module (NEW! 📊)
- Upload regulatory reports (XLSX files)
- Automated validation with detailed reports
- Status tracking (8 statuses: DRAFT → SUBMITTED → IN_PROGRESS → SUCCESS/ERROR)
- Report corrections with version history
- Reporting calendar with compliance tracking
- Communication threads per report
- Full audit trail
- Export to XLSX/CSV/JSON
- Role-based access (ENTITY_USER, ENTITY_ADMIN, UKNF_EMPLOYEE, UKNF_ADMIN)
- Documentation: [REGULATORY_REPORTING_MODULE.md](./REGULATORY_REPORTING_MODULE.md)
- Quickstart: [QUICKSTART_REGULATORY_REPORTING.md](./QUICKSTART_REGULATORY_REPORTING.md)

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
