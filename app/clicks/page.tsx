export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { readFile } from "fs/promises";
import path from "path";

type ClickEvent = {
  type: string;
  carrier: string;
  homeZip: string;
  dataTier: string;
  priority: string;
  source: string;
  at: string;
  userAgent?: string;
};

function pct(n: number, d: number) {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

export default async function ClicksPage() {
  const filePath = path.join(process.cwd(), "data", "clicks.jsonl");

  let events: ClickEvent[] = [];
  try {
    const content = await readFile(filePath, "utf8");
    const lines = content.trim().split("\n").filter(Boolean);
    const last = lines.slice(-500); // keep more events for better summaries

    events = last
      .map((line) => {
        try {
          return JSON.parse(line) as ClickEvent;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ClickEvent[];
  } catch {
    // No file yet is fine
  }

  const total = events.length;

  const byCarrier = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.carrier] = (acc[e.carrier] ?? 0) + 1;
    return acc;
  }, {});

  const bySource = events.reduce<Record<string, number>>((acc, e) => {
    const key = e.source || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  // "results" = Best Match hero CTA in our implementation
  const bestMatchClicks = bySource["results"] ?? 0;
  const cheapestCardClicks = bySource["cheapest_card"] ?? 0;
  const coverageCardClicks = bySource["coverage_card"] ?? 0;
  const otherClicks = total - (bestMatchClicks + cheapestCardClicks + coverageCardClicks);

  const tableEvents = events.slice(-50).slice().reverse();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200">
              SignalWise
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Clicks</h1>
            <p className="mt-2 text-sm text-gray-300">
              Showing summaries from the last {events.length} recorded switch clicks (local dev file).
            </p>
          </div>

          <a
            href="/"
            className="mt-2 text-sm underline underline-offset-4 text-gray-300 hover:text-white"
          >
            Home
          </a>
        </div>

        {/* Summary: totals + best match share */}
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <StatCard title="Total clicks" value={String(total)} sub="All recorded clicks" />
          <StatCard
            title="Best Match share"
            value={pct(bestMatchClicks, total)}
            sub={`${bestMatchClicks} from Best Match CTA`}
          />
          <StatCard
            title="Cheapest card clicks"
            value={String(cheapestCardClicks)}
            sub={pct(cheapestCardClicks, total)}
          />
          <StatCard
            title="Coverage card clicks"
            value={String(coverageCardClicks)}
            sub={pct(coverageCardClicks, total)}
          />
        </div>

        {/* Breakdown grids */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* By carrier */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm font-semibold">Clicks by carrier</div>
            <div className="mt-3 grid gap-2">
              {Object.entries(byCarrier)
                .sort((a, b) => b[1] - a[1])
                .map(([carrier, count]) => (
                  <RowStat
                    key={carrier}
                    label={carrier}
                    value={`${count}`}
                    meta={pct(count, total)}
                  />
                ))}
              {Object.keys(byCarrier).length === 0 && (
                <div className="text-sm text-gray-400">No clicks yet.</div>
              )}
            </div>
          </div>

          {/* By source */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm font-semibold">Clicks by source</div>
            <div className="mt-3 grid gap-2">
              {Object.entries(bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <RowStat
                    key={source}
                    label={source}
                    value={`${count}`}
                    meta={pct(count, total)}
                  />
                ))}
              {total > 0 && otherClicks > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  Note: {otherClicks} clicks have source values outside the main three (results / cheapest_card / coverage_card).
                </div>
              )}
              {Object.keys(bySource).length === 0 && (
                <div className="text-sm text-gray-400">No clicks yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Carrier</th>
                <th className="px-4 py-3">ZIP</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {tableEvents.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-400" colSpan={6}>
                    No clicks recorded yet. Go to Results and press “Switch Now”.
                  </td>
                </tr>
              ) : (
                tableEvents.map((e, idx) => (
                  <tr key={idx} className="border-t border-white/10">
                    <td className="px-4 py-3 text-gray-300">{e.at}</td>
                    <td className="px-4 py-3 font-semibold">{e.carrier}</td>
                    <td className="px-4 py-3">{e.homeZip}</td>
                    <td className="px-4 py-3">{e.dataTier}</td>
                    <td className="px-4 py-3">{e.priority}</td>
                    <td className="px-4 py-3 text-gray-300">{e.source || "unknown"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Stored locally in <code className="text-gray-200">data/clicks.jsonl</code>. For production we’ll move this to a database.
        </p>
      </div>
    </main>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{sub}</div>
    </div>
  );
}

function RowStat({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <div className="text-sm font-medium text-gray-200">{label}</div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-xs text-gray-400">{meta}</div>
      </div>
    </div>
  );
}
