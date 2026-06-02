# GitHub Profile Studio

<p align="center">
  <strong>Generate, design, deploy, and continuously maintain a complete GitHub profile presence.</strong>
</p>

<p align="center">
  <a href="https://github.com/hachiwar/github-profile-studio/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/hachiwar/github-profile-studio/ci.yml?branch=main&label=CI&style=for-the-badge"></a>
  <a href="https://hachiwar.github.io/github-profile-studio/"><img alt="GitHub Pages" src="https://img.shields.io/badge/GitHub%20Pages-live-0969da?style=for-the-badge&logo=github"></a>
  <img alt="Acceptance" src="https://img.shields.io/badge/acceptance-395%2F395-brightgreen?style=for-the-badge">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Monorepo" src="https://img.shields.io/badge/monorepo-npm%20workspaces-cc3534?style=for-the-badge&logo=npm&logoColor=white">
</p>

<p align="center">
  <a href="https://hachiwar.github.io/github-profile-studio/">Live Site</a>
  ·
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#api-examples">API</a>
  ·
  <a href="#deployment">Deployment</a>
  ·
  <a href="#quality-gates">Quality Gates</a>
</p>

![GitHub Profile Studio home](artifacts/screenshots/final-home.png)

GitHub Profile Studio is a full product for building a professional GitHub identity. It generates Profile README files, GitHub Pages personal sites, dynamic SVG/PNG/JSON cards, achievement walls, automation workflows, and privacy-safe new-user profiles from public GitHub data plus optional manual input.

Generated content defaults to English. Chinese and English plus Chinese bilingual output are supported across README, Pages, cards, achievements, UI copy, templates, dates, and numbers.

## Why It Exists

Most profile generators stop at static Markdown snippets. GitHub Profile Studio treats a profile as a living product:

| Need | What GitHub Profile Studio provides |
| --- | --- |
| New GitHub user with little data | Empty-data-safe README and Pages generation with guided education, skills, learning plan, and project forms |
| Experienced developer | GitHub analytics, contribution history, language distribution, stars, forks, PRs, issues, releases, and community impact |
| Personal site | Exportable GitHub Pages static site with SEO, Open Graph, favicon, themes, responsive navigation, and deployment guide |
| Dynamic visuals | SVG, PNG, and JSON card APIs for stats, streaks, languages, repositories, achievements, rankings, followers, and activity |
| Long-term maintenance | GitHub Actions generation, scheduled snapshots, automatic updates, growth recommendations, and yearly summaries |
| Safe publishing | Field-level privacy controls, token encryption, diff preview, backup, rollback, and OAuth-gated repository writes |

## Final Version Status

This repository keeps the verified first release on the `v1` branch. The `main` branch is the final-version development line and the default branch.

| Gate | Current result |
| --- | --- |
| Acceptance checklist | 395/395 passing with evidence |
| Test suite | 39 test files, 104 tests |
| Type checking | All workspaces pass |
| Lint | All workspaces pass |
| Production build | 68 Next.js app routes generated |
| Runtime smoke | Home, new-user workspace, health, README generation, Pages ZIP export, SVG card API verified |

## Screenshots

| Home | New-user automation |
| --- | --- |
| ![Home](artifacts/screenshots/final-home.png) | ![New user wizard](artifacts/screenshots/final-new-user.png) |

| GitHub Pages static edition |
| --- |
| ![GitHub Pages static edition](artifacts/screenshots/github-pages-static.png) |

More verification screenshots are stored in [`artifacts/screenshots`](artifacts/screenshots).

## Public Website

