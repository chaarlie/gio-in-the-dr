import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsAppLauncher from "../../components/WhatsAppLauncher";
import PortableBody from "../../components/PortableBody";
import PostCard from "../../components/PostCard";
import { formatDate, getPost, getPostSlugs, readingTime } from "../../lib/posts.server";
import { WA } from "../../lib/whatsapp";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found — Gio In The DR" };

  const description = post.excerpt ?? undefined;
  const image = post.cover?.url ?? undefined;

  return {
    title: `${post.title} — Gio In The DR`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = formatDate(post.publishedAt);
  const minutes = readingTime(post.body);
  const related = post.related ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    image: post.cover?.url ? [post.cover.url] : undefined,
    author: { "@type": "Person", name: "Gio" },
    publisher: { "@type": "Organization", name: "Gio In The DR" },
    mainEntityOfPage: `/blog/${post.slug}`,
  };

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 w-full">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink no-underline transition-colors"
          >
            ← All guides
          </Link>

          <header className="mt-6">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {post.topic ? <span>{post.topic}</span> : null}
              {post.topic && date ? <span aria-hidden="true">·</span> : null}
              {date ? (
                <time dateTime={post.publishedAt ?? undefined} className="tracking-normal normal-case">
                  {date}
                </time>
              ) : null}
              {minutes ? <span aria-hidden="true">·</span> : null}
              {minutes ? <span className="tracking-normal normal-case">{minutes}</span> : null}
            </p>
            <h1 className="font-display font-bold text-ink text-4xl md:text-5xl mt-3 text-balance">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="text-muted text-lg leading-relaxed mt-4">{post.excerpt}</p>
            ) : null}
          </header>

          {post.cover?.url ? (
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-accent mt-8">
              <Image
                src={post.cover.url}
                alt={post.cover.alt ?? ""}
                fill
                priority
                sizes="(min-width: 768px) 720px, 100vw"
                placeholder={post.cover.lqip ? "blur" : undefined}
                blurDataURL={post.cover.lqip ?? undefined}
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mt-10">
            <PortableBody value={post.body} />
          </div>

          {/* Every guide answers a question someone was going to ask anyway — so end
              where that question goes next. */}
          <aside className="mt-14 bg-card border border-line rounded-3xl p-7 text-center">
            <p className="font-display text-2xl font-semibold text-ink text-balance">
              Questions this didn&apos;t answer?
            </p>
            <p className="text-muted mt-2">
              Gio works in English, Spanish and Italian, and usually replies the same day.
            </p>
            <a
              href={WA.general}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
            >
              Message Gio on WhatsApp
            </a>
          </aside>
        </article>

        {related.length > 0 ? (
          <section className="max-w-6xl mx-auto px-6 md:px-8 pb-16 md:pb-20">
            <h2 className="font-display font-semibold text-ink text-2xl mb-6">Keep reading</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
      <WhatsAppLauncher />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
