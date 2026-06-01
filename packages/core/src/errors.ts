import type { LocalizedText } from "./language";

export type StudioErrorCode =
  | "USERNAME_INVALID"
  | "GITHUB_USER_NOT_FOUND"
  | "GITHUB_RATE_LIMITED"
  | "NETWORK_FAILED"
  | "REPOSITORY_NOT_FOUND"
  | "REPOSITORY_NOT_PUBLIC"
  | "README_NOT_FOUND"
  | "PAGES_NOT_ENABLED"
  | "OAUTH_FAILED"
  | "OAUTH_SCOPE_INSUFFICIENT"
  | "TOKEN_EXPIRED"
  | "COMMIT_CONFLICT"
  | "BRANCH_NOT_FOUND"
  | "WORKFLOW_WRITE_FAILED"
  | "THIRD_PARTY_CARD_INVALID"
  | "README_PARSE_FAILED"
  | "SVG_GENERATION_FAILED"
  | "HTML_GENERATION_FAILED"
  | "DOWNLOAD_FAILED"
  | "CACHE_STALE"
  | "AUTOMATION_FAILED";

export type StudioError = {
  code: StudioErrorCode;
  title: LocalizedText;
  reason: LocalizedText;
  impact: LocalizedText;
  solution: LocalizedText;
  retryable: boolean;
  docsPath: string;
};

