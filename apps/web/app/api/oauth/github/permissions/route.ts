import { NextResponse } from "next/server";
import { minimumOAuthScopes } from "@gps/github";

export function GET() {
  return NextResponse.json({
    provider: "github",
    principle: "minimum required permissions",
    scopes: minimumOAuthScopes,
    loggedOutCapabilities: ["generate", "copy", "download", "public-card-api"],
    loggedInCapabilities: ["save-config", "create-repository", "commit-files", "create-pr", "create-actions", "rollback"]
  });
}

