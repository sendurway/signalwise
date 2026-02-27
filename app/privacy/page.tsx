export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Privacy</h1>

      <p className="mt-4 text-sm text-gray-300">
        SignalWise is designed to be simple and privacy-conscious. This page explains what we
        collect and why.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
      <ul className="mt-3 text-sm text-gray-300 space-y-2">
        <li>• Inputs you provide (ZIP, data tier, priority) to generate recommendations.</li>
        <li>• Click events (which carrier link you clicked) to measure what’s working.</li>
        <li>• Basic technical info (like browser user-agent) for debugging and fraud prevention.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">What we don’t do</h2>
      <ul className="mt-3 text-sm text-gray-300 space-y-2">
        <li>• We do not sell your personal information.</li>
        <li>• We do not require an account to use the tool.</li>
        <li>• We do not collect sensitive personal data like SSNs.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Affiliate disclosure</h2>
      <p className="mt-3 text-sm text-gray-300">
        We may earn a commission if you switch through our links. This does not affect the
        recommendations shown.
      </p>

      <div className="mt-8">
        <a className="underline underline-offset-4 text-sm text-gray-300 hover:text-white" href="/">
          Back home
        </a>
      </div>
    </main>
  );
}