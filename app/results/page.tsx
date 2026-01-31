export const dynamic = "force-dynamic";
export const revalidate = 0;

type CarrierSlug = "mint" | "visible" | "us-mobile";

type Recommendation = {
  name: string;
  network: string;
  price: string;
  reason: string;
  slug: CarrierSlug; // IMPORTANT: always use slug so we go through /go/ for tracking
};

function getSimpleRecommendation(homeZip: string, dataTier: string, priority: string) {
  const westCoast = homeZip.startsWith("9");

  const mint = (price: string, reason: string): Recommendation => ({
    name: "Mint Mobile",
    network: "T-Mobile",
    price,
    reason,
    slug: "mint",
  });

  const visible = (price: string, reason: string): Recommendation => ({
    name: "Visible",
    network: "Verizon",
    price,
    reason,
    slug: "visible",
  });

  const usm = (price: string, reason: string): Recommendation => ({
    name: "US Mobile",
    network: "Verizon/T-Mobile",
    price,
    reason,
    slug: "us-mobile",
  });

  // LIGHT DATA
  if (dataTier === "light") {
    const cheapest = mint("$15/mo", "Cheapest option for light data users.");
    const coverage = visible("$25/mo", "Better coverage if signal reliability matters.");
    const balanced = mint("$15/mo", "Strong value for light usage with simple pricing.");

    const bestMatch =
      priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

    return { bestMatch, cheapest, bestCoverage: coverage };
  }

  // UNLIMITED
  if (dataTier === "unlimited") {
    const cheapest = visible("$25/mo", "Lowest-cost unlimited option with a simple signup flow.");
    const coverage = visible("$45/mo", "Higher priority data in busy areas and strong Verizon coverage.");

    const balanced = westCoast
      ? mint("$30/mo", "Unlimited data at a strong value for your region.")
      : visible("$25/mo", "Unlimited data at a strong value for your region.");

    const bestMatch =
      priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

    return { bestMatch, cheapest, bestCoverage: coverage };
  }

  // DEFAULT (medium/heavy)
  const cheapest = mint("$15–20/mo", "Lower cost if you don’t need unlimited.");
  const coverage = visible("$45/mo", "Often stronger coverage + priority options.");
  const balanced = westCoast
    ? mint("$25–30/mo", "Balanced option for most users in your area.")
    : visible("$25–30/mo", "Balanced option for most users in your area.");

  const bestMatch =
    priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

  return { bestMatch, cheapest, bestCoverage: coverage };
}

function labelForDataTier(t: string) {
  if (t === "light") return "Light (under 5GB)";
  if (t === "medium") return "Medium (5–15GB)";
  if (t === "heavy") return "Heavy (15–35GB)";
  if (t === "unlimited") return "Unlimited";
  return t;
}

function labelForPriority(p: string) {
  if (p === "cheapest") return "Cheapest";
  if (p === "coverage") return "Coverage";
  return "Balanced";
}

function computeSavings(bestPrice: string, currentBill?: string) {
  if (!currentBill) return null;
  const current = Number(currentBill);
  if (!Number.isFinite(current) || current <= 0) return null;

  const m = bestPrice.match(/\$([0-9]+)/);
  const best = m ? Number(m[1]) : null;
  if (!best || !Number.isFinite(best)) return null;

  return Math.max(0, current - best);
}

