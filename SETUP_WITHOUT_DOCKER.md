# Setup Without Docker

Since Docker is not installed, you can use a cloud database instead.

## Option 1: Prisma Postgres (Recommended - Free Tier)

1. **Install Prisma CLI globally (if not already):**
   ```bash
   npm install -g prisma
   ```

2. **Create a free Prisma Postgres database:**
   ```bash
   cd apps/web
   npx prisma postgres create
   ```

3. **Copy the connection string** that's generated and update your `.env` file

## Option 2: Neon, Supabase, or Railway (Free Tiers Available)

### Neon (https://neon.tech)
- Sign up for free account
- Create a new project
- Copy the connection string
- Update `.env` with: `DATABASE_URL="your-connection-string"`

### Supabase (https://supabase.com)
- Sign up for free account
- Create a new project
- Go to Settings → Database
- Copy the "Connection String" (URI format)
- Update `.env` with: `DATABASE_URL="your-connection-string"`

### Railway (https://railway.app)
- Sign up with GitHub
- Create new project → Add PostgreSQL
- Copy the DATABASE_URL from variables
- Update `.env` with the connection string

## Option 3: Local PostgreSQL (Windows)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download and install PostgreSQL 16

2. **During installation:**
   - Set password for postgres user (remember this!)
   - Default port: 5432

3. **Update your `.env` file:**
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trusthub"
   ```

## Next Steps (After Setting Up Database)

1. **Create `.env` file in `apps/web/`:**
   ```bash
   cd apps/web
   cp .env.example .env
   ```

2. **Edit `.env` and update:**
   - `DATABASE_URL` - your database connection string
   - `NEXTAUTH_SECRET` - run: `openssl rand -base64 32` (or use any random string)
   - `NEXTAUTH_URL` - keep as `http://localhost:3000`

3. **Push database schema:**
   ```bash
   npm run db:push
   ```

4. **Seed demo data:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open http://localhost:3000** and sign in with demo account:
   - Email: `admin@trusthub.com`
   - Password: `admin123`

## File Storage (MinIO Alternative)

For file uploads, you can:
1. **Use local filesystem** - Update `apps/web/lib/storage/minio.ts` to use filesystem instead
2. **Use AWS S3** - Create free tier S3 bucket and update credentials
3. **Use Cloudflare R2** - Free tier available, S3-compatible
4. **Skip for now** - File upload features will be disabled but rest of app works

## Troubleshooting

### "Command not found: openssl"
Use this PowerShell command instead:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Database connection errors
- Ensure database is running
- Check connection string format
- Verify firewall/network settings
