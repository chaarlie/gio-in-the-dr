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
import { MAIL } from "../../lib/email";

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
            {/*
              Two ways to ask, because they suit different people: WhatsApp is
              instant and how most buyers here actually talk, email is what
              someone comparing four agents from another timezone reaches for.

              Same shape and size; the email one is outlined rather than filled
              so the pair reads as one choice with a default, not two buttons
              competing for the same click.

              The mailto carries the post title as its subject, so a reply does
              not start with "which article was this?".
            */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <a
                href={WA.general}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.17c-.24.68-1.2 1.26-1.94 1.42-.5.1-1.15.19-3.35-.72-2.81-1.16-4.62-4.01-4.76-4.2-.14-.19-1.13-1.5-1.13-2.86 0-1.36.71-2.03.96-2.31.25-.28.55-.35.73-.35h.52c.17 0 .4-.06.62.47.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.17-.19.7-.81.88-1.09.19-.28.37-.23.63-.14.25.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.68-.17 1.35Z" />
                </svg>
                Message Gio on WhatsApp
              </a>
              <a
                href={MAIL.guide(post.title)}
                className="inline-flex items-center gap-2 border border-ink/20 hover:border-ink hover:bg-ink/5 text-ink text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m3.5 7.5 7.6 5.1a1.6 1.6 0 0 0 1.8 0l7.6-5.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Email Gio
              </a>
            </div>
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
