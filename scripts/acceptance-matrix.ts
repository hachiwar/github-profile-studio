import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type ChecklistItem = {
  id: string;
  title: string;
  standard: string;
  status: "未开始" | "开发中" | "待验收" | "通过" | "不通过" | "阻塞";
  evidence: string[];
};

const checklistPath = resolve(process.cwd(), "..", "github_profile_studio_acceptance_checklist.md");
const outputPath = resolve(process.cwd(), "acceptance-matrix.json");
const markdown = readFileSync(checklistPath, "utf8");

const rows = markdown
  .split("\n")
  .filter((line) => line.startsWith("|") && !line.includes("---"))
  .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
  .filter((cells) => cells.length >= 3 && /^[A-Z0-9-]+$/.test(cells[0]));

const items: ChecklistItem[] = rows.map((cells) => ({
  id: cells[0],
  title: cells[1],
  standard: cells[2],
  status: "未开始",
  evidence: []
}));

writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2));
console.log(`Generated ${items.length} acceptance items at ${outputPath}`);

