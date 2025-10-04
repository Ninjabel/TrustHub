# 🧪 Test Guide - TrustHub

## Quick Start

1. **Uruchom serwer deweloperski:**
```bash
npm run dev
```

2. **Otwórz przeglądarkę:**
```
http://localhost:3000
```

## 🔐 Konta Testowe

### UKNF (Urząd Nadzoru)

**Administrator UKNF** - pełne uprawnienia
- Email: `admin@uknf.test`
- Password: `Passw0rd!`
- Dashboard: `/dashboard` (widok UKNF)
- Może: wszystko

**Pracownik UKNF** - ograniczone uprawnienia
- Email: `pracownik@uknf.test`  
- Password: `Passw0rd!`
- Może: przeglądać sprawozdania, obsługiwać sprawy, publikować komunikaty
- Nie może: zarządzać użytkownikami, usuwać podmiotów

### Podmioty (Entity)

**Administrator podmiotu - Bank Przykładowy S.A.**
- Email: `admin@bank-przykladowy.test`
- Password: `Passw0rd!`
- Dashboard: `/dashboard` (widok podmiotu)
- Może: składać sprawozdania, zarządzać użytkownikami swojego podmiotu

**Użytkownik podmiotu - Bank Przykładowy S.A.**
- Email: `user@bank-przykladowy.test`
- Password: `Passw0rd!`
- Może: składać sprawozdania, tworzyć sprawy, wysyłać wiadomości

## ✅ Co przetestować

### 1. Logowanie i sesja
- [ ] Zaloguj się jako `admin@uknf.test`
- [ ] Sprawdź czy widzisz "Panel UKNF" w lewym menu
- [ ] Wyloguj się
- [ ] Zaloguj się jako `admin@bank-przykladowy.test`
- [ ] Sprawdź czy widzisz "Panel podmiotu" w lewym menu
- [ ] Sprawdź czy widzisz przełącznik "Reprezentuję: Bank Przykładowy S.A." w headerze

### 2. Nawigacja (różna dla UKNF vs Podmioty)

**Menu UKNF zawiera:**
- Pulpit
- Sprawozdania
- Wiadomości
- Sprawy
- Komunikaty
- Biblioteka
- FAQ
- Podmioty ← tylko UKNF!

**Menu Podmiotu zawiera:**
- Pulpit
- Sprawozdania
- Wiadomości
- Sprawy
- Komunikaty
- Biblioteka
- FAQ
- (brak "Podmioty")

### 3. Moduł Komunikatów (Bulletins)

**Jako UKNF (`admin@uknf.test`):**
- [ ] Przejdź do `/dashboard/bulletins`
- [ ] Sprawdź czy widzisz 2 przykładowe komunikaty z seed
- [ ] Kliknij filtr "Tylko nieprzeczytane"
- [ ] Kliknij w komunikat - powinien oznaczyć się jako przeczytany

**Jako Podmiot (`admin@bank-przykladowy.test`):**
- [ ] Przejdź do `/dashboard/bulletins`
- [ ] Zobacz te same komunikaty
- [ ] Sprawdź filtr "Tylko nieprzeczytane"
- [ ] Kliknij komunikat - potwierdź odczyt

### 4. Komponenty UI

**DataTable (w `/dashboard/bulletins`):**
- [ ] Użyj pola wyszukiwania - wpisz "zmiany"
- [ ] Kliknij nagłówek kolumny aby sortować
- [ ] Zmień ilość wyświetlanych wpisów (10/25/50)
- [ ] Testuj paginację (strzałki)
- [ ] Kliknij "Eksportuj" i zobacz opcje CSV/XLSX/JSON

**OrganizationSwitcher (tylko dla podmiotów):**
- [ ] Zaloguj się jako `admin@bank-przykladowy.test`
- [ ] Kliknij na "Reprezentuję: Bank Przykładowy S.A."
- [ ] Zobacz listę organizacji (powinna być 1)
- [ ] (Jeśli użytkownik ma więcej organizacji, można przełączać)

### 5. Uprawnienia i dostęp

**UKNF_ADMIN:**
- [ ] Dostęp do `/dashboard/entities` ✓
- [ ] Może widzieć wszystkie podmioty

**UKNF_EMPLOYEE:**
- [ ] Dostęp do `/dashboard/bulletins` ✓
- [ ] Może publikować komunikaty
- [ ] NIE może usuwać podmiotów

