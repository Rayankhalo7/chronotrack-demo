# ChronoTrack — Feinspec & Architektur

**Repo-Ziel:** `Rayankhalo7/chronotrack-demo`  
**Produktname:** ChronoTrack  
**Status:** Architektur freigegeben (PM-Review eingearbeitet) · Scaffold/Repo-Write gesperrt bis Connect + Repo-Anlegen  
**Stack:** Next.js App Router · TypeScript · Prisma · SQLite (dev) / Postgres (prod) · NextAuth Credentials · Demo-Login · Tailwind

Kein Firmen-Code, keine Kundendaten, keine Secrets im Repo.

**Hartregel:** Bestehende private Repos weder klonen, ändern noch referenzieren. Nur neues öffentliches Repo `chronotrack-demo`.

---

## 1. Ziel & MVP

Öffentliche Zeiterfassungs-Demo für Portfolio: Projekte anlegen, Zeiten starten/stoppen oder manuell erfassen, Übersicht und CSV-Export.

### In Scope (MVP)
- Auth: Seed-User + Demo-Login-Button + Credentials-Login für den Seed-User (keine öffentliche Register-Seite)
- Projekte CRUD (Name, Farbe/Label optional; Soft-Archive)
- Zeiteinträge CRUD (Start/Stop, manuell, Notiz, Projekt-Zuordnung)
- Dashboard: Summe heute / diese Woche, Filter Projekt + Datumsrange
- CSV-Export der gefilterten Einträge
- Seed-Daten für Reviewer
- README: Setup, Architektur, Screens, Tech-Entscheidungen

### Out of Scope (Welle 1)
- Öffentliche Registrierung / Self-Signup
- Teams / Rollen / Einladungen
- Rechnungen, Stundenlohn, Freigabe-Workflows
- Mobile Native App, Offline-Sync
- OAuth-Provider (Google etc.) — später optional
- Hard-Delete von Projekten mit vorhandenen Einträgen

---

## 2. Ordnerstruktur (geplant)

```
chronotrack-demo/
├── README.md
├── .env.example
├── .gitignore
├── LICENSE                    # MIT empfohlen
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/            # nach erstem migrate
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing / Redirect → /dashboard
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   └── login/page.tsx       # Credentials + Demo-Login; kein Register im MVP
│   │   ├── (app)/
│   │   │   ├── layout.tsx           # geschützte Shell (Nav)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── projects/[id]/page.tsx
│   │   │   └── entries/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── projects/route.ts
│   │       ├── projects/[id]/route.ts
│   │       ├── entries/route.ts
│   │       ├── entries/[id]/route.ts
│   │       ├── entries/active/route.ts   # laufender Timer
│   │       └── export/csv/route.ts
│   ├── components/
│   │   ├── ui/                  # Button, Input, Card, …
│   │   ├── auth/DemoLoginButton.tsx
│   │   ├── projects/ProjectForm.tsx
│   │   ├── entries/TimerBar.tsx
│   │   ├── entries/EntryForm.tsx
│   │   ├── entries/EntryTable.tsx
│   │   └── dashboard/StatsCards.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts              # NextAuth config + helpers
│   │   ├── passwords.ts         # bcrypt hash/verify
│   │   ├── time.ts              # Dauer-Berechnung, Week-Bounds
│   │   └── csv.ts
│   └── types/
│       └── index.ts
└── tests/
    ├── time.test.ts
    └── entries.test.ts          # Service-/Lib-Tests, kein E2E in MVP
```

---

## 3. Datenmodell (Prisma)

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String?
  passwordHash String
  createdAt    DateTime  @default(now())
  projects     Project[]
  entries      TimeEntry[]
}

model Project {
  id          String      @id @default(cuid())
  name        String
  color       String?     // z. B. "#3B82F6"
  archived    Boolean     @default(false)
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries     TimeEntry[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
}

model TimeEntry {
  id          String    @id @default(cuid())
  userId      String
  projectId   String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Restrict)
  startedAt   DateTime
  endedAt     DateTime? // null = laufender Timer
  note        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, startedAt])
  @@index([projectId])
  @@index([userId, endedAt]) // aktiver Timer: endedAt IS NULL
}
```

**Regeln**
- Pro User höchstens ein Eintrag mit `endedAt = null` (in API erzwingen).
- Dauer = `endedAt - startedAt` (nur abgeschlossene Einträge in Summen; laufender Timer separat anzeigen).
- Alle Queries immer nach `userId` der Session filtern.
- Projekte: Soft-Archive (`archived=true`); kein Hard-Delete, wenn Einträge existieren. Ohne Einträge optional Hard-Delete erlaubt.

---

## 4. Auth-Flow

```
[Landing] → /login
              │
              ├─ Credentials (email + password)
              │     → bcrypt verify → JWT/Session (NextAuth)
              │
              └─ Demo-Login
                    → fester Demo-User aus Seed
                    → gleiche Session wie Credentials
                    → kein Passwort nötig (Server Action / API Route
                       prüft DEMO_LOGIN_ENABLED=true)

