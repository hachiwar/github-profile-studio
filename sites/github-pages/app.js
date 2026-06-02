const form = document.querySelector("#profile-form");
const readmeOutput = document.querySelector("#readme-output");
const pageOutput = document.querySelector("#page-output");
const statusLine = document.querySelector("#status");

const copyByLocale = {
  "en-US": {
    greeting: "Hi, I'm",
    rolePrefix: "I am a",
    skills: "Skills",
    projects: "Featured Projects",
    goal: "Current Focus",
    stats: "GitHub Stats",
    contact: "Contact",
    generated: "Generated with GitHub Profile Studio",
    pageTitle: "Developer Portfolio",
    pageIntro: "A browser-generated personal page."
  },
  "zh-CN": {
    greeting: "你好，我是",
    rolePrefix: "我目前是",
    skills: "技能栈",
    projects: "精选项目",
    goal: "当前目标",
    stats: "GitHub 数据",
    contact: "联系我",
    generated: "由 GitHub Profile Studio 生成",
    pageTitle: "开发者主页",
    pageIntro: "一个在浏览器中生成的个人主页。"
  }
};

function getValues() {
  const data = new FormData(form);
  return {
    username: clean(data.get("username")) || "octocat",
    displayName: clean(data.get("displayName")) || clean(data.get("username")) || "Developer",
    role: clean(data.get("role")) || "Developer",
    location: clean(data.get("location")) || "Remote",
    locale: clean(data.get("locale")) || "en-US",
    template: clean(data.get("template")) || "developer",
    intro: clean(data.get("intro")),
    skills: splitLines(data.get("skills")),
    projects: splitRows(data.get("projects")),
    goal: clean(data.get("goal")),
    includeStats: data.get("includeStats") === "on",
    includeContact: data.get("includeContact") === "on",
    includePage: data.get("includePage") === "on"
  };
}

