# TrustHub API Documentation

## Overview

TrustHub uses tRPC for type-safe, end-to-end API calls. All endpoints are automatically typed and validated.

## Base URL

```
http://localhost:3000/api/trpc
```

## Authentication

All protected endpoints require authentication via NextAuth session.

```typescript
import { signIn } from 'next-auth/react'

await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
})
```

## tRPC Routers

### Reports Router

#### List Reports
```typescript
trpc.reports.list.useQuery({
  status: 'SUCCESS', // optional
  limit: 20,
  cursor: undefined,
})
```

#### Get Report by ID
```typescript
trpc.reports.getById.useQuery({ id: 'report-id' })
```

#### Create Report
```typescript
trpc.reports.create.useMutation({
  title: 'Q4 2024 Report',
  description: 'Quarterly compliance report',
  fileName: 'report.xlsx',
  fileUrl: '/uploads/report.xlsx',
  fileSize: 245000,
})
```

#### Update Report Status (Staff only)
```typescript
trpc.reports.updateStatus.useMutation({
  id: 'report-id',
  status: 'SUCCESS',
  errorMessage: undefined,
})
```

### Messages Router

#### List Threads
```typescript
trpc.messages.listThreads.useQuery({
  limit: 20,
  cursor: undefined,
})
```

#### Get Thread
```typescript
trpc.messages.getThread.useQuery({ id: 'thread-id' })
```

#### Create Thread
```typescript
trpc.messages.createThread.useMutation({
  subject: 'Question about reporting',
  content: 'I need help with...',
  attachments: [],
})
```

#### Reply to Thread
```typescript
trpc.messages.replyToThread.useMutation({
  threadId: 'thread-id',
  content: 'Here is the answer...',
  attachments: ['/uploads/file.pdf'],
})
```

### Cases Router

#### List Cases
```typescript
trpc.cases.list.useQuery({
  status: 'IN_PROGRESS', // optional
  priority: 'HIGH', // optional
  limit: 20,
})
```

#### Get Case by ID
```typescript
trpc.cases.getById.useQuery({ id: 'case-id' })
```

#### Create Case
```typescript
trpc.cases.create.useMutation({
  title: 'Data validation issue',
  description: 'Encountering validation errors...',
  priority: 'HIGH',
})
```

#### Update Case Status (Staff only)
```typescript
trpc.cases.updateStatus.useMutation({
  id: 'case-id',
  status: 'DONE',
})
```

#### Assign Case (Staff only)
```typescript
trpc.cases.assign.useMutation({
  id: 'case-id',
  assignToId: 'user-id',
})
```

### Announcements Router

#### List Announcements
```typescript
trpc.announcements.list.useQuery({
  limit: 20,
})
```

#### Create Announcement (Staff only)
```typescript
trpc.announcements.create.useMutation({
  title: 'New Features Released',
  content: 'We have released...',
  publish: true,
})
```

#### Mark as Read
```typescript
trpc.announcements.markAsRead.useMutation({
  id: 'announcement-id',
})
```

#### Get Unread Count
```typescript
trpc.announcements.getUnreadCount.useQuery()
```

### Library Router

#### List Files
```typescript
trpc.library.list.useQuery({
  search: 'compliance', // optional
  limit: 20,
})
```

#### Upload File (Staff only)
```typescript
trpc.library.upload.useMutation({
  title: 'Compliance Guidelines 2025',
  description: 'Updated guidelines',
  fileName: 'guidelines.pdf',
  fileUrl: '/uploads/guidelines.pdf',
  fileSize: 2400000,
  mimeType: 'application/pdf',
  version: '1.0',
})
```

### FAQ Router

#### List FAQs
```typescript
trpc.faq.list.useQuery({
  category: 'Reports', // optional
  search: 'upload', // optional
  limit: 20,
})
```

#### Create FAQ (Staff only)
```typescript
trpc.faq.create.useMutation({
  question: 'How do I upload a report?',
  answer: 'Navigate to Reports section...',
  category: 'Reports',
  isPublished: true,
})
```

#### Rate FAQ
```typescript
trpc.faq.rate.useMutation({
  faqId: 'faq-id',
  rating: 5, // 1-5
})
```

### Entities Router (Staff only)

#### List Entities
```typescript
trpc.entities.list.useQuery({ limit: 20 })
```

#### Create Entity (Admin only)
```typescript
trpc.entities.create.useMutation({
  name: 'ACME Corporation',
  code: 'ACME',
  description: 'Financial institution',
  isActive: true,
})
```

### Users Router (Staff only)

#### List Users
```typescript
trpc.users.list.useQuery({
  role: 'ENTITY_USER', // optional
  entityId: 'entity-id', // optional
  limit: 20,
})
```

#### Create User (Admin only)
```typescript
trpc.users.create.useMutation({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure-password',
  role: 'ENTITY_USER',
  entityId: 'entity-id',
})
```

## Error Handling

tRPC provides detailed error information:

```typescript
const { data, error, isLoading } = trpc.reports.getById.useQuery({ id: 'invalid-id' })

if (error) {
  console.log(error.message) // "Report not found"
  console.log(error.data?.code) // "NOT_FOUND"
}
```

## Common Error Codes

- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate resource
- `BAD_REQUEST`: Invalid input
- `INTERNAL_SERVER_ERROR`: Server error

## Role-Based Access

### Roles (Hierarchy)
1. `ADMIN` (highest)
2. `STAFF`
3. `ENTITY_ADMIN`
4. `ENTITY_USER` (lowest)

### Access Rules
- **Public procedures**: None (all require auth)
- **Protected procedures**: Any authenticated user
- **Staff procedures**: ADMIN or STAFF
- **Admin procedures**: ADMIN only

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Headers**: Rate limit info in response headers
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## CSRF Protection

All state-changing operations require CSRF token validation (handled automatically by NextAuth).
