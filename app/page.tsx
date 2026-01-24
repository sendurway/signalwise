import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h1>SignalWise</h1>
      <p>Find the best cell phone plan for your location.</p>

      <Link href="/start">
        <button style={{ marginTop: 16, padding: "12px 18px", cursor: "pointer" }}>
          Start
        </button>
      </Link>
    </main>
  );
}
