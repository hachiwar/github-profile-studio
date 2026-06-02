import { z } from "zod";
import type { LearningPlan, ManualProject, ProfileStudioConfig, Skill, SocialLink } from "./domain";
import { localeSchema, type StudioLocale } from "./language";
import { buildNewUserConfig, learningDirectionCatalog, programmingLanguageCatalog, skillCatalog } from "./new-user";
import { defaultPrivacySettings } from "./privacy";

const optionalUrl = z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), z.string().url().optional());
const optionalEmail = z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), z.string().email().optional());
const visibilitySchema = z.object({
  readme: z.boolean().default(true),
  pages: z.boolean().default(true)
});

export const newUserSocialLinkSchema = z.object({
  provider: z.string().min(1),
  label: z.string().min(1),
  url: optionalUrl,
  visibility: visibilitySchema.default({ readme: true, pages: true })
});

export const newUserEducationFormSchema = z.object({
  school: z.string().optional(),
  department: z.string().optional(),
  major: z.string().optional(),
  degree: z.string().optional(),
  startYear: z.number().int().min(1900).max(2200).optional(),
  graduationYear: z.number().int().min(1900).max(2200).optional(),
  grade: z.string().optional(),
  gpa: z.string().optional(),
  courses: z.array(z.string()).default([]),
  honors: z.array(z.string()).default([]),
  visibility: visibilitySchema.default({ readme: true, pages: true })
});

export const newUserLanguageFormSchema = z.object({
  name: z.string().min(1),
  proficiency: z.number().min(0).max(100).default(40),
  isLearning: z.boolean().default(true),
  isDailyUse: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
  showIcon: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  showBadge: z.boolean().default(true),
  showSkillCloud: z.boolean().default(false),
  visibility: visibilitySchema.default({ readme: true, pages: true })
});

export const newUserSkillFormSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["frontend", "backend", "database", "ai-data", "devops", "testing", "cloud", "other"]),
  proficiency: z.number().min(0).max(100).default(40),
  status: z.enum(["learning", "daily-use", "primary", "interested"]).default("learning"),
  showIcon: z.boolean().default(true),
  showBadge: z.boolean().default(true),
  visibility: visibilitySchema.default({ readme: true, pages: true })
});

export const newUserManualProjectFormSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  type: z.enum(["personal", "course", "competition", "team", "open-source", "planned"]).default("personal"),
  status: z.enum(["planned", "building", "completed", "maintained"]).default("building"),
  techStack: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  role: z.string().optional(),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  imageUrl: optionalUrl,
  videoUrl: optionalUrl,
  featured: z.boolean().default(true),
  visibility: visibilitySchema.default({ readme: true, pages: true })
});

export const newUserFormDraftSchema = z.object({
  username: z.string().min(1).default("new-developer"),
  locale: localeSchema.default("en-US"),
  basics: z.object({
    displayName: z.string().optional(),
    nickname: z.string().optional(),
    avatarUrl: optionalUrl,
    oneLineIntro: z.string().optional(),
    currentRole: z.string().optional(),
    status: z.string().optional(),
    location: z.string().optional(),
    email: optionalEmail,
    website: optionalUrl,
    blog: optionalUrl,
    resumeUrl: optionalUrl,
    socialLinks: z.array(newUserSocialLinkSchema).default([])
  }),
  education: z.array(newUserEducationFormSchema).default([]),
  learning: z.object({
    directions: z.array(z.string()).default([]),
    currentFocus: z.array(z.string()).default([]),
    books: z.array(z.string()).default([]),
    courses: z.array(z.string()).default([]),
    currentProjects: z.array(z.string()).default([]),
    shortTermGoals: z.array(z.string()).default([]),
    longTermGoals: z.array(z.string()).default([]),
    weeklyPlan: z.string().optional(),
    openSourcePlan: z.string().optional(),
    jobPlan: z.string().optional(),
    blogPlan: z.string().optional(),
    algorithmPlan: z.string().optional(),
    visibility: visibilitySchema.default({ readme: true, pages: true })
  }),
  languages: z.array(newUserLanguageFormSchema).default([]),
  skills: z.array(newUserSkillFormSchema).default([]),
  manualProjects: z.array(newUserManualProjectFormSchema).default([]),
  highlights: z.array(z.string()).default([]),
  contact: z.object({
    showEmail: z.boolean().default(false),
    showWebsite: z.boolean().default(true),
    showBlog: z.boolean().default(true),
    showResume: z.boolean().default(false),
    preferredChannels: z.array(z.string()).default([])
  }),
  display: z.object({
    showGitHubStats: z.boolean().default(true),
    showContributionCalendar: z.boolean().default(false),
    showVisitors: z.boolean().default(true),
    showAchievements: z.boolean().default(true),
    showBlog: z.boolean().default(true),
    showResume: z.boolean().default(false),
    showContact: z.boolean().default(true),
    showSkillBadges: z.boolean().default(true),
    showSkillProgress: z.boolean().default(true),
    showLanguageProgress: z.boolean().default(true)
  }),
  privacy: z.object({
    publicOnlyGitHubData: z.boolean().default(true),
    hideRealName: z.boolean().default(false),
    hideEmailInReadme: z.boolean().default(true),
    hideGpa: z.boolean().default(true),
    hideLocation: z.boolean().default(false)
  }),
  templateKeys: z.object({
    readme: z.string().default("student-developer"),
    pages: z.string().default("student-portfolio")
  })
});