Geschützte Routen: (app)/* und /api/projects|entries|export
  → getServerSession(); sonst 401 / redirect /login

Logout → NextAuth signOut → /login
```

**Env (nur `.env.example` committen)**
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DEMO_LOGIN_ENABLED=true` (lokal/Demo; in Prod optional aus)

**Seed & Secrets**
- User `demo@chronotrack.dev`; Klartext-Passwort **nur in der README** (für Reviewer), im Seed ausschließlich `passwordHash` (bcrypt) — nie Klartext im Code committen
- 2–3 Projekte, mehrere abgeschlossene Einträge, kein laufender Timer beim Start

---

## 5. API-Skizze (REST unter `/api`)

| Methode | Pfad | Zweck |
|--------|------|--------|
| GET/POST | `/api/projects` | Liste / anlegen |
| GET/PATCH | `/api/projects/[id]` | Detail / update / Soft-Archive (`archived`) |
| DELETE | `/api/projects/[id]` | Nur wenn keine Einträge; sonst 409 → Soft-Archive nutzen |
| GET/POST | `/api/entries` | Liste (Query: projectId, from, to) / manuell anlegen |
| PATCH/DELETE | `/api/entries/[id]` | Update / löschen |
| POST | `/api/entries/active` | Timer starten `{ projectId }` |
| PATCH | `/api/entries/active` | Timer stoppen |
| GET | `/api/export/csv` | CSV der gefilterten Einträge |

Validierung: Zod an den Route-Handlern. Fehler: 400 / 401 / 403 / 404 / 409 JSON.

**CSV-Format (UTF-8)**
- Header-Zeile (Spaltennamen)
- Zeiten als ISO-8601 (`startedAt`, `endedAt`)
- Dauer in **Minuten** (Ganzzahl; abgeschlossene Einträge)
- `Content-Type: text/csv; charset=utf-8` (BOM optional für Excel)

---

## 6. UI-Flows (kurz)

1. **Timer:** Projekt wählen → Start → `TimerBar` zeigt Live-Dauer → Stop → Eintrag in Liste.
2. **Manuell:** Formular Start/Ende/Projekt/Notiz → speichern.
3. **Dashboard:** StatsCards + gefilterte `EntryTable`.
4. **Projekte:** Liste, anlegen, Soft-Archive; archivierte in Timer-Auswahl ausblenden.

---

## 7. Tests (MVP)

- `lib/time.ts`: Wochengrenzen, Dauer-Formatierung, Überlappungs-/Validierungshilfen
- Eintrag-Regeln: kein zweiter aktiver Timer; `endedAt > startedAt`

---

## 8. Definition of Done (Reminder)

- [ ] README mit Setup, Architektur-Link, Screens/GIF, Tech-Entscheidungen, Demo-Passwort (Klartext nur hier)
- [ ] Lokal: `npm i && npx prisma migrate dev && npm run db:seed && npm run dev`
- [ ] Demo-Login + Credentials für Seed-User; keine Register-Seite
- [ ] CSV: Header, ISO-Zeiten, Dauer in Minuten, UTF-8
- [ ] Projekte mit Einträgen nur Soft-Archive
- [ ] Kern-Tests grün
- [ ] `.env.example` vollständig; Seed nur Hash, keine Klartext-Secrets im Code
- [ ] Deploy-Pfad dokumentiert (Vercel + Postgres)

---

## 9. Nächste Schritte (Blocker)

1. GitHub-Connect in Cursor  
2. Öffentliches Repo `Rayankhalo7/chronotrack-demo` anlegen (GitHub Experte)  
3. Freigabe Scaffold → dann `create-next-app` + Prisma-Schema laut diesem Doc  

**Nicht tun vor Freigabe:** Scaffold, Push, Deploy.

---

*Erstellt: Software Engineer · PM-Review eingearbeitet*
