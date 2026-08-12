import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppLauncher from "../components/WhatsAppLauncher";
import PostCard from "../components/PostCard";
import { getPosts } from "../lib/posts.server";

export const metadata: Metadata = {
  title: "Blog — Gio In The DR",
  description:
    "Guides on buying property, residency, taxes and living on the Dominican Republic's north coast.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
            Guides & stories
          </p>
          {/* Two headlines for two states — the empty one is a real page, not a
              placeholder, so an unpublished blog never looks like a broken deploy. */}
          <h1 className="font-display font-bold text-ink text-4xl md:text-6xl text-balance">
            {posts.length === 0 ? "The blog is on the way." : "Buying on the north coast."}
          </h1>
          <p className="text-muted text-lg leading-relaxed mt-5">
            {posts.length === 0
              ? "Soon: the 2026 Dominican Republic Buyer's Guide, area guides for Cabarete & Sosúa, and practical notes on residency, taxes and financing — all editable from the backend."
              : "What Gio gets asked before anyone is ready to talk to an agent — the buying process, the areas, the taxes, and what living here actually costs."}
          </p>
          {posts.length === 0 ? (
            <Link
              href="/#contact"
              className="inline-block mt-8 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
            >
              Get notified
            </Link>
          ) : null}
        </div>

        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 md:mt-16">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
