export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { OUTBOUND_URLS, CarrierSlug } from "@/lib/outbound";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const carrier = slug as CarrierSlug;

  const url = new URL(req.url);

  const homeZip = url.searchParams.get("homeZip");
  const dataTier = url.searchParams.get("dataTier");
  const priority = url.searchParams.get("priority");
  const source = url.searchParams.get("source");

  const currentCarrier = url.searchParams.get("currentCarrier");
  const currentBillRaw = url.searchParams.get("currentBill");
  const currentBill =
    currentBillRaw && Number.isFinite(Number(currentBillRaw))
      ? Number(currentBillRaw)
      : null;

  const userAgent = req.headers.get("user-agent");

  // Write click to Supabase (non-blocking for redirect)
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("clicks").insert({
      carrier,
      home_zip: homeZip,
      data_tier: dataTier,
      priority,
      source,
      current_carrier: currentCarrier,
      current_bill: currentBill,
      user_agent: userAgent,
    });

    if (error) console.error("[SUPABASE_INSERT_ERROR]", error);
  } catch (err) {
    console.error("[SUPABASE_FAILED]", err);
  }

  // Resolve outbound URL from config
  const target =
    carrier in OUTBOUND_URLS
      ? OUTBOUND_URLS[carrier]
      : "https://www.google.com";

  return NextResponse.redirect(target, { status: 302 });
}