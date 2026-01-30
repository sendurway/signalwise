export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ClickRow = {
  id: string;
  created_at: string;
  carrier: string;
  home_zip: string | null;
  data_tier: string | null;
  priority: string | null;
  source: string | null;
  current_carrier: string | null;
  current_bill: number | null;
};

function pct(n: number, d: number) {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

export default async function ClicksPage() {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("clicks")
    .select(
      "id, created_at, carrier, home_zip, data_tier, priority, source, current_carrier, current_bill"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const rows: ClickRow[] = data ?? [];
  const total = rows.length;

  const byCarrier = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.carrier] = (acc[r.carrier] ?? 0) + 1;
    return acc;
  }, {});

  const bySource = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.source || "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const bestMatchClicks = bySource["results"] ?? 0;
  const cheapestCardClicks = bySource["cheapest_card"] ?? 0;
  const coverageCardClicks = bySource["coverage_card"] ?? 0;

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
              Showing the last {rows.length} clicks from Supabase.
            </p>

            {error ? (
              <p className="mt-2 text-sm text-red-300">
                Error loading clicks: {String(error.message ?? error)}
              </p>
            ) : null}
          </div>

          <a
            href="/"
            className="mt-2 text-sm underline underline-offset-4 text-gray-300 hover:text-white"
          >
            Home
          </a>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <StatCard title="Total clicks" value={String(total)} sub="Last 300 rows" />
          <StatCard
            title="Best Match share"
            value={pct(bestMatchClicks, total)}
            sub={`${bestMatchClicks} from Best Match CTA`}
          />
          <StatCard
            title="Cheapest card"
            value={String(cheapestCardClicks)}
            sub={pct(cheapestCardClicks, total)}
          />
          <StatCard
            title="Coverage card"
            value={String(coverageCardClicks)}
            sub={pct(coverageCardClicks, total)}
          />
        </div>

        {/* Breakdowns */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="Clicks by carrier">
            {Object.keys(byCarrier).length === 0 ? (
              <div className="text-sm text-gray-400">No clicks yet.</div>
            ) : (
              <div className="grid gap-2">
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
              </div>
            )}
          </Panel>

          <Panel title="Clicks by source">
            {Object.keys(bySource).length === 0 ? (
              <div className="text-sm text-gray-400">No clicks yet.</div>
            ) : (
              <div className="grid gap-2">
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
              </div>
            )}
          </Panel>
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
                <th className="px-4 py-3">Current bill</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-400" colSpan={7}>
                    No clicks recorded yet. Go to Results and press “Switch Now”.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-gray-300">{r.created_at}</td>
                    <td className="px-4 py-3 font-semibold">{r.carrier}</td>
                    <td className="px-4 py-3">{r.home_zip ?? ""}</td>
                    <td className="px-4 py-3">{r.data_tier ?? ""}</td>
                    <td className="px-4 py-3">{r.priority ?? ""}</td>
                    <td className="px-4 py-3 text-gray-300">{r.source ?? ""}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {r.current_bill !== null ? `$${r.current_bill}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Dashboard is now production-ready (reads from Supabase).
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3">{children}</div>
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