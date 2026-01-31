"use client";

import { useMemo, useState } from "react";

type CarrierSlug = "mint" | "visible" | "us-mobile";

type Recommendation = {
  name: string;
  network: string;
  price: string;
  reason: string;
  slug: CarrierSlug;
};

function goHref(
  slug: CarrierSlug,
  ctx: {
    homeZip: string;
    dataTier: string;
    priority: string;
    source: string;
    currentBill?: string;
    currentCarrier?: string;
  }
) {
  const qs = new URLSearchParams();
  qs.set("homeZip", ctx.homeZip);
  qs.set("dataTier", ctx.dataTier);
  qs.set("priority", ctx.priority);
  qs.set("source", ctx.source);
  if (ctx.currentBill) qs.set("currentBill", ctx.currentBill);
  if (ctx.currentCarrier) qs.set("currentCarrier", ctx.currentCarrier);
  return `/go/${slug}?${qs.toString()}`;
}

function whyThisPlan(slug: CarrierSlug) {
  if (slug === "mint") {
    return [
      "Uses T-Mobile towers nationwide",
      "Low monthly price with upfront savings",
      "Easy eSIM activation (device-dependent)",
    ];
  }
  if (slug === "visible") {
    return [
      "Runs on Verizon’s nationwide network",
      "Simple flat monthly pricing",
      "Unlimited plan options (plan-dependent)",
    ];
  }
  return [
    "Choose Verizon or T-Mobile network options",
    "Flexible plans and add-ons",
    "Good balance of price + control",
  ];
}

function whatYouGiveUp(slug: CarrierSlug) {
  if (slug === "mint") return "May slow down during congestion in busy areas (deprioritization).";
  if (slug === "visible") return "Support is mostly online/chat (less in-store help).";
  return "Plan details vary by network selection (double-check plan limits).";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LogoDot({ label }: { label: string }) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/40 text-xs font-bold text-gray-200">
      {label}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200">
      {label}
    </span>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-400">{title}</div>
      <div className="mt-1 text-sm font-semibold text-gray-100">{value}</div>
    </div>
  );
}

function confidenceLabel(score: number) {
  if (score >= 90) return "Very High";
  if (score >= 85) return "High";
  return "Medium";
}

function confidenceBar(score: number) {
  // map 70–95 → 0–100%
  const pct = Math.round(((score - 70) / 25) * 100);
  return Math.max(0, Math.min(100, pct));
}

