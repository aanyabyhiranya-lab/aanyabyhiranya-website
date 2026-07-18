import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshops & Collaborations",
  description: "Intimate, hands-on workshops in botanical pressing and resin art, plus brand and event collaborations rooted in sustainability and craft.",
};

export default function Workshops() {
  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Community</p>
        <h1 className="font-script text-5xl md:text-6xl text-forest dark:text-beige mb-16">Workshops & Collaborations</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div className="border-t border-forest/20 dark:border-beige/20 pt-10">
            <h2 className="font-script text-3xl text-forest dark:text-beige mb-4">Workshops</h2>
            <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-6">
              Hiranya hosts intimate, hands-on workshops exploring botanical pressing, resin art, and slow creative practices. Sessions are kept small to allow for genuine connection and learning.
            </p>
            <p className="text-sm text-dark/50 dark:text-beige/50 italic">More coming soon. Reach out to collaborate.</p>
          </div>
          <div className="border-t border-forest/20 dark:border-beige/20 pt-10">
            <h2 className="font-script text-3xl text-forest dark:text-beige mb-4">Brand & Event Collaborations</h2>
            <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-6">
              Open to collaborations with brands, spaces, and events that share a commitment to sustainability, craft, and intentional living.
            </p>
            <p className="text-sm text-dark/50 dark:text-beige/50 italic">More coming soon. Reach out to collaborate.</p>
          </div>
        </div>

        <div className="text-center py-16 border-t border-forest/20 dark:border-beige/20">
          <p className="font-script text-3xl text-forest dark:text-beige mb-4">Interested in working together?</p>
          <p className="text-dark/60 dark:text-beige/60 mb-8">Get in touch to discuss workshops, events, or brand collaborations.</p>
          <Link href="/contact"
            className="inline-block text-xs tracking-widest uppercase bg-forest text-white px-10 py-4 hover:bg-teal transition-colors">
            Contact Hiranya
          </Link>
        </div>
      </div>
    </div>
  );
}
