import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsAppLauncher from "../../components/WhatsAppLauncher";
import { getPost, getPostSlugsIn } from "../../lib/posts.server";
import PostView from "../../components/blog/PostView";
import { HREFLANG, blogPath } from "../../lib/i18n";

export async function generateStaticParams() {
  const slugs = await getPostSlugsIn("en");
  return slugs.map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, "en");
  if (!post) return { title: "Post not found — Gio In The DR" };

  const description = post.excerpt ?? undefined;
  const image = post.cover?.url ?? undefined;

  return {
    title: `${post.title} — Gio In The DR`,
    description,
    /*
      hreflang, both directions. Google needs each language to point at the
      other or it treats them as unrelated pages competing for the same queries
      — which for a translated guide is the worst of both outcomes.
    */
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: post.translation
        ? { [HREFLANG.es]: blogPath("es", post.translation.slug), [HREFLANG.en]: `/blog/${post.slug}` }
        : undefined,
    },
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
  const post = await getPost(slug, "en");
  if (!post) notFound();


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
        <PostView post={post} locale="en" />
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
