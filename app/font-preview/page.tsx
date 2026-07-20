import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Font Preview",
  robots: { index: false, follow: false },
};

const FONTS = [
  { name: "Yellowtail",     family: "'Yellowtail', cursive",     note: "Current choice — bold, single-weight brush script" },
  { name: "Alex Brush",     family: "'Alex Brush', cursive",     note: "True brush-pen feel with thick/thin variation — closest to the Golden Plains reference" },
  { name: "Sacramento",     family: "'Sacramento', cursive",     note: "Thin, delicate, elegant signature style" },
  { name: "Pacifico",       family: "'Pacifico', cursive",       note: "Rounded, friendly, more casual/bubbly" },
  { name: "Caveat",         family: "'Caveat', cursive",         note: "Genuine handwriting feel, less 'brush', more 'note'" },
  { name: "Parisienne",     family: "'Parisienne', cursive",     note: "Flowing, delicate, formal script" },
  { name: "Great Vibes",    family: "'Great Vibes', cursive",    note: "Elegant calligraphy, very flowing, thin strokes" },
  { name: "Kaushan Script", family: "'Kaushan Script', cursive", note: "Bold brush script, playful, casual" },
  { name: "Marck Script",   family: "'Marck Script', cursive",   note: "Casual signature style, medium weight" },
];

export default function FontPreview() {
  return (
    <div style={{ background: "#f8e9de", minHeight: "100vh", padding: "48px 24px" }}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@400;700&family=Great+Vibes&family=Kaushan+Script&family=Marck+Script&family=Pacifico&family=Parisienne&family=Sacramento&family=Yellowtail&display=swap"
      />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2E4D38", opacity: 0.6, marginBottom: 40 }}>
          Font comparison — not part of the live site
        </p>
        {FONTS.map(f => (
          <div key={f.name} style={{ borderBottom: "1px solid rgba(46,77,56,0.15)", padding: "28px 0" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4D38", opacity: 0.5, marginBottom: 8 }}>
              {f.name}
            </p>
            <p style={{ fontFamily: f.family, fontSize: 44, color: "#2E4D38", lineHeight: 1.15, marginBottom: 4 }}>
              AanyaByHiranya
            </p>
            <p style={{ fontFamily: f.family, fontSize: 32, color: "#2E4D38", lineHeight: 1.15, marginBottom: 8 }}>
              Request a Commission
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1C1A", opacity: 0.6 }}>
              {f.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
