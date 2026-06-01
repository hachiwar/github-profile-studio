export const defaultPrivacySettings = [
    { key: "realName", label: { en: "Real name", zh: "真实姓名" }, sensitive: true, scope: "both", visibleInReadme: true, visibleInPages: true, obfuscation: "Developer" },
    { key: "school", label: { en: "School", zh: "学校" }, sensitive: true, scope: "both", visibleInReadme: true, visibleInPages: true, obfuscation: "Computer Science Student" },
    { key: "major", label: { en: "Major", zh: "专业" }, sensitive: false, scope: "both", visibleInReadme: true, visibleInPages: true },
    { key: "degree", label: { en: "Degree", zh: "学历" }, sensitive: false, scope: "both", visibleInReadme: true, visibleInPages: true },
    { key: "gpa", label: { en: "GPA", zh: "GPA" }, sensitive: true, scope: "both", visibleInReadme: false, visibleInPages: false },
    { key: "graduationYear", label: { en: "Graduation year", zh: "毕业年份" }, sensitive: false, scope: "both", visibleInReadme: true, visibleInPages: true },
    { key: "email", label: { en: "Email", zh: "邮箱" }, sensitive: true, scope: "both", visibleInReadme: false, visibleInPages: true, obfuscation: "Contact button" },
    { key: "resume", label: { en: "Resume link", zh: "简历链接" }, sensitive: true, scope: "both", visibleInReadme: false, visibleInPages: true },
    { key: "city", label: { en: "City", zh: "城市" }, sensitive: false, scope: "both", visibleInReadme: true, visibleInPages: true },
    { key: "social", label: { en: "Social accounts", zh: "社交账号" }, sensitive: false, scope: "both", visibleInReadme: true, visibleInPages: true },
    { key: "jobSeeking", label: { en: "Job seeking status", zh: "求职状态" }, sensitive: true, scope: "both", visibleInReadme: false, visibleInPages: true }
];
export function runPrivacyCheck(config) {
    const checks = [];
    for (const setting of config.privacy) {
        if (!setting.sensitive)
            continue;
        if (setting.visibleInReadme) {
            checks.push({
                field: setting.key,
                severity: setting.key === "email" || setting.key === "gpa" ? "critical" : "warning",
                message: `${setting.label.en} will be visible in README.`,
                scope: "readme"
            });
        }
        if (setting.visibleInPages) {
            checks.push({
                field: setting.key,
                severity: setting.key === "email" || setting.key === "gpa" ? "critical" : "warning",
                message: `${setting.label.en} will be visible in GitHub Pages.`,
                scope: "pages"
            });
        }
    }
    return checks;
}
export function hideSensitiveSettings(config) {
    return {
        ...config,
        privacy: config.privacy.map((setting) => setting.sensitive ? { ...setting, visibleInReadme: false, visibleInPages: false } : setting)
    };
}
