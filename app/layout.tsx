import "./globals.css";

export const metadata = {
  other: {
    "impact-site-verification": "594589f7-ba8c-43d6-8bca-2b6342305891",
    "impact_site_verification": "594589f7-ba8c-43d6-8bca-2b6342305891",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>

          <footer className="border-t border-white/10 bg-black/30">
            <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-gray-300 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <a className="underline underline-offset-4 hover:text-white" href="/about">
                  About
                </a>
                <a className="underline underline-offset-4 hover:text-white" href="/privacy">
                  Privacy
                </a>
                <a className="underline underline-offset-4 hover:text-white" href="/contact">
                  Contact
                </a>
              </div>

              <div className="text-gray-400">
                Disclosure: We may earn a commission if you switch through our links. This does not
                affect recommendations.
              </div>

              <div className="text-gray-500">
                Recommendations are generated from your inputs (ZIP, data usage, and priority) and
                known carrier characteristics — not paid placement.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}