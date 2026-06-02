import { NextRequest, NextResponse } from "next/server";
import type { NewUserFormDraft } from "@gps/core";
import { defaultNewUserFormDraft, newUserFormDraftSchema, summarizeNewUserFormDraft } from "@gps/core";

type StoredDraft = {
  draft: NewUserFormDraft;
  savedAt: string;
  persistence: "memory" | "postgresql";
};

const globalStore = globalThis as unknown as { gpsNewUserDrafts?: Map<string, StoredDraft> };
const draftStore = globalStore.gpsNewUserDrafts ?? new Map<string, StoredDraft>();
globalStore.gpsNewUserDrafts = draftStore;

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "new-developer";
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = localeParam === "zh-CN" || localeParam === "bilingual" ? localeParam : "en-US";
  const authenticated = Boolean(request.cookies.get("gps_github_token")?.value);
  const stored = draftStore.get(storageKey(request, username));

  return NextResponse.json({
    authenticated,
    persistence: stored?.persistence ?? "memory",
    savedAt: stored?.savedAt,
    draft: stored?.draft ?? defaultNewUserFormDraft(username, locale),
    summary: summarizeNewUserFormDraft(stored?.draft ?? defaultNewUserFormDraft(username, locale)),
    acceptanceIds: ["N-FORM-001", "N-FORM-002", "N-FORM-003", "N-FORM-004", "N-FORM-005", "N-FORM-006", "N-FORM-007", "N-FORM-008", "N-FORM-009", "N-FORM-010", "N-FORM-011", "N-FORM-012", "N-FORM-013", "N-FORM-014", "N-FORM-015"]
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => undefined);
  const parsed = newUserFormDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "NEW_USER_FORM_INVALID",
        message: "The new-user profile form contains invalid fields.",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const authenticated = Boolean(request.cookies.get("gps_github_token")?.value);
  const savedAt = new Date().toISOString();
  const dbResult = process.env.DATABASE_URL ? await persistToDatabase(parsed.data).catch((error) => ({ error: error instanceof Error ? error.message : "DATABASE_SAVE_FAILED" })) : undefined;
  const persistence: StoredDraft["persistence"] = dbResult && !("error" in dbResult) ? "postgresql" : "memory";
  draftStore.set(storageKey(request, parsed.data.username), { draft: parsed.data, savedAt, persistence });

  return NextResponse.json({
    saved: true,
    authenticated,
    savedAt,
    persistence,
    database: dbResult,
    summary: summarizeNewUserFormDraft(parsed.data),
    nextActions: authenticated
      ? ["Continue editing the saved profile form.", "Generate README and Pages from the saved draft.", "Deploy when the OAuth permissions are ready."]
      : ["Draft saved for this local session.", "Connect GitHub OAuth to persist the draft across sessions.", "Generate README and Pages locally while unauthenticated."],
    acceptanceIds: ["N-FORM-015"]
  });
}

function storageKey(request: NextRequest, username: string): string {
  const cookie = request.cookies.get("gps_github_token")?.value;
  return `${cookie ? `oauth:${cookie.slice(0, 16)}` : "anonymous"}:${username.toLowerCase()}`;
}

