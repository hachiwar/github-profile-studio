# GitHub Profile Studio

GitHub Profile Studio is a full product for generating and maintaining GitHub Profile README files, GitHub Pages personal sites, dynamic cards, achievement walls, and automated update workflows.

The implementation follows the uploaded complete requirements and acceptance checklist. Generated content defaults to English, with Chinese and bilingual output available across README, Pages, cards, achievements, and UI copy.

## Workspace

- `apps/web`: Next.js product UI and API routes.
- `apps/worker`: queue and scheduled maintenance worker.
- `packages/core`: domain types, validation, i18n, privacy, errors, acceptance matrix.
- `packages/github`: GitHub REST/GraphQL integration and username/repository detection.
- `packages/generators`: README and GitHub Pages generation engines.
- `packages/cards`: dynamic SVG/PNG/JSON card rendering.
- `packages/achievements`: configurable achievement rule engine.
- `packages/db`: Prisma schema and database client.

## Commands

```bash
npm install
npm run dev
npm run start
npm run build
npm run typecheck
npm run test
npm run lint
npm run acceptance:matrix
npm run acceptance:report
```

## Website Setup

1. Copy `.env.example` to `.env.local` for local development or configure the same variables in the hosting provider.
2. Generate `TOKEN_ENCRYPTION_KEY` with a 32-byte base64 value, for example:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. For public GitHub data, `GITHUB_TOKEN` is optional but recommended to reduce rate-limit fallback behavior.
4. For OAuth deployment features, configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_URL`.
5. Build and run the website:

   ```bash
   npm install
   npm run build
   npm run start
   ```

The default local URL is `http://localhost:3000`. Vercel is the intended hosted target; configure PostgreSQL with `DATABASE_URL` and Redis with `REDIS_URL` when enabling persisted drafts, queues, and scheduled workers.

## Acceptance Policy

Every implementation task is tied to requirement sections and acceptance checklist IDs. Final delivery requires a complete pass through `github_profile_studio_acceptance_checklist.md`, with evidence attached for each passing item.
