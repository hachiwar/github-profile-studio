# GitHub Profile Studio Acceptance Report

Generated at: 2026-06-02T00:42:29.902Z

Matrix generated at: 2026-06-01T14:16:30.958Z

Evidence generated at: 2026-06-02T00:42:21.998Z

Passed items with evidence: 131

## Status Summary

| Status | Count |
| --- | ---: |
| 未开始 | 241 |
| 开发中 | 0 |
| 待验收 | 23 |
| 通过 | 131 |
| 不通过 | 0 |
| 阻塞 | 0 |

## Verification Commands

| Kind | Reference | Note |
| --- | --- | --- |
| log | `npm.cmd run typecheck` | Workspace TypeScript typecheck passes after automation, maintenance, growth, and admin API additions. |
| log | `npm.cmd run test` | Vitest suite passes: 20 files, 56 tests, including maintenance generators and worker queue plans. |
| log | `npm.cmd run build` | Production build passes and lists the new automation, growth, and admin API routes. |
| api-response | `POST http://127.0.0.1:3000/api/export/readme` | Local smoke test returned a README export package for octocat. |
| api-response | `POST http://127.0.0.1:3000/api/export/pages?format=zip` | Local smoke test returned status=200 and an 8083 byte ZIP package. |
| api-response | `GET http://127.0.0.1:3000/api/github/languages?username=octocat` | Local smoke test returned real GitHub language data, cache metadata, and rate limit metadata. |
| api-response | `GET http://127.0.0.1:3000/api/cards/stats?user=octocat&format=json&include=stars,forks&hide_border=true&width=720&height=260&cache_seconds=120` | Local smoke test returned card JSON with real GitHub dataset, parameters, embeds, cache metadata, and rate limit metadata. |
| api-response | `GET http://127.0.0.1:3000/api/cards/stats?...format=svg` | Local smoke test returned svg_status=200 and 1283 bytes. |
| api-response | `GET http://127.0.0.1:3000/api/cards/stats?...format=png` | Local smoke test returned png_status=200 and 10305 bytes. |
| api-response | `GET http://127.0.0.1:3000/pricing` | Local smoke test returned pricing_status=200. |
| api-response | `GET http://127.0.0.1:3000/api/oauth/github?format=json` | Local smoke test returned OAuth setup status with a clear 501 when GitHub OAuth env vars are absent. |
| api-response | `GET http://127.0.0.1:3000/api/oauth/github/session` | Local smoke test returned oauth_session_status=200. |
| api-response | `POST http://127.0.0.1:3000/api/deploy/github/execute` | Local smoke test returned deploy_execute_status=200 with OAuth-gated deployment operations. |
| api-response | `POST http://127.0.0.1:3000/api/deploy/github/pages` | Local smoke test returned pages_enable_status=200. |
| api-response | `POST http://127.0.0.1:3000/api/deploy/github/rollback` | Local smoke test returned rollback_status=200. |
| api-response | `GET http://127.0.0.1:3010/api/automation/jobs?username=octocat` | Local smoke test returned status=200 with 11-001, 11-002, 11-003, 11-004, 11-005, and 11-007 acceptance IDs. |
| api-response | `POST http://127.0.0.1:3010/api/automation/run` | Local smoke test returned status=200 with generated README, Pages data, snapshots, achievements, year review, card cache, ranking, workflow, and N-GROW outputs. |
| api-response | `GET http://127.0.0.1:3010/api/growth/recommendations?username=octocat&locale=en-US` | Local smoke test returned status=200 with all N-GROW-001 through N-GROW-010 recommendations. |
| api-response | `GET http://127.0.0.1:3010/api/admin/metrics` | Local smoke test returned status=200 with product, generation, GitHub API, deployment, automation, template, card, and locale metrics. |
| api-response | `GET http://127.0.0.1:3010/api/admin/cache` | Local smoke test returned status=200 with cache snapshot and stale/fallback cache policy. |
| api-response | `GET http://127.0.0.1:3010/api/admin/queues?username=octocat` | Local smoke test returned status=200 with ready queue plans for scheduled maintenance jobs. |
| api-response | `GET http://127.0.0.1:3010/api/admin/errors` | Local smoke test returned status=200 with structured error catalog and notification settings. |

## Full Checklist Matrix