export const studioErrors: Record<StudioErrorCode, StudioError> = {
  USERNAME_INVALID: {
    code: "USERNAME_INVALID",
    title: { en: "Invalid GitHub username", zh: "GitHub 用户名无效" },
    reason: { en: "The input cannot be parsed as a username, profile URL, or repository URL.", zh: "输入无法解析为用户名、个人主页 URL 或仓库 URL。" },
    impact: { en: "GitHub data cannot be fetched.", zh: "无法获取 GitHub 数据。" },
    solution: { en: "Enter a username such as octocat or paste a valid GitHub URL.", zh: "请输入 octocat 这样的用户名，或粘贴有效的 GitHub URL。" },
    retryable: true,
    docsPath: "/docs/errors#username"
  },
  GITHUB_USER_NOT_FOUND: {
    code: "GITHUB_USER_NOT_FOUND",
    title: { en: "GitHub user not found", zh: "未找到 GitHub 用户" },
    reason: { en: "GitHub returned 404 for the requested user.", zh: "GitHub 对该用户返回了 404。" },
    impact: { en: "Public data and repository status cannot be shown.", zh: "无法展示公开数据和仓库状态。" },
    solution: { en: "Check spelling or switch to new-user manual mode.", zh: "检查拼写，或切换到新用户手动模式。" },
    retryable: true,
    docsPath: "/docs/errors#not-found"
  },
  GITHUB_RATE_LIMITED: {
    code: "GITHUB_RATE_LIMITED",
    title: { en: "GitHub API rate limit reached", zh: "GitHub API 达到限流" },
    reason: { en: "GitHub rejected the request because the rate limit is exhausted.", zh: "GitHub 因限流耗尽拒绝了请求。" },
    impact: { en: "Some data may use cached values or be delayed.", zh: "部分数据会使用缓存或延迟刷新。" },
    solution: { en: "Sign in with GitHub, wait for reset, or continue with cached data.", zh: "登录 GitHub、等待重置，或继续使用缓存数据。" },
    retryable: true,
    docsPath: "/docs/errors#rate-limit"
  },
  NETWORK_FAILED: {
    code: "NETWORK_FAILED",
    title: { en: "Network request failed", zh: "网络请求失败" },
    reason: { en: "The server could not reach GitHub or a configured service.", zh: "服务器无法访问 GitHub 或配置服务。" },
    impact: { en: "Live data refresh is unavailable.", zh: "无法刷新实时数据。" },
    solution: { en: "Retry later or use the generated content from current inputs.", zh: "稍后重试，或使用当前输入生成内容。" },
    retryable: true,
    docsPath: "/docs/errors#network"
  },
  REPOSITORY_NOT_FOUND: {
    code: "REPOSITORY_NOT_FOUND",
    title: { en: "Repository not found", zh: "未找到仓库" },
    reason: { en: "The target repository does not exist.", zh: "目标仓库不存在。" },
    impact: { en: "One-click commit requires repository creation first.", zh: "一键提交前需要先创建仓库。" },
    solution: { en: "Authorize GitHub and create the repository from the deployment panel.", zh: "授权 GitHub 后在部署面板创建仓库。" },
    retryable: false,
    docsPath: "/docs/deploy#create-repository"
  },
  REPOSITORY_NOT_PUBLIC: {
    code: "REPOSITORY_NOT_PUBLIC",
    title: { en: "Repository is not public", zh: "仓库不是公开仓库" },
    reason: { en: "GitHub Profile README and Pages user sites require public repositories.", zh: "Profile README 和用户 Pages 站点需要公开仓库。" },
    impact: { en: "Generated content may not render on the public profile.", zh: "生成内容可能无法在公开主页显示。" },
    solution: { en: "Make the repository public or create a public target repository.", zh: "将仓库设为公开，或创建公开目标仓库。" },
    retryable: false,
    docsPath: "/docs/deploy#visibility"
  },
  README_NOT_FOUND: {
    code: "README_NOT_FOUND",
    title: { en: "README not found", zh: "未找到 README" },
    reason: { en: "The target repository has no README.md.", zh: "目标仓库没有 README.md。" },
    impact: { en: "Import and diff cannot compare existing content.", zh: "导入和差异预览无法比较旧内容。" },
    solution: { en: "Create a new generated README or import Markdown manually.", zh: "创建新的生成 README，或手动导入 Markdown。" },
    retryable: false,
    docsPath: "/docs/readme#import"
  },
  PAGES_NOT_ENABLED: {
    code: "PAGES_NOT_ENABLED",
    title: { en: "GitHub Pages is not enabled", zh: "GitHub Pages 未启用" },
    reason: { en: "The repository has no active Pages configuration.", zh: "仓库没有启用 Pages 配置。" },
    impact: { en: "The generated site is not publicly served yet.", zh: "生成的网站尚未公开发布。" },
    solution: { en: "Enable Pages from the deployment panel or follow the manual instructions.", zh: "在部署面板启用 Pages，或按手动说明配置。" },
    retryable: false,
    docsPath: "/docs/pages#enable"
  },
  OAUTH_FAILED: {
    code: "OAUTH_FAILED",
    title: { en: "GitHub OAuth failed", zh: "GitHub OAuth 失败" },
    reason: { en: "The authorization flow did not complete successfully.", zh: "授权流程未成功完成。" },
    impact: { en: "Repository write actions are disabled.", zh: "仓库写入操作不可用。" },
    solution: { en: "Try signing in again and confirm the requested permissions.", zh: "重新登录并确认所需权限。" },
    retryable: true,
    docsPath: "/docs/oauth"
  },
  OAUTH_SCOPE_INSUFFICIENT: {
    code: "OAUTH_SCOPE_INSUFFICIENT",
    title: { en: "Insufficient GitHub permission", zh: "GitHub 权限不足" },
    reason: { en: "The token does not include the scope required for this operation.", zh: "Token 不包含该操作所需权限。" },
    impact: { en: "The selected deployment action cannot continue.", zh: "所选部署操作无法继续。" },
    solution: { en: "Re-authorize with the minimal additional permission shown in the dialog.", zh: "按弹窗提示重新授权最小额外权限。" },
    retryable: true,
    docsPath: "/docs/oauth#scopes"
  },
  TOKEN_EXPIRED: {
    code: "TOKEN_EXPIRED",
    title: { en: "GitHub token expired", zh: "GitHub Token 已过期" },
    reason: { en: "Stored credentials can no longer access GitHub.", zh: "已保存凭据无法继续访问 GitHub。" },
    impact: { en: "Automated writes and private configuration sync are paused.", zh: "自动写入和私有配置同步已暂停。" },
    solution: { en: "Sign in again to refresh the token.", zh: "重新登录以刷新 Token。" },
    retryable: true,
    docsPath: "/docs/oauth#token"
  },
  COMMIT_CONFLICT: {
    code: "COMMIT_CONFLICT",
    title: { en: "Commit conflict detected", zh: "检测到提交冲突" },
    reason: { en: "The remote file changed after the preview was generated.", zh: "预览生成后远程文件发生了变化。" },
    impact: { en: "Direct overwrite is blocked to protect user changes.", zh: "为保护用户更改，直接覆盖已被阻止。" },
    solution: { en: "Refresh diff, create a pull request, or merge manually.", zh: "刷新差异、创建 PR，或手动合并。" },
    retryable: true,
    docsPath: "/docs/deploy#conflicts"
  },
  BRANCH_NOT_FOUND: {
    code: "BRANCH_NOT_FOUND",
    title: { en: "Branch not found", zh: "未找到分支" },
    reason: { en: "The configured deployment branch does not exist.", zh: "配置的部署分支不存在。" },
    impact: { en: "Files cannot be committed to the requested branch.", zh: "无法提交文件到目标分支。" },
    solution: { en: "Choose an existing branch or let Studio create one.", zh: "选择已有分支，或让 Studio 创建分支。" },
    retryable: false,
    docsPath: "/docs/deploy#branch"
  },
  WORKFLOW_WRITE_FAILED: {
    code: "WORKFLOW_WRITE_FAILED",
    title: { en: "Workflow write failed", zh: "Workflow 写入失败" },
    reason: { en: "GitHub rejected writing files under .github/workflows.", zh: "GitHub 拒绝写入 .github/workflows 下的文件。" },
    impact: { en: "Automatic maintenance cannot be enabled.", zh: "无法启用自动维护。" },
    solution: { en: "Check workflow permission and re-authorize if needed.", zh: "检查 workflow 权限，并按需重新授权。" },
    retryable: true,
    docsPath: "/docs/actions"
  },
  THIRD_PARTY_CARD_INVALID: {
    code: "THIRD_PARTY_CARD_INVALID",
    title: { en: "Third-party card is invalid", zh: "第三方卡片无效" },
    reason: { en: "The URL does not match a supported card provider or has invalid parameters.", zh: "URL 不匹配受支持卡片来源，或参数无效。" },
    impact: { en: "The card cannot be converted automatically.", zh: "无法自动转换该卡片。" },
    solution: { en: "Paste a supported card URL or keep it as custom Markdown.", zh: "粘贴受支持卡片 URL，或保留为自定义 Markdown。" },
    retryable: true,
    docsPath: "/docs/import#cards"
  },
  README_PARSE_FAILED: {
    code: "README_PARSE_FAILED",
    title: { en: "README parsing failed", zh: "README 解析失败" },
    reason: { en: "The Markdown contains unsupported or malformed content.", zh: "Markdown 包含不支持或格式错误内容。" },
    impact: { en: "Some modules may stay as custom content.", zh: "部分模块会保留为自定义内容。" },
    solution: { en: "Review parser warnings and keep unmatched blocks as custom modules.", zh: "查看解析警告，并将未匹配块保留为自定义模块。" },
    retryable: false,
    docsPath: "/docs/import#readme"
  },
  SVG_GENERATION_FAILED: {
    code: "SVG_GENERATION_FAILED",
    title: { en: "SVG generation failed", zh: "SVG 生成失败" },
    reason: { en: "The card renderer could not produce a valid SVG.", zh: "卡片渲染器无法生成有效 SVG。" },
    impact: { en: "The card endpoint returns an error SVG instead.", zh: "卡片接口会返回错误 SVG。" },
    solution: { en: "Check card parameters and theme values.", zh: "检查卡片参数和主题值。" },
    retryable: true,
    docsPath: "/docs/cards#errors"
  },
  HTML_GENERATION_FAILED: {
    code: "HTML_GENERATION_FAILED",
    title: { en: "HTML generation failed", zh: "HTML 生成失败" },
    reason: { en: "The Pages generator failed to render the selected template.", zh: "Pages 生成器无法渲染所选模板。" },
    impact: { en: "The site package cannot be exported.", zh: "无法导出站点包。" },
    solution: { en: "Switch templates or fix invalid custom content.", zh: "切换模板，或修复无效自定义内容。" },
    retryable: true,
    docsPath: "/docs/pages#errors"
  },
  DOWNLOAD_FAILED: {
    code: "DOWNLOAD_FAILED",
    title: { en: "Download failed", zh: "下载失败" },
    reason: { en: "The server could not create or stream the requested file.", zh: "服务器无法创建或传输请求文件。" },
    impact: { en: "The generated content must be copied manually.", zh: "需要手动复制生成内容。" },
    solution: { en: "Retry download or copy individual files.", zh: "重试下载，或复制单个文件。" },
    retryable: true,
    docsPath: "/docs/export"
  },
  CACHE_STALE: {
    code: "CACHE_STALE",
    title: { en: "Cache is stale", zh: "缓存已过期" },
    reason: { en: "Cached data is older than the configured freshness window.", zh: "缓存数据超过了配置的新鲜度窗口。" },
    impact: { en: "Generated stats may not be fully current.", zh: "生成统计可能不是最新。" },
    solution: { en: "Refresh manually or wait for the scheduled update.", zh: "手动刷新，或等待定时更新。" },
    retryable: true,
    docsPath: "/docs/cache"
  },
  AUTOMATION_FAILED: {
    code: "AUTOMATION_FAILED",
    title: { en: "Automation failed", zh: "自动维护失败" },
    reason: { en: "A scheduled workflow or worker job ended with an error.", zh: "定时 workflow 或 worker 任务失败。" },
    impact: { en: "Snapshots, cards, or generated files may not update.", zh: "快照、卡片或生成文件可能未更新。" },
    solution: { en: "Open the deployment log, copy error details, and retry the job.", zh: "打开部署日志、复制错误详情并重试任务。" },
    retryable: true,
    docsPath: "/docs/actions#failures"
  }
};

