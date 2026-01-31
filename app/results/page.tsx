export const dynamic = "force-dynamic";
export const revalidate = 0;

import ResultsClient from "./ResultsClient";

type CarrierSlug = "mint" | "visible" | "us-mobile";

type Recommendation = {
  name: string;
  network: string;
  price: string;
  reason: string;
  slug: CarrierSlug;
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

  if (dataTier === "light") {
    const cheapest = mint("$15/mo", "Cheapest option for light data users.");
    const coverage = visible("$25/mo", "Better coverage if signal reliability matters.");
    const balanced = mint("$15/mo", "Strong value for light usage with simple pricing.");

    const bestMatch =
      priority === "cheapest" ? cheapest : priority === "coverage" ? coverage : balanced;

    return { bestMatch, cheapest, bestCoverage: coverage };
  }

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

/**
 * Confidence heuristic (MVP):
 * - Start with 82
 * - Add points when data tier is clear and priority matches plan intent
 * - Add points for "coverage" when using Verizon-backed (visible) in our rules
 * - Add points for West Coast on Mint (our rules use this)
 * - Clamp to 70–95
 */
function confidenceScore(
  best: Recommendation,
  homeZip: string,
  dataTier: string,
  priority: string
) {
  let score = 82;

  if (dataTier === "light" || dataTier === "unlimited") score += 4;
  if (dataTier === "heavy") score += 2;

  if (priority === "coverage" && best.slug === "visible") score += 6;
  if (priority === "cheapest" && (best.slug === "mint" || best.slug === "visible")) score += 3;
  if (priority === "balanced") score += 2;

  const westCoast = homeZip.startsWith("9");
  if (westCoast && best.slug === "mint") score += 3;

  // small penalty if missing zip
  if (!homeZip || homeZip.length < 5) score -= 8;

  // clamp
  score = Math.max(70, Math.min(95, score));
  return score;
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
  const confidence = confidenceScore(rec.bestMatch, homeZip, dataTier, priority);

  return (
    <ResultsClient
      homeZip={homeZip}
      dataTier={dataTier}
      priority={priority}
      currentBill={currentBill}
      currentCarrier={currentCarrier}
      bestMatch={rec.bestMatch}
      cheapest={rec.cheapest}
      bestCoverage={rec.bestCoverage}
      savings={savings}
      labelForDataTier={labelForDataTier(dataTier)}
      labelForPriority={labelForPriority(priority)}
      confidence={confidence}
    />
  );
}