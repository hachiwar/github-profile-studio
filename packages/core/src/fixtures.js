import { defaultPrivacySettings } from "./privacy";
export function demoGitHubDataset(username) {
    const now = new Date().toISOString();
    return {
        profile: {
            githubUsername: username,
            displayName: username === "octocat" ? "The Octocat" : "New Developer",
            avatarUrl: "https://github.com/identicons/octocat.png",
            bio: "Building useful developer tools and learning in public.",
            currentRole: "Software learner",
            location: "Remote",
            followers: 120,
            following: 24,
            publicRepos: 8,
            publicGists: 2,
            createdAt: "2022-01-01T00:00:00.000Z",
            lastFetchedAt: now
        },
        repositories: [
            {
                githubRepoId: 1,
                owner: username,
                name: "profile-lab",
                fullName: `${username}/profile-lab`,
                description: "Experiments for learning web development and GitHub automation.",
                language: "TypeScript",
                topics: ["profile", "nextjs", "automation"],
                stars: 42,
                forks: 7,
                watchers: 42,
                subscribers: 4,
                openIssues: 2,
                size: 512,
                defaultBranch: "main",
                isFork: false,
                isArchived: false,
                isPrivate: false,
                hasPages: true,
                hasWiki: false,
                hasDiscussions: true,
                createdAt: "2024-01-12T00:00:00.000Z",
                updatedAt: now,
                pushedAt: now
            }
        ],
        contributions: {
            username,
            year: new Date().getFullYear(),
            totalContributions: 356,
            commitContributions: 260,
            issueContributions: 36,
            pullRequestContributions: 44,
            reviewContributions: 16,
            currentStreak: 11,
            longestStreak: 42,
            contributionDays: [],
            monthlyStats: { Jan: 32, Feb: 46, Mar: 58, Apr: 62, May: 71, Jun: 87 },
            weeklyStats: { Mon: 42, Tue: 55, Wed: 63, Thu: 58, Fri: 47, Sat: 33, Sun: 27 },
            hourlyStats: { "09": 20, "13": 46, "21": 38 }
        },
        repositoryTrends: [
            {
                repoFullName: `${username}/profile-lab`,
                date: now.slice(0, 10),
                stars: 42,
                forks: 7,
                issues: 2,
                watchers: 42,
                subscribers: 4,
                contributors: 3,
                releaseDownloads: 0,
                snapshotSource: "scheduled-snapshot"
            }
        ],
        pullRequests: { total: 44, merged: 38, closed: 4, reviewed: 16, recentYear: 44, mergeRate: 86, externalRepositories: 5, organizations: 2 },
        issues: { total: 36, closed: 28, recentYear: 36, closeRate: 78, participantCount: 12 },
        languages: {
            byRepoCount: { TypeScript: 4, Python: 2, HTML: 1, CSS: 1 },
            byBytes: { TypeScript: 68000, Python: 24000, HTML: 8000, CSS: 6000 },
            recentYear: { TypeScript: 70, Python: 20, CSS: 10 },
            starWeighted: { TypeScript: 72, Python: 18, HTML: 10 },
            forkWeighted: { TypeScript: 75, Python: 15, CSS: 10 }
        },
        totalStars: 42,
        totalForks: 7,
        technologyTags: ["TypeScript", "React", "Next.js", "Tailwind CSS", "PostgreSQL", "GitHub Actions"],
        fetchedAt: now
    };
}
export function demoProfileConfig(username, locale) {
    const github = demoGitHubDataset(username);
    return {
        locale,
        mode: "new-user",
        targetUsername: username,
        profile: {
            ...github.profile,
            displayName: "Alex Developer",
            bio: "I am learning full-stack development and building practical projects in public.",
            currentRole: "Student developer",
            status: "Learning, building projects, and preparing for open-source contributions.",
            email: "hello@example.com",
            blog: "https://example.com"
        },
        education: [
            {
                school: "Example University",
                department: "School of Computer Science",
                major: "Computer Science",
                degree: "Bachelor",
                startYear: 2023,
                graduationYear: 2027,
                grade: "Sophomore",
                courses: ["Data Structures", "Database Systems", "Web Development"],
                honors: [],
                showInReadme: true,
                showInPages: true
            }
        ],
        skills: [
            { name: "TypeScript", category: "language", proficiency: 70, status: "primary", showIcon: true, showBadge: true, showInReadme: true, showInPages: true },
            { name: "React", category: "frontend", proficiency: 65, status: "daily-use", showIcon: true, showBadge: true, showInReadme: true, showInPages: true },
            { name: "Node.js", category: "backend", proficiency: 55, status: "learning", showIcon: true, showBadge: true, showInReadme: true, showInPages: true },
            { name: "PostgreSQL", category: "database", proficiency: 45, status: "learning", showIcon: true, showBadge: true, showInReadme: true, showInPages: true }
        ],
        learningPlan: {
            currentFocus: ["Next.js", "API design", "PostgreSQL", "GitHub Actions"],
            books: ["Designing Data-Intensive Applications"],
            courses: ["Full-stack Web Development"],
            currentProjects: ["GitHub Profile Studio", "Portfolio site"],
            shortTermGoals: ["Ship a complete profile README", "Publish a GitHub Pages site"],
            longTermGoals: ["Contribute to open-source projects", "Build production-ready full-stack apps"],
            openSourcePlan: "Start with documentation fixes and small issues, then contribute features.",
            jobPlan: "Prepare project case studies and a technical resume.",
            showInReadme: true,
            showInPages: true
        },
        manualProjects: [
            {
                name: "Personal Profile Studio",
                summary: "A profile generation project that turns learning progress into a useful GitHub presence.",
                type: "personal",
                status: "building",
                techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
                highlights: ["README generation", "GitHub Pages export", "Dynamic cards"],
                featured: true,
                showInReadme: true,
                showInPages: true
            }
        ],
        socialLinks: [
            { provider: "GitHub", label: "GitHub", url: `https://github.com/${username}`, showInReadme: true, showInPages: true },
            { provider: "Blog", label: "Blog", url: "https://example.com", showInReadme: true, showInPages: true }
        ],
        themeKey: "github-native",
        readmeTemplateKey: "student-developer",
        pageTemplateKey: "student-portfolio",
        enabledReadmeModules: ["intro", "education", "skills", "learning-plan", "projects", "github-growth", "contact"],
        enabledPageSections: ["hero", "about", "education", "skills", "projects", "timeline", "github", "contact"],
        privacy: defaultPrivacySettings,
        github
    };
}