export type NewUserFormDraft = z.infer<typeof newUserFormDraftSchema>;

export function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function defaultNewUserFormDraft(username = "new-developer", locale: StudioLocale = "en-US"): NewUserFormDraft {
  return {
    username,
    locale,
    basics: {
      displayName: "Alex Developer",
      nickname: "Alex",
      avatarUrl: undefined,
      oneLineIntro: "I am learning full-stack development and building practical projects in public.",
      currentRole: "Student developer",
      status: "Learning, building projects, and preparing for open-source contributions.",
      location: "Remote",
      email: "hello@example.com",
      website: "https://example.com",
      blog: "https://example.com/blog",
      resumeUrl: "https://example.com/resume",
      socialLinks: [
        { provider: "GitHub", label: "GitHub", url: `https://github.com/${username}`, visibility: { readme: true, pages: true } },
        { provider: "LinkedIn", label: "LinkedIn", url: "https://www.linkedin.com/in/example", visibility: { readme: false, pages: true } }
      ]
    },
    education: [
      {
        school: "Example University",
        department: "School of Computer Science",
        major: "Computer Science",
        degree: "Bachelor",
        startYear: 2023,
        graduationYear: 2027,
        grade: "Sophomore",
        gpa: "",
        courses: ["Data Structures", "Database Systems", "Web Development"],
        honors: [],
        visibility: { readme: true, pages: true }
      }
    ],
    learning: {
      directions: learningDirectionCatalog.slice(0, 3),
      currentFocus: ["Next.js", "API design", "PostgreSQL"],
      books: ["Designing Data-Intensive Applications"],
      courses: ["Full-stack Web Development"],
      currentProjects: ["GitHub Profile Studio"],
      shortTermGoals: ["Ship a complete profile README", "Publish a GitHub Pages site"],
      longTermGoals: ["Contribute to open-source projects", "Build production-ready full-stack apps"],
      weeklyPlan: "Build one feature, write notes, and publish progress every week.",
      openSourcePlan: "Start with documentation fixes and beginner-friendly issues.",
      jobPlan: "Prepare project case studies and a technical resume.",
      blogPlan: "Write learning notes after each project milestone.",
      algorithmPlan: "Practice data structures twice a week.",
      visibility: { readme: true, pages: true }
    },
    languages: [
      { name: "TypeScript", proficiency: 70, isLearning: true, isDailyUse: true, isPrimary: true, showIcon: true, showProgress: true, showBadge: true, showSkillCloud: true, visibility: { readme: true, pages: true } },
      { name: "Python", proficiency: 55, isLearning: true, isDailyUse: false, isPrimary: false, showIcon: true, showProgress: true, showBadge: true, showSkillCloud: true, visibility: { readme: true, pages: true } }
    ],
    skills: [
      { name: skillCatalog.frontend[4], category: "frontend", proficiency: 65, status: "daily-use", showIcon: true, showBadge: true, visibility: { readme: true, pages: true } },
      { name: skillCatalog.backend[6], category: "backend", proficiency: 45, status: "learning", showIcon: true, showBadge: true, visibility: { readme: true, pages: true } },
      { name: skillCatalog.database[1], category: "database", proficiency: 45, status: "learning", showIcon: true, showBadge: true, visibility: { readme: true, pages: true } }
    ],
    manualProjects: [
      {
        name: "Personal Profile Studio",
        summary: "A profile generation project that turns learning progress into a useful GitHub presence.",
        type: "personal",
        status: "building",
        techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
        highlights: ["README generation", "GitHub Pages export", "Dynamic cards"],
        role: "Full-stack developer",
        repoUrl: undefined,
        demoUrl: undefined,
        imageUrl: undefined,
        videoUrl: undefined,
        featured: true,
        visibility: { readme: true, pages: true }
      }
    ],
    highlights: ["Learning in public", "Project-based growth", "Open-source ready"],
    contact: {
      showEmail: false,
      showWebsite: true,
      showBlog: true,
      showResume: false,
      preferredChannels: ["GitHub", "Email"]
    },
    display: {
      showGitHubStats: true,
      showContributionCalendar: false,
      showVisitors: true,
      showAchievements: true,
      showBlog: true,
      showResume: false,
      showContact: true,
      showSkillBadges: true,
      showSkillProgress: true,
      showLanguageProgress: true
    },
    privacy: {
      publicOnlyGitHubData: true,
      hideRealName: false,
      hideEmailInReadme: true,
      hideGpa: true,
      hideLocation: false
    },
    templateKeys: {
      readme: "student-developer",
      pages: "student-portfolio"
    }
  };
}

