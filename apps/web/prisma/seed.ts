import { 
  PrismaClient, 
  UserRole, 
  OrganizationRole, 
  OrganizationStatus,
  ReportStatus,
  ReportPeriod,
  BulletinPriority,
  BulletinRecipientType,
  CaseStatus,
  CasePriority,
  ThreadStatus,
  FinancialReportType
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Rozpoczynam seedowanie bazy danych...\n')
  
  // Clear existing data
  console.log('🗑️  Czyszczenie istniejących danych...')
  await prisma.bulletinRead.deleteMany()
  await prisma.bulletin.deleteMany()
  await prisma.message.deleteMany()
  await prisma.messageThread.deleteMany()
  await prisma.case.deleteMany()
  await prisma.fAQRating.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.libraryFile.deleteMany()
  await prisma.reportSubmission.deleteMany()
  await prisma.report.deleteMany()
  await prisma.profitLossLine.deleteMany()
  await prisma.financialReport.deleteMany()
  await prisma.rIPFormData.deleteMany()
  await prisma.organizationMembership.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()
  
  const password = await bcrypt.hash('Passw0rd!', 10)
  
  // ============================================
  // UKNF USERS
  // ============================================
  console.log('👥 Tworzenie użytkowników UKNF...')
  
  const adminUKNF = await prisma.user.create({
    data: { 
      email: 'admin@uknf.test', 
      name: 'Jan Kowalski', 
      password, 
      role: UserRole.UKNF_ADMIN 
    }
  })
  
  const employee1UKNF = await prisma.user.create({
    data: { 
      email: 'pracownik@uknf.test', 
      name: 'Anna Nowak', 
      password, 
      role: UserRole.UKNF_EMPLOYEE 
    }
  })
  
  const employee2UKNF = await prisma.user.create({
    data: { 
      email: 'supervisor@uknf.test', 
      name: 'Piotr Wiśniewski', 
      password, 
      role: UserRole.UKNF_EMPLOYEE 
    }
  })
  
  const employee3UKNF = await prisma.user.create({
    data: { 
      email: 'analyst@uknf.test', 
      name: 'Katarzyna Lewandowska', 
      password, 
      role: UserRole.UKNF_EMPLOYEE 
    }
  })
  
  // ============================================
  // ORGANIZATIONS
  // ============================================
  console.log('🏢 Tworzenie podmiotów nadzorowanych...')
  
  const organizations = await Promise.all([
    prisma.organization.create({
      data: {
        name: 'Bank Przykładowy S.A.',
        slug: 'bank-przykladowy',
        uknfCode: 'BK001',
        lei: 'PL259300EXAMPLE001',
        nip: '1234567890',
        krs: '0000123456',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki uniwersalne',
        street: 'Aleje Jerozolimskie',
        building: '125',
        postalCode: '00-001',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'PKO Bank Polski S.A.',
        slug: 'pko-bp',
        uknfCode: 'BK002',
        lei: 'PL259300PKOBP00002',
        nip: '5252012345',
        krs: '0000002222',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki uniwersalne',
        street: 'Puławska',
        building: '15',
        postalCode: '02-515',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'mBank S.A.',
        slug: 'mbank',
        uknfCode: 'BK003',
        lei: 'PL259300MBANK00003',
        nip: '5260001234',
        krs: '0000003333',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki detaliczne',
        street: 'Senatorska',
        building: '18',
        postalCode: '00-082',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'Santander Bank Polska S.A.',
        slug: 'santander',
        uknfCode: 'BK004',
        lei: 'PL259300SANT000004',
        nip: '8961234567',
        krs: '0000004444',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki uniwersalne',
        street: 'Żwirki i Wigury',
        building: '18A',
        postalCode: '02-092',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'PZU S.A.',
        slug: 'pzu',
        uknfCode: 'ZU001',
        lei: 'PL259300PZU0000001',
        nip: '5260123456',
        krs: '0000005555',
        type: 'Zakład ubezpieczeń',
        category: 'Ubezpieczenia majątkowe i osobowe',
        sector: 'Ubezpieczenia',
        subsector: 'Ubezpieczenia życiowe i majątkowe',
        street: 'Aleje Jerozolimskie',
        building: '44',
        postalCode: '00-024',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'Nationale-Nederlanden TU S.A.',
        slug: 'nn-tu',
        uknfCode: 'ZU002',
        lei: 'PL259300NN00000002',
        nip: '5260234567',
        krs: '0000006666',
        type: 'Zakład ubezpieczeń',
        category: 'Ubezpieczenia życiowe',
        sector: 'Ubezpieczenia',
        subsector: 'Ubezpieczenia życiowe',
        street: 'Włodarzewska',
        building: '20',
        postalCode: '02-384',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'WARTA S.A.',
        slug: 'warta',
        uknfCode: 'ZU003',
        lei: 'PL259300WARTA00003',
        nip: '5260345678',
        krs: '0000007777',
        type: 'Zakład ubezpieczeń',
        category: 'Ubezpieczenia majątkowe',
        sector: 'Ubezpieczenia',
        subsector: 'Ubezpieczenia komunikacyjne',
        street: 'Chmielna',
        building: '85/87',
        postalCode: '00-805',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'ING Bank Śląski S.A.',
        slug: 'ing-bank-slaski',
        uknfCode: 'BK005',
        lei: 'PL259300ING0000005',
        nip: '6340001234',
        krs: '0000008888',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki uniwersalne',
        street: 'Sokolska',
        building: '34',
        postalCode: '40-086',
        city: 'Katowice',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'Millennium Bank S.A.',
        slug: 'millennium',
        uknfCode: 'BK006',
        lei: 'PL259300MILL000006',
        nip: '5260456789',
        krs: '0000009999',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki detaliczne',
        street: 'Stanisława Żaryna',
        building: '2A',
        postalCode: '02-593',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'Alior Bank S.A.',
        slug: 'alior',
        uknfCode: 'BK007',
        lei: 'PL259300ALIOR00007',
        nip: '5260567890',
        krs: '0000010000',
        type: 'Bank krajowy',
        category: 'Bank komercyjny',
        sector: 'Bankowość',
        subsector: 'Banki uniwersalne',
        street: 'Łopuszańska',
        building: '38D',
        postalCode: '02-232',
        city: 'Warszawa',
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        name: 'Instytucja Finansowa w likwidacji',
        slug: 'if-likwidacja',
        uknfCode: 'IF001',
        nip: '5260678901',
        krs: '0000011111',
        type: 'Instytucja finansowa',
        category: 'Inne instytucje',
        sector: 'Finanse',
        street: 'Testowa',
        building: '1',
        postalCode: '00-999',
        city: 'Warszawa',
        status: OrganizationStatus.SUSPENDED
      }
    }),
  ])

  console.log(`✅ Utworzono ${organizations.length} podmiotów`)
  
  // ============================================
  // ENTITY USERS & MEMBERSHIPS
  // ============================================
  console.log('👤 Tworzenie użytkowników podmiotów...')
  
  const entityUsers = []
  
  // Bank Przykładowy
  const bankAdmin = await prisma.user.create({
    data: { 
      email: 'admin@bank-przykladowy.test', 
      name: 'Marek Dyrektor', 
      password, 
      role: UserRole.ENTITY_ADMIN 
    }
  })
  await prisma.organizationMembership.create({
    data: { userId: bankAdmin.id, organizationId: organizations[0].id, role: OrganizationRole.ADMIN }
  })
  entityUsers.push(bankAdmin)
  
  const bankUser = await prisma.user.create({
    data: { 
      email: 'user@bank-przykladowy.test', 
      name: 'Zofia Księgowa', 
      password, 
      role: UserRole.ENTITY_USER 
    }
  })
  await prisma.organizationMembership.create({
    data: { userId: bankUser.id, organizationId: organizations[0].id, role: OrganizationRole.USER }
  })
  entityUsers.push(bankUser)
  
  // PKO BP
  const pkoAdmin = await prisma.user.create({
    data: { 
      email: 'admin@pko.test', 
      name: 'Robert Kowalczyk', 
      password, 
      role: UserRole.ENTITY_ADMIN 
    }
  })
  await prisma.organizationMembership.create({
    data: { userId: pkoAdmin.id, organizationId: organizations[1].id, role: OrganizationRole.ADMIN }
  })
  entityUsers.push(pkoAdmin)
  
  // mBank
  const mbankUser = await prisma.user.create({
    data: { 
      email: 'reporting@mbank.test', 
      name: 'Agnieszka Raport', 
      password, 
      role: UserRole.ENTITY_USER 
    }
  })
  await prisma.organizationMembership.create({
    data: { userId: mbankUser.id, organizationId: organizations[2].id, role: OrganizationRole.USER }
  })
  entityUsers.push(mbankUser)
  
  // PZU
  const pzuAdmin = await prisma.user.create({
    data: { 
      email: 'admin@pzu.test', 
      name: 'Tomasz Ubezpieczyciel', 
      password, 
      role: UserRole.ENTITY_ADMIN 
    }
  })
  await prisma.organizationMembership.create({
    data: { userId: pzuAdmin.id, organizationId: organizations[4].id, role: OrganizationRole.ADMIN }
  })
  entityUsers.push(pzuAdmin)
  
  console.log(`✅ Utworzono ${entityUsers.length} użytkowników podmiotów`)
  
  // ============================================
  // BULLETINS (KOMUNIKATY)
  // ============================================
  console.log('📢 Tworzenie komunikatów...')
  
  const bulletins = await Promise.all([
    prisma.bulletin.create({
      data: {
        title: 'Zmiany w raportowaniu kwartalnym Q2 2025',
        body: `Uprzejmie informujemy o wprowadzeniu zmian w formatkach raportowania dla okresu Q2 2025.

**Główne zmiany:**
- Nowe pozycje w formularzu F01.01.01.a dotyczące kredytów konsumenckich
- Modyfikacja struktury danych w zakresie pozaodsetkowych kosztów kredytu
- Aktualizacja taksonomii do wersji SIP-1.0_2025-Q2_QR

**Termin wdrożenia:** 01.04.2025
**Obowiązuje od okresu:** Q2 2025

Prosimy o zapoznanie się z załączoną dokumentacją techniczną i dostosowanie systemów raportujących.`,
        priority: BulletinPriority.HIGH,
        recipientType: BulletinRecipientType.ALL,
        requireReadReceipt: true,
        publishedAt: new Date('2025-03-15T09:00:00Z'),
        authorId: adminUKNF.id
      }
    }),
    prisma.bulletin.create({
      data: {
        title: 'Harmonogram kontroli planowych na II kwartał 2025',
        body: `Zgodnie z planem działalności kontrolnej UKNF, przedstawiamy harmonogram kontroli planowanych na II kwartał 2025 roku.

**Podmioty objęte kontrolą:**
1. Bank Przykładowy S.A. - kontrola tematyczna dot. zarządzania ryzykiem kredytowym (kwiecień 2025)
2. PZU S.A. - kontrola kompleksowa (maj 2025)
3. mBank S.A. - kontrola tematyczna dot. cyberbezpieczeństwa (czerwiec 2025)

Szczegółowe zakresy kontroli zostaną przesłane do podmiotów na 14 dni przed planowanym rozpoczęciem.`,
        priority: BulletinPriority.NORMAL,
        recipientType: BulletinRecipientType.BY_TYPE,
        requireReadReceipt: true,
        publishedAt: new Date('2025-03-10T10:00:00Z'),
        authorId: employee1UKNF.id
      }
    }),
    prisma.bulletin.create({
      data: {
        title: 'Nowe wytyczne w zakresie zarządzania ryzykiem ESG',
        body: `UKNF publikuje nowe wytyczne dotyczące zarządzania ryzykiem środowiskowym, społecznym i zarządzania (ESG) w instytucjach finansowych.

**Zakres wytycznych:**
- Identyfikacja i pomiar ryzyka ESG
- Wymogi sprawozdawcze
- Polityka inwestycyjna uwzględniająca kryteria ESG
- Raportowanie niefinansowe

**Termin implementacji:** 01.01.2026
**Okres przejściowy:** do 30.06.2026

Pełna treść wytycznych dostępna w sekcji Biblioteka.`,
        priority: BulletinPriority.HIGH,
        recipientType: BulletinRecipientType.ALL,
        requireReadReceipt: true,
        publishedAt: new Date('2025-03-05T14:30:00Z'),
        authorId: employee2UKNF.id
      }
    }),
    prisma.bulletin.create({
      data: {
        title: 'Webinar: Nowe standardy MSSF dla instytucji finansowych',
        body: `Zapraszamy na webinar dotyczący nowych standardów MSSF i ich wpływu na raportowanie instytucji finansowych.

**Termin:** 25 marca 2025, godz. 10:00-12:00
**Prowadzący:** dr hab. Anna Nowak, ekspert UKNF

**Agenda:**
- Przegląd zmian w MSSF 9 i MSSF 17
- Implikacje dla sprawozdawczości finansowej
- Sesja Q&A

Rejestracja przez system do 22 marca 2025.`,
        priority: BulletinPriority.NORMAL,
        recipientType: BulletinRecipientType.ALL,
        requireReadReceipt: false,
        publishedAt: new Date('2025-03-01T08:00:00Z'),
        authorId: employee3UKNF.id
      }
    }),
    prisma.bulletin.create({
      data: {
        title: 'Aktualizacja procedur bezpieczeństwa systemów IT',
        body: `W związku z rosnącymi zagrożeniami cyberbezpieczeństwa, UKNF przypomina o obowiązku zachowania najwyższych standardów bezpieczeństwa systemów informatycznych.

**Wymagania:**
- Regularne testy penetracyjne (min. raz na kwartał)
- Aktualizacje systemów bezpieczeństwa
- Szkolenia pracowników z zakresu cyberbezpieczeństwa
- Procedury reagowania na incydenty

Podmioty zobowiązane są do raporowania incydentów w ciągu 24h.`,
        priority: BulletinPriority.HIGH,
        recipientType: BulletinRecipientType.ALL,
        requireReadReceipt: true,
        publishedAt: new Date('2025-02-28T11:00:00Z'),
        authorId: adminUKNF.id
      }
    }),
    prisma.bulletin.create({
      data: {
        title: 'Konsultacje publiczne - projekt nowych przepisów o ochronie konsumentów',
        body: `UKNF rozpoczyna konsultacje publiczne projektu nowych przepisów dotyczących ochrony konsumentów usług finansowych.

**Główne założenia projektu:**
- Rozszerzenie obowiązków informacyjnych
- Nowe standardy przejrzystości opłat i prowizji
- Procedury reklamacyjne
- Sankcje za naruszenia

**Termin konsultacji:** do 30 kwietnia 2025

Uwagi i propozycje można zgłaszać przez formularz w systemie.`,
        priority: BulletinPriority.NORMAL,
        recipientType: BulletinRecipientType.ALL,
        requireReadReceipt: false,
        publishedAt: new Date('2025-02-20T09:00:00Z'),
        authorId: employee1UKNF.id
      }
    }),
  ])
  
  console.log(`✅ Utworzono ${bulletins.length} komunikatów`)
  
  // Mark some bulletins as read
  await prisma.bulletinRead.createMany({
    data: [
      { bulletinId: bulletins[0].id, userId: bankAdmin.id, readAt: new Date('2025-03-15T10:30:00Z') },
      { bulletinId: bulletins[0].id, userId: pkoAdmin.id, readAt: new Date('2025-03-15T11:00:00Z') },
      { bulletinId: bulletins[1].id, userId: bankAdmin.id, readAt: new Date('2025-03-10T14:00:00Z') },
      { bulletinId: bulletins[3].id, userId: mbankUser.id, readAt: new Date('2025-03-02T09:00:00Z') },
    ]
  })
  
  // ============================================
  // LIBRARY FILES
  // ============================================
  console.log('📚 Tworzenie plików w bibliotece...')
  
  const libraryFiles = await Promise.all([
    prisma.libraryFile.create({
      data: {
        fileName: 'Instrukcja_wypełniania_RIP_Q1_2025.pdf',
        title: 'Instrukcja wypełniania RIP Q1 2025',
        fileUrl: '/storage/library/instrukcja_rip_q1_2025.pdf',
        fileSize: 2458000,
        mimeType: 'application/pdf',
        description: 'Szczegółowa instrukcja wypełniania formularzy RIP dla okresu Q1 2025',
        uploadedById: adminUKNF.id
      }
    }),
    prisma.libraryFile.create({
      data: {
        fileName: 'Wytyczne_ESG_2025.pdf',
        title: 'Wytyczne ESG 2025',
        fileUrl: '/storage/library/wytyczne_esg_2025.pdf',
        fileSize: 1856000,
        mimeType: 'application/pdf',
        description: 'Nowe wytyczne UKNF dotyczące zarządzania ryzykiem ESG',
        uploadedById: employee2UKNF.id
      }
    }),
    prisma.libraryFile.create({
      data: {
        fileName: 'Szablon_Rachunek_Zyskow_Strat_Kalkulacyjny.xlsx',
        title: 'Szablon - Rachunek zysków i strat (wariant kalkulacyjny)',
        fileUrl: '/storage/library/szablon_rzis_kalkulacyjny.xlsx',
        fileSize: 125000,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        description: 'Szablon Excel do raportowania rachunku zysków i strat w wariancie kalkulacyjnym',
        uploadedById: employee1UKNF.id
      }
    }),
    prisma.libraryFile.create({
      data: {
        fileName: 'Ustawa_o_nadzorze_2025.pdf',
        title: 'Ustawa o nadzorze nad rynkiem finansowym - tekst jednolity 2025',
        fileUrl: '/storage/library/ustawa_nadzor_2025.pdf',
        fileSize: 3245000,
        mimeType: 'application/pdf',
        description: 'Tekst jednolity ustawy o nadzorze nad rynkiem finansowym (stan na 01.01.2025)',
        uploadedById: adminUKNF.id
      }
    }),
    prisma.libraryFile.create({
      data: {
        fileName: 'Rekomendacja_H_Zarzadzanie_Ryzykiem.pdf',
        title: 'Rekomendacja H - Zarządzanie ryzykiem kredytowym',
        fileUrl: '/storage/library/rekomendacja_h.pdf',
        fileSize: 987000,
        mimeType: 'application/pdf',
        description: 'Rekomendacja UKNF H dotycząca zarządzania ryzykiem kredytowym w bankach',
        uploadedById: employee2UKNF.id
      }
    }),
    prisma.libraryFile.create({
      data: {
        fileName: 'FAQ_Raportowanie_Kwartalne_2025.pdf',
        title: 'FAQ - Raportowanie kwartalne 2025',
        fileUrl: '/storage/library/faq_raportowanie_2025.pdf',
        fileSize: 654000,
        mimeType: 'application/pdf',
        description: 'Najczęściej zadawane pytania dotyczące raportowania kwartalnego',
        uploadedById: employee3UKNF.id
      }
    }),
  ])
  
  console.log(`✅ Utworzono ${libraryFiles.length} plików w bibliotece`)
  
  // ============================================
  // FAQS
  // ============================================
  console.log('❓ Tworzenie FAQ...')
  
  const faqs = await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'Jaki jest termin przesłania sprawozdania kwartalnego?',
        answer: 'Sprawozdania kwartalne należy przesyłać do 30 dnia miesiąca następującego po zakończeniu kwartału. Dla Q1 2025 termin upływa 30 kwietnia 2025. Q2 - 31 lipca, Q3 - 31 października, Q4 - 30 stycznia roku następnego.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee1UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Czy mogę przesłać korektę sprawozdania?',
        answer: 'Tak, korekty sprawozdań można przesyłać przez system. W przypadku wykrycia błędów po terminie należy niezwłocznie przesłać wersję poprawioną wraz z uzasadnieniem wprowadzonych zmian. Korekta zastępuje poprzednią wersję sprawozdania w systemie.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee1UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak zarejestrować nowego użytkownika w systemie?',
        answer: 'Nowych użytkowników może dodawać wyłącznie Administrator podmiotu. Procedura: Panel podmiotu → Użytkownicy → Dodaj użytkownika. Nowy użytkownik otrzyma link aktywacyjny na podany adres e-mail ważny przez 48 godzin.',
        category: 'System',
        isPublished: true,
        authorId: employee3UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Gdzie znajdę szablony formularzy do raportowania?',
        answer: 'Wszystkie aktualne szablony dostępne są w sekcji Biblioteka → Szablony. Zalecamy korzystanie wyłącznie z oficjalnych szablonów UKNF, które są regularnie aktualizowane. Przed wypełnieniem sprawdź datę wersji w stopce dokumentu.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: adminUKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Co zrobić w przypadku problemów technicznych z systemem?',
        answer: 'W przypadku problemów technicznych prosimy o kontakt z helpdesk UKNF: tel. +48 22 262 50 00, email: helpdesk@uknf.gov.pl. Helpdesk czynny pon-pt 8:00-16:00. W pilnych sprawach dostępna jest całodobowa linia awaryjna.',
        category: 'System',
        isPublished: true,
        authorId: employee3UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jakie formaty plików są akceptowane przez system?',
        answer: 'System akceptuje pliki Excel (.xlsx dla wersji 2016+), PDF (.pdf tylko jako załączniki), XML (dla danych strukturalnych XBRL). Maksymalny rozmiar pojedynczego pliku to 50 MB. Pliki ZIP nie są akceptowane.',
        category: 'System',
        isPublished: true,
        authorId: employee3UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Czy dane w systemie są szyfrowane?',
        answer: 'Tak, wszystkie dane przesyłane i przechowywane w systemie są szyfrowane zgodnie z najwyższymi standardami bezpieczeństwa (AES-256, TLS 1.3). System jest zgodny z wymogami RODO i posiada certyfikat ISO 27001.',
        category: 'Bezpieczeństwo',
        isPublished: true,
        authorId: adminUKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Co zrobić gdy zapomniałem hasła do systemu?',
        answer: 'Na stronie logowania kliknij link "Zapomniałeś hasła?". Na podany przy rejestracji adres email zostanie wysłany link do resetowania hasła ważny przez 1 godzinę. Po 3 nieudanych próbach logowania konto zostaje zablokowane na 30 minut.',
        category: 'Bezpieczeństwo',
        isPublished: true,
        authorId: employee3UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jakie są wymagania dotyczące haseł w systemie?',
        answer: 'Hasło musi zawierać minimum 10 znaków, w tym: wielką literę, małą literę, cyfrę i znak specjalny (!@#$%^&*). Hasło należy zmieniać co 90 dni. System nie pozwala na ponowne użycie 5 ostatnich haseł. Zalecamy użycie menedżera haseł.',
        category: 'Bezpieczeństwo',
        isPublished: true,
        authorId: adminUKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak wypełnić formularz RIP - które pozycje są obowiązkowe?',
        answer: 'W formularzu RIP obowiązkowe są wszystkie pozycje oznaczone gwiazdką (*). Sekcje A-D dotyczą danych bilansowych, E-F pozabilansowych, G-H kapitałów własnych. Szczegółowa instrukcja dostępna w dokumencie "Instrukcja_wypełniania_RIP_Q1_2025.pdf" w sekcji Biblioteka.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee2UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Czy mogę delegować uprawnienia do raportowania na innego użytkownika?',
        answer: 'Tak, administrator podmiotu może przypisać uprawnienia "Raportowanie" dowolnemu użytkownikowi w zakładce Zarządzanie użytkownikami. Użytkownik z tymi uprawnieniami może przesyłać sprawozdania, ale ich zatwierdzanie wymaga uprawnień "Administrator podmiotu".',
        category: 'System',
        isPublished: true,
        authorId: employee3UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak długo są przechowywane dane w systemie?',
        answer: 'Zgodnie z wymogami archiwizacyjnymi, wszystkie sprawozdania i dokumenty są przechowywane przez 10 lat od daty przesłania. Dane użytkowników nieaktywnych przez 2 lata są archiwizowane. Podmiot może pobrać swoje historyczne dane w dowolnym momencie w formacie Excel lub PDF.',
        category: 'Administracja',
        isPublished: true,
        authorId: adminUKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Co oznacza status "Wymaga uzupełnienia" przy sprawozdaniu?',
        answer: 'Status "Wymaga uzupełnienia" oznacza, że w przesłanym sprawozdaniu wykryto braki, niespójności lub błędy walidacyjne. W zakładce Sprawozdania znajdziesz szczegółowy komentarz analityka UKNF wskazujący które pozycje wymagają poprawy. Po korekcie prześlij sprawozdanie ponownie.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee2UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak dodać nowy podmiot w ramach grupy kapitałowej?',
        answer: 'Dodanie nowego podmiotu wymaga złożenia wniosku do UKNF wraz z dokumentacją rejestracyjną (KRS, umowa/statut, licencja). Po pozytywnej weryfikacji UKNF utworzy profil podmiotu w systemie i przyśle dane dostępowe dla administratora. Proces trwa 5-10 dni roboczych.',
        category: 'Administracja',
        isPublished: true,
        authorId: employee2UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Czy system działa w trybie 24/7?',
        answer: 'System jest dostępny 24 godziny na dobę, 7 dni w tygodniu, z wyjątkiem planowanych konserwacji (zwykle soboty 23:00-01:00). O planowanych przerwach w dostępności informujemy z 7-dniowym wyprzedzeniem poprzez komunikaty w systemie. W razie nieplanowanej awarii: helpdesk@uknf.gov.pl',
        category: 'System',
        isPublished: true,
        authorId: employee3UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak sprawdzić historię zmian w sprawozdaniu?',
        answer: 'W zakładce Sprawozdania kliknij na wybrany raport, a następnie przycisk "Historia wersji". System przechowuje wszystkie wersje sprawozdania wraz z informacją kto, kiedy i jakie zmiany wprowadził. Możesz porównać wersje oraz pobrać dowolną poprzednią wersję.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee1UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Co zrobić w przypadku kontroli UKNF?',
        answer: 'Podczas kontroli UKNF otrzymasz oficjalne zawiadomienie z minimum 14-dniowym wyprzedzeniem. W systemie pojawi się dedykowana zakładka "Kontrola" gdzie należy przesyłać wymagane dokumenty i odpowiadać na pytania kontrolerów. Wszelkie pytania kieruj do wskazanego w zawiadomieniu kontrolera wiodącego.',
category: 'Kontrole',
        isPublished: true,
        authorId: employee2UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak interpretować komunikaty walidacyjne przy przesyłaniu sprawozdania?',
        answer: 'Komunikaty "BŁĄD" (czerwone) blokują przesłanie sprawozdania - muszą zostać naprawione. Komunikaty "OSTRZEŻENIE" (żółte) nie blokują przesłania, ale wymagają wyjaśnienia w polu uwag. Komunikaty "INFO" (niebieskie) są tylko informacyjne. Pełna lista reguł walidacyjnych znajduje się w dokumencie "Zasady_walidacji_2025.pdf".',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee2UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Czy mogę przesłać sprawozdanie po terminie?',
        answer: 'Sprawozdania przesłane po ustawowym terminie są przyjmowane przez system, ale automatycznie oznaczane jako "Opóźnione". UKNF może wszcząć postępowanie administracyjne za nieterminowe wypełnienie obowiązku. W uzasadnionych przypadkach (awaria systemów, siła wyższa) można złożyć wniosek o uznanie terminowości.',
        category: 'Raportowanie',
        isPublished: true,
        authorId: employee2UKNF.id
      }
    }),
    prisma.fAQ.create({
      data: {
        question: 'Jak zgłosić zmianę danych kontaktowych podmiotu?',
        answer: 'Zmiany danych kontaktowych (adres korespondencyjny, telefon, email) zgłasza się poprzez formularz w zakładce Profil podmiotu → Dane kontaktowe. Zmiany wymagają akceptacji UKNF (1-2 dni robocze). Zmiana danych statutowych (nazwa, siedziba, KRS) wymaga przesłania odpowiedniej dokumentacji prawnej (wydruk z KRS, uchwała).',
        category: 'Administracja',
        isPublished: true,
        authorId: adminUKNF.id
      }
    }),
  ])
  
  console.log(`✅ Utworzono ${faqs.length} pytań FAQ`)
  
  // ============================================
  // CASES (SPRAWY)
  // ============================================
  console.log('📋 Tworzenie spraw...')
  
  const cases = await Promise.all([
    prisma.case.create({
      data: {
        title: 'Kontrola zarządzania ryzykiem kredytowym - Bank Przykładowy S.A.',
        description: 'Kontrola tematyczna dotycząca procedur zarządzania ryzykiem kredytowym w zakresie kredytów konsumenckich.',
        status: CaseStatus.IN_PROGRESS,
        priority: CasePriority.HIGH,
        organizationId: organizations[0].id,
        createdById: adminUKNF.id,
        assignedToId: employee2UKNF.id
      }
    }),
    prisma.case.create({
      data: {
        title: 'Analiza sprawozdania rocznego 2024 - PKO BP S.A.',
        description: 'Kompleksowa analiza sprawozdania finansowego za rok 2024 oraz ocena adekwatności kapitałowej.',
        status: CaseStatus.IN_PROGRESS,
        priority: CasePriority.MEDIUM,
        organizationId: organizations[1].id,
        createdById: employee1UKNF.id,
        assignedToId: employee3UKNF.id
      }
    }),
    prisma.case.create({
      data: {
        title: 'Weryfikacja systemu ochrony danych - mBank S.A.',
        description: 'Kontrola poprawności wdrożenia wymogów RODO oraz procedur cyberbezpieczeństwa.',
        status: CaseStatus.NEW,
        priority: CasePriority.HIGH,
        organizationId: organizations[2].id,
        createdById: adminUKNF.id,
        assignedToId: employee2UKNF.id
      }
    }),
    prisma.case.create({
      data: {
        title: 'Postępowanie wyjaśniające - PZU S.A.',
        description: 'Rozpatrzenie skargi klienta dotyczącej opóźnień w wypłacie odszkodowania z polisy OC.',
        status: CaseStatus.DONE,
        priority: CasePriority.MEDIUM,
        organizationId: organizations[4].id,
        createdById: employee1UKNF.id,
        assignedToId: employee1UKNF.id
      }
    }),
    prisma.case.create({
      data: {
        title: 'Rozbieżności w sprawozdaniu - ING Bank Śląski',
        description: 'Wykryte rozbieżności w sprawozdaniu kwartalnym Q4 2024 wymagające wyjaśnienia.',
        status: CaseStatus.IN_PROGRESS,
        priority: CasePriority.URGENT,
        organizationId: organizations[3].id,
        createdById: employee3UKNF.id,
        assignedToId: employee3UKNF.id
      }
    }),
  ])
  
  console.log(`✅ Utworzono ${cases.length} spraw`)
  
  // ============================================
  // MESSAGE THREADS
  // ============================================
  console.log('💬 Tworzenie wątków wiadomości...')
  
  const thread1 = await prisma.messageThread.create({
    data: {
      subject: 'Wyjaśnienie rozbieżności w sprawozdaniu Q4 2024',
      organizationId: organizations[3].id,
      status: ThreadStatus.AWAITING_RESPONSE,
      createdById: employee3UKNF.id
    }
  })
  
  await prisma.message.createMany({
    data: [
      {
        threadId: thread1.id,
        body: 'Dzień dobry,\n\nW przesłanym sprawozdaniu za Q4 2024 wykryliśmy rozbieżność w pozycji C (Zysk brutto ze sprzedaży). Suma kontrolna A-B nie zgadza się z wartością w pozycji C.\n\nProszę o weryfikację i przesłanie korekty w terminie 7 dni.\n\nPozdrawiam',
        senderId: employee3UKNF.id,
      },
      {
        threadId: thread1.id,
        body: 'Dzień dobry,\n\nDziękujemy za informację. Sprawdziliśmy dane i rzeczywiście wystąpił błąd techniczny przy eksporcie. Poprawioną wersję sprawozdania prześlemy do jutra.\n\nPozdrawiam',
        senderId: pkoAdmin.id,
      }
    ]
  })
  
  const thread2 = await prisma.messageThread.create({
    data: {
      subject: 'Pytanie dotyczące nowych wymogów ESG',
      organizationId: organizations[0].id,
      status: ThreadStatus.ANSWERED,
      createdById: bankAdmin.id
    }
  })
  
  await prisma.message.createMany({
    data: [
      {
        threadId: thread2.id,
        body: 'Dzień dobry,\n\nCzy nowe wytyczne ESG obowiązują również małe banki spółdzielcze czy tylko banki komercyjne?\n\nPozdrawiam',
        senderId: bankAdmin.id,
      },
      {
        threadId: thread2.id,
        body: 'Dzień dobry,\n\nWytyczne ESG obowiązują wszystkie podmioty nadzorowane, jednak dla małych banków spółdzielczych przewidziano uproszczone wymogi raportowe. Szczegóły w dokumencie "Wytyczne_ESG_2025.pdf" w sekcji Biblioteka.\n\nPozdrawiam',
        senderId: employee2UKNF.id,
      }
    ]
  })
  
  console.log('✅ Utworzono wątki wiadomości')
  
  // ============================================
  // REPORT SUBMISSIONS
  // ============================================
  console.log('📊 Tworzenie zgłoszeń sprawozdawczych...')
  
  const reportSubmissions = await Promise.all([
    prisma.reportSubmission.create({
      data: {
        period: ReportPeriod.Q4,
        year: 2024,
        fileName: 'Bank_Przykladowy_Q4_2024_RZiS.xlsx',
        fileUrl: '/storage/reports/bank_przykladowy_q4_2024.xlsx',
        fileSize: 245000,
        status: ReportStatus.SUCCESS,
        validationReport: 'Sprawozdanie zwalidowane pozytywnie. Wszystkie sumy kontrolne poprawne.',
        organizationId: organizations[0].id,
        submittedById: bankUser.id,
        submittedAt: new Date('2025-01-28T14:30:00Z'),
        validatedAt: new Date('2025-01-28T14:35:00Z')
      }
    }),
    prisma.reportSubmission.create({
      data: {
        period: ReportPeriod.Q1,
        year: 2025,
        fileName: 'Bank_Przykladowy_Q1_2025_RZiS.xlsx',
        fileUrl: '/storage/reports/bank_przykladowy_q1_2025.xlsx',
        fileSize: 248000,
        status: ReportStatus.SUCCESS,
        validationReport: 'Sprawozdanie zwalidowane pozytywnie.',
        organizationId: organizations[0].id,
        submittedById: bankAdmin.id,
        submittedAt: new Date('2025-03-20T10:15:00Z'),
        validatedAt: new Date('2025-03-20T10:20:00Z')
      }
    }),
    prisma.reportSubmission.create({
      data: {
        period: ReportPeriod.Q4,
        year: 2024,
        fileName: 'Santander_Q4_2024_RZiS.xlsx',
        fileUrl: '/storage/reports/santander_q4_2024.xlsx',
        fileSize: 252000,
        status: ReportStatus.RULE_ERROR,
        validationReport: 'Błąd walidacji: Niezgodność sum kontrolnych',
        errorDetails: 'Pozycja C (Zysk brutto ze sprzedaży): Wartość 15,234,567 PLN nie zgadza się z wyliczeniem A-B = 15,234,570 PLN. Różnica: 3 PLN',
        organizationId: organizations[3].id,
        submittedById: pkoAdmin.id,
        submittedAt: new Date('2025-01-30T16:45:00Z'),
        validatedAt: new Date('2025-01-30T16:50:00Z')
      }
    }),
    prisma.reportSubmission.create({
      data: {
        period: ReportPeriod.Q4,
        year: 2024,
        fileName: 'PKO_BP_Q4_2024_RZiS.xlsx',
        fileUrl: '/storage/reports/pko_bp_q4_2024.xlsx',
        fileSize: 267000,
        status: ReportStatus.SUCCESS,
        validationReport: 'Sprawozdanie zwalidowane pozytywnie.',
        organizationId: organizations[1].id,
        submittedById: pkoAdmin.id,
        submittedAt: new Date('2025-01-29T09:20:00Z'),
        validatedAt: new Date('2025-01-29T09:25:00Z')
      }
    }),
    prisma.reportSubmission.create({
      data: {
        period: ReportPeriod.Q1,
        year: 2025,
        fileName: 'mBank_Q1_2025_RZiS.xlsx',
        fileUrl: '/storage/reports/mbank_q1_2025.xlsx',
        fileSize: 239000,
        status: ReportStatus.PROCESSING,
        organizationId: organizations[2].id,
        submittedById: mbankUser.id,
        submittedAt: new Date('2025-03-25T11:00:00Z')
      }
    }),
    prisma.reportSubmission.create({
      data: {
        period: ReportPeriod.ANNUAL,
        year: 2024,
        fileName: 'PZU_Roczne_2024.xlsx',
        fileUrl: '/storage/reports/pzu_annual_2024.xlsx',
        fileSize: 512000,
        status: ReportStatus.SUCCESS,
        validationReport: 'Sprawozdanie roczne zwalidowane pozytywnie.',
        organizationId: organizations[4].id,
        submittedById: pzuAdmin.id,
        submittedAt: new Date('2025-02-28T15:30:00Z'),
        validatedAt: new Date('2025-02-28T15:40:00Z')
      }
    }),
  ])
  
  console.log(`✅ Utworzono ${reportSubmissions.length} zgłoszeń sprawozdawczych`)
  
  // ============================================
  // FINANCIAL REPORTS (Sample data)
  // ============================================
  console.log('💰 Tworzenie przykładowych danych finansowych...')
  
  const financialReport1 = await prisma.financialReport.create({
    data: {
      reportType: FinancialReportType.PROFIT_LOSS_STATEMENT,
      period: ReportPeriod.Q1,
      year: 2025,
      quarter: 1,
      variant: 'kalkulacyjny',
      organizationId: organizations[0].id,
      submittedById: bankAdmin.id,
      status: ReportStatus.SUCCESS,
      submittedAt: new Date('2025-03-20T10:15:00Z'),
      validatedAt: new Date('2025-03-20T10:20:00Z'),
      data: {
        currency: 'PLN',
        reportingEntity: 'Bank Przykładowy S.A.',
        period: 'Q1 2025'
      }
    }
  })
  
  // Create Profit & Loss lines for the report
  const profitLossLines = [
    { code: 'A', name: 'Przychody netto ze sprzedaży produktów, towarów i materiałów, w tym', value: 25000000, level: 0 },
    { code: 'A.I', name: 'Przychody netto ze sprzedaży produktów', value: 24500000, level: 1, parent: 'A' },
    { code: 'A.II', name: 'Przychody netto ze sprzedaży towarów i materiałów', value: 500000, level: 1, parent: 'A' },
    { code: 'B', name: 'Koszty sprzedanych produktów, towarów i materiałów, w tym', value: 15000000, level: 0 },
    { code: 'B.I', name: 'Koszt wytworzenia sprzedanych produktów', value: 14000000, level: 1, parent: 'B' },
    { code: 'B.II', name: 'Wartość sprzedanych towarów i materiałów', value: 1000000, level: 1, parent: 'B' },
    { code: 'C', name: 'Zysk (strata) brutto ze sprzedaży (A-B)', value: 10000000, level: 0 },
    { code: 'D', name: 'Koszty sprzedaży', value: 2000000, level: 0 },
    { code: 'E', name: 'Koszty ogólnego zarządu', value: 3000000, level: 0 },
    { code: 'F', name: 'Zysk (strata) ze sprzedaży (C-D-E)', value: 5000000, level: 0 },
    { code: 'G', name: 'Pozostałe przychody operacyjne', value: 500000, level: 0 },
    { code: 'H', name: 'Pozostałe koszty operacyjne', value: 300000, level: 0 },
    { code: 'I', name: 'Zysk (strata) z działalności operacyjnej (F+G-H)', value: 5200000, level: 0 },
    { code: 'J', name: 'Przychody finansowe', value: 800000, level: 0 },
    { code: 'K', name: 'Koszty finansowe', value: 400000, level: 0 },
    { code: 'L', name: 'Zysk (strata) brutto (I+J-K)', value: 5600000, level: 0 },
    { code: 'M', name: 'Podatek dochodowy', value: 1064000, level: 0 },
    { code: 'N', name: 'Pozostałe obowiązkowe zmniejszenia zysku (zwiększenia straty)', value: 0, level: 0 },
    { code: 'O', name: 'Zysk (strata) netto (L-M-N)', value: 4536000, level: 0 },
  ]
  
  await prisma.profitLossLine.createMany({
    data: profitLossLines.map(line => ({
      financialReportId: financialReport1.id,
      lineCode: line.code,
      lineName: line.name,
      value: line.value,
      level: line.level,
      parentLineCode: line.parent
    }))
  })
  
  console.log('✅ Utworzono dane finansowe (Rachunek zysków i strat)')
  
  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('✨ SEEDOWANIE ZAKOŃCZONE POMYŚLNIE!')
  console.log('='.repeat(60))
  console.log('\n📊 STATYSTYKI:')
  console.log(`   Użytkownicy UKNF: 4`)
  console.log(`   Podmioty nadzorowane: ${organizations.length}`)
  console.log(`   Użytkownicy podmiotów: ${entityUsers.length}`)
  console.log(`   Komunikaty: ${bulletins.length}`)
  console.log(`   Pliki w bibliotece: ${libraryFiles.length}`)
  console.log(`   Pytania FAQ: ${faqs.length}`)
  console.log(`   Sprawy: ${cases.length}`)
  console.log(`   Wątki wiadomości: 2`)
  console.log(`   Zgłoszenia sprawozdawcze: ${reportSubmissions.length}`)
  console.log(`   Dane finansowe: 1 raport z ${profitLossLines.length} pozycjami`)
  
  console.log('\n🔐 KONTA TESTOWE:')
  console.log('\n   👨‍💼 UKNF:')
  console.log('   admin@uknf.test / Passw0rd! (Administrator)')
  console.log('   pracownik@uknf.test / Passw0rd! (Pracownik)')
  console.log('   supervisor@uknf.test / Passw0rd! (Supervisor)')
  console.log('   analyst@uknf.test / Passw0rd! (Analityk)')
  
  console.log('\n   🏦 PODMIOTY:')
  console.log('   admin@bank-przykladowy.test / Passw0rd! (Bank Przykładowy - Admin)')
  console.log('   user@bank-przykladowy.test / Passw0rd! (Bank Przykładowy - User)')
  console.log('   admin@pko.test / Passw0rd! (PKO BP - Admin)')
  console.log('   reporting@mbank.test / Passw0rd! (mBank - User)')
  console.log('   admin@pzu.test / Passw0rd! (PZU - Admin)')
  
  console.log('\n' + '='.repeat(60) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seedowania:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

