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
npm run build
npm run test
npm run lint
npm run acceptance:matrix
```

## Acceptance Policy

Every implementation task is tied to requirement sections and acceptance checklist IDs. Final delivery requires a complete pass through `github_profile_studio_acceptance_checklist.md`, with evidence attached for each passing item.

