import type { LocalizedText, StudioLocale } from "./language";
import { localize } from "./language";
import type { NewUserFormDraft } from "./new-user-form";
import { newUserFormDraftSchema } from "./new-user-form";

export type NewUserCopyTone = "formal" | "friendly" | "confident" | "concise";
export type NewUserCopyBlockId =
  | "zh-intro"
  | "en-intro"
  | "current-status"
  | "education"
  | "skill-stack"
  | "project-intro"
  | "learning-goals"
  | "open-source-goals"
  | "job-goals"
  | "empty-data";

export type NewUserCopyBlock = {
  id: NewUserCopyBlockId;
  label: LocalizedText;
  localized: LocalizedText;
  text: string;
  tone: NewUserCopyTone;
  locked: boolean;
  manual: boolean;
  acceptanceIds: string[];
};

export type GenerateNewUserCopyOptions = {
  locale?: StudioLocale;
  tone?: NewUserCopyTone;
  previousBlocks?: Partial<Record<NewUserCopyBlockId, string>>;
  lockedBlockIds?: NewUserCopyBlockId[];
  manualEdits?: Partial<Record<NewUserCopyBlockId, string>>;
};

const blockAcceptance: Record<NewUserCopyBlockId, string[]> = {
  "zh-intro": ["N-TEXT-001"],
  "en-intro": ["N-TEXT-002"],
  "current-status": ["N-TEXT-003"],
  education: ["N-TEXT-004"],
  "skill-stack": ["N-TEXT-005"],
  "project-intro": ["N-TEXT-006"],
  "learning-goals": ["N-TEXT-007"],
  "open-source-goals": ["N-TEXT-008"],
  "job-goals": ["N-TEXT-009"],
  "empty-data": ["N-TEXT-010"]
};

const labels: Record<NewUserCopyBlockId, LocalizedText> = {
  "zh-intro": { en: "Chinese introduction", zh: "中文自我介绍" },
  "en-intro": { en: "English introduction", zh: "英文自我介绍" },
  "current-status": { en: "Current learning status", zh: "当前学习状态" },
  education: { en: "Education copy", zh: "教育背景文案" },
  "skill-stack": { en: "Skill stack copy", zh: "技能栈文案" },
  "project-intro": { en: "Project copy", zh: "项目介绍文案" },
  "learning-goals": { en: "Learning goals", zh: "学习目标文案" },
  "open-source-goals": { en: "Open-source goals", zh: "开源目标文案" },
  "job-goals": { en: "Job goals", zh: "求职目标文案" },
  "empty-data": { en: "Empty-data replacement", zh: "空数据替代文案" }
};

export function generateNewUserCopy(input: NewUserFormDraft, options: GenerateNewUserCopyOptions = {}) {
  const draft = newUserFormDraftSchema.parse(input);
  const tone = options.tone ?? "formal";
  const locale = options.locale ?? draft.locale;
  const locked = new Set(options.lockedBlockIds ?? []);
  const blocks = (Object.keys(labels) as NewUserCopyBlockId[]).map((id) => {
    const localized = buildLocalizedBlock(id, draft, tone);
    const manual = options.manualEdits?.[id];
    const previous = options.previousBlocks?.[id];
    const text = locked.has(id) && previous ? previous : manual ?? localize(localized, locale);
    return {
      id,
      label: labels[id],
      localized,
      text,
      tone,
      locked: locked.has(id),
      manual: Boolean(manual),
      acceptanceIds: blockAcceptance[id]
    };
  });

  return {
    locale,
    tone,
    blocks,
    acceptanceIds: [
      "N-TEXT-001",
      "N-TEXT-002",
      "N-TEXT-003",
      "N-TEXT-004",
      "N-TEXT-005",
      "N-TEXT-006",
      "N-TEXT-007",
      "N-TEXT-008",
      "N-TEXT-009",
      "N-TEXT-010",
      "N-TEXT-011",
      "N-TEXT-012",
      "N-TEXT-013",
      "N-TEXT-014",
      "N-TEXT-015",
      "N-TEXT-016"
    ]
  };
}

export function applyManualCopyEdits(
  result: ReturnType<typeof generateNewUserCopy>,
  edits: Partial<Record<NewUserCopyBlockId, string>>
) {
  return {
    ...result,
    blocks: result.blocks.map((block) => (edits[block.id] ? { ...block, text: edits[block.id]!, manual: true } : block))
  };
}

export function regenerateCopyBlocks(input: NewUserFormDraft, previous: ReturnType<typeof generateNewUserCopy>, options: GenerateNewUserCopyOptions = {}) {
  const previousBlocks = Object.fromEntries(previous.blocks.map((block) => [block.id, block.text])) as Partial<Record<NewUserCopyBlockId, string>>;
  const lockedBlockIds = previous.blocks.filter((block) => block.locked).map((block) => block.id);
  return generateNewUserCopy(input, {
    ...options,
    previousBlocks: { ...previousBlocks, ...options.previousBlocks },
    lockedBlockIds: [...lockedBlockIds, ...(options.lockedBlockIds ?? [])]
  });
}

