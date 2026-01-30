"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type DataTier = "light" | "medium" | "heavy" | "unlimited";
type Priority = "cheapest" | "balanced" | "coverage";

const isDataTier = (x: string): x is DataTier =>
  x === "light" || x === "medium" || x === "heavy" || x === "unlimited";

export default function StartPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [homeZip, setHomeZip] = useState("");
  const [dataTier, setDataTier] = useState<DataTier>("medium");
  const [priority, setPriority] = useState<Priority>("balanced");

  const [currentCarrier, setCurrentCarrier] = useState("");
  const [currentBill, setCurrentBill] = useState("");

  // Prefill when returning from Results
  useEffect(() => {
    const zip = sp.get("homeZip");
    const tier = sp.get("dataTier");
    const pr = sp.get("priority");
    const cc = sp.get("currentCarrier");
    const cb = sp.get("currentBill");

    if (zip) setHomeZip(zip);
    if (tier && isDataTier(tier)) setDataTier(tier);
    if (pr === "cheapest" || pr === "balanced" || pr === "coverage") setPriority(pr);
    if (cc) setCurrentCarrier(cc);
    if (cb) setCurrentBill(cb);
  }, [sp]);

  function goToResults() {
    const zip = homeZip.trim();
    if (zip.length !== 5) return;

    const qs = new URLSearchParams();
    qs.set("homeZip", zip);
    qs.set("dataTier", dataTier);
    qs.set("priority", priority);
    if (currentCarrier.trim()) qs.set("currentCarrier", currentCarrier.trim());
    if (currentBill.trim()) qs.set("currentBill", currentBill.trim());

    router.push(`/results?${qs.toString()}`);
  }

  const canSubmit = homeZip.trim().length === 5 && currentBill.trim().length > 0;

  const dataChoice = (key: DataTier, title: string, subtitle: string) => {
    const active = dataTier === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setDataTier(key)}
        className={
          "rounded-2xl border p-4 text-left transition " +
          (active ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10")
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-100">{title}</div>
            <div className="mt-1 text-xs text-gray-400">{subtitle}</div>
          </div>
          <div
            className={
              "mt-0.5 h-4 w-4 rounded-full border " +
              (active ? "border-white bg-white" : "border-white/30")
            }
          />
        </div>
      </button>
    );
  };

  const priorityChoice = (key: Priority, title: string, subtitle: string) => {
    const active = priority === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setPriority(key)}
        className={
          "rounded-2xl border p-4 text-left transition " +
          (active ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10")
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-100">{title}</div>
            <div className="mt-1 text-xs text-gray-400">{subtitle}</div>
          </div>
          <div
            className={
              "mt-0.5 h-4 w-4 rounded-full border " +
              (active ? "border-white bg-white" : "border-white/30")
            }
          />
        </div>
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200">
              SignalWise
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">Let’s personalize this</h1>
            <p className="text-sm text-gray-300">
              Answer a few questions. We’ll show a best match + real monthly savings.
            </p>

            {/* Transparency microcopy */}
            <p className="text-xs text-gray-400">
              Recommendations are generated from your inputs and known carrier characteristics. We don’t accept paid placement.
            </p>
          </div>

          <a
            href="/"
            className="mt-2 text-sm font-medium text-gray-300 underline underline-offset-4 hover:text-white"
          >
            Back
          </a>
        </div>

        {/* Content */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Left: ZIP + Current bill */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-200">1) Where do you use your phone?</h2>
              <span className="text-xs text-gray-400">Coverage</span>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-gray-300">Home ZIP</label>
              <input
                value={homeZip}
                onChange={(e) => setHomeZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="e.g. 94928"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-lg text-gray-100 placeholder-gray-500 outline-none focus:border-white/20"
              />
              <p className="text-xs text-gray-400">
                We’ll weight coverage confidence heavily at your home ZIP.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-200">2) What are you paying now?</h2>
                <span className="text-xs text-gray-400">Savings</span>
              </div>

              <label className="text-xs font-semibold text-gray-300">Current carrier (optional)</label>
              <select
                value={currentCarrier}
                onChange={(e) => setCurrentCarrier(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-gray-100 outline-none focus:border-white/20"
              >
                <option value="">Select carrier</option>
                <option value="Verizon">Verizon</option>
                <option value="AT&T">AT&amp;T</option>
                <option value="T-Mobile">T-Mobile</option>
                <option value="Mint">Mint</option>
                <option value="Visible">Visible</option>
                <option value="Other">Other</option>
              </select>

              <label className="mt-3 block text-xs font-semibold text-gray-300">
                Current monthly bill ($)
              </label>
              <input
                type="number"
                value={currentBill}
                onChange={(e) => setCurrentBill(e.target.value)}
                placeholder="e.g. 85"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-lg text-gray-100 placeholder-gray-500 outline-none focus:border-white/20"
              />
              <p className="text-xs text-gray-400">
                We compare your best match vs this number to show real savings.
              </p>
            </div>
          </div>

          {/* Right: Data + Priority */}
          <div className="space-y-6">
            {/* Data card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-200">3) How much data?</h2>
                <span className="text-xs text-gray-400">Plans</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {dataChoice("light", "Light", "Under 5GB")}
                {dataChoice("medium", "Medium", "5–15GB")}
                {dataChoice("heavy", "Heavy", "15–35GB")}
                {dataChoice("unlimited", "Unlimited", "Or not sure")}
              </div>

              <p className="mt-3 text-xs text-gray-400">
                This helps avoid plans that throttle or don’t match your usage.
              </p>
            </div>

            {/* Priority card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-200">4) What matters most?</h2>
                <span className="text-xs text-gray-400">Your goal</span>
              </div>

              <div className="mt-4 grid gap-3">
                {priorityChoice("cheapest", "Cheapest", "Lowest monthly price")}
                {priorityChoice("balanced", "Balanced", "Best overall fit")}
                {priorityChoice("coverage", "Coverage", "Reliability first")}
              </div>

              <p className="mt-3 text-xs text-gray-400">
                We’ll change the “Best Match” recommendation based on this.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <button
            onClick={goToResults}
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-white px-5 py-4 text-base font-semibold text-black hover:opacity-90 disabled:opacity-40"
          >
            See Results
          </button>

          <p className="mt-3 text-xs text-gray-400">
            Disclosure: We may earn a commission if you switch through our links. This does not affect recommendations.
          </p>
        </div>
      </div>
    </main>
  );
}