export default function ResultsClient(props: {
  homeZip: string;
  dataTier: string;
  priority: string;
  currentBill: string;
  currentCarrier: string;
  bestMatch: Recommendation;
  cheapest: Recommendation;
  bestCoverage: Recommendation;
  savings: number | null;
  labelForDataTier: string;
  labelForPriority: string;
  confidence: number; // 70–95
}) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const ctxBase = useMemo(
    () => ({
      homeZip: props.homeZip,
      dataTier: props.dataTier,
      priority: props.priority,
      currentBill: props.currentBill,
      currentCarrier: props.currentCarrier,
    }),
    [props.homeZip, props.dataTier, props.priority, props.currentBill, props.currentCarrier]
  );

  const primaryCta =
    props.savings !== null ? `Switch & Save $${props.savings}/mo` : "Switch (Recommended)";

  const barPct = confidenceBar(props.confidence);
  const confText = confidenceLabel(props.confidence);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200">
              SignalWise
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">Your results</h1>

            <p className="text-xs text-gray-400">
              Recommendations are generated from your inputs and known carrier characteristics. We don’t accept paid placement.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge label={`ZIP: ${props.homeZip || "(missing)"}`} />
              <Badge label={`Data: ${props.labelForDataTier}`} />
              <Badge label={`Priority: ${props.labelForPriority}`} />
              {props.currentBill ? <Badge label={`Current bill: $${props.currentBill}/mo`} /> : null}
              {props.currentCarrier ? <Badge label={`Current carrier: ${props.currentCarrier}`} /> : null}
            </div>
          </div>

          <a
            href={`/start`}
            className="mt-2 text-sm font-medium text-gray-300 underline underline-offset-4 hover:text-white"
          >
            Change
          </a>
        </div>

        {/* HERO */}
        <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                Best Match • Recommended for you
              </div>

              <div className="flex items-center gap-4">
                <LogoDot label={initials(props.bestMatch.name)} />
                <div>
                  <h2 className="text-2xl font-semibold">{props.bestMatch.name}</h2>
                  <p className="text-sm text-gray-300">Network: {props.bestMatch.network}</p>
                </div>
              </div>

              {/* Confidence meter */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-200">
                    Confidence: {confText}
                  </div>
                  <div className="text-xs text-gray-400">{props.confidence}/95</div>
                </div>

                <div className="mt-2 h-2 w-full rounded-full bg-black/40 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-white/80"
                    style={{ width: `${barPct}%` }}
                  />
                </div>

                <div className="mt-2 text-[11px] text-gray-400">
                  Based on ZIP + data fit + your priority.
                </div>
              </div>

              {/* Trust microcopy */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-gray-200">Why this plan</div>
                <ul className="mt-2 space-y-1 text-xs text-gray-300">
                  {whyThisPlan(props.bestMatch.slug).map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>

                <div className="mt-3 text-xs text-gray-300">
                  <span className="font-semibold text-gray-200">What you give up:</span>{" "}
                  {whatYouGiveUp(props.bestMatch.slug)}
                </div>
              </div>

              {/* Reassurance line */}
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-300">
                ✅ You keep your number • ✅ No contract • ✅ Switch takes ~10 minutes
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center md:w-64">
              <p className="text-xs text-gray-400">Est. monthly</p>
              <p className="mt-1 text-3xl font-semibold">{props.bestMatch.price}</p>

              <p className="mt-3 text-xs text-gray-400">Savings vs your current bill</p>
              <p className="mt-1 text-xl font-semibold">
                {props.savings !== null ? `$${props.savings}/mo` : "—"}
              </p>

              <a
                href={goHref(props.bestMatch.slug, { ...ctxBase, source: "results" })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
              >
                {primaryCta}
              </a>

              <p className="mt-2 text-xs text-gray-500">Official carrier site</p>
            </div>
          </div>

          {/* Reduce decision load */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAlternatives((v) => !v)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              {showAlternatives ? "Hide alternatives" : "View cheapest & coverage alternatives"}
            </button>

            {showAlternatives && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <AltCard
                  title="Cheapest Option"
                  item={props.cheapest}
                  href={goHref(props.cheapest.slug, { ...ctxBase, source: "cheapest_card" })}
                />
                <AltCard
                  title="Best Coverage (Estimate)"
                  item={props.bestCoverage}
                  href={goHref(props.bestCoverage.slug, { ...ctxBase, source: "coverage_card" })}
                />
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Disclosure: We may earn a commission if you switch through our links. This does not affect recommendations.
          </p>
        </div>
      </div>
    </main>
  );
}

function AltCard({
  title,
  item,
  href,
}: {
  title: string;
  item: Recommendation;
  href: string;
}) {
  const barPct = confidenceBar(82);
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur opacity-95">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>

      <div className="mt-3 flex items-center gap-3">
        <LogoDot label={initials(item.name)} />
        <div>
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-400">Network: {item.network}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-200">{item.reason}</p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold text-gray-200">Why this plan</div>
        <ul className="mt-2 space-y-1 text-xs text-gray-300">
          {whyThisPlan(item.slug).map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>

        <div className="mt-3 text-xs text-gray-300">
          <span className="font-semibold text-gray-200">What you give up:</span>{" "}
          {whatYouGiveUp(item.slug)}
        </div>

        <div className="mt-3 text-[11px] text-gray-400">
          Confidence: <span className="font-medium text-gray-300">Medium</span>
        </div>

        <div className="mt-2 h-2 w-full rounded-full bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-full bg-white/60" style={{ width: `${barPct}%` }} />
        </div>
      </div>

      <a
        href={href}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
      >
        Switch
      </a>

      <p className="mt-2 text-xs text-gray-500">Official carrier site</p>
    </section>
  );
}