export function buildNewUserConfigFromDraft(input: NewUserFormDraft): ProfileStudioConfig {
  const draft = newUserFormDraftSchema.parse(input);
  const base = buildNewUserConfig(draft.username, draft.locale);
  const socialLinks = buildSocialLinks(draft);
  const languageSkills: Skill[] = draft.languages.map((language) => ({
    name: language.name,
    category: "language",
    proficiency: language.proficiency,
    status: language.isPrimary ? "primary" : language.isDailyUse ? "daily-use" : language.isLearning ? "learning" : "interested",
    showIcon: language.showIcon,
    showBadge: language.showBadge && draft.display.showSkillBadges,
    showInReadme: language.visibility.readme,
    showInPages: language.visibility.pages
  }));
  const skills: Skill[] = [
    ...languageSkills,
    ...draft.skills.map((skill) => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      status: skill.status,
      showIcon: skill.showIcon,
      showBadge: skill.showBadge && draft.display.showSkillBadges,
      showInReadme: skill.visibility.readme,
      showInPages: skill.visibility.pages
    }))
  ];

  return {
    ...base,
    locale: draft.locale,
    targetUsername: draft.username,
    profile: {
      ...base.profile,
      githubUsername: draft.username,
      displayName: draft.privacy.hideRealName ? draft.basics.nickname || "Developer" : draft.basics.displayName || draft.basics.nickname || draft.username,
      nickname: draft.basics.nickname,
      avatarUrl: draft.basics.avatarUrl || base.profile.avatarUrl,
      bio: [draft.basics.oneLineIntro, ...draft.highlights].filter(Boolean).join(" "),
      currentRole: draft.basics.currentRole,
      status: draft.basics.status,
      location: draft.privacy.hideLocation ? undefined : draft.basics.location,
      blog: draft.contact.showBlog ? draft.basics.blog || draft.basics.website : draft.basics.website,
      email: draft.contact.showEmail && !draft.privacy.hideEmailInReadme ? draft.basics.email : undefined
    },
    education: draft.education.map((item) => ({
      school: draft.privacy.hideRealName ? undefined : item.school,
      department: item.department,
      major: item.major,
      degree: item.degree,
      startYear: item.startYear,
      graduationYear: item.graduationYear,
      grade: item.grade,
      courses: item.courses,
      honors: item.honors,
      showInReadme: item.visibility.readme,
      showInPages: item.visibility.pages
    })),
    skills,
    learningPlan: buildLearningPlan(draft),
    manualProjects: draft.manualProjects.map(mapManualProject),
    socialLinks,
    readmeTemplateKey: draft.templateKeys.readme,
    pageTemplateKey: draft.templateKeys.pages,
    enabledReadmeModules: filterReadmeModules(base.enabledReadmeModules, draft),
    enabledPageSections: filterPageSections(base.enabledPageSections, draft),
    privacy: defaultPrivacySettings.map((setting) => {
      if (setting.key === "email") return { ...setting, visibleInReadme: draft.contact.showEmail && !draft.privacy.hideEmailInReadme, visibleInPages: draft.contact.showEmail };
      if (setting.key === "gpa") return { ...setting, visibleInReadme: !draft.privacy.hideGpa, visibleInPages: !draft.privacy.hideGpa };
      if (setting.key === "city") return { ...setting, visibleInReadme: !draft.privacy.hideLocation, visibleInPages: !draft.privacy.hideLocation };
      return setting;
    })
  };
}

