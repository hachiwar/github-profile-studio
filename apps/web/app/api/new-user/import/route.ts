import { NextRequest, NextResponse } from "next/server";
import {
  importNewUserDraftConfig,
  importNewUserFromReadme,
  importNewUserFromResumeText,
  importProjectsFromReadmes,
  importSkillsFromText,
  recommendTemplateFromImport
} from "@gps/core";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "imported-user";
  const sourceType = typeof body.sourceType === "string" ? body.sourceType : "readme";
  const content = typeof body.content === "string" ? body.content : "";
  const result =
    sourceType === "resume-text"
      ? importNewUserFromResumeText(content, username)
      : sourceType === "project-readme"
        ? importProjectsFromReadmes([{ name: typeof body.projectName === "string" ? body.projectName : "Imported Project", markdown: content }], username)
        : sourceType === "bulk-projects"
          ? importProjectsFromReadmes(Array.isArray(body.projects) ? body.projects : [], username)
          : sourceType === "bulk-skills"
            ? importSkillsFromText(content, username)
            : sourceType === "config-json"
              ? importNewUserDraftConfig(content)
              : importNewUserFromReadme(content, username);

  return NextResponse.json({
    ...result,
    recommendation: recommendTemplateFromImport(result)
  });
}
