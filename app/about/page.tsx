export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">About SignalWise</h1>

      <p className="mt-4 text-sm text-gray-300">
        SignalWise helps people quickly compare a curated set of high-value mobile carriers. You
        enter your ZIP code, estimated data usage, and what matters most (price vs coverage). We
        then recommend options that best match your inputs.
      </p>

      <p className="mt-4 text-sm text-gray-300">
        We focus on a small set of carriers first so we can keep recommendations clear and
        maintainable. More carriers may be added over time based on user demand.
      </p>

      <p className="mt-4 text-sm text-gray-300">
        We do not sell personal data. If you choose to switch, we send you to the official carrier
        site. We may earn a commission if you switch through our links, but recommendations are not
        paid placement.
      </p>

      <div className="mt-8">
        <a className="underline underline-offset-4 text-sm text-gray-300 hover:text-white" href="/">
          Back home
        </a>
      </div>
    </main>
  );
}