export function summarizeNewUserFormDraft(input: NewUserFormDraft) {
  const draft = newUserFormDraftSchema.parse(input);
  return {
    username: draft.username,
    locale: draft.locale,
    fields: {
      basics: Object.keys(draft.basics).length,
      education: draft.education.length,
      learningDirections: draft.learning.directions.length,
      programmingLanguages: draft.languages.length,
      skills: draft.skills.length,
      manualProjects: draft.manualProjects.length,
      highlights: draft.highlights.length,
      contactChannels: draft.contact.preferredChannels.length
    },
    displaySwitches: Object.entries(draft.display).filter(([, enabled]) => enabled).map(([key]) => key),
    privacy: draft.privacy,
    acceptanceIds: [
      "N-FORM-001",
      "N-FORM-002",
      "N-FORM-003",
      "N-FORM-004",
      "N-FORM-005",
      "N-FORM-006",
      "N-FORM-007",
      "N-FORM-008",
      "N-FORM-009",
      "N-FORM-010",
      "N-FORM-011",
      "N-FORM-012",
      "N-FORM-013",
      "N-FORM-014"
    ]
  };
}

function buildLearningPlan(draft: NewUserFormDraft): LearningPlan {
  return {
    currentFocus: [...draft.learning.directions, ...draft.learning.currentFocus],
    books: draft.learning.books,
    courses: draft.learning.courses,
    currentProjects: draft.learning.currentProjects,
    shortTermGoals: draft.learning.shortTermGoals,
    longTermGoals: draft.learning.longTermGoals,
    openSourcePlan: draft.learning.openSourcePlan,
    jobPlan: draft.learning.jobPlan,
    showInReadme: draft.learning.visibility.readme,
    showInPages: draft.learning.visibility.pages
  };
}

function mapManualProject(project: NewUserFormDraft["manualProjects"][number]): ManualProject {
  return {
    name: project.name,
    summary: project.summary,
    type: project.type,
    status: project.status,
    techStack: project.techStack,
    highlights: project.highlights,
    role: project.role,
    repoUrl: project.repoUrl,
    demoUrl: project.demoUrl,
    imageUrl: project.imageUrl,
    featured: project.featured,
    showInReadme: project.visibility.readme,
    showInPages: project.visibility.pages
  };
}

function buildSocialLinks(draft: NewUserFormDraft): SocialLink[] {
  const links = draft.basics.socialLinks
    .filter((link) => Boolean(link.url))
    .map((link) => ({
      provider: link.provider,
      label: link.label,
      url: link.url as string,
      showInReadme: link.visibility.readme,
      showInPages: link.visibility.pages
    }));
  if (draft.contact.showWebsite && draft.basics.website) {
    links.push({ provider: "Website", label: "Website", url: draft.basics.website, showInReadme: true, showInPages: true });
  }
  if (draft.contact.showBlog && draft.basics.blog) {
    links.push({ provider: "Blog", label: "Blog", url: draft.basics.blog, showInReadme: true, showInPages: true });
  }
  if (draft.contact.showResume && draft.basics.resumeUrl) {
    links.push({ provider: "Resume", label: "Resume", url: draft.basics.resumeUrl, showInReadme: false, showInPages: true });
  }
  if (draft.contact.showEmail && draft.basics.email && !draft.privacy.hideEmailInReadme) {
    links.push({ provider: "Email", label: "Email", url: `mailto:${draft.basics.email}`, showInReadme: true, showInPages: true });
  }
  return links;
}

function filterReadmeModules(modules: string[], draft: NewUserFormDraft): string[] {
  return modules.filter((module) => {
    if (!draft.display.showGitHubStats && ["github-overview", "github-growth", "streak", "languages", "star-growth", "pr-issue"].includes(module)) return false;
    if (!draft.display.showContributionCalendar && module === "contribution-calendar") return false;
    if (!draft.display.showVisitors && module === "visitors") return false;
    if (!draft.display.showAchievements && module === "achievements") return false;
    if (!draft.display.showBlog && module === "blog") return false;
    if (!draft.display.showContact && module === "contact") return false;
    return true;
  });
}

function filterPageSections(sections: string[], draft: NewUserFormDraft): string[] {
  return sections.filter((section) => {
    if (!draft.display.showGitHubStats && section === "github") return false;
    if (!draft.display.showAchievements && section === "achievements") return false;
    if (!draft.display.showBlog && section === "blog") return false;
    if (!draft.display.showResume && section === "resume") return false;
    if (!draft.display.showContact && section === "contact") return false;
    return true;
  });
}

export const newUserFormCatalogEvidence = {
  learningDirections: learningDirectionCatalog.length,
  programmingLanguages: programmingLanguageCatalog.length,
  skillCategories: Object.keys(skillCatalog)
};
