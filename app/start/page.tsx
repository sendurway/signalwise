"use client";

import { useState } from "react";

export default function StartPage() {
  const [homeZip, setHomeZip] = useState("");
  const [dataTier, setDataTier] = useState("medium");
  const [priority, setPriority] = useState("balanced");
  const [currentCarrier, setCurrentCarrier] = useState("");
  const [currentBill, setCurrentBill] = useState("");

  const canSubmit = homeZip.length === 5 && currentBill !== "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          Find a better mobile plan
        </h1>
        <p className="mt-3 text-gray-300">
          Answer a few questions and we’ll recommend the best option for you.
        </p>

        <div className="mt-10 space-y-6">
          {/* ZIP */}
          <Field label="Home ZIP">
            <input
              value={homeZip}
              onChange={(e) => setHomeZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="e.g. 94928"
              className="w-full rounded-xl bg-black/40 px-4 py-3 text-white outline-none ring-1 ring-white/10"
            />
          </Field>

          {/* Current carrier */}
          <Field label="Current carrier (optional)">
            <select
              value={currentCarrier}
              onChange={(e) => setCurrentCarrier(e.target.value)}
              className="w-full rounded-xl bg-black/40 px-4 py-3 text-white outline-none ring-1 ring-white/10"
            >
              <option value="">Select carrier</option>
              <option value="Verizon">Verizon</option>
              <option value="AT&T">AT&T</option>
              <option value="T-Mobile">T-Mobile</option>
              <option value="Other">Other</option>
            </select>
          </Field>

          {/* Bill */}
          <Field label="Current monthly bill ($)">
            <input
              type="number"
              value={currentBill}
              onChange={(e) => setCurrentBill(e.target.value)}
              placeholder="e.g. 85"
              className="w-full rounded-xl bg-black/40 px-4 py-3 text-white outline-none ring-1 ring-white/10"
            />
          </Field>

          {/* Data */}
          <Field label="Monthly data usage">
            <select
              value={dataTier}
              onChange={(e) => setDataTier(e.target.value)}
              className="w-full rounded-xl bg-black/40 px-4 py-3 text-white outline-none ring-1 ring-white/10"
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </Field>

          {/* Priority */}
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl bg-black/40 px-4 py-3 text-white outline-none ring-1 ring-white/10"
            >
              <option value="balanced">Balanced</option>
              <option value="cheapest">Cheapest</option>
              <option value="coverage">Coverage</option>
            </select>
          </Field>

          <a
            href={`/results?homeZip=${homeZip}&dataTier=${dataTier}&priority=${priority}&currentCarrier=${encodeURIComponent(
              currentCarrier
            )}&currentBill=${encodeURIComponent(currentBill)}`}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-4 text-sm font-semibold ${
              canSubmit
                ? "bg-white text-black hover:opacity-90"
                : "bg-white/20 text-gray-400 pointer-events-none"
            }`}
          >
            See Results
          </a>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">{label}</label>
      {children}
    </div>
  );
}
