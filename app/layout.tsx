import "./globals.css";

export const metadata = {
  other: {
    "impact-site-verification": "594589f7-ba8c-43d6-8bca-2b6342305891",
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
        {children}
      </body>
    </html>
  );
}