export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { OUTBOUND_URLS, CarrierSlug } from "@/lib/outbound";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const carrier = slug as CarrierSlug;

  const url = new URL(req.url);

  const homeZip = url.searchParams.get("homeZip") ?? null;
  const dataTier = url.searchParams.get("dataTier") ?? null;
  const priority = url.searchParams.get("priority") ?? null;
  const source = url.searchParams.get("source") ?? null;

  const currentCarrier = url.searchParams.get("currentCarrier") ?? null;
  const currentBillRaw = url.searchParams.get("currentBill");
  const currentBill =
    currentBillRaw && Number.isFinite(Number(currentBillRaw)) ? Number(currentBillRaw) : null;

  const userAgent = req.headers.get("user-agent") ?? null;

  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  // DEBUG MODE: return JSON instead of redirect
  // Use: /go/mint?debug=1
  const debug = url.searchParams.get("debug") === "1";
  if (debug) {
    let insertOk = false;
    let insertError: string | null = null;

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

      if (error) insertError = error.message ?? String(error);
      else insertOk = true;
    } catch (err: any) {
      insertError = err?.message ?? String(err);
    }

    return NextResponse.json({
      debug: true,
      carrier,
      hasUrl,
      hasKey,
      insertOk,
      insertError,
      note:
        "If hasUrl/hasKey are false -> env vars not applied to this deployment. If insertError exists -> Supabase rejected insert (key/permissions/rls).",
    });
  }

  // Normal mode: insert (non-blocking) then redirect
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

    if (error) console.error("[SUPABASE_INSERT_ERROR]", error.message ?? error);
  } catch (err) {
    console.error("[SUPABASE_FAILED]", err);
  }

  const target = carrier in OUTBOUND_URLS ? OUTBOUND_URLS[carrier] : "https://www.google.com";
  return NextResponse.redirect(target, { status: 302 });
}