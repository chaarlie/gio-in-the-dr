import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "../PostCard";
import BlogTabs from "./BlogTabs";
import Pagination from "../properties/Pagination";
import { getBlogTopics, getPostsPage } from "../../lib/posts.server";
import { blogPath, blogTopicPath, localePath, type Locale } from "../../lib/i18n";
import { topicSlug } from "../../lib/topics";
import { MESSAGES } from "../../lib/messages";

/*
  The blog index body, shared by the unfiltered index (/blog) and a category
  archive (/blog/topic/<slug>). One page of posts, filtered and sliced in GROQ —
  so it stays the same size whether the blog has ten posts or a thousand.

  `activeTopic` is the topic label to filter by, or null for the whole index —
  the one thing the routes decide (and the archive route 404s an unknown slug
  before this ever runs). The active tab's slug is derived from it here rather
  than passed alongside, so the two can't be handed in disagreeing with each other.
*/
export default async function BlogIndex({
  locale,
  activeTopic,
  page,
}: {
  locale: Locale;
  activeTopic: string | null;
  page: number;
}) {
  const t = MESSAGES[locale].blog;
  const common = MESSAGES[locale].common;
  const activeSlug = activeTopic ? topicSlug(activeTopic) : "all";

  const [topics, result] = await Promise.all([
    getBlogTopics(locale),
    getPostsPage(locale, activeTopic ?? "", page),
  ]);

  /*
    A page past the end is a 404, not an empty grid — the duplicate-content trap
    the properties index documents. Page one is always allowed: for the whole
    index it may legitimately be empty (the blog is not published yet), and an
    archive route has already proven its topic has posts.
  */
  if (page > 1 && page > result.pageCount) notFound();

  // Two empty shapes: the whole blog has nothing yet, or a real category whose
  // posts are still scheduled. The category one keeps its tabs and heading; only
  // the whole-blog one falls back to the "on its way" placeholder.
  const emptyAll = activeTopic === null && result.total === 0;
  const emptyTopic = activeTopic !== null && result.total === 0;

  // The active category has to appear as a tab even with no live posts — that is
  // exactly the scheduled category the menu links to — so the strip can show it
  // selected rather than highlighting nothing.
  const tabLabels = [...topics];
  if (activeTopic && !tabLabels.includes(activeTopic)) tabLabels.push(activeTopic);

  const tabs = [
    { slug: "all", href: blogPath(locale), label: t.allTopics },
    ...tabLabels.map((label) => ({
      slug: topicSlug(label),
      href: blogTopicPath(locale, topicSlug(label)),
      label,
    })),
  ];

  const base = activeSlug === "all" ? blogPath(locale) : blogTopicPath(locale, activeSlug);
  const hrefFor = (p: number) => (p > 1 ? `${base}?page=${p}` : base);

  const heading = emptyAll ? t.indexEmpty : (activeTopic ?? t.indexHeading);
  // The whole index gets an intro, an empty category a "check back" line; a
  // populated category's label speaks for itself.
  const intro = emptyAll
    ? t.indexEmptyBody
    : emptyTopic
      ? t.emptyTopic
      : activeTopic
        ? null
        : t.indexIntro;

  return (
    <>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
          {t.indexEyebrow}
        </p>
        <h1 className="font-display font-bold text-ink text-4xl md:text-6xl text-balance">
          {heading}
        </h1>
        {intro ? (
          <p className="text-muted text-lg leading-relaxed mt-5">{intro}</p>
        ) : null}
        {emptyAll || emptyTopic ? (
          <Link
            href={localePath(locale, "/#contact")}
            className="inline-block mt-8 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >
            {t.getNotified}
          </Link>
        ) : null}
      </div>

      {!emptyAll && tabLabels.length > 0 ? (
        <BlogTabs tabs={tabs} activeSlug={activeSlug} ariaLabel={t.filterLabel} />
      ) : null}

      {result.items.length > 0 ? (
        <>
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ${
              tabLabels.length > 0 ? "mt-8 md:mt-10" : "mt-12 md:mt-16"
            }`}
          >
            {result.items.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            hrefFor={hrefFor}
            labels={{
              previous: common.previous,
              next: common.next,
              pagination: common.pagination,
            }}
          />
        </>
      ) : null}
    </>
  );
}
