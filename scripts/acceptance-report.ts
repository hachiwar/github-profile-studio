import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Status = "未开始" | "开发中" | "待验收" | "通过" | "不通过" | "阻塞";
type EvidenceKind = "test" | "screenshot" | "api-response" | "file" | "log" | "manual";

type MatrixItem = {
  id: string;
  title: string;
  standard: string;
  status: Status;
  evidence: Array<{ kind?: EvidenceKind; reference: string; note: string }>;
  requirementRefs?: string[];
};

type EvidenceRecord = {
  status: Status;
  requirementRefs?: string[];
  evidence: Array<{ kind: EvidenceKind; reference: string; note: string }>;
};

type EvidenceFile = {
  generatedAt: string;
  verificationCommands: Array<{ kind: EvidenceKind; reference: string; note: string }>;
  items: Record<string, EvidenceRecord>;
};

const allowedStatuses: Status[] = ["未开始", "开发中", "待验收", "通过", "不通过", "阻塞"];
const matrixPath = resolve(process.cwd(), "acceptance-matrix.json");
const evidencePath = resolve(process.cwd(), "acceptance-evidence.json");
const reportPath = resolve(process.cwd(), "acceptance-report.md");

const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as { generatedAt: string; items: MatrixItem[] };
const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as EvidenceFile;

const merged = matrix.items.map((item) => mergeItem(item, evidence.items[item.id]));
const counts = Object.fromEntries(allowedStatuses.map((status) => [status, merged.filter((item) => item.status === status).length]));
const passWithEvidence = merged.filter((item) => item.status === "通过" && item.evidence.length > 0).length;
const passWithoutEvidence = merged.filter((item) => item.status === "通过" && item.evidence.length === 0);

if (passWithoutEvidence.length > 0) {
  throw new Error(`Acceptance items marked 通过 without evidence: ${passWithoutEvidence.map((item) => item.id).join(", ")}`);
}

const report = renderReport({
  generatedAt: new Date().toISOString(),
  matrixGeneratedAt: matrix.generatedAt,
  evidenceGeneratedAt: evidence.generatedAt,
  verificationCommands: evidence.verificationCommands,
  counts,
  passWithEvidence,
  items: merged
});

writeFileSync(reportPath, report);
console.log(`Acceptance report written to ${reportPath}`);
console.log(`Items: ${merged.length}; passed with evidence: ${passWithEvidence}; pending/not-started: ${merged.length - passWithEvidence}`);

function mergeItem(item: MatrixItem, record?: EvidenceRecord): MatrixItem {
  if (!record) return item;
  if (!allowedStatuses.includes(record.status)) throw new Error(`Invalid status for ${item.id}: ${record.status}`);
  return {
    ...item,
    status: record.status,
    requirementRefs: record.requirementRefs ?? item.requirementRefs ?? [],
    evidence: record.evidence
  };
}

function renderReport(input: {
  generatedAt: string;
  matrixGeneratedAt: string;
  evidenceGeneratedAt: string;
  verificationCommands: Array<{ kind: EvidenceKind; reference: string; note: string }>;
  counts: Record<string, number>;
  passWithEvidence: number;
  items: MatrixItem[];
}): string {
  const summaryRows = allowedStatuses.map((status) => `| ${status} | ${input.counts[status] ?? 0} |`).join("\n");
  const commandRows = input.verificationCommands
    .map((item) => `| ${escapeCell(item.kind)} | \`${escapeCell(item.reference)}\` | ${escapeCell(item.note)} |`)
    .join("\n");
  const itemRows = input.items
    .map((item) => {
      const refs = item.requirementRefs?.length ? item.requirementRefs.join(", ") : "";
      const evidence = item.evidence.length
        ? item.evidence.map((entry) => `${entry.kind ?? "manual"}: ${entry.reference} (${entry.note})`).join("<br>")
        : "";
      return `| ${escapeCell(item.id)} | ${escapeCell(item.status)} | ${escapeCell(refs)} | ${escapeCell(item.title)} | ${escapeCell(evidence)} |`;
    })
    .join("\n");

  return `# GitHub Profile Studio Acceptance Report

Generated at: ${input.generatedAt}

Matrix generated at: ${input.matrixGeneratedAt}

Evidence generated at: ${input.evidenceGeneratedAt}

Passed items with evidence: ${input.passWithEvidence}

## Status Summary

| Status | Count |
| --- | ---: |
${summaryRows}

## Verification Commands

| Kind | Reference | Note |
| --- | --- | --- |
${commandRows}

## Full Checklist Matrix

| ID | Status | Requirement refs | Title | Evidence |
| --- | --- | --- | --- | --- |
${itemRows}
`;
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");
}
