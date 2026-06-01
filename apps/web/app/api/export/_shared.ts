import archiver from "archiver";
import { NextResponse } from "next/server";
import { demoProfileConfig, type ProfileStudioConfig } from "@gps/core";
import type { ExportPackage } from "@gps/generators";

export function resolveExportConfig(body: Record<string, unknown>): ProfileStudioConfig {
  if (body.config && typeof body.config === "object") return body.config as ProfileStudioConfig;
  const username = typeof body.username === "string" && body.username.trim() ? body.username.trim() : "new-developer";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  return demoProfileConfig(username, locale);
}

export async function exportPackageResponse(pkg: ExportPackage, format: string | null) {
  if (format === "zip") return zipExportPackageResponse(pkg);
  return NextResponse.json({
    ...pkg,
    files: pkg.files.map((file) => ({
      ...file,
      preview: previewContent(file.content)
    }))
  });
}

async function zipExportPackageResponse(pkg: ExportPackage) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  for (const file of pkg.files) {
    archive.append(file.content, { name: file.path.replaceAll("\\", "/") });
  }
  await archive.finalize();
  const zip = await done;

  return new Response(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${pkg.name}.zip"`,
      "cache-control": "no-store",
      "x-profile-studio-file-count": String(pkg.files.length),
      "x-profile-studio-generated-at": pkg.generatedAt
    }
  });
}

function previewContent(content: string): string {
  return content.length > 1200 ? `${content.slice(0, 1200)}\n...` : content;
}
