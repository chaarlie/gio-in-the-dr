import Image from "next/image";
import Link from "next/link";
import { formatDate, type PostCard as Post } from "../lib/posts.server";

/*
  A post on the index. Cover image when there is one, a tinted band in the accent
  colour when there isn't — same call as the property cards, so a post published
  before Gio has a photo still looks finished.
*/
export default function PostCard({ post }: { post: Post }) {
  const date = formatDate(post.publishedAt);

  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className="group block no-underline h-full bg-card border border-line rounded-3xl overflow-hidden hover:border-ink/20 transition-colors"
      >
        <div className="relative aspect-[16/10] bg-accent overflow-hidden">
          {post.cover?.url ? (
            <Image
              src={post.cover.url}
              alt={post.cover.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              placeholder={post.cover.lqip ? "blur" : undefined}
              blurDataURL={post.cover.lqip ?? undefined}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-cream/15">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 4h14v16l-7-3.5L5 20V4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {post.topic ? <span>{post.topic}</span> : null}
            {post.topic && date ? <span aria-hidden="true">·</span> : null}
            {date ? <span className="tracking-normal normal-case">{date}</span> : null}
          </p>
          <h2 className="font-display font-semibold text-ink text-xl leading-snug mt-2 text-balance">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="text-muted text-sm leading-relaxed mt-2">{post.excerpt}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
