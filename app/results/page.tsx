export const dynamic = "force-dynamic";
export const revalidate = 0;

type Recommendation = {
  name: string;
  network: string;
  price: string;
  reason: string;
  link: string;
};

function getSimpleRecommendation(homeZip: string, dataTier: string, priority: string) {
  const westCoast = homeZip.startsWith("9");

  if (dataTier === "light") {
    const cheapest: Recommendation = {
      name: "Mint Mobile",
      network: "T-Mobile",
      price: "$15/mo",
      reason: "Cheapest option for light data users.",
      link: "/go/mint",
    };

    const coverage: Recommendation = {
      name: "Visible",
      network: "Verizon",
      price: "$25/mo",
      reason: "Better coverage if signal reliability matters.",
      link: "/go/visible",
    };

    const balanced: Recommendation = {
      name: "Mint Mobile",
      network: "T-Mobile",
      price: "$15/mo",
      reason: "Strong value for light usage with simple pricing.",
      link: "/go/mint",
    };

    const bestMatch =
      priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

    return { bestMatch, cheapest, bestCoverage: coverage };
  }

  if (dataTier === "unlimited") {
    const cheapest: Recommendation = {
      name: "Visible",
      network: "Verizon",
      price: "$25/mo",
      reason: "Lowest-cost unlimited option with a simple signup flow.",
      link: "/go/visible",
    };

    const coverage: Recommendation = {
      name: "Visible Plus",
      network: "Verizon",
      price: "$45/mo",
      reason: "Higher priority data in busy areas and strong Verizon coverage.",
      link: "/go/visible",
    };

    const balanced: Recommendation = {
      name: westCoast ? "Mint Mobile" : "Visible",
      network: westCoast ? "T-Mobile" : "Verizon",
      price: westCoast ? "$30/mo" : "$25/mo",
      reason: "Unlimited data at a strong value for your region.",
      link: westCoast ? "/go/mint" : "/go/visible",
    };

    const bestMatch =
      priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

    return { bestMatch, cheapest, bestCoverage: coverage };
  }

  const cheapest: Recommendation = {
    name: "Mint Mobile",
    network: "T-Mobile",
    price: "$15–20/mo",
    reason: "Lower cost if you don’t need unlimited.",
    link: "/go/mint",
  };

  const coverage: Recommendation = {
    name: "Visible",
    network: "Verizon",
    price: "$45/mo",
    reason: "Often stronger coverage + priority options.",
    link: "/go/visible",
  };

  const balanced: Recommendation = {
    name: westCoast ? "Mint Mobile" : "Visible",
    network: westCoast ? "T-Mobile" : "Verizon",
    price: "$25–30/mo",
    reason: "Balanced option for most users in your area.",
    link: westCoast ? "/go/mint" : "/go/visible",
  };

  const bestMatch =
    priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

  return { bestMatch, cheapest, bestCoverage: coverage };
}

function withTracking(
  baseLink: string,
  ctx: { homeZip: string; dataTier: string; priority: string; source: string; currentBill?: string; currentCarrier?: string }
) {
  const qs = new URLSearchParams();
  qs.set("homeZip", ctx.homeZip);
  qs.set("dataTier", ctx.dataTier);
  qs.set("priority", ctx.priority);
  qs.set("source", ctx.source);
  if (ctx.currentBill) qs.set("currentBill", ctx.currentBill);
  if (ctx.currentCarrier) qs.set("currentCarrier", ctx.currentCarrier);
  return `${baseLink}?${qs.toString()}`;
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

  const why = [
    `Matches your data usage: ${labelForDataTier(dataTier)}`,
    `Optimized for your priority: ${labelForPriority(priority)}`,
    `Network fit for your ZIP: ${homeZip || "(missing)"}`,
  ];

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
            <p className="text-sm text-gray-300">
              Best Match is highlighted. Cheapest and Coverage are still available below.
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
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                Best Match
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
                {why.map((w) => (
                  <Bullet key={w} text={w} />
                ))}
              </div>

              <div className="mt-2 grid gap-2 text-xs text-gray-300 sm:grid-cols-3">
                <MiniStat title="Keep your number" value="Yes" />
                <MiniStat title="Time to switch" value="~10 min" />
                <MiniStat title="Contract" value="No" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center md:w-60">
              <p className="text-xs text-gray-400">Est. monthly</p>
              <p className="mt-1 text-3xl font-semibold">{rec.bestMatch.price}</p>

              <p className="mt-3 text-xs text-gray-400">Savings vs your current bill</p>
              <p className="mt-1 text-xl font-semibold">
                {savings !== null ? `$${savings}/mo` : "—"}
              </p>

              <a
                href={withTracking(rec.bestMatch.link, { ...ctxBase, source: "results" })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
              >
                Switch Now
              </a>

              <p className="mt-2 text-xs text-gray-500">Official carrier site</p>
            </div>
          </div>
        </div>

        {/* SECONDARY */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ResultCard
            title="Cheapest Option"
            subtitle="Lowest monthly cost for your selection"
            item={rec.cheapest}
            bullets={[
              "Best if you want to minimize your bill",
              "Simple signup and pricing",
              "May deprioritize under congestion (varies)",
            ]}
            href={withTracking(rec.cheapest.link, { ...ctxBase, source: "cheapest_card" })}
          />

          <ResultCard
            title="Best Coverage (Estimate)"
            subtitle="Reliability-first recommendation"
            item={rec.bestCoverage}
            bullets={[
              "Better fit if signal reliability matters most",
              "Coverage estimate (MVP rules for now)",
              "We’ll upgrade this with real coverage data",
            ]}
            href={withTracking(rec.bestCoverage.link, { ...ctxBase, source: "coverage_card" })}
          />
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Disclosure: We may earn a commission if you switch through our links. This does not affect
          recommendations.
        </p>
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

function ResultCard({
  title,
  subtitle,
  item,
  bullets,
  href,
}: {
  title: string;
  subtitle: string;
  item: Recommendation;
  bullets: string[];
  href: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
          <p className="text-sm text-gray-300">{subtitle}</p>

          <div className="mt-3 flex items-center gap-3">
            <LogoDot label={initials(item.name)} />
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-xs text-gray-400">Network: {item.network}</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Est. monthly</p>
          <p className="text-xl font-semibold">{item.price}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-200">{item.reason}</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-200">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-white/60" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
      >
        Switch Now
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
