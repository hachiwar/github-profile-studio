import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "@gps/core";
import { buildPagesExportPackage, buildReadmeExportPackage } from "./export-package";

describe("export packages", () => {
  it("builds a profile README package with manifest, workflow, and deployment guide", () => {
    const pkg = buildReadmeExportPackage(demoProfileConfig("octocat", "en-US"));
    const paths = pkg.files.map((file) => file.path);

    expect(pkg.target).toBe("readme");
    expect(pkg.repository.name).toBe("octocat");
    expect(paths).toContain("README.md");
    expect(paths).toContain(".github/workflows/profile-readme-update.yml");
    expect(paths).toContain("assets/profile-studio-metadata.json");
    expect(paths).toContain("profile-studio.manifest.json");
    expect(paths).toContain("DEPLOYMENT.md");
    expect(pkg.manifest.acceptanceIds).toContain("04-020");
    expect(pkg.files.every((file) => file.checksum.startsWith("fnv1a-"))).toBe(true);
  });

  it("builds a GitHub Pages package with all deployable static files", () => {
    const pkg = buildPagesExportPackage(demoProfileConfig("octocat", "en-US"));
    const paths = pkg.files.map((file) => file.path);

    expect(pkg.target).toBe("pages");
    expect(pkg.repository.name).toBe("octocat.github.io");
    expect(paths).toContain("index.html");
    expect(paths).toContain("style.css");
    expect(paths).toContain("script.js");
    expect(paths).toContain("404.html");
    expect(paths).toContain("sitemap.xml");
    expect(paths).toContain("robots.txt");
    expect(paths).toContain("data/github.json");
    expect(paths).toContain(".github/workflows/update-pages.yml");
    expect(paths).toContain("profile-studio.manifest.json");
    expect(pkg.instructions).toContain("Enable GitHub Pages");
    const dataFile = pkg.files.find((file) => file.path === "data/github.json");
    expect(dataFile?.content).toContain("\"profile\"");
    expect(dataFile?.content).toContain("\"projects\"");
    expect(dataFile?.content).toContain("\"skills\"");
  });
});
