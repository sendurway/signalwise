export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Contact</h1>

      <p className="mt-4 text-sm text-gray-300">
        Questions, feedback, or a carrier you want us to add?
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-gray-300">Email</div>
        <div className="mt-2 text-sm font-semibold text-gray-100">
          support@signalwise.vercel.app
        </div>
        <div className="mt-2 text-xs text-gray-400">
          (You can replace this with a real support email later.)
        </div>
      </div>

      <div className="mt-8">
        <a className="underline underline-offset-4 text-sm text-gray-300 hover:text-white" href="/">
          Back home
        </a>
      </div>
    </main>
  );
}