// This is the critical part: ALWAYS go through /go/... so Supabase logging runs.
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
      "7-day trial + easy eSIM activation",
    ];
  }
  if (slug === "visible") {
    return [
      "Runs on Verizon’s nationwide network",
      "One flat monthly price (simple billing)",
      "Unlimited data options + hotspot (plan-dependent)",
    ];
  }
  return [
    "Choose Verizon or T-Mobile network options",
    "Good balance of price + flexibility",
    "eSIM support and easy plan switching",
  ];
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    homeZip?: string;
    dataTier?: string;
    priority?: string;
    currentBill?: string;
    currentCarrier?: string;
  }>;
}) {
  const sp = await searchParams;

  const homeZip = (sp.homeZip ?? "").trim();
  const dataTier = (sp.dataTier ?? "medium").trim();
  const priority = (sp.priority ?? "balanced").trim();

  const currentBill = (sp.currentBill ?? "").trim();
  const currentCarrier = (sp.currentCarrier ?? "").trim();

  const rec = getSimpleRecommendation(homeZip, dataTier, priority);
  const savings = computeSavings(rec.bestMatch.price, currentBill);

  const ctxBase = { homeZip, dataTier, priority, currentBill, currentCarrier };

  const whyChosen = [
    `Matches your data usage: ${labelForDataTier(dataTier)}`,
    `Optimized for your priority: ${labelForPriority(priority)}`,
    `Coverage estimate uses your ZIP: ${homeZip || "(missing)"}`,
  ];

  const primaryCta =
    savings !== null ? `Switch & Save $${savings}/mo` : "Switch (Recommended)";

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
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
              <Badge label={`ZIP: ${homeZip || "(missing)"}`} />
              <Badge label={`Data: ${labelForDataTier(dataTier)}`} />
              <Badge label={`Priority: ${labelForPriority(priority)}`} />
              {currentBill ? <Badge label={`Current bill: $${currentBill}/mo`} /> : null}
              {currentCarrier ? <Badge label={`Current carrier: ${currentCarrier}`} /> : null}
            </div>
          </div>

          <a
            href={`/start?homeZip=${encodeURIComponent(homeZip)}&dataTier=${encodeURIComponent(
              dataTier
            )}&priority=${encodeURIComponent(priority)}&currentCarrier=${encodeURIComponent(
              currentCarrier
            )}&currentBill=${encodeURIComponent(currentBill)}`}
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
                <LogoDot label={initials(rec.bestMatch.name)} />
                <div>
                  <h2 className="text-2xl font-semibold">{rec.bestMatch.name}</h2>
                  <p className="text-sm text-gray-300">Network: {rec.bestMatch.network}</p>
                </div>
              </div>

              <p className="text-sm text-gray-200">{rec.bestMatch.reason}</p>

              <div className="grid gap-2 text-sm text-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Why this was chosen
                </div>
                {whyChosen.map((w) => (
                  <Bullet key={w} text={w} />
                ))}
              </div>

              {/* Trust microcopy */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-gray-200">Why this plan</div>
                <ul className="mt-2 space-y-1 text-xs text-gray-300">
                  {whyThisPlan(rec.bestMatch.slug).map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-gray-400">
                  Confidence: <span className="font-medium text-gray-300">High</span>
                </div>
              </div>

              <div className="mt-2 grid gap-2 text-xs text-gray-300 sm:grid-cols-3">
                <MiniStat title="Keep your number" value="Yes" />
                <MiniStat title="Time to switch" value="~10 min" />
                <MiniStat title="Contract" value="No" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center md:w-64">
              <p className="text-xs text-gray-400">Est. monthly</p>
              <p className="mt-1 text-3xl font-semibold">{rec.bestMatch.price}</p>

              <p className="mt-3 text-xs text-gray-400">Savings vs your current bill</p>
              <p className="mt-1 text-xl font-semibold">
                {savings !== null ? `$${savings}/mo` : "—"}
              </p>

              <a
                href={goHref(rec.bestMatch.slug, { ...ctxBase, source: "results" })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
              >
                {primaryCta}
              </a>

              <p className="mt-2 text-xs text-gray-500">Official carrier site</p>
              <p className="mt-1 text-xs text-gray-500">Keep your number • ~10 min</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Disclosure: We may earn a commission if you switch through our links. This does not affect recommendations.
          </p>
        </div>

        {/* Secondary */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SecondaryCard
            title="Cheapest Option"
            item={rec.cheapest}
            href={goHref(rec.cheapest.slug, { ...ctxBase, source: "cheapest_card" })}
          />
          <SecondaryCard
            title="Best Coverage (Estimate)"
            item={rec.bestCoverage}
            href={goHref(rec.bestCoverage.slug, { ...ctxBase, source: "coverage_card" })}
          />
        </div>
      </div>
    </main>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200">
      {label}
    </span>
  );
}

function SecondaryCard({
  title,
  item,
  href,
}: {
  title: string;
  item: Recommendation;
  href: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur opacity-90 hover:opacity-100 transition">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>

      <div className="mt-3 flex items-center gap-3">
        <LogoDot label={initials(item.name)} />
        <div>
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-400">Network: {item.network}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-200">{item.reason}</p>

      {/* Trust microcopy */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold text-gray-200">Why this plan</div>
        <ul className="mt-2 space-y-1 text-xs text-gray-300">
          {whyThisPlan(item.slug).map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
        <div className="mt-2 text-[11px] text-gray-400">
          Confidence: <span className="font-medium text-gray-300">Medium</span>
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

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-2 w-2 rounded-full bg-white/60" />
      <span>{text}</span>
    </div>
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