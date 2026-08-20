import Link from "next/link";
import { WA } from "../lib/whatsapp";
import SectionHeading from "./SectionHeading";
import { DEFAULT_LOCALE, type Locale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";

type HomeMessages = (typeof MESSAGES)["en"]["home"];

function services(t: HomeMessages) {
  return [
    { title: t.serviceListingsTitle, body: t.serviceListingsBody, href: "#properties", dark: false },
    { title: t.serviceGuideTitle, body: t.serviceGuideBody, href: WA.invest, dark: true },
    { title: t.serviceRelocationTitle, body: t.serviceRelocationBody, href: WA.relocate, dark: false },
  ];
}

export default function Services({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = MESSAGES[locale].home;
  const SERVICES = services(t);
  return (
    <section
      id="services"
      className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-12 sm:pt-16 pb-4"
    >
      <SectionHeading align="center" title={t.servicesEyebrow} className="mb-11">
        <p className="text-muted mt-3">
          {t.servicesHeading}
        </p>
      </SectionHeading>
      <div className="grid md:grid-cols-3 gap-5">
        {SERVICES.map((s) => {
          const external = s.href.startsWith("http");
          const cls = s.dark
            ? "bg-accent text-cream"
            : "bg-card border border-line text-ink";
          return (
            <div key={s.title} className={`rounded-3xl p-8 ${cls}`}>
              <div className="font-display text-2xl font-semibold">
                {s.title}
              </div>
              <p
                className={`mt-3.5 leading-relaxed ${s.dark ? "text-cream/80" : "text-muted"}`}
              >
                {s.body}
              </p>
              {external ? (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className={`inline-block mt-6 text-sm font-semibold no-underline ${
                    s.dark ? "text-cream" : "text-ink"
                  }`}
                >
                  {t.servicesMore}
                </a>
              ) : (
                <Link
                  href={s.href}
                  className="inline-block mt-6 text-sm font-semibold text-ink no-underline"
                >
                  {t.servicesMore}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