**ENTITY_ADMIN:**
- [ ] NIE ma dostępu do `/dashboard/entities` ✗
- [ ] Może zarządzać swoim podmiotem
- [ ] Widzi przełącznik organizacji

**ENTITY_USER:**
- [ ] Podstawowe uprawnienia
- [ ] Może przeglądać, nie może zarządzać

## 🎨 UI/UX do sprawdzenia

- [ ] Header pokazuje imię użytkownika i rolę
- [ ] Sidebar ma ikony i aktywny element jest podświetlony (niebieski)
- [ ] DataTable ma:
  - Sticky header przy scrollowaniu
  - Hover effect na wierszach
  - Poprawną paginację
  - Działające sortowanie
- [ ] Przyciski mają hover states
- [ ] Formularze pokazują błędy walidacji
- [ ] Wszystko jest responsywne (zmień rozmiar okna)

## 🐛 Znane ograniczenia (TODO)

1. **Walidator sprawozdań** - obecnie mock:
   - Q1 w nazwie → sukces
   - Q2 w nazwie → błędy
   - Trzeba zaimplementować prawdziwą walidację CSV/XLSX

2. **Export danych** - obecnie console.log:
   - Potrzebne backendy endpointy dla CSV/XLSX/JSON
   - Streaming dla dużych zbiorów

3. **CSV import organizacji:**
   - Seed akceptuje CSV ale na razie używa sample data
   - Utwórz `apps/web/prisma/organizations.csv` z właściwymi danymi

4. **Middleware routingu:**
   - Brak automatycznego przekierowania UKNF → `/dashboard/uknf`
   - Brak automatycznego przekierowania ENTITY → `/dashboard/entity`

5. **Refresh po zmianie organizacji:**
   - Obecnie `window.location.reload()` - lepiej użyć router.refresh()

## 📊 Dane w bazie (po seeding)

```sql
-- Użytkownicy: 4
-- - admin@uknf.test (UKNF_ADMIN)
-- - pracownik@uknf.test (UKNF_EMPLOYEE)  
-- - admin@bank-przykladowy.test (ENTITY_ADMIN)
-- - user@bank-przykladowy.test (ENTITY_USER)

-- Organizacje: 2
-- - Bank Przykładowy S.A. (slug: bank-przykladowy)
-- - Ubezpieczenia Przykładowe S.A. (slug: ubezpieczenia-przykladowe)

-- Komunikaty: 2
-- - "Ważne zmiany w regulacjach" (HIGH priority)
-- - "Aktualizacja szablonów sprawozdań" (NORMAL priority)

-- Biblioteka: 2
-- - "Instrukcja wypełniania sprawozdań Q1 2025"
-- - "Szablon sprawozdania finansowego"

-- FAQ: 3 pytania
```

## 🔍 Debug Tips

1. **Sprawdź console przeglądarki** (F12):
   - Network tab - czy API calls działają
   - Console - czy są błędy JS

2. **Sprawdź terminal** gdzie działa `npm run dev`:
   - Czy są błędy serwera
   - Logi z tRPC

3. **Sprawdź bazę danych:**
```bash
cd apps/web
npx prisma studio
```

4. **Zresetuj bazę jeśli coś nie działa:**
```bash
cd apps/web
npx prisma db push --force-reset
npm run db:seed
```

## 🎯 Następne kroki po testach

1. Zaimplementuj prawdziwy walidator sprawozdań
2. Dodaj middleware dla routing (UKNF vs Entity dashboards)
3. Stwórz formularze CRUD dla wszystkich modułów
4. Dodaj upload plików (sprawozdania, załączniki)
5. Zaimplementuj export CSV/XLSX/JSON
6. Dodaj notyfikacje real-time (pusher/socket.io)
7. Stwórz stronę szczegółów komunikatu
8. Dodaj historię zmian (audit log viewer)
9. Zaimplementuj filtry zaawansowane z date pickers
10. Dodaj testy jednostkowe i E2E

## 📞 Help

Jeśli coś nie działa:
1. Sprawdź czy baza jest zaktualizowana: `npx prisma db push`
2. Sprawdź czy seed się wykonał: `npm run db:seed`
3. Sprawdź czy serwer działa: `npm run dev`
4. Sprawdź logi w terminalu i konsoli przeglądarki
5. Zobacz `IMPLEMENTATION.md` dla szczegółów technicznych

---

**Happy Testing! 🚀**
