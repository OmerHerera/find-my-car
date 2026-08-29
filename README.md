# Find My Car

A responsive family web app for recording where shared cars are parked. It supports adding, editing, and removing cars; selectable sedan, SUV, and hatchback illustrations; GPS and written locations; named or anonymous parking history; navigation; browser-local mock data; PostgreSQL; English; and Hebrew RTL. The first version is intentionally open without authentication and has no "in use" state or unreliable automatic parking detection.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A modern browser with the Geolocation API
- Optional: PostgreSQL 16 or a hosted PostgreSQL provider such as Neon, Supabase, or Vercel Postgres
- Optional: a Vercel account for deployment

No mobile SDK, Expo, Xcode, or Android tooling is required.

## Run in Mock Development Mode

```bash
npm install
cp .env.example .env.local
npm run dev
```

Keep `NEXT_PUBLIC_DATA_MODE=mock` in `.env.local`, or leave the variable unset. Open [http://localhost:3000](http://localhost:3000). Cars, parking history, language, and the local user name are stored in this browser; no backend or database is required.

## Run Locally with the Real Database

Create and initialize PostgreSQL:

```bash
createdb find_my_car
psql find_my_car < db/schema.sql
```

Configure `.env.local`:

```dotenv
NEXT_PUBLIC_DATA_MODE=api
DATABASE_URL=postgresql://localhost/find_my_car
```

Then restart Next.js:

```bash
npm run dev
```

For a local production build using the same real database:

```bash
npm run lint
npm run build
npm start
```

## Mock Development Mode

Set `NEXT_PUBLIC_DATA_MODE=mock`, or leave it unset. Three sample cars demonstrate GPS, written, and unknown locations as well as the three illustration styles. Adding, editing, and removing cars, plus parking, history, timestamps, language selection, user name, and state changes, are persisted in browser `localStorage`. Removing a car also removes its local parking history after confirmation. Car colors include blue, white, black, green, red, and yellow.

Use **Park here** to capture browser GPS or enter text such as "Herzl St. near the bakery." The latest location is displayed in a prominent location panel with actor and timestamp. GPS records show navigation inside that panel; written-only locations do not. Browser location access requires user permission and a secure context: HTTPS in production or localhost in development.

## PostgreSQL and API Mode

The Node.js backend is integrated into Next.js route handlers:

- `GET/POST /api/cars`
- `PATCH/DELETE /api/cars/:carId`
- `POST /api/cars/:carId/parking`
- `GET /api/health`

Create and initialize or migrate a database:

```bash
createdb find_my_car
psql find_my_car < db/schema.sql
```

Configure `.env.local`:

```dotenv
NEXT_PUBLIC_DATA_MODE=api
DATABASE_URL=postgresql://localhost/find_my_car
```

Restart the development server after changing public environment variables. `DATABASE_URL` is server-only and must never use the `NEXT_PUBLIC_` prefix.

## Backend-Unavailable Behavior

The site always renders. If API mode is enabled but the database is missing or unavailable, API routes return a structured `503 DATABASE_UNAVAILABLE` response. The dashboard displays a warning and loads browser mock data instead. Failed writes remain in their dialog with localized feedback. GPS denial or failure automatically leaves the written-location option available.

## Architecture

```text
Next.js browser dashboard
          |
   data repository
     /          \
localStorage   Next route handlers
                    |
                PostgreSQL
```

- **Presentation:** React client component, semantic HTML dialogs, responsive CSS, Lucide icons, and original color-aware inline SVG sedan/SUV/hatchback illustrations.
- **State:** React state backed by a small repository boundary.
- **Mock data:** browser `localStorage`; no infrastructure required.
- **Backend:** Next.js Node route handlers with Zod request validation.
- **Database:** `pg` stores cars and immutable newest-first parking events.
- **Location:** `navigator.geolocation.getCurrentPosition` captures latitude, longitude, and accuracy.
- **Navigation:** GPS coordinates open Google Maps directions in a new browser tab; mobile browsers can hand this to an installed maps app.
- **Localization:** typed English/Hebrew resources, persisted locale, and document-level `dir="rtl"` for Hebrew.

The UI uses the same models in mock and API modes. Changing `NEXT_PUBLIC_DATA_MODE` swaps the persistence implementation without rewriting screens.

## Data Model

`cars` stores display identity, color, illustration style (`sedan`, `suv`, or `hatchback`), and optional plate. Existing browser and database records default to `sedan`. `parking_events` is append-only and stores the acting member, timestamp, and one explicit location type:

```ts
type ParkingLocation =
  | { type: 'gps'; latitude: number; longitude: number; accuracy?: number }
  | { type: 'manual'; text: string };
```

The latest event is the current parked location. `memberName` is nullable: if this browser has no saved name, the event is stored anonymously and displayed as `Unknown person`. A car with no event shows `Location unknown`.

## Libraries

- **Next.js + React + TypeScript:** browser UI and Node.js API in one Vercel-native deployment.
- **PostgreSQL + pg:** durable storage with minimal abstraction.
- **Zod:** runtime API request validation.
- **Lucide React:** consistent interface icons.
- **CSS:** dependency-free responsive styling and RTL logical properties.

## Localization and RTL

Translations live in `src/lib/translations.ts`. Settings stores the selected locale and optional user name together under `find-my-car/preferences` in browser `localStorage`. Existing `find-my-car/locale` values are migrated automatically. Hebrew changes the root HTML language and direction, causing grid, flex, spacing, text, forms, and dialogs to follow RTL. Non-directional car artwork and pins are not mirrored. Clearing browser storage resets both preferences, as expected for this unauthenticated first version.

To add a language, extend `Locale`, add an object with the same translation keys, and expose it in Settings. Test long strings at mobile widths.

## Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import it in Vercel. The framework preset is detected as Next.js; no custom root directory or build command is needed.
3. For mock mode, deploy without environment variables. Each browser has independent data.
4. For persistent shared data, add `NEXT_PUBLIC_DATA_MODE=api` and `DATABASE_URL` in Vercel project settings.
5. Apply `db/schema.sql` to the production database before enabling API mode.
6. Redeploy after changing `NEXT_PUBLIC_DATA_MODE` because public variables are embedded at build time.

Vercel provides HTTPS, so browser geolocation is available after the user grants permission.

## Testing

Automated static checks:

```bash
npm run lint
npm run build
```

Manual release checks:

1. Add a car and verify color and optional plate.
2. Edit its name, plate, and color and verify existing parking history is preserved.
3. Remove a car, cancel once, then confirm and verify its history is removed with it.
4. Park using GPS and verify coordinates, member, timestamp, history, and navigation.
5. Park using written text and verify it is clearly labeled and has no navigation action.
6. Deny location permission and confirm written entry remains available.
7. Stop or omit PostgreSQL in API mode and verify the warning, mock fallback, and structured health response.
8. Switch between English and Hebrew and inspect alignment, action order, forms, dialogs, and mobile wrapping.
9. Test current Chrome, Safari, and Firefox at phone and desktop widths.

This first version has no authentication. The optional name comes from each browser's local preferences and is sent with parking events. It identifies the person for family convenience but is not verified. Add authentication and server-derived identity before treating names as trusted data.
