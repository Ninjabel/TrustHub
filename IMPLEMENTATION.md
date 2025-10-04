# TrustHub - System Komunikacji z Podmiotami

System zarządzania komunikacją między UKNF a nadzorowanymi podmiotami finansowymi.

## ✅ Zaimplementowane Funkcjonalności

### 1. System Ról i Uprawnień

**Role globalne:**
- `UKNF_ADMIN` - pełne uprawnienia
- `UKNF_EMPLOYEE` - pracownik UKNF (ograniczone)
- `ENTITY_ADMIN` - administrator podmiotu
- `ENTITY_USER` - użytkownik podmiotu

**Uprawnienia per rola:**
```typescript
UKNF_ADMIN: wszystko
UKNF_EMPLOYEE: reports:review, cases:handle, messages:reply, bulletin:publish, library:manage, entities:view
ENTITY_ADMIN: reports:submit, cases:create, messages:send, bulletin:view, library:view, entity:manage_own, users:manage_own
ENTITY_USER: reports:submit, cases:create, messages:send, bulletin:view, library:view
```

**Kierowanie użytkowników:**
- UKNF_* → `/dashboard/uknf`
- ENTITY_* → `/dashboard/entity` (wymaga `currentOrgId`)

### 2. Baza Danych (Prisma Schema)

**Modele:**
- `User` - użytkownicy z globalną rolą
- `Organization` - podmioty nadzorowane
  - Pola: name, slug, uknfCode, LEI, NIP, KRS, adres, status, isCrossBorder
  - Status: ACTIVE, INACTIVE, SUSPENDED
- `OrganizationMembership` - przypisania użytkownik-organizacja z rolą
- `ReportSubmission` - sprawozdania z walidacją
- `Bulletin` + `BulletinRead` - komunikaty UKNF
- `MessageThread` + `Message` - wiadomości
- `Case` + `CaseTimeline` - sprawy/zgłoszenia
- `LibraryFile` - biblioteka dokumentów
- `FAQ` + `FAQRating` - pytania i odpowiedzi
- `AuditLog` - logi audytowe

### 3. Kontekst Sesji

**Tokenie sesji zawiera:**
```typescript
{
  user: {
    id: string
    role: UserRole
    memberships: Array<{orgId, role, orgName, orgSlug}>
    currentOrgId?: string
  }
}
```

**Endpoint przełączania organizacji:**
```
POST /api/session/switch-org
Body: { orgId: string }
```

### 4. Moduł Sprawozdań

**ReportSubmission model:**
- period: Q1, Q2, Q3, Q4, ANNUAL
- year: rok
- status: PROCESSING, SUCCESS, RULE_ERROR, SYSTEM_ERROR
- validationReport: tekst raportu walidacji
- errorDetails: szczegóły błędów

**Walidator (mock dla demo):**
- Nazwa pliku zawiera "Q1" → status SUCCESS + raport pozytywny
- Nazwa pliku zawiera "Q2" → status RULE_ERROR + przykładowe błędy

### 5. Moduł Komunikatów (Bulletins)

**Funkcje:**
- Tworzenie komunikatów z:
  - title, body, priority (LOW/NORMAL/HIGH)
  - recipientType: ALL, BY_TYPE, BY_ENTITY, BY_GROUP
  - recipientFilter (JSON)
  - requireReadReceipt: boolean
  - attachments: array
  
**UKNF może:**
- Tworzyć i publikować komunikaty
- Przeglądać statystyki odczytów
- Lista potwierdzeń (kto, kiedy, z jakiego podmiotu)

**Podmioty mogą:**
- Przeglądać komunikaty
- Filtrować nieprzeczytane
- Potwierdzać odczyt (automatyczny zapis: readAt, userId, orgId)

### 6. Moduł Wiadomości

**MessageThread:**
- subject, status (OPEN, AWAITING_RESPONSE, ANSWERED, CLOSED)
- organizationId (opcjonalne - kontekst podmiotu)
- createdById

**Message:**
- body, attachments[]
- threadId, senderId

**Filtrowanie:**
- Status wątku
- organizationId
- "Moje podmioty"

**Załączniki:**
- Biała lista: .pdf, .docx, .xlsx, .png, .jpg, .zip

### 7. Komponent DataTable

**Cechy:**
- Pole "Szukaj..." z live filtering
- Filtry (rozwijane) - custom per strona
- Sortowanie kolumn (▲/▼)
- Sticky header
- Paginacja z wyborem ilości wpisów (10/25/50/100)
- Przycisk "Eksportuj" → CSV/XLSX/JSON
- Przycisk "Wyczyść" - reset filtrów i sortowania