async function persistToDatabase(draft: NewUserFormDraft) {
  const { prisma } = await import("@gps/db");
  const profile = await prisma.userProfile.upsert({
    where: { githubUsername: draft.username },
    create: {
      githubUsername: draft.username,
      displayName: draft.basics.displayName || draft.basics.nickname || draft.username,
      avatarUrl: draft.basics.avatarUrl,
      bio: draft.basics.oneLineIntro,
      location: draft.privacy.hideLocation ? undefined : draft.basics.location,
      blog: draft.basics.blog || draft.basics.website,
      email: draft.contact.showEmail ? draft.basics.email : undefined
    },
    update: {
      displayName: draft.basics.displayName || draft.basics.nickname || draft.username,
      avatarUrl: draft.basics.avatarUrl,
      bio: draft.basics.oneLineIntro,
      location: draft.privacy.hideLocation ? undefined : draft.basics.location,
      blog: draft.basics.blog || draft.basics.website,
      email: draft.contact.showEmail ? draft.basics.email : undefined
    }
  });

  const form = await prisma.newUserProfileForm.upsert({
    where: { profileId: profile.id },
    create: {
      profileId: profile.id,
      locale: mapLocale(draft.locale),
      currentRole: draft.basics.currentRole,
      status: draft.basics.status,
      introductionTone: "formal",
      lockedCopyBlocks: {},
      learningDirections: draft.learning.directions,
      highlights: draft.highlights,
      contactSettings: draft.contact
    },
    update: {
      locale: mapLocale(draft.locale),
      currentRole: draft.basics.currentRole,
      status: draft.basics.status,
      learningDirections: draft.learning.directions,
      highlights: draft.highlights,
      contactSettings: draft.contact
    }
  });

  await prisma.$transaction([
    prisma.education.deleteMany({ where: { formId: form.id } }),
    prisma.skill.deleteMany({ where: { formId: form.id } }),
    prisma.programmingLanguage.deleteMany({ where: { formId: form.id } }),
    prisma.learningPlan.deleteMany({ where: { formId: form.id } }),
    prisma.manualProject.deleteMany({ where: { formId: form.id } })
  ]);

  await Promise.all([
    draft.education.length
      ? prisma.education.createMany({
          data: draft.education.map((item) => ({
            formId: form.id,
            school: item.school,
            department: item.department,
            major: item.major,
            degree: item.degree,
            startYear: item.startYear,
            graduationYear: item.graduationYear,
            grade: item.grade,
            gpa: draft.privacy.hideGpa ? undefined : item.gpa,
            honors: item.honors,
            courses: item.courses,
            showInReadme: item.visibility.readme,
            showInPages: item.visibility.pages
          }))
        })
      : undefined,
    draft.skills.length
      ? prisma.skill.createMany({
          data: draft.skills.map((skill, index) => ({
            formId: form.id,
            name: skill.name,
            category: skill.category,
            proficiency: skill.proficiency,
            status: skill.status,
            showIcon: skill.showIcon,
            showBadge: skill.showBadge,
            sortOrder: index,
            showInReadme: skill.visibility.readme,
            showInPages: skill.visibility.pages
          }))
        })
      : undefined,
    draft.languages.length
      ? prisma.programmingLanguage.createMany({
          data: draft.languages.map((language) => ({
            formId: form.id,
            name: language.name,
            proficiency: language.proficiency,
            isLearning: language.isLearning,
            isDailyUse: language.isDailyUse,
            isPrimary: language.isPrimary,
            showIcon: language.showIcon,
            showProgress: language.showProgress,
            showBadge: language.showBadge,
            showSkillCloud: language.showSkillCloud,
            showInReadme: language.visibility.readme,
            showInPages: language.visibility.pages
          }))
        })
      : undefined,
    prisma.learningPlan.create({
      data: {
        formId: form.id,
        currentFocus: draft.learning.currentFocus,
        books: draft.learning.books,
        courses: draft.learning.courses,
        currentProjects: draft.learning.currentProjects,
        shortTermGoals: draft.learning.shortTermGoals,
        longTermGoals: draft.learning.longTermGoals,
        weeklyPlan: draft.learning.weeklyPlan,
        openSourcePlan: draft.learning.openSourcePlan,
        jobPlan: draft.learning.jobPlan,
        blogPlan: draft.learning.blogPlan,
        algorithmPlan: draft.learning.algorithmPlan,
        showInReadme: draft.learning.visibility.readme,
        showInPages: draft.learning.visibility.pages
      }
    }),
    draft.manualProjects.length
      ? prisma.manualProject.createMany({
          data: draft.manualProjects.map((project) => ({
            formId: form.id,
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
            videoUrl: project.videoUrl,
            featured: project.featured,
            showInReadme: project.visibility.readme,
            showInPages: project.visibility.pages
          }))
        })
      : undefined
  ]);

  return { profileId: profile.id, formId: form.id };
}

function mapLocale(locale: NewUserFormDraft["locale"]): "EN_US" | "ZH_CN" | "BILINGUAL" {
  if (locale === "zh-CN") return "ZH_CN";
  if (locale === "bilingual") return "BILINGUAL";
  return "EN_US";
}
