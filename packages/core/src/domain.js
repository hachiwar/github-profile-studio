import { z } from "zod";
export const generationModeSchema = z.enum(["new-user", "data-enhanced", "hybrid", "manual"]);
export const targetTypeSchema = z.enum(["readme", "pages", "cards", "achievements"]);
export const privacyScopeSchema = z.enum(["readme", "pages", "both"]);
export const socialLinkSchema = z.object({
    provider: z.string(),
    label: z.string(),
    url: z.string().url(),
    showInReadme: z.boolean().default(true),
    showInPages: z.boolean().default(true)
});
export const skillSchema = z.object({
    name: z.string().min(1),
    category: z.enum(["frontend", "backend", "database", "ai-data", "devops", "language", "testing", "cloud", "other"]),
    proficiency: z.number().min(0).max(100),
    status: z.enum(["learning", "daily-use", "primary", "interested"]),
    showIcon: z.boolean().default(true),
    showBadge: z.boolean().default(true),
    showInReadme: z.boolean().default(true),
    showInPages: z.boolean().default(true)
});
export const educationSchema = z.object({
    school: z.string().optional(),
    department: z.string().optional(),
    major: z.string().optional(),
    degree: z.string().optional(),
    startYear: z.number().optional(),
    graduationYear: z.number().optional(),
    grade: z.string().optional(),
    courses: z.array(z.string()).default([]),
    honors: z.array(z.string()).default([]),
    showInReadme: z.boolean().default(true),
    showInPages: z.boolean().default(true)
});
export const manualProjectSchema = z.object({
    name: z.string().min(1),
    summary: z.string().min(1),
    type: z.enum(["personal", "course", "competition", "team", "open-source", "planned"]),
    status: z.enum(["planned", "building", "completed", "maintained"]),
    techStack: z.array(z.string()).default([]),
    highlights: z.array(z.string()).default([]),
    role: z.string().optional(),
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    showInReadme: z.boolean().default(true),
    showInPages: z.boolean().default(true)
});
export const learningPlanSchema = z.object({
    currentFocus: z.array(z.string()).default([]),
    books: z.array(z.string()).default([]),
    courses: z.array(z.string()).default([]),
    currentProjects: z.array(z.string()).default([]),
    shortTermGoals: z.array(z.string()).default([]),
    longTermGoals: z.array(z.string()).default([]),
    openSourcePlan: z.string().optional(),
    jobPlan: z.string().optional(),
    showInReadme: z.boolean().default(true),
    showInPages: z.boolean().default(true)
});
export const userProfileSchema = z.object({
    githubUsername: z.string().min(1),
    githubId: z.number().optional(),
    displayName: z.string().optional(),
    nickname: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().optional(),
    currentRole: z.string().optional(),
    status: z.string().optional(),
    location: z.string().optional(),
    company: z.string().optional(),
    blog: z.string().url().optional(),
    email: z.string().email().optional(),
    followers: z.number().default(0),
    following: z.number().default(0),
    publicRepos: z.number().default(0),
    publicGists: z.number().default(0),
    createdAt: z.string().optional(),
    lastFetchedAt: z.string().optional()
});
