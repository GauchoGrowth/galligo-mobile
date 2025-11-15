# Repository Guidelines

## Project Structure & Module Organization
Expo loads `App.tsx` → `index.ts`, while reusable logic lives in `src/`. UI atoms and layout primitives sit under `src/components/ui`, screens in `src/screens`, navigation scaffolding in `src/navigation`, and shared hooks/services/stores inside their matching folders. Theme tokens and typography helpers are centralized in `src/theme`, and Supabase/auth helpers are in `src/lib`. Native assets (SVGs, fonts, illustrations) belong in `assets/`, and iOS/Android projects store platform overrides. Keep long-form plans and migration notes inside `docs/` to avoid polluting PRs.

## Build, Test, and Development Commands
- `npm run start` (alias `expo start`): boots Metro with dev-client support for iterative work.
- `npm run ios` / `npm run android`: rebuilds the native shell after changing native modules or permissions.
- `npm run web`: quick smoke check in Expo Web; expect parity gaps but it catches obvious regressions.
Use `.expo` cache cleanup (`npx expo start -c`) whenever assets or Tailwind tokens fail to refresh.

## Coding Style & Naming Conventions
Stick to TypeScript everywhere, 2-space indentation, and functional React components with hooks. Components and stores use PascalCase filenames (`TravelLogScreen.tsx`, `useLocationStore.ts`), hooks/functions use camelCase, and types/interfaces live under `src/types` prefixed with `Galli`. Import via the configured module resolver (`@/components/ui/Button`). Tailwind classes come from NativeWind; fall back to `StyleSheet` for animated states. Run Prettier/ESLint via your editor—no repo-level script yet, so keep diffs minimal and alphabetize object keys when practical.

## Testing Guidelines
There is no Jest harness today; lean on targeted scripts like `test-fetch.ts` for network sanity checks and on-device validation in the iOS Simulator (press `i` after `expo start`). When adding tests, colocate `*.test.ts` files with their modules and avoid DOM-specific APIs. Document manual test plans in the PR body, including credentials (`dev@example.com / DevExample`) when relevant, and call out any areas left unverified.

## Commit & Pull Request Guidelines
Follow the existing Conventional Commit style (`feat:`, `docs:`, `fix:`). Keep commits focused—UI tweaks, navigation work, and data plumbing should land separately to simplify reverts. PRs need: a concise summary, linked Linear/GitHub issue, screenshots or screen recordings for UI deltas, reproduction steps for bugs, and a checklist covering tests run (`expo start`, platform builds, scripts). Mention any config or env changes explicitly so other agents can refresh `.env` or rerun `expo run`.
