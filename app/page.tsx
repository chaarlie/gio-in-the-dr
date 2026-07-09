// Temporary preview: renders the standalone HTML design (from public/gio-in-the-dr.html)
// full-viewport. This is a static-HTML preview only — the real React/Sanity build replaces it.
export default function Home() {
  return (
    <iframe
      src="/gio-in-the-dr.html"
      title="Gio In The DR"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
    />
  );
}