**Użycie:**
```tsx
<DataTable
  data={items}
  columns={[
    { key: 'date', label: 'Data', sortable: true, render: (item) => ... },
    { key: 'title', label: 'Tytuł', sortable: true },
  ]}
  searchPlaceholder="Szukaj..."
  onRowClick={(item) => navigate(`/detail/${item.id}`)}
  filters={<CustomFilters />}
  onExport={(format) => exportData(format)}
/>
```

## 🗂️ Struktura Projektu

```
apps/web/
├── prisma/
│   ├── schema.prisma          # Kompletny schema z wszystkimi modelami
│   └── seed.ts                # Seed z przykładowymi danymi
├── lib/
│   ├── auth/
│   │   ├── config.ts          # NextAuth z memberships
│   │   └── types.ts           # Typy sesji z currentOrgId
│   ├── rbac/
│   │   └── permissions.ts     # System uprawnień
│   └── trpc/routers/
│       ├── bulletins.ts       # Router komunikatów
│       ├── messages.ts        # Router wiadomości
│       ├── reports.ts         # Router sprawozdań
│       └── ...
├── components/
│   └── data-table.tsx         # Reużywalny komponent tabeli
└── app/
    ├── api/
    │   └── session/switch-org/ # Endpoint przełączania org
    └── dashboard/
        ├── bulletins/          # Strona komunikatów
        ├── messages/           # Strona wiadomości
        └── reports/            # Strona sprawozdań
```

## 🚀 Uruchomienie

1. **Instalacja:**
```bash
npm install
```

2. **Baza danych:**
```bash
cd apps/web
npx prisma db push
npm run db:seed
```

3. **Development:**
```bash
npm run dev
```

## 🔑 Konta testowe

```
UKNF Admin:
  Email: admin@uknf.test
  Password: Passw0rd!

UKNF Employee:
  Email: pracownik@uknf.test
  Password: Passw0rd!

Entity Admin (Bank Przykładowy):
  Email: admin@bank-przykladowy.test
  Password: Passw0rd!

Entity User (Bank Przykładowy):
  Email: user@bank-przykladowy.test
  Password: Passw0rd!
```

## 📝 Następne Kroki (TODO)

### Import CSV z podmiotami

1. Stwórz plik `apps/web/prisma/organizations.csv` z nagłówkami:
```
Typ podmiotu;Kod UKNF;Nazwa;LEI;NIP;KRS;Ulica;Nr budynku;Nr lokalu;Kod pocztowy;Miejscowość;Status;Kategoria;Sektor;Podsektor;Transgraniczny
```

2. Rozszerz seed.ts o parser CSV i import organizacji

### Dashboard routing

1. Middleware w `/app/middleware.ts` sprawdzający role i przekierowujący na właściwy dashboard
2. Layout dla `/dashboard/uknf` i `/dashboard/entity`

### Przełącznik podmiotu w UI

1. Dropdown w headerze "Reprezentuję: <nazwa>"
2. Lista z `session.user.memberships`
3. Wywołanie `/api/session/switch-org`
4. Refresh sesji

### Walidator sprawozdań

1. Upload endpoint obsługujący .csv/.xlsx
2. Parser pliku
3. Walidacja względem reguł biznesowych
4. Generowanie raportu walidacji
5. Timeline statusów w UI

### Filtry zaawansowane

1. DatePicker dla zakresów dat
2. Multi-select dla statusów
3. Autocomplete dla podmiotów
4. Zachowanie filtrów w URL params

### Export danych

1. Backend endpoints:
   - `/api/export/csv`
   - `/api/export/xlsx` (użyj biblioteki `xlsx`)
   - `/api/export/json`
2. Streaming dla dużych zbiorów
3. Zachowanie aktywnych filtrów przy eksporcie

## 🎨 Zgodność z UI

Implementacja wzorowana jest na screenach systemu UKNF:
- Czysty, profesjonalny design
- Tabele z sticky headers
- Filtrowanie i sortowanie
- Paginacja
- Breadcrumbs navigation
- Status badges (kolorowe tagi)
- Modal dialogs dla akcji
- Responsywność

## 🔒 Bezpieczeństwo

- Wszystkie endpointy sprawdzają uprawnienia
- CSRF protection (middleware)
- Rate limiting
- Audit log dla wszystkich akcji
- Walidacja input danych (Zod schemas)
- SQL injection protection (Prisma ORM)

## 📚 Technologie

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **API:** tRPC
- **Auth:** NextAuth.js
- **UI:** TailwindCSS + Headless UI
- **Forms:** React Hook Form + Zod
- **Date:** date-fns
- **Icons:** Lucide React

## 📞 Support

W razie pytań lub problemów, sprawdź dokumentację w `/docs` lub kontakt przez issue tracker.