function clean(value) {
  return String(value ?? "").trim();
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitRows(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function localize(locale, key) {
  if (locale === "bilingual") return `${copyByLocale["en-US"][key]} / ${copyByLocale["zh-CN"][key]}`;
  return copyByLocale[locale]?.[key] ?? copyByLocale["en-US"][key];
}

function renderReadme(profile) {
  const lines = [
    `<h1 align="center">${localize(profile.locale, "greeting")} ${escapeHtml(profile.displayName)}</h1>`,
    "",
    `<p align="center">${escapeHtml(profile.intro || `${localize(profile.locale, "rolePrefix")} ${profile.role} based in ${profile.location}.`)}</p>`,
    "",
    `<p align="center">`,
    `  <a href="https://github.com/${profile.username}"><img src="https://img.shields.io/badge/GitHub-${profile.username}-181717?style=for-the-badge&logo=github" /></a>`,
    `  <img src="https://img.shields.io/badge/Profile-${profile.template}-0969da?style=for-the-badge" />`,
    `</p>`,
    "",
    `## ${localize(profile.locale, "skills")}`,
    "",
    profile.skills.length ? profile.skills.map((skill) => `- ${skill}`).join("\n") : "- TypeScript\n- GitHub Actions\n- Product Engineering",
    "",
    `## ${localize(profile.locale, "projects")}`,
    "",
    renderProjects(profile.projects),
    "",
    `## ${localize(profile.locale, "goal")}`,
    "",
    profile.goal || "Build useful software, write clear documentation, and keep improving every week."
  ];

  if (profile.includeStats) {
    lines.push(
      "",
      `## ${localize(profile.locale, "stats")}`,
      "",
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(profile.username)}&show_icons=true&hide_border=true" alt="${escapeHtml(profile.username)} GitHub stats" />`,
      `</p>`
    );
  }

  if (profile.includeContact) {
    lines.push(
      "",
      `## ${localize(profile.locale, "contact")}`,
      "",
      `- GitHub: https://github.com/${profile.username}`,
      `- Location: ${profile.location}`
    );
  }

  lines.push("", "---", "", `<p align="center">${localize(profile.locale, "generated")}</p>`);
  return lines.join("\n");
}

function renderProjects(projects) {
  if (!projects.length) return "- Add your first project and regenerate this README.";
  return projects
    .map((project) => {
      const [name, description] = project.split("|").map((part) => part.trim());
      return `- **${name || project}**${description ? ` - ${description}` : ""}`;
    })
    .join("\n");
}

function renderPage(profile) {
  const skills = profile.skills.length ? profile.skills : ["TypeScript", "React", "GitHub Actions"];
  const projects = profile.projects.length ? profile.projects : ["First project | Describe what you are building"];
  return `<!doctype html>
<html lang="${profile.locale === "zh-CN" ? "zh-CN" : "en"}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(profile.displayName)} - ${localize(profile.locale, "pageTitle")}</title>
    <style>
      body { margin: 0; font-family: Inter, system-ui, sans-serif; color: #111827; background: #f7f8fb; }
      header { padding: 72px 8vw; background: #fff; border-bottom: 1px solid #d8dee8; }
      main { padding: 36px 8vw; display: grid; gap: 24px; }
      h1 { font-size: clamp(42px, 8vw, 84px); line-height: 1; margin: 0 0 18px; }
      p { color: #4b5563; font-size: 18px; max-width: 820px; }
      section { background: #fff; border: 1px solid #d8dee8; border-radius: 12px; padding: 24px; }
      ul { display: grid; gap: 10px; padding-left: 20px; }
      .chips { display: flex; flex-wrap: wrap; gap: 10px; }
      .chip { border: 1px solid #d8dee8; border-radius: 999px; padding: 8px 12px; font-weight: 700; }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHtml(profile.displayName)}</h1>
      <p>${escapeHtml(profile.intro || localize(profile.locale, "pageIntro"))}</p>
      <strong>${escapeHtml(profile.role)} · ${escapeHtml(profile.location)} · @${escapeHtml(profile.username)}</strong>
    </header>
    <main>
      <section>
        <h2>${localize(profile.locale, "skills")}</h2>
        <div class="chips">${skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div>
      </section>
      <section>
        <h2>${localize(profile.locale, "projects")}</h2>
        <ul>${projects.map((project) => `<li>${escapeHtml(project.replace("|", " - "))}</li>`).join("")}</ul>
      </section>
      <section>
        <h2>${localize(profile.locale, "goal")}</h2>
        <p>${escapeHtml(profile.goal || "Keep building and learning in public.")}</p>
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generate() {
  const profile = getValues();
  const readme = renderReadme(profile);
  const page = profile.includePage ? renderPage(profile) : "<!-- Personal page generation is disabled. -->";
  readmeOutput.textContent = readme;
  pageOutput.textContent = page;
  statusLine.textContent = "Generated. You can copy or download the files now.";
  localStorage.setItem("gps-static-profile", JSON.stringify(profile));
}

async function copyReadme() {
  const content = readmeOutput.textContent ?? "";
  let copied = false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) copied = fallbackCopy(content);
  statusLine.textContent = copied ? "README copied to clipboard." : "Clipboard is blocked. Select and copy the README manually.";
}

function fallbackCopy(content) {
  const textArea = document.createElement("textarea");
  textArea.value = content;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();
  return copied;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function restore() {
  const raw = localStorage.getItem("gps-static-profile");
  if (!raw) return;
  const profile = JSON.parse(raw);
  for (const [key, value] of Object.entries(profile)) {
    const element = form.elements.namedItem(key);
    if (!element) continue;
    if (element instanceof HTMLInputElement && element.type === "checkbox") element.checked = Boolean(value);
    else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      element.value = Array.isArray(value) ? value.join(key === "projects" ? "\n" : ", ") : String(value);
    }
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".output").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.target}`).classList.add("active");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

document.querySelector("#copy-readme").addEventListener("click", copyReadme);
document.querySelector("#download-readme").addEventListener("click", () => download("README.md", readmeOutput.textContent, "text/markdown;charset=utf-8"));
document.querySelector("#download-page").addEventListener("click", () => download("index.html", pageOutput.textContent, "text/html;charset=utf-8"));

restore();
generate();