| ID | Status | Requirement refs | Title | Evidence |
| --- | --- | --- | --- | --- |
| 01-001 | 未开始 |  | 产品可以生成 GitHub Profile README |  |
| 01-002 | 未开始 |  | 未登录用户可以输入 username、查看公开数据、生成 |  |
| 01-003 | 未开始 |  | 登录用户可以保存配置、提交仓库、创建仓库、创建 Acti |  |
| 01-004 | 未开始 |  | README Markdown、SVG 卡片、HTML |  |
| 01-005 | 未开始 |  | 从 username 输入、数据读取、编辑预览、导出、提 |  |
| 01-006 | 未开始 |  | 完整需求中的所有功能均已实现，不保留 MVP 缺口 |  |
| 02-001 | 通过 | 4.1 | username 输入 | test: packages/github/src/parse.test.ts (Valid username parsing is covered.)<br>file: packages/github/src/parse.ts (Username pattern rejects invalid GitHub names.) |
| 02-002 | 通过 | 4.1 | GitHub Profile URL 自动提取 user | test: packages/github/src/parse.test.ts (GitHub profile URL to username extraction is covered.) |
| 02-003 | 通过 | 4.1 | 仓库 URL 自动识别 owner 与 repo | test: packages/github/src/parse.test.ts (Repository URL owner/repo parsing is covered.) |
| 02-004 | 待验收 | 4.1.2 | 用户存在检测 | file: packages/github/src/client.ts (GitHubClient.getUser and detect implement public user existence checks.)<br>api-response: apps/web/app/api/github/user/route.ts (User API route is implemented.) |
| 02-005 | 未开始 |  | User 与 Organization 区分 |  |
| 02-006 | 待验收 | 4.1.2 | 头像、名称、bio、company、location、b | test: packages/github/src/normalize.test.ts (GitHub user profile normalization covers identity and contact fields.)<br>file: packages/github/src/normalize.ts (Avatar, name, bio, company, location, blog, and email fields are normalized.) |
| 02-007 | 通过 | 4.1.2 | followers、following、public r | test: packages/github/src/normalize.test.ts (followers, following, public repos, and public gists are normalized.) |
| 02-008 | 通过 | 4.1.2 | account age 计算 | test: packages/github/src/normalize.test.ts (Account age days and years are calculated from created_at.)<br>api-response: GET http://127.0.0.1:3000/api/cards/stats?format=json (Local card JSON smoke response included accountAgeDays and accountAgeYears for octocat.) |
| 02-009 | 待验收 | 4.1.3 | `username` 仓库检测 | file: packages/github/src/client.ts (detectRepository checks whether the username repository exists.) |
| 02-010 | 待验收 | 4.1.3 | `username` 仓库 public 检测 | file: packages/github/src/client.ts (detectRepository returns isPublic for target repositories.) |
| 02-011 | 待验收 | 4.1.3 | `username` README 检测 | file: packages/github/src/client.ts (detectRepository checks README presence.) |
| 02-012 | 待验收 | 4.1.3 | `username.github.io` 仓库检测 | file: packages/github/src/client.ts (detectRepository checks the username.github.io repository.) |
| 02-013 | 待验收 | 4.1.3 | GitHub Pages 是否启用检测 | api-response: apps/web/app/api/github/pages-status/route.ts (Pages status API route exists.)<br>file: packages/github/src/client.ts (GitHub Pages source branch, path, and URL are captured when available.) |
| 02-014 | 待验收 | 4.1.3 | Pages 发布分支与目录检测 | file: packages/github/src/client.ts (GitHub Pages source branch and path are captured when the API returns Pages metadata.) |
| 02-015 | 未开始 |  | 检测结果状态卡片 |  |
| 02-016 | 待验收 | 4.1.4 | 根据检测结果推荐下一步操作 | file: packages/github/src/client.ts (Detection result includes recommended mode and nextActions.) |
| 03-001 | 待验收 | 4.2.2 | 用户基础数据完整采集 | api-response: apps/web/app/api/github/repos/route.ts (Repository list API route exists.)<br>file: packages/github/src/normalize.ts (Repository response normalization covers core repository fields.) |
| 03-002 | 未开始 |  | 仓库列表完整获取 |  |
| 03-003 | 通过 | 4.2.2 | 仓库 description、homepage、lang | test: packages/github/src/normalize.test.ts (Repository description, homepage, language, topics, and license normalization is tested.) |
| 03-004 | 未开始 |  | 仓库 created、updated、pushed、si |  |
| 03-005 | 通过 | 4.2.2 | 仓库 star、fork、watcher、subscri | test: packages/github/src/normalize.test.ts (Star, fork, watcher, subscriber, and open issue normalization is tested.) |
| 03-006 | 未开始 |  | 正确区分 starred 用户数与真正 watchers |  |
| 03-007 | 未开始 |  | 仓库 archived、fork、template、vi |  |
| 03-008 | 未开始 |  | release、latest release、relea |  |
| 03-009 | 待验收 | 4.2.2 | contributors、repo languages、 | file: packages/github/src/client.ts (Repository enrichment fetches contributors, languages, releases, release downloads, and README summary for top public repositories.) |
| 03-010 | 通过 | 4.2.3 | 总贡献、最近一年贡献、每日贡献获取 | test: packages/github/src/stats.test.ts (Contribution totals and yearly heatmap generation are tested.)<br>file: packages/github/src/client.ts (GraphQL contribution collection is used when a GitHub token is available, with deterministic fallback otherwise.) |
| 03-011 | 未开始 |  | 当前 streak 与最长 streak 计算 |  |
| 03-012 | 未开始 |  | commit、issue、PR、review contr |  |
| 03-013 | 未开始 |  | monthly、weekly、hourly contri |  |
| 03-014 | 通过 | 4.2.3 | 贡献热力图数据生成 | test: packages/github/src/stats.test.ts (Contribution heatmap levels are tested.) |
| 03-015 | 未开始 |  | 总 Star、仓库 Star 排名、7/30/90/36 |  |
| 03-016 | 未开始 |  | 仓库 Star 曲线、用户总 Star 曲线、增长最快仓 |  |
| 03-017 | 通过 |  | 首次使用前 Star 历史尽量回溯，首次使用后快照记录 | test: packages/generators/src/maintenance.test.ts (Covers best-effort star history backfill from repository creation date plus scheduled star snapshots.)<br>file: packages/generators/src/maintenance.ts (createStarHistoryBackfill and star-snapshot maintenance files generate first-use history and ongoing snapshots.) |
| 03-018 | 未开始 |  | 总 Fork、Fork 排名、最近一年新增 Fork、F |  |
| 03-019 | 未开始 |  | 社区影响力评分生成 |  |
| 03-020 | 未开始 |  | PR 总数、merged PR、closed PR、re |  |
| 03-021 | 未开始 |  | issue 总数、closed issue、最近一年 i |  |
| 03-022 | 通过 | 4.2.6 | PR 合并率、Issue 关闭率、外部贡献仓库和组织数计 | test: packages/github/src/stats.test.ts (Dataset construction includes PR merge rate, issue close rate, external repositories, and organizations.) |
| 03-023 | 通过 | 4.2.7 | 主语言分布、代码字节语言分布、最近一年语言分布计算 | test: packages/github/src/stats.test.ts (Main language, byte language, and recent-year language distributions are tested.) |
| 03-024 | 通过 | 4.2.7 | Star/Fork 加权语言分布计算 | test: packages/github/src/stats.test.ts (Star-weighted and fork-weighted language distributions are tested.) |
| 03-025 | 未开始 |  | topics、README、package 文件技术栈识 |  |
| 03-026 | 未开始 |  | 前端、后端、数据库、DevOps、测试、云服务识别 |  |
| 04-001 | 未开始 |  | 模块面板、编辑区域、实时预览、Markdown 源码视图 |  |
| 04-002 | 未开始 |  | 结构视图、拖拽排序、模块开关、复制、删除可用 |  |
| 04-003 | 未开始 |  | 每个模块可配置参数，整体主题可配置 |  |
| 04-004 | 未开始 |  | GitHub 风格预览、深色/浅色预览可用 |  |
| 04-005 | 未开始 |  | 导入现有 README、Markdown 格式化、兼容性 |  |
| 04-006 | 通过 | 4.3.2 | 个人介绍模块完整 | test: packages/generators/src/readme.test.ts (README intro module renders welcome, role, status, and GitHub link.) |
| 04-007 | 通过 | 4.3.2 | GitHub 总览模块完整 | test: packages/generators/src/readme.test.ts (GitHub overview module renders contributions, commits, PRs, issues, stars, forks, followers, account age, and impact score.) |
| 04-008 | 通过 | 4.3.2 | Streak 模块完整 | test: packages/generators/src/readme.test.ts (GitHub streak module renders streak card and current/longest streak metrics.) |
| 04-009 | 通过 | 4.3.2 | 贡献热力图模块完整 | test: packages/generators/src/readme.test.ts (Contribution calendar module renders dynamic card link and level summary.) |
| 04-010 | 通过 | 4.3.2 | 语言统计模块完整 | test: packages/generators/src/readme.test.ts (Language stats module renders top language card and byte percentages.) |
| 04-011 | 通过 | 4.3.2 | 热门仓库模块完整 | test: packages/generators/src/readme.test.ts (Projects module renders manual projects and top public repositories.) |
| 04-012 | 通过 | 4.3.2 | Star 增长模块完整 | test: packages/generators/src/readme.test.ts (Star growth module renders star-growth card and top starred repositories.) |
| 04-013 | 通过 | 4.3.2 | PR / Issue 模块完整 | test: packages/generators/src/readme.test.ts (PR / Issue collaboration module renders PR, review, issue, close-rate, and external repository stats.) |
| 04-014 | 通过 | 4.3.2 | 技术栈模块完整 | test: packages/generators/src/readme.test.ts (Tech stack module renders badges and primary skill status.) |
| 04-015 | 通过 | 4.3.2, 4.4.2 | 成就墙模块完整 | test: packages/generators/src/readme.test.ts (Achievement wall module renders achievement card embed.)<br>test: packages/generators/src/pages.test.ts (Pages site includes achievement wall section.) |
| 04-016 | 通过 | 4.3.2 | 社交与联系模块完整 | test: packages/generators/src/readme.test.ts (Social/contact module renders visible social links.) |
| 04-017 | 通过 | 4.3.2 | 博客文章模块完整 | test: packages/generators/src/readme.test.ts (Blog module renders blog link or RSS-ready placeholder.) |
| 04-018 | 通过 | 4.3.2 | 访客统计模块完整 | test: packages/generators/src/readme.test.ts (Visitor stats module renders profile view badge.) |
| 04-019 | 通过 | 4.3.2 | 自定义模块完整 | test: packages/generators/src/readme.test.ts (Custom Markdown module renders guarded custom content block.) |
| 04-020 | 待验收 | 4.3.4 | 复制完整 Markdown 可用 | file: apps/web/app/api/generate/readme/route.ts (README generation API returns full Markdown; browser copy interaction still needs E2E verification.) |
| 04-021 | 未开始 |  | 下载 README.md 可用 |  |
| 04-022 | 未开始 |  | 复制单模块 Markdown 和动态卡片链接可用 |  |
| 04-023 | 未开始 |  | OAuth 提交到 `username` 仓库可用 |  |
| 04-024 | 未开始 |  | 提交前 diff、旧 README 备份、回滚可用 |  |
| 04-025 | 未开始 |  | README 自动更新 workflow 生成可用 |  |
| 05-001 | 未开始 |  | 单页个人主页、开源成就墙、作品集、技术简历、数据仪表盘、 |  |
| 05-002 | 通过 | 4.4.2 | Hero、简介、统计、热力图、Star 趋势、热门仓库、 | test: packages/generators/src/pages.test.ts (Pages site renders Hero, profile, GitHub data, project, timeline, blog, achievement, and contact sections.) |
| 05-003 | 通过 | 4.4.2 | 主题切换、语言切换、返回顶部可用 | test: packages/generators/src/pages.test.ts (Theme toggle, language toggle, and back-to-top controls are generated and wired in script.js.) |
| 05-004 | 未开始 |  | 响应式设计通过手机、平板、桌面测试 |  |
| 05-005 | 通过 | 4.4.3 | 深色、浅色、系统主题跟随可用 | test: packages/generators/src/pages.test.ts (Generated CSS and script support light/dark theme switching.) |
| 05-006 | 未开始 |  | 自定义主色、字体、背景、动画可用 |  |
| 05-007 | 未开始 |  | 内置 15 套页面模板可用 |  |
| 05-008 | 未开始 |  | 复制 HTML、下载完整静态站点可用 |  |
| 05-009 | 通过 | 4.4.5 | 导出 index.html、style.css、scri | test: packages/generators/src/export-package.test.ts (Pages export package includes index.html, CSS, JS, 404, sitemap, robots, and workflow files.) |
| 05-010 | 通过 | 4.4.5 | GitHub Pages 部署说明生成可用 | test: packages/generators/src/export-package.test.ts (Pages deployment instructions are generated.) |
| 05-011 | 未开始 |  | OAuth 提交到 `username.github.i |  |
| 05-012 | 未开始 |  | 自动启用 Pages 或配置发布源可用 |  |
| 05-013 | 未开始 |  | 提交前 diff 与回滚可用 |  |
| 06-001 | 通过 | 4.5 | Profile Overview Card 可用 | test: packages/cards/src/render.test.ts (Card catalog renders every card type, including Profile Overview Card.) |
| 06-002 | 通过 | 4.5 | GitHub Stats Card 可用 | test: packages/cards/src/render.test.ts (GitHub Stats Card renders and supports the stats alias.)<br>api-response: GET http://127.0.0.1:3000/api/cards/stats?format=json (Local smoke test returned GitHub Stats Card JSON.) |
| 06-003 | 通过 | 4.5 | GitHub Streak Card 可用 | test: packages/cards/src/render.test.ts (GitHub Streak Card renders and supports the streak alias.) |
| 06-004 | 通过 | 4.5 | Contribution Calendar Card 可 | test: packages/cards/src/render.test.ts (Contribution Calendar Card renders from the catalog.) |
| 06-005 | 通过 | 4.5 | Top Languages Card 可用 | test: packages/cards/src/render.test.ts (Top Languages Card renders and supports the languages alias.) |
| 06-006 | 通过 | 4.5 | Repository Card 可用 | test: packages/cards/src/render.test.ts (Repository Card renders and supports the repo alias.) |
| 06-007 | 通过 | 4.5 | Star Growth Card 可用 | test: packages/cards/src/render.test.ts (Star Growth Card renders from the catalog.) |
| 06-008 | 通过 | 4.5 | Fork Growth Card 可用 | test: packages/cards/src/render.test.ts (Fork Growth Card renders from the catalog.) |
| 06-009 | 通过 | 4.5 | PR / Issue Card 可用 | test: packages/cards/src/render.test.ts (PR / Issue Card renders from the catalog.) |
| 06-010 | 通过 | 4.5 | Achievement Card 可用 | test: packages/cards/src/render.test.ts (Achievement Card renders and supports the achievements alias.) |
| 06-011 | 通过 | 4.5 | Trophy Card 可用 | test: packages/cards/src/render.test.ts (Trophy Card renders from the catalog.) |
| 06-012 | 通过 | 4.5 | Tech Stack Card 可用 | test: packages/cards/src/render.test.ts (Tech Stack Card renders from the catalog.) |
| 06-013 | 通过 | 4.5 | Activity Graph Card 可用 | test: packages/cards/src/render.test.ts (Activity Graph Card renders from the catalog.) |
| 06-014 | 通过 | 4.5 | Repo Ranking Card 可用 | test: packages/cards/src/render.test.ts (Repo Ranking Card renders from the catalog.) |
| 06-015 | 通过 | 4.5 | Followers Card 可用 | test: packages/cards/src/render.test.ts (Followers Card renders from the catalog.) |
| 06-016 | 通过 | 4.5 | Account Age Card 可用 | test: packages/cards/src/render.test.ts (Account Age Card renders from the catalog and profile data includes account age.) |
| 06-017 | 通过 | 4.5 | Open Source Impact Card 可用 | test: packages/cards/src/render.test.ts (Open Source Impact Card renders from the catalog.) |
| 06-018 | 通过 | 4.5 | Year in Review Card 可用 | test: packages/cards/src/render.test.ts (Year in Review Card renders from the catalog.) |
| 06-019 | 通过 | 4.5 | Monthly Activity Card 可用 | test: packages/cards/src/render.test.ts (Monthly Activity Card renders from the catalog.) |
| 06-020 | 通过 | 4.5 | Custom Composite Card 可用 | test: packages/cards/src/render.test.ts (Custom Composite Card renders from the catalog.) |
| 06-021 | 通过 | 4.5.2 | 所有卡片支持 user、theme、layout、hid | test: packages/cards/src/render.test.ts (Card rendering supports width, height, hide_border, bg_color, title_color, include, and icons.)<br>api-response: GET http://127.0.0.1:3000/api/cards/stats?format=json&include=stars,forks&hide_border=true&width=720&height=260&cache_seconds=120 (Local smoke test verified parameter parsing and JSON echo for card API.) |
| 06-022 | 通过 | 4.5.3 | 支持 SVG、PNG、JSON 输出 | api-response: GET http://127.0.0.1:3000/api/cards/stats?format=json (JSON output returned 200.)<br>api-response: GET http://127.0.0.1:3000/api/cards/stats?format=svg (SVG output returned 200 and 1283 bytes.)<br>api-response: GET http://127.0.0.1:3000/api/cards/stats?format=png (PNG output returned 200 and 10305 bytes.) |
| 06-023 | 通过 | 4.5.4 | 支持复制 Markdown 图片链接、HTML img、 | test: packages/cards/src/embeds.test.ts (Markdown image link, HTML img, iframe, and URL variants are generated.)<br>api-response: GET http://127.0.0.1:3000/api/cards/stats?format=json (JSON smoke response includes embeds for markdown and HTML.) |
| 06-024 | 未开始 |  | 支持下载图片 |  |
| 06-025 | 通过 | 4.5.4 | 卡片在 GitHub README 中可正常显示 | test: packages/cards/src/embeds.test.ts (README badge/card embed markdown generation is tested.) |
| 06-026 | 未开始 |  | 卡片生成器支持类型选择、参数调整、实时预览、复制、下载、 |  |
| 07-001 | 通过 | 4.6.1 | 贡献类、Star 类、Fork 类、PR 类、Issue | test: packages/achievements/src/index.test.ts (Achievement category catalog covers the required categories.) |
| 07-002 | 未开始 |  | First Commit、Weekly Builder、 |  |
| 07-003 | 未开始 |  | First Star、Star Collector、St |  |
| 07-004 | 未开始 |  | First PR、PR Hero、Review Help |  |
| 07-005 | 通过 | 4.6.2 | First Repo、Repo Builder、Mult | test: packages/achievements/src/index.test.ts (Repository achievement rules are evaluated against the demo dataset.) |
| 07-006 | 未开始 |  | 每个成就有名称、图标、描述、解锁状态、解锁时间、当前进度 |  |
| 07-007 | 未开始 |  | 成就可分享、可嵌入 README、可嵌入 Pages、可 |  |
| 08-001 | 未开始 |  | 可粘贴 README Markdown |  |
| 08-002 | 未开始 |  | 可上传 README.md |  |
| 08-003 | 未开始 |  | 可通过仓库 URL 读取 README |  |
| 08-004 | 未开始 |  | 可通过 OAuth 读取自己的 README |  |
| 08-005 | 未开始 |  | 可读取 `username` 仓库 README |  |
| 08-006 | 未开始 |  | 可读取任意公开仓库 README |  |
| 08-007 | 通过 | 4.7.2 | 可识别标题、个人介绍、badge、stats、strea | test: packages/generators/src/import-readme.test.ts (README import recognizes headings, badges, stats, streaks, languages, trophy, activity graph, images, tables, comments, and workflow markers.) |
| 08-008 | 通过 | 4.7.3 | 可解析 GitHub Readme Stats、GitH | test: packages/generators/src/import-readme.test.ts (Third-party card provider parsing is covered.) |
| 08-009 | 未开始 |  | 可提供样式统一建议、重复模块提示、失效链接检测、图片加载 |  |
| 08-010 | 未开始 |  | 优化后保留用户自定义内容 |  |
| 08-011 | 未开始 |  | 可展示新旧版本差异并导出新版 README |  |
| 09-001 | 未开始 |  | README、Pages、卡片、成就墙、项目展示、简历、 |  |
| 09-002 | 待验收 | 4.8.2 | 内置 GitHub Native、Minimal Lig | file: packages/core/src/templates.ts (Theme/template registries define the built-in style catalog.) |
| 09-003 | 未开始 |  | 可自定义主色、辅色、背景、文本、边框、图标、字体、圆角、 |  |
| 09-004 | 未开始 |  | 可保存主题、导入主题 JSON、导出主题 JSON、分享 |  |
| 09-005 | 未开始 |  | 主题可应用到 README、Pages、卡片 |  |
| 10-001 | 待验收 | 4.9.1 | GitHub OAuth 登录可用 | test: packages/github/src/oauth.test.ts (OAuth authorization URL, state, token exchange, and token encryption helpers are tested.)<br>api-response: GET http://127.0.0.1:3000/api/oauth/github?format=json (OAuth start route exists and returns explicit setup status when env vars are absent; live OAuth requires configured GitHub app.) |
| 10-002 | 通过 | 4.9.2 | 授权前明确展示权限且使用最小权限 | api-response: apps/web/app/api/oauth/github/permissions/route.ts (Permissions route lists minimal required scopes and logged-in/logged-out capabilities.)<br>file: packages/github/src/oauth.ts (minimumOAuthScopes uses read:user, public_repo, and workflow.) |
| 10-003 | 未开始 |  | 登录后可识别当前用户和仓库列表 |  |
| 10-004 | 通过 | 4.9.2 | 未授权只提供复制和下载，授权后提供一键提交 | api-response: GET http://127.0.0.1:3000/api/oauth/github/session (Session route exposes logged-out generate/copy/download/public-card capabilities and logged-in write capabilities.) |
| 10-005 | 待验收 | 4.9.2, 8 | 支持退出登录、撤销授权提示、Token 加密、Token | test: packages/github/src/oauth.test.ts (GitHub token encryption uses AES-256-GCM.)<br>file: apps/web/app/api/oauth/github/logout/route.ts (Logout route clears the HttpOnly token cookie; revocation UX still needs browser verification.) |
| 10-006 | 未开始 |  | 可创建 `username` 仓库 |  |
| 10-007 | 未开始 |  | 可创建 `username.github.io` 仓库 |  |
| 10-008 | 未开始 |  | 可更新 README、index.html、CSS、JS |  |
| 10-009 | 待验收 | 4.9.3 | 可创建 commit 和 pull request | test: packages/github/src/deploy.test.ts (Deployment plan covers commits, PRs, backups, rollback, diff, and logs; live OAuth write flow still needs integration verification.) |
| 10-010 | 通过 | 4.9.3 | 支持直接提交和 PR 模式 | test: packages/github/src/deploy.test.ts (Deployment plans support pull-request and direct-commit modes.) |
| 10-011 | 待验收 | 4.9.3 | 支持冲突检测、提交前 diff、旧文件备份、回滚、失败重 | test: packages/github/src/deploy.test.ts (Diff, backup labels, rollback plan, and deployment logs are modeled; live conflict/retry behavior needs integration verification.)<br>api-response: POST http://127.0.0.1:3000/api/deploy/github/rollback (Rollback preview route returned 200.) |
| 11-001 | 通过 |  | 可自动更新 README 动态数据 | test: packages/generators/src/maintenance.test.ts (Full maintenance run writes README.md for dynamic README refresh.)<br>api-response: POST /api/automation/run (Automation run route exposes README refresh output in the generated file plan.) |
| 11-002 | 通过 |  | 可自动更新 Pages 静态 JSON | test: packages/generators/src/maintenance.test.ts (Full maintenance run writes data/github.json for GitHub Pages static JSON refresh.)<br>api-response: POST /api/automation/run (Automation run route exposes Pages data refresh output.) |
| 11-003 | 通过 |  | 可记录 Star 与 Fork 快照 | test: packages/generators/src/maintenance.test.ts (Full maintenance run writes star and fork snapshot JSON files.)<br>test: apps/worker/src/jobs.test.ts (Worker queue creates dedicated star snapshot operations with acceptance IDs.) |
| 11-004 | 通过 |  | 可更新贡献统计、博客文章、成就状态、年度总结、SVG 卡 | test: packages/generators/src/maintenance.test.ts (Full maintenance run writes contribution, blog, achievement, annual summary, card cache, and project ranking outputs.)<br>api-response: GET /api/admin/queues (Admin queue route reports modules and operations for contribution, blog, achievements, annual summary, card cache, ranking, and errors.) |
| 11-005 | 通过 |  | 可生成每日更新、每周更新、手动触发 workflow | test: packages/generators/src/actions.test.ts (Default workflow configs generate daily, weekly, and manual GitHub Actions triggers.)<br>test: apps/worker/src/jobs.test.ts (Worker queue maps scheduled jobs to executable maintenance operations.) |
| 11-006 | 通过 | 4.10.2 | 可生成 README、Pages、Blog、成就、Sta | test: packages/generators/src/actions.test.ts (README, Pages data, blog, achievements, star snapshot, cache cleanup, and error notification workflow modules are generated.) |
| 11-007 | 通过 |  | 用户可配置更新时间、更新频率、更新模块、commit m | test: packages/generators/src/maintenance.test.ts (Maintenance run writes configurable workflow YAML with frequency, modules, target branch, and commit message.)<br>file: apps/web/app/api/automation/_shared.ts (Automation request parser accepts cron, frequency, modules, targetBranch, and commitMessage overrides.) |
| 12-001 | 未开始 |  | 首页包含产品标题、一句话介绍、username 输入框、 |  |
| 12-002 | 未开始 |  | 工作台包含顶部导航、当前 username、当前目标类型 |  |
| 12-003 | 未开始 |  | 预览支持 README、GitHub Profile、P |  |
| 12-004 | 未开始 |  | 导出界面支持复制 Markdown、HTML、卡片 UR |  |
| 13-001 | 待验收 | 6 | 支持中文和英文界面 | file: packages/core/src/language.ts (Core locale model supports English, Chinese, and bilingual output.) |
| 13-002 | 未开始 |  | README、卡片、成就可选择语言 |  |
| 13-003 | 未开始 |  | 日期、数字、时区可本地化 |  |
| 13-004 | 未开始 |  | 用户可自定义模板文案 |  |
| 13-005 | 通过 | 7 | GitHub API、SVG 卡片、仓库统计、贡献数据均 | test: packages/github/src/cache.test.ts (GitHub API data cache hit, stale cache, and fallback behavior are tested.)<br>file: packages/github/src/cache.ts (In-memory TTL cache includes stale windows and degraded metadata.) |
| 13-006 | 通过 | 7 | 支持手动刷新、缓存过期、队列、rate limit 提示 | test: packages/github/src/cache.test.ts (Manual refresh and stale fallback paths are represented by force refresh and stale cache behavior.)<br>api-response: apps/web/app/api/github/_shared.ts (GitHub dataset routes support refresh=true and return cache/rateLimit metadata.) |
| 13-007 | 未开始 |  | 首页、编辑器、图表、模板、预览、图片、SVG、移动端性能 |  |
| 13-008 | 未开始 |  | 默认只读公开数据，私有数据不默认展示 |  |
| 13-009 | 通过 | 8 | Token 加密，前端不暴露敏感 token | test: packages/github/src/oauth.test.ts (OAuth token encryption/decryption is tested with AES-GCM.)<br>file: apps/web/app/api/oauth/github/callback/route.ts (Callback route encrypts the GitHub access token before HttpOnly cookie storage and never returns the raw token.) |
| 13-010 | 未开始 |  | 用户可删除保存配置并撤销授权 |  |
| 13-011 | 未开始 |  | 具备 XSS、Markdown 注入、HTML 注入、自 |  |
| 13-012 | 未开始 |  | username 不存在、API 限制、网络失败、仓库不 |  |
| 14-001 | 待验收 | 9 | UserProfile、Repository、Contr | file: packages/core/src/domain.ts (UserProfile, Repository, ContributionStats, RepositoryTrend, Achievement, GeneratedReadme, Theme-related config, and PageSiteBundle models exist.)<br>test: packages/github/src/stats.test.ts (Public dataset construction exercises the data model.) |
| 14-002 | 通过 | 10.1 | 公共页面路由 `/`、`/generate`、`/tem | file: apps/web/app/pricing/page.tsx (Pricing public page has been added.)<br>api-response: GET http://127.0.0.1:3000/pricing (Local smoke test returned pricing_status=200.)<br>log: npm.cmd run build (Build output includes /, /generate, /templates, /cards, /achievements, /docs, /examples, /pricing, /login, /privacy, and /terms.) |
| 14-003 | 未开始 |  | 工作台路由 `/dashboard`、`/dashboa |  |
| 14-004 | 待验收 | 10.3 | GitHub、cards、generate、import | file: apps/web/app/api/github/contributions/route.ts (GitHub contributions API route exists.)<br>file: apps/web/app/api/github/stars/route.ts (GitHub stars API route exists.)<br>file: apps/web/app/api/github/forks/route.ts (GitHub forks API route exists.)<br>file: apps/web/app/api/github/issues/route.ts (GitHub issues API route exists.)<br>file: apps/web/app/api/github/pulls/route.ts (GitHub pulls API route exists.)<br>file: apps/web/app/api/github/languages/route.ts (GitHub languages API route exists.)<br>file: apps/web/app/api/export/readme/route.ts (README export API route exists.)<br>file: apps/web/app/api/export/pages/route.ts (Pages export API route exists.)<br>file: apps/web/app/api/oauth/github/route.ts (GitHub OAuth start API route exists.)<br>file: apps/web/app/api/oauth/github/callback/route.ts (GitHub OAuth callback API route exists.)<br>file: apps/web/app/api/deploy/github/execute/route.ts (GitHub deploy execute API route exists.)<br>file: apps/web/app/api/deploy/github/pages/route.ts (GitHub Pages enablement API route exists.)<br>file: apps/web/app/api/deploy/github/rollback/route.ts (GitHub rollback API route exists.) |
| 14-005 | 通过 | 13.1 | README 导出包包含 README.md、asset | test: packages/generators/src/export-package.test.ts (README export package includes README.md, update workflow, and profile-studio.config.json.) |
| 14-006 | 通过 | 13.2 | Pages 导出包包含 index.html、style | test: packages/generators/src/export-package.test.ts (Pages export package includes index.html, style.css, script.js, data/github.json, README.md, 404.html, robots.txt, sitemap.xml, and update-pages workflow.) |
| 14-007 | 未开始 |  | 配置导出包含模块配置、主题配置、卡片配置、成就配置、数据 |  |
| 15-001 | 未开始 |  | 未登录用户输入 username 后可查看公开数据、生成 |  |
| 15-002 | 未开始 |  | 登录用户可 GitHub OAuth 登录、检测仓库、创 |  |
| 15-003 | 未开始 |  | 用户可导入旧 README、识别模块、获得优化建议、统一 |  |
| 15-004 | 未开始 |  | 系统可根据真实 GitHub 数据计算成就、展示已解锁和 |  |
| N-ENTRY-001 | 未开始 |  | 新用户模式识别 |  |
| N-ENTRY-002 | 通过 | 13A.2 | 新用户模式推荐 | test: packages/core/src/new-user.test.ts (Low GitHub data triggers new-user mode recommendation.) |
| N-ENTRY-003 | 未开始 |  | 手动选择模式 |  |
| N-ENTRY-004 | 未开始 |  | 混合模式 |  |
| N-ENTRY-005 | 未开始 |  | 数据增强模式切换 |  |
| N-ENTRY-006 | 未开始 |  | 空数据友好提示 |  |
| N-FORM-001 | 未开始 |  | 基础信息 |  |
| N-FORM-002 | 未开始 |  | 教育背景 |  |
| N-FORM-003 | 未开始 |  | 学习方向 |  |
| N-FORM-004 | 未开始 |  | 编程语言 |  |
| N-FORM-005 | 未开始 |  | 语言熟练度 |  |
| N-FORM-006 | 未开始 |  | 技能栈 |  |
| N-FORM-007 | 未开始 |  | 技能展示控制 |  |
| N-FORM-008 | 未开始 |  | 手动项目 |  |
| N-FORM-009 | 未开始 |  | 项目信息完整性 |  |
| N-FORM-010 | 未开始 |  | 学习计划 |  |
| N-FORM-011 | 未开始 |  | 个人亮点 |  |
| N-FORM-012 | 未开始 |  | 联系方式 |  |
| N-FORM-013 | 未开始 |  | 展示开关 |  |
| N-FORM-014 | 未开始 |  | 表单分步骤 |  |
| N-FORM-015 | 未开始 |  | 表单保存 |  |
| N-README-001 | 通过 | 13A.5 | 零贡献可生成 | test: packages/generators/src/readme.test.ts (New-user config generates a complete README without relying on live contribution data.) |
| N-README-002 | 通过 | 13A.5 | 零仓库可生成 | test: packages/generators/src/readme.test.ts (Zero-repository config still generates project and GitHub overview sections with replacement copy.) |
| N-README-003 | 通过 | 13A.5.1 | 顶部欢迎区 | test: packages/generators/src/readme.test.ts (README intro contains the top welcome area.) |
| N-README-004 | 通过 | 13A.5.1 | 当前身份展示 | test: packages/generators/src/readme.test.ts (README intro contains current role and status.) |
| N-README-005 | 通过 | 13A.5.1 | 教育背景展示 | test: packages/generators/src/readme.test.ts (Education module renders visible education records.) |
| N-README-006 | 通过 | 13A.5.1 | 学习方向展示 | test: packages/generators/src/readme.test.ts (Learning plan module renders current focus as learning direction.) |
| N-README-007 | 通过 | 13A.5.1 | 主要语言展示 | test: packages/generators/src/readme.test.ts (Languages module renders primary language information from GitHub or manual skills.) |
| N-README-008 | 通过 | 13A.5.1 | 技能栈展示 | test: packages/generators/src/readme.test.ts (Tech stack module renders skill badges and skill status.) |
| N-README-009 | 通过 | 13A.5.1 | 学习计划展示 | test: packages/generators/src/readme.test.ts (Learning plan module renders current focus and goals.) |
| N-README-010 | 通过 | 13A.5.1 | 项目作品展示 | test: packages/generators/src/readme.test.ts (Projects module renders manual projects and GitHub repositories.) |
| N-README-011 | 通过 | 13A.5.1 | 未来计划展示 | test: packages/generators/src/readme.test.ts (Learning plan module renders long-term direction and open-source plan.) |
| N-README-012 | 通过 | 13A.5.1 | 联系方式展示 | test: packages/generators/src/readme.test.ts (Contact module renders visible social/contact links.) |
| N-README-013 | 通过 | 13A.5.4 | 空数据替代 | test: packages/core/src/new-user.test.ts (New-user recommendations provide empty-data substitutes.) |
| N-README-014 | 通过 | 13A.5.4 | 隐藏空模块 | test: packages/generators/src/readme.test.ts (Zero-data README avoids undefined and uses replacement copy instead of empty modules.) |
| N-README-015 | 通过 | 13A.5.5 | 可选 GitHub 统计 | test: packages/generators/src/readme.test.ts (GitHub overview module is optional through enabledReadmeModules and renders when enabled.) |
| N-README-016 | 通过 | 13A.5.5 | 可选贡献热力图 | test: packages/generators/src/readme.test.ts (Contribution calendar module is optional through enabledReadmeModules and renders when enabled.) |
| N-README-017 | 通过 | 13A.5.5 | 可选访客统计 | test: packages/generators/src/readme.test.ts (Visitor stats module renders profile view badge when enabled.) |
| N-README-018 | 未开始 |  | 可选打字机动画 |  |
| N-README-019 | 未开始 |  | 实时预览 |  |
| N-README-020 | 未开始 |  | 复制 Markdown |  |
| N-README-021 | 未开始 |  | 下载 README |  |
| N-README-022 | 未开始 |  | 提交 username 仓库 |  |
| N-RT-001 | 未开始 |  | 学生开发者模板 |  |
| N-RT-002 | 未开始 |  | 计算机专业学生模板 |  |
| N-RT-003 | 未开始 |  | 非科班转码模板 |  |
| N-RT-004 | 未开始 |  | 前端学习者模板 |  |
| N-RT-005 | 未开始 |  | 后端学习者模板 |  |
| N-RT-006 | 未开始 |  | 全栈学习者模板 |  |
| N-RT-007 | 未开始 |  | AI / 数据科学模板 |  |
| N-RT-008 | 未开始 |  | 算法竞赛模板 |  |
| N-RT-009 | 未开始 |  | 求职准备模板 |  |
| N-RT-010 | 未开始 |  | 实习申请模板 |  |
| N-RT-011 | 未开始 |  | 课程项目模板 |  |
| N-RT-012 | 未开始 |  | 开源新人模板 |  |
| N-RT-013 | 未开始 |  | 极简个人介绍模板 |  |
| N-RT-014 | 未开始 |  | 技术简历模板 |  |
| N-RT-015 | 未开始 |  | 中英文双语模板 |  |
| N-TEXT-001 | 未开始 |  | 中文自我介绍 |  |
| N-TEXT-002 | 未开始 |  | 英文自我介绍 |  |
| N-TEXT-003 | 未开始 |  | 当前学习状态 |  |
| N-TEXT-004 | 未开始 |  | 教育背景文案 |  |
| N-TEXT-005 | 未开始 |  | 技能栈文案 |  |
| N-TEXT-006 | 未开始 |  | 项目介绍文案 |  |
| N-TEXT-007 | 未开始 |  | 学习目标文案 |  |
| N-TEXT-008 | 未开始 |  | 开源目标文案 |  |
| N-TEXT-009 | 未开始 |  | 求职目标文案 |  |
| N-TEXT-010 | 未开始 |  | 空数据替代文案 |  |
| N-TEXT-011 | 未开始 |  | 语气切换 |  |
| N-TEXT-012 | 未开始 |  | 文案编辑 |  |
| N-TEXT-013 | 未开始 |  | 重新生成 |  |
| N-TEXT-014 | 未开始 |  | 锁定文案 |  |
| N-TEXT-015 | 未开始 |  | 中英文互译 |  |
| N-TEXT-016 | 未开始 |  | 保留人工修改 |  |
| N-PAGE-001 | 通过 | 13A.6 | 零仓库可生成网站 | test: packages/generators/src/pages.test.ts (Zero-repository users still receive a non-empty generated website.) |
| N-PAGE-002 | 通过 | 13A.6.1 | 首页 Hero | test: packages/generators/src/pages.test.ts (Generated site contains Hero section.) |
| N-PAGE-003 | 通过 | 13A.6.1 | 个人简介区 | test: packages/generators/src/pages.test.ts (Generated site contains About section.) |
| N-PAGE-004 | 通过 | 13A.6.1 | 教育背景区 | test: packages/generators/src/pages.test.ts (Generated site contains Education section.) |
| N-PAGE-005 | 通过 | 13A.6.1 | 技能栈区 | test: packages/generators/src/pages.test.ts (Generated site contains Skills section.) |
| N-PAGE-006 | 通过 | 13A.6.1 | 编程语言区 | test: packages/generators/src/pages.test.ts (Skills section displays programming languages and proficiencies.) |
| N-PAGE-007 | 通过 | 13A.6.1 | 学习方向区 | test: packages/generators/src/pages.test.ts (Generated site contains Learning Directions section.) |
| N-PAGE-008 | 通过 | 13A.6.1 | 学习计划区 | test: packages/generators/src/pages.test.ts (Generated site contains Learning Plan section.) |
| N-PAGE-009 | 通过 | 13A.6.1 | 项目作品区 | test: packages/generators/src/pages.test.ts (Generated site contains manual and GitHub project cards.) |
| N-PAGE-010 | 通过 | 13A.6.1 | 时间线 | test: packages/generators/src/pages.test.ts (Generated site contains Timeline section.) |
| N-PAGE-011 | 通过 | 13A.6.1 | 成长路线 | test: packages/generators/src/pages.test.ts (Generated site contains Growth Roadmap section.) |
| N-PAGE-012 | 通过 | 13A.6.1 | GitHub 数据概览 | test: packages/generators/src/pages.test.ts (Generated site contains GitHub data overview section.) |
| N-PAGE-013 | 通过 | 13A.6.1 | 未来目标 | test: packages/generators/src/pages.test.ts (Generated site contains Future Goals section.) |
| N-PAGE-014 | 通过 | 13A.6.1 | 联系方式 | test: packages/generators/src/pages.test.ts (Generated site contains Contact section.) |
| N-PAGE-015 | 通过 | 13A.6.1 | 简历下载入口 | test: packages/generators/src/pages.test.ts (Generated site contains Resume entry section.) |
| N-PAGE-016 | 通过 | 13A.6.1 | 博客入口 | test: packages/generators/src/pages.test.ts (Generated site contains Blog entry section.) |
| N-PAGE-017 | 通过 | 13A.6.1 | 深浅色切换 | test: packages/generators/src/pages.test.ts (Generated site includes dark/light theme toggle.) |
| N-PAGE-018 | 通过 | 13A.6.1 | 响应式导航 | test: packages/generators/src/pages.test.ts (Generated CSS includes responsive navigation behavior.) |
| N-PT-001 | 未开始 |  | 学生作品集模板 |  |
| N-PT-002 | 未开始 |  | 求职简历模板 |  |
| N-PT-003 | 未开始 |  | 学习成长主页模板 |  |
| N-PT-004 | 未开始 |  | 课程项目展示模板 |  |
| N-PT-005 | 未开始 |  | AI 学习者模板 |  |
| N-PT-006 | 未开始 |  | 前端开发者模板 |  |
| N-PT-007 | 未开始 |  | 后端开发者模板 |  |
| N-PT-008 | 未开始 |  | 全栈开发者模板 |  |
| N-PT-009 | 未开始 |  | 极简名片模板 |  |
| N-PT-010 | 未开始 |  | 个人品牌主页模板 |  |
| N-PT-011 | 未开始 |  | 双语主页模板 |  |
| N-PT-012 | 未开始 |  | Bento Grid 学生主页 |  |
| N-PT-013 | 未开始 |  | 时间线成长主页 |  |
| N-PT-014 | 未开始 |  | 技能地图主页 |  |
| N-PT-015 | 未开始 |  | 开源新人主页 |  |
| N-LAYOUT-001 | 未开始 |  | 教育信息自动布局 |  |
| N-LAYOUT-002 | 未开始 |  | 课程自动布局 |  |
| N-LAYOUT-003 | 未开始 |  | 项目数量布局 |  |
| N-LAYOUT-004 | 未开始 |  | 学习计划布局 |  |
| N-LAYOUT-005 | 未开始 |  | 求职状态布局 |  |
| N-LAYOUT-006 | 未开始 |  | 学习状态布局 |  |
| N-LAYOUT-007 | 未开始 |  | 开源新人布局 |  |
| N-LAYOUT-008 | 未开始 |  | GitHub 数据弱化 |  |
| N-LAYOUT-009 | 未开始 |  | 默认头像 |  |
| N-LAYOUT-010 | 未开始 |  | 默认项目封面 |  |
| N-LAYOUT-011 | 未开始 |  | 文案补全 |  |
| N-PVIS-001 | 未开始 |  | 主页风格配置 |  |
| N-PVIS-002 | 未开始 |  | 主色配置 |  |
| N-PVIS-003 | 未开始 |  | 字体配置 |  |
| N-PVIS-004 | 未开始 |  | 背景配置 |  |
| N-PVIS-005 | 未开始 |  | Hero 布局配置 |  |
| N-PVIS-006 | 未开始 |  | 卡片风格配置 |  |
| N-PVIS-007 | 未开始 |  | 技能图标风格 |  |
| N-PVIS-008 | 未开始 |  | 项目卡片风格 |  |
| N-PVIS-009 | 未开始 |  | SEO 信息 |  |
| N-PVIS-010 | 未开始 |  | Open Graph 图 |  |
| N-PVIS-011 | 未开始 |  | favicon |  |
| N-POUT-001 | 通过 | 13A.6.4 | index.html | test: packages/generators/src/export-package.test.ts (Pages package includes index.html.) |
| N-POUT-002 | 通过 | 13A.6.4 | style.css | test: packages/generators/src/export-package.test.ts (Pages package includes style.css.) |
| N-POUT-003 | 通过 | 13A.6.4 | script.js | test: packages/generators/src/export-package.test.ts (Pages package includes script.js.) |
| N-POUT-004 | 通过 | 13A.6.4 | 个人信息 JSON | test: packages/generators/src/export-package.test.ts (Pages package includes data/github.json containing profile data.) |
| N-POUT-005 | 通过 | 13A.6.4 | 项目 JSON | test: packages/generators/src/export-package.test.ts (Pages package data/github.json contains manual project data.) |
| N-POUT-006 | 通过 | 13A.6.4 | 技能 JSON | test: packages/generators/src/export-package.test.ts (Pages package data/github.json contains skill data.) |
| N-POUT-007 | 未开始 |  | 静态资源 |  |
| N-POUT-008 | 待验收 | 13A.6.4 | 下载站点包 | api-response: apps/web/app/api/export/pages/route.ts (Pages export API can return ZIP packages; browser download evidence still required.) |
| N-POUT-009 | 未开始 |  | 提交 Pages 仓库 |  |
| N-POUT-010 | 未开始 |  | 创建 Pages 仓库 |  |
| N-POUT-011 | 未开始 |  | 启用 GitHub Pages |  |
| N-POUT-012 | 通过 | 13A.6.4 | 手动部署教程 | test: packages/generators/src/export-package.test.ts (Pages package includes a manual deployment guide.) |
| N-POUT-013 | 未开始 |  | 自定义域名说明 |  |
| N-POUT-014 | 通过 | 13A.6.4 | 自动更新配置 | test: packages/generators/src/export-package.test.ts (Pages package includes GitHub Actions update workflow.) |
| N-SAVE-001 | 未开始 |  | 保存基础信息 |  |
| N-SAVE-002 | 未开始 |  | 保存教育背景 |  |
| N-SAVE-003 | 未开始 |  | 保存技能栈 |  |
| N-SAVE-004 | 未开始 |  | 保存学习方向 |  |
| N-SAVE-005 | 未开始 |  | 保存项目信息 |  |
| N-SAVE-006 | 未开始 |  | 保存学习计划 |  |
| N-SAVE-007 | 未开始 |  | 保存联系方式 |  |
| N-SAVE-008 | 未开始 |  | 保存模板主题 |  |
| N-SAVE-009 | 未开始 |  | 历史版本 |  |
| N-GROW-001 | 通过 |  | 新仓库推荐 | test: packages/generators/src/maintenance.test.ts (New repository recommendation generated with evidence and actions.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-002 | 通过 |  | commit 增长推荐 | test: packages/generators/src/maintenance.test.ts (Commit growth recommendation generated from contribution totals and deltas.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-003 | 通过 |  | star 增长推荐 | test: packages/generators/src/maintenance.test.ts (Star growth recommendation generated from repo ranking and star deltas.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-004 | 通过 |  | PR / issue 增长推荐 | test: packages/generators/src/maintenance.test.ts (PR and issue growth recommendation generated from collaboration stats.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-005 | 通过 |  | 技能更新 | test: packages/generators/src/maintenance.test.ts (Skill update recommendation generated from language and technology tags.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-006 | 通过 |  | 教育状态更新 | test: packages/generators/src/maintenance.test.ts (Education status recommendation generated from education visibility fields.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-007 | 通过 |  | 求职状态更新 | test: packages/generators/src/maintenance.test.ts (Job status recommendation generated from learning plan and privacy-safe career fields.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-008 | 通过 |  | 月度成长总结 | test: packages/generators/src/maintenance.test.ts (Monthly growth summary generated with contributions, stars, forks, and active repos.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-009 | 通过 |  | 年度总结 | test: packages/generators/src/maintenance.test.ts (Annual summary generated with year-in-review markdown and JSON.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-GROW-010 | 通过 |  | 自动优化建议 | test: packages/generators/src/maintenance.test.ts (Automatic optimization recommendation generated for module priority, privacy, and compatibility.)<br>api-response: GET /api/growth/recommendations (Growth recommendation API returns all N-GROW acceptance IDs and localized recommendations.) |
| N-IMP-001 | 未开始 |  | 从 README 导入 |  |
| N-IMP-002 | 未开始 |  | 从简历文本导入 |  |
| N-IMP-003 | 未开始 |  | 从项目 README 导入 |  |
| N-IMP-004 | 未开始 |  | 批量导入项目 |  |
| N-IMP-005 | 未开始 |  | 批量导入技能 |  |
| N-IMP-006 | 未开始 |  | 导出个人配置 |  |
| N-IMP-007 | 未开始 |  | 导入个人配置 |  |
| N-REC-001 | 未开始 |  | README 模板推荐 |  |
| N-REC-002 | 未开始 |  | README 模块推荐 |  |
| N-REC-003 | 未开始 |  | 技能排序推荐 |  |
| N-REC-004 | 未开始 |  | 项目排序推荐 |  |
| N-REC-005 | 未开始 |  | Pages 模板推荐 |  |
| N-REC-006 | 未开始 |  | 首页区块顺序推荐 |  |
| N-REC-007 | 未开始 |  | SEO 推荐 |  |
| N-REC-008 | 未开始 |  | 主题色推荐 |  |
| N-REC-009 | 通过 | 13A.8.3 | 成长建议 | test: packages/core/src/new-user.test.ts (Recommendation engine returns project, skill, learning, open-source, and profile improvement suggestions.) |
| N-UP-001 | 未开始 |  | 仓库数阈值 |  |
| N-UP-002 | 未开始 |  | commit 阈值 |  |
| N-UP-003 | 待验收 | 13A.9 | 贡献数阈值 | file: packages/core/src/new-user.ts (Upgrade recommendation logic includes contribution growth thresholds.) |
| N-UP-004 | 未开始 |  | Star 阈值 |  |
| N-UP-005 | 未开始 |  | PR / issue 阈值 |  |
| N-UP-006 | 未开始 |  | 保留个人信息 |  |
| N-UP-007 | 未开始 |  | 手动项目合并 |  |
| N-UP-008 | 未开始 |  | diff 预览 |  |
| N-UP-009 | 未开始 |  | 回滚新用户模式 |  |
| N-UP-010 | 未开始 |  | 长期混合模式 |  |
| N-PRIV-001 | 未开始 |  | 真实姓名控制 |  |
| N-PRIV-002 | 未开始 |  | 学校控制 |  |
| N-PRIV-003 | 未开始 |  | 专业控制 |  |
| N-PRIV-004 | 未开始 |  | 学历控制 |  |
| N-PRIV-005 | 未开始 |  | GPA 控制 |  |
| N-PRIV-006 | 未开始 |  | 毕业年份控制 |  |
| N-PRIV-007 | 未开始 |  | 邮箱控制 |  |
| N-PRIV-008 | 未开始 |  | 简历链接控制 |  |
| N-PRIV-009 | 未开始 |  | 城市控制 |  |
| N-PRIV-010 | 未开始 |  | 社交账号控制 |  |
| N-PRIV-011 | 未开始 |  | 求职状态控制 |  |
| N-PRIV-012 | 未开始 |  | README / Pages 分别控制 |  |
| N-PRIV-013 | 未开始 |  | 提交前隐私检查 |  |
| N-PRIV-014 | 未开始 |  | 一键隐藏敏感信息 |  |
| N-PRIV-015 | 未开始 |  | 模糊化文案 |  |
| N-PRIV-016 | 未开始 |  | 邮箱保护 |  |
| N-PRIV-017 | 未开始 |  | 删除个人信息 |  |
| N-E2E-001 | 待验收 | 13A.11 | 零 commit 用户生成 README | test: packages/generators/src/readme.test.ts (Unit-level evidence exists for zero-commit README generation; browser E2E evidence still required before final pass.) |
| N-E2E-002 | 未开始 |  | 零仓库用户生成 Pages |  |
| N-E2E-003 | 未开始 |  | 学生用户链路 |  |
| N-E2E-004 | 未开始 |  | 求职用户链路 |  |
| N-E2E-005 | 未开始 |  | 开源新人链路 |  |
| N-E2E-006 | 未开始 |  | 复制与下载 |  |
| N-E2E-007 | 未开始 |  | 一键提交 |  |
| N-E2E-008 | 未开始 |  | 后续升级 |  |
| N-E2E-009 | 未开始 |  | 隐私检查 |  |
| N-E2E-010 | 未开始 |  | 无空白模块 |  |
