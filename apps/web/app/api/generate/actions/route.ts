import { NextRequest, NextResponse } from "next/server";
import { defaultWorkflowConfigs, generateWorkflow } from "@gps/generators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const configs = defaultWorkflowConfigs();
  const selected =
    typeof body.frequency === "string"
      ? configs.find((config) => config.frequency === body.frequency) ?? configs[0]
      : configs[0];

  return NextResponse.json({
    config: selected,
    yaml: generateWorkflow(selected)
  });
}

