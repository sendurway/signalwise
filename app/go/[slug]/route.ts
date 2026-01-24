export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

const DESTINATIONS: Record<string, string> = {
  mint: "https://www.mintmobile.com",
  visible: "https://www.visible.com",
  "us-mobile": "https://www.usmobile.com",
};

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);

  const homeZip = url.searchParams.get("homeZip") ?? "";
  const dataTier = url.searchParams.get("dataTier") ?? "";
  const priority = url.searchParams.get("priority") ?? "";
  const source = url.searchParams.get("source") ?? "";

  const event = {
    type: "SWITCH_CLICK",
    carrier: slug,
    homeZip,
    dataTier,
    priority,
    source,
    at: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? "",
  };

  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, "clicks.jsonl");
    await appendFile(filePath, JSON.stringify(event) + "\n", "utf8");
  } catch (err) {
    console.error("[CLICK_WRITE_FAILED]", err);
  }

  console.log("[SWITCH_CLICK]", event);

  const target = DESTINATIONS[slug] ?? "https://www.google.com";
  return NextResponse.redirect(target, { status: 302 });
}
