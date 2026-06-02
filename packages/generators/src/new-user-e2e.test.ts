import { describe, expect, it } from "vitest";
import {
  buildNewUserConfigFromDraft,
  defaultNewUserFormDraft,
  deletePersonalInfo,
  demoGitHubDataset,
  evaluateNewUserUpgrade,
  runPreSubmitPrivacyCheck
} from "@gps/core";
import { buildDiff, createDeploymentExecutionPreview, createPagesEnablementPlan, createReadmeDeploymentPlan } from "@gps/github";
import { buildPagesExportPackage, buildReadmeExportPackage } from "./export-package";
import { generatePagesSite } from "./pages";
import { generateReadme } from "./readme";

describe("new-user end-to-end flows", () => {
  it("generates README for a zero-commit user without blank modules", () => {
    const draft = defaultNewUserFormDraft("zero-commit", "en-US");
    const config = buildNewUserConfigFromDraft(draft);
    config.github = {
      ...config.github!,
      contributions: { ...config.github!.contributions, totalContributions: 0, commitContributions: 0, contributionDays: [] },
      totalStars: 0,
      pullRequests: { ...config.github!.pullRequests, total: 0 },
      issues: { ...config.github!.issues, total: 0 }
    };
    const readme = generateReadme(config);

    expect(readme.markdown).toContain("Learning Plan");
    expect(readme.markdown).not.toContain("undefined");
    expect(readme.markdown).not.toContain("NaN");
  });

  it("generates Pages for a zero-repository user", () => {
    const draft = defaultNewUserFormDraft("zero-repo", "en-US");
    const config = buildNewUserConfigFromDraft(draft);
    config.github = { ...config.github!, repositories: [], profile: { ...config.github!.profile, publicRepos: 0 } };
    const site = generatePagesSite(config);

    expect(site.files["index.html"]).toContain("Projects");
    expect(site.files["index.html"]).not.toContain("undefined");
    expect(site.files["style.css"]).toContain("@media");
  });

  it("covers student, job-seeking, and open-source newcomer chains", () => {
    const student = buildNewUserConfigFromDraft(defaultNewUserFormDraft("student", "en-US"));
    const jobDraft = defaultNewUserFormDraft("job", "en-US");
    jobDraft.contact.showResume = true;
    jobDraft.learning.jobPlan = "Apply for internships with project case studies.";
    const newcomerDraft = defaultNewUserFormDraft("oss", "en-US");
    newcomerDraft.learning.openSourcePlan = "Start with documentation fixes and first PRs.";

    expect(generateReadme(student).markdown).toContain("Education");
    expect(generatePagesSite(buildNewUserConfigFromDraft(jobDraft)).files["index.html"]).toContain("Resume");
    expect(generateReadme(buildNewUserConfigFromDraft(newcomerDraft)).markdown).toContain("Open-source plan");
  });

  it("covers copy/download exports and one-click deployment previews", () => {
    const config = buildNewUserConfigFromDraft(defaultNewUserFormDraft("alex", "en-US"));
    const readmePackage = buildReadmeExportPackage(config);
    const pagesPackage = buildPagesExportPackage(config);
    const readmePlan = createReadmeDeploymentPlan({ username: "alex", markdown: readmePackage.files.find((file) => file.path === "README.md")!.content });
    const preview = createDeploymentExecutionPreview({ plan: readmePlan, diff: buildDiff(readmePlan.files), authenticated: true });
    const pages = createPagesEnablementPlan({ username: "alex", authenticated: true });

    expect(readmePackage.files.map((file) => file.path)).toContain("README.md");
    expect(pagesPackage.files.map((file) => file.path)).toContain("index.html");
    expect(preview.operations.some((operation) => operation.action === "write-files")).toBe(true);
    expect(preview.operations.some((operation) => operation.action === "create-commit")).toBe(true);
    expect(pages.operations.some((operation) => operation.action === "enable-pages")).toBe(true);
  });

  it("covers later upgrade, privacy check, and no empty output", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    draft.education[0].gpa = "4.0";
    const dataset = demoGitHubDataset("alex");
    dataset.profile.publicRepos = 6;
    dataset.contributions.totalContributions = 150;
    const upgrade = evaluateNewUserUpgrade(draft, dataset);
    const privacyIssues = runPreSubmitPrivacyCheck(draft, [{ field: "email", showInReadme: true, showInPages: true }, { field: "gpa", showInReadme: true, showInPages: true }]);
    const privateSafe = buildNewUserConfigFromDraft(deletePersonalInfo(draft));

    expect(upgrade.diffPreview.length).toBeGreaterThan(0);
    expect(privacyIssues.map((issue) => issue.field)).toEqual(expect.arrayContaining(["email", "gpa"]));
    expect(generateReadme(privateSafe).markdown).not.toContain("4.0");
    expect(generatePagesSite(privateSafe).files["index.html"]).not.toContain("undefined");
  });
});
