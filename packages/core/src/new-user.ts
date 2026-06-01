import type { GitHubDataset, ProfileStudioConfig, StudioLocale } from "./index";
import { demoProfileConfig } from "./fixtures";
import { runPrivacyCheck } from "./privacy";

export type NewUserReadinessInput = {
  username: string;
  publicRepos: number;
  totalContributions: number;
  totalStars: number;
  pullRequests: number;
  issues: number;
  hasContributionGraph: boolean;
};

export type NewUserRecommendation = {
  recommendedMode: "new-user" | "data-enhanced" | "hybrid";
  reasons: string[];
  hiddenModules: string[];
  recommendedReadmeTemplate: string;
  recommendedPageTemplate: string;
  recommendedLocale: StudioLocale;
  growthActions: string[];
};

export const learningDirectionCatalog = [
  "Frontend Development",
  "Backend Development",
  "Full-stack Development",
  "Mobile Development",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Large Language Models",
  "Computer Vision",
  "Natural Language Processing",
  "Database Systems",
  "Operating Systems",
  "Computer Networks",
  "Cybersecurity",
  "Game Development",
  "Embedded Development",
  "Cloud Computing",
  "DevOps",
  "Blockchain",
  "Software Engineering",
  "Algorithm Competition",
  "Open Source Contribution"
];

export const programmingLanguageCatalog = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "R",
  "MATLAB",
  "SQL",
  "HTML",
  "CSS",
  "Shell",
  "Lua",
  "Scala",
  "Objective-C"
];

export const skillCatalog = {
  frontend: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "Tailwind CSS", "Sass", "Vite", "Webpack", "Electron", "Three.js"],
  backend: ["Node.js", "Express", "NestJS", "Spring Boot", "Django", "Flask", "FastAPI", "Laravel", "Ruby on Rails", "ASP.NET", "Gin", "Fiber", "Actix", "GraphQL", "REST API"],
  database: ["MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Elasticsearch", "Supabase", "Firebase", "Oracle", "SQL Server"],
  aiData: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn", "PyTorch", "TensorFlow", "Keras", "OpenCV", "Hugging Face", "LangChain", "Jupyter", "RStudio"],
  devops: ["Git", "GitHub", "Docker", "Kubernetes", "Linux", "Nginx", "GitHub Actions", "CI/CD", "AWS", "Azure", "Google Cloud", "Vercel", "Netlify", "Cloudflare", "Postman", "Figma"]
};

export function recommendNewUserMode(input: NewUserReadinessInput): NewUserRecommendation {
  const sparseRepos = input.publicRepos < 3;
  const sparseContributions = input.totalContributions < 30 || !input.hasContributionGraph;
  const sparseImpact = input.totalStars < 5 && input.pullRequests === 0 && input.issues === 0;
  const reasons: string[] = [];
  const hiddenModules: string[] = [];

  if (sparseRepos) {
    reasons.push("Public repository count is still low, so manual projects and learning plans should carry the profile.");
    hiddenModules.push("top-starred-repositories", "fastest-growing-repositories");
  }
  if (sparseContributions) {
    reasons.push("Contribution data is limited, so the README should avoid empty contribution-heavy sections.");
    hiddenModules.push("contribution-calendar", "streak-card");
  }
  if (sparseImpact) {
    reasons.push("Star, PR, and issue data is limited, so open-source goals should replace empty impact metrics.");
    hiddenModules.push("star-growth", "pr-issue", "open-source-impact");
  }

  if (sparseRepos || sparseContributions || sparseImpact) {
    return {
      recommendedMode: input.publicRepos > 0 || input.totalContributions > 0 ? "hybrid" : "new-user",
      reasons,
      hiddenModules,
      recommendedReadmeTemplate: "student-developer",
      recommendedPageTemplate: "student-portfolio",
      recommendedLocale: "en-US",
      growthActions: [
        "Publish one focused learning project with a clear README.",
        "Add a weekly learning plan and current project roadmap.",
        "Start with documentation fixes or beginner-friendly open-source issues.",
        "Enable GitHub data cards after contributions become meaningful."
      ]
    };
  }

  return {
    recommendedMode: "data-enhanced",
    reasons: ["GitHub activity is strong enough to prioritize data-driven profile modules."],
    hiddenModules: [],
    recommendedReadmeTemplate: "technical-resume",
    recommendedPageTemplate: "personal-brand",
    recommendedLocale: "en-US",
    growthActions: [
      "Feature top repositories by stars and recent growth.",
      "Enable PR, issue, language, and achievement modules.",
      "Record Star/Fork snapshots for future trend cards."
    ]
  };
}

export function buildNewUserConfig(username: string, locale: StudioLocale, dataset?: GitHubDataset): ProfileStudioConfig {
  const config = demoProfileConfig(username, locale);
  if (dataset) config.github = dataset;
  const recommendation = recommendNewUserMode({
    username,
    publicRepos: config.github?.profile.publicRepos ?? 0,
    totalContributions: config.github?.contributions.totalContributions ?? 0,
    totalStars: config.github?.totalStars ?? 0,
    pullRequests: config.github?.pullRequests.total ?? 0,
    issues: config.github?.issues.total ?? 0,
    hasContributionGraph: (config.github?.contributions.contributionDays.length ?? 0) > 0
  });

  return {
    ...config,
    mode: recommendation.recommendedMode,
    readmeTemplateKey: recommendation.recommendedReadmeTemplate,
    pageTemplateKey: recommendation.recommendedPageTemplate,
    enabledReadmeModules: config.enabledReadmeModules.filter((module) => !recommendation.hiddenModules.includes(module))
  };
}

export function summarizeNewUserConfig(config: ProfileStudioConfig) {
  const privacyWarnings = runPrivacyCheck(config);
  return {
    username: config.targetUsername,
    locale: config.locale,
    mode: config.mode,
    readmeTemplateKey: config.readmeTemplateKey,
    pageTemplateKey: config.pageTemplateKey,
    readmeModules: config.enabledReadmeModules,
    pageSections: config.enabledPageSections,
    privacyWarnings
  };
}