export function translateCopyBlocks(result: ReturnType<typeof generateNewUserCopy>, locale: StudioLocale) {
  return {
    ...result,
    locale,
    blocks: result.blocks.map((block) => ({
      ...block,
      text: localize(block.localized, locale)
    }))
  };
}

function buildLocalizedBlock(id: NewUserCopyBlockId, draft: NewUserFormDraft, tone: NewUserCopyTone): LocalizedText {
  const name = draft.basics.displayName || draft.basics.nickname || draft.username;
  const role = draft.basics.currentRole || "developer";
  const focus = draft.learning.currentFocus.slice(0, 3).join(", ") || draft.learning.directions.slice(0, 3).join(", ") || "software fundamentals";
  const education = draft.education[0];
  const school = education?.school || "my school";
  const major = education?.major || "computer science";
  const skills = [...draft.languages.map((language) => language.name), ...draft.skills.map((skill) => skill.name)].slice(0, 5).join(", ") || "core programming skills";
  const project = draft.manualProjects[0];
  const projectName = project?.name || "my first portfolio project";
  const projectSummary = project?.summary || "a learning project that documents my progress";
  const learningGoal = draft.learning.shortTermGoals[0] || "publish one polished project and document what I learn";
  const openSourceGoal = draft.learning.openSourcePlan || "start with documentation fixes and beginner-friendly issues";
  const jobGoal = draft.learning.jobPlan || "turn projects into clear case studies for internships or junior roles";
  const tonePrefix = toneIntro(tone);

  switch (id) {
    case "zh-intro":
      return {
        en: `${tonePrefix.en} ${name} is a ${role} focused on ${focus}.`,
        zh: `${tonePrefix.zh}我是 ${name}，目前以 ${role} 的身份学习 ${focus}。`
      };
    case "en-intro":
      return {
        en: `${tonePrefix.en} I'm ${name}, a ${role} building practical projects around ${focus}.`,
        zh: `${tonePrefix.zh}${name} 正在围绕 ${focus} 构建实践项目。`
      };
    case "current-status":
      return {
        en: draft.basics.status || `Currently learning ${focus} and turning notes into public projects.`,
        zh: draft.basics.status ? `当前状态：${draft.basics.status}` : `当前正在学习 ${focus}，并把学习笔记沉淀成公开项目。`
      };
    case "education":
      return {
        en: `Studying ${major} at ${school}, with coursework and projects connected to ${focus}.`,
        zh: `就读于 ${school}，学习方向为 ${major}，课程与项目重点围绕 ${focus}。`
      };
    case "skill-stack":
      return {
        en: `Current skill stack: ${skills}. I mark proficiency honestly and update it as projects mature.`,
        zh: `当前技能栈：${skills}。我会按真实熟练度展示，并随着项目推进持续更新。`
      };
    case "project-intro":
      return {
        en: `${projectName} is ${projectSummary}. It is used to show what I can build now and what I am improving next.`,
        zh: `${projectName} 是${projectSummary}，用于展示我当前能完成的作品以及下一步改进方向。`
      };
    case "learning-goals":
      return {
        en: `Near-term goal: ${learningGoal}. Long-term direction: ${draft.learning.longTermGoals[0] || "grow into a reliable full-stack contributor"}.`,
        zh: `近期目标：${learningGoal}。长期方向：${draft.learning.longTermGoals[0] || "成长为可靠的全栈贡献者"}。`
      };
    case "open-source-goals":
      return {
        en: `Open-source plan: ${openSourceGoal}.`,
        zh: `开源目标：${openSourceGoal}。`
      };
    case "job-goals":
      return {
        en: `Career plan: ${jobGoal}.`,
        zh: `求职目标：${jobGoal}。`
      };
    case "empty-data":
      return {
        en: "GitHub activity is still growing, so this profile highlights learning plans, manual projects, and next milestones instead of empty metrics.",
        zh: "GitHub 数据还在积累中，因此主页优先展示学习计划、手动项目和下一阶段目标，避免空白统计。"
      };
  }
}

function toneIntro(tone: NewUserCopyTone): LocalizedText {
  switch (tone) {
    case "friendly":
      return { en: "Hi,", zh: "你好，" };
    case "confident":
      return { en: "I am steadily growing:", zh: "我正在稳步成长：" };
    case "concise":
      return { en: "Summary:", zh: "简述：" };
    default:
      return { en: "Profile:", zh: "个人介绍：" };
  }
}
