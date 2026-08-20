import Image from "next/image";
import { WA } from "../lib/whatsapp";
import SectionHeading from "./SectionHeading";
import { DEFAULT_LOCALE, MESSAGES, type Locale } from "../lib/i18n";

type HomeMessages = (typeof MESSAGES)["en"]["home"];

function stats(t: HomeMessages) {
  return [
    { big: "4+", label: t.aboutStatYears },
    { big: "3", label: t.aboutStatLanguages },
    { big: "1:1", label: t.aboutStatService },
  ];
}

export default function About({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = MESSAGES[locale].home;
  const STATS = stats(t);
  return (
    <section id="about" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-8 pt-14 sm:pt-20 pb-4">
      <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
        <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-accent">
          {/* Headshot here; the hero keeps the wider beachfront portrait, so the
              two sections don't repeat the same image. */}
          <Image
            src="/gio-headshot.jpg"
            alt="Gio, real estate agent in Cabarete, Dominican Republic"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-[center_30%]"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow={t.aboutEyebrow}
            title={t.aboutHeading}
          />
          <p className="text-muted text-lg leading-relaxed max-w-xl mt-5"> {t.aboutBody1}</p>
          <p className="text-muted text-lg leading-relaxed max-w-xl mt-4"> {t.aboutBody2}</p>
          <div className="flex flex-wrap gap-10 mt-8">
            {STATS.map((s) => (
              <div key={s.big}>
                <div className="font-display text-3xl font-bold text-ink">{s.big}</div>
                <div className="text-muted text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <a
            href={WA.general}
            target="_blank"
            rel="noopener"
            className="inline-block mt-9 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >
            {t.aboutCta}
          </a>
        </div>
      </div>
    </section>
  );
}