The repository includes a static GitHub Pages edition at [hachiwar.github.io/github-profile-studio](https://hachiwar.github.io/github-profile-studio/). Users can open the website, enter or select profile information, generate a README and personal page in the browser, then copy or download the generated files.

This static edition sends no profile input to a server and requires no token. OAuth repository writes, backups, pull requests, rollbacks, dynamic APIs, database-backed drafts, and worker jobs remain part of the full Next.js deployment.

Build the GitHub Pages website locally:

```bash
npm run pages:build
```

The static output is written to `dist/github-pages`.

## Features

### Profile README Studio

- Modular README builder with live preview, Markdown source, copy, download, import, formatting, compatibility checks, and diff output.
- Full module library: intro, GitHub overview, streak, calendar, languages, projects, star growth, PR/issue collaboration, tech stack, achievements, contact, blog, visitors, custom Markdown, and typewriter animation.
- English, Chinese, and bilingual output through `locale=en-US|zh-CN|bilingual`.
- Optional one-click deployment to the `username` repository with OAuth, backup, pull request mode, conflict detection, and rollback.

### GitHub Pages Studio

- Static site generator with `index.html`, `style.css`, `script.js`, JSON data files, assets, SEO metadata, Open Graph configuration, favicon, theme switching, responsive navigation, and deployment instructions.
- Built-in templates for portfolios, resumes, learning growth pages, bento layouts, timelines, skill maps, open-source newcomer pages, and bilingual sites.
- ZIP export, manual deployment guide, custom domain guidance, and OAuth-gated deployment to `username.github.io`.

### Dynamic Card API

- Cards for profile overview, GitHub stats, streak, contribution calendar, top languages, repositories, star/fork growth, PR/issue stats, achievements, trophies, tech stack, activity graph, ranking, followers, account age, open-source impact, year review, monthly activity, and custom composites.
- SVG, PNG, and JSON output.
- Markdown image links and HTML image embeds.
- Cache metadata, rate-limit fallback, theme support, layout controls, privacy-safe rendering, and README compatibility.

### Achievement System

- Configurable rules for contribution, star, fork, PR, issue, repository, and community milestones.
- Progress, unlock state, unlock time, localized names, icons, share links, README embeds, Pages embeds, and SVG cards.
- Works with real GitHub data and deterministic fallback datasets for safe previewing.

### New-User Automation

- Automatically detects sparse GitHub accounts and recommends the correct mode.
- Guided form for basics, education, learning direction, programming languages, skills, manual projects, learning plans, highlights, contact links, display switches, and privacy switches.
- No blank modules: weak or missing GitHub data is replaced with education, learning, manual projects, and privacy-safe copy.
- Import from README, resume text, project README, bulk project lists, bulk skills, and saved configuration JSON.
- Upgrade path from new-user mode to hybrid or data-enhanced mode as repositories, commits, stars, PRs, and issues grow.

### OAuth, Deployment, and Automation

- GitHub OAuth with minimum scopes, permission disclosure, encrypted token storage, logout, and revoke guidance.
- Repository creation for `username` and `username.github.io`.
- Direct commit or pull request deployment modes.
- Diff preview, old-file backup, rollback plan, failure logs, deployment logs, and Pages enablement.
- GitHub Actions workflow generation for daily, weekly, and manual updates.
- Worker-ready maintenance jobs for README, Pages data, blog data, achievements, star/fork snapshots, yearly summaries, and card cache refreshes.

### Privacy and Security

- Public data only by default.
- Field-level privacy for real name, school, major, degree, GPA, graduation year, email, resume link, city, social accounts, job status, README visibility, and Pages visibility.
- One-click sensitive-data hiding, obfuscation, email protection, and saved-data deletion.
- Markdown, HTML, external asset, XSS, content-type, frame, and referrer protections.
- Bilingual error catalog for username not found, rate limits, network failure, repository missing, Pages disabled, OAuth failure, permission denial, deployment conflict, SVG rendering failure, and validation errors.

## Quick Start

```bash
git clone https://github.com/hachiwar/github-profile-studio.git
cd github-profile-studio
npm install
npm run build
npm run start
```

Open `http://localhost:3000`.

For local development:

```bash
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` for local development or configure the same variables in the hosting provider.

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/github_profile_studio"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
TOKEN_ENCRYPTION_KEY="base64-32-byte-key"
GITHUB_TOKEN=""
```

Generate a valid token encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`GITHUB_TOKEN` is optional for public previews, but recommended to reduce GitHub API rate-limit fallback behavior. OAuth deployment features require `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `TOKEN_ENCRYPTION_KEY`.

## Deployment

Vercel is the intended web deployment target.

1. Import the repository into Vercel.
2. Set the project root to the repository root.
3. Use the default install command `npm ci`.
4. Use the build command `npm run build`.
5. Configure the environment variables above.
6. Add PostgreSQL via `DATABASE_URL` for persisted drafts and Redis via `REDIS_URL` for queue-backed workers.

The production web app is served by:

```bash
npm run start
```

The worker can be run separately:

```bash
npm run dev --workspace @github-profile-studio/worker
```

### GitHub Pages Static Site

The static website is published by `.github/workflows/pages.yml`. On every push to `main`, GitHub Actions installs dependencies, runs `npm run pages:build`, uploads `dist/github-pages` as a Pages artifact, and deploys it with GitHub Pages.

If the repository has never used Pages before, set the repository Pages source to GitHub Actions in the GitHub repository settings.

## API Examples

Generate a README:

```bash
curl -X POST http://localhost:3000/api/generate/readme \
  -H "Content-Type: application/json" \
  -d '{"username":"octocat","locale":"en-US"}'
```

Export a GitHub Pages ZIP:

```bash
curl -X POST "http://localhost:3000/api/export/pages?format=zip" \
  -H "Content-Type: application/json" \
  -d '{"username":"octocat","locale":"en-US"}' \
  --output github-pages.zip
```

Render a dynamic SVG card:

```bash
curl "http://localhost:3000/api/cards/stats?user=octocat&format=svg&locale=en-US"
```

Check service health:

```bash
curl http://localhost:3000/api/health
```

## Monorepo

```text
apps/
  web/        Next.js UI and API routes
  worker/     scheduled jobs and maintenance worker
packages/
  core/       domain types, validation, i18n, privacy, themes, errors
  github/     GitHub REST and GraphQL clients, detection, OAuth, deploy plans
  generators/ README, Pages, Actions, import, export, maintenance engines
  cards/      SVG, PNG, JSON card rendering
  achievements/ rule engine and achievement embeds
  db/         Prisma schema and database client
scripts/
  acceptance-matrix.ts
  acceptance-report.ts
  build-github-pages.ts
sites/
  github-pages/ static browser-only generator for GitHub Pages
```

## Quality Gates

Run the same gates used for final verification:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
npm run pages:build
npm run acceptance:report
```

Current verified status:

- `npm run lint`: passing
- `npm run test`: passing, 39 files and 104 tests
- `npm run typecheck`: passing across all workspaces
- `npm run build`: passing, 68 Next.js routes
- `npm run pages:build`: passing, static GitHub Pages artifact generated
- `npm run acceptance:report`: 395/395 passing with evidence

## Acceptance

The product is implemented against the uploaded complete requirements and acceptance checklist. The generated report is available at [`acceptance-report.md`](acceptance-report.md).

The checklist status model is strict:

- `未开始`
- `开发中`
- `待验收`
- `通过`
- `不通过`
- `阻塞`

Final delivery requires every non-optional checklist item to be marked `通过` with concrete evidence. The current final-version report has 395 passing items and 0 pending, failed, or blocked items.

## Branches

- `v1`: verified first release snapshot.
- `main`: default branch and final-version development line.

## Security Notes

- Private GitHub data is never displayed by default.
- Tokens are encrypted server-side with AES-256-GCM.
- OAuth write operations require explicit user authorization.
- Deployment routes return preview plans unless a valid encrypted OAuth token is available.
- Markdown and HTML generation paths include injection safeguards and external asset validation.

## Project Philosophy

GitHub Profile Studio is not a snippet generator and not an MVP shell. It is designed as a complete profile operating system: import, generate, preview, personalize, deploy, measure, maintain, and safely evolve a developer's public GitHub presence over time.
