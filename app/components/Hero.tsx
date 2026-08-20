import Image from "next/image";
import { DEFAULT_LOCALE, MESSAGES, type Locale } from "../lib/i18n";

export default function Hero({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = MESSAGES[locale].home;
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 pt-6 sm:pt-10 pb-6">
      <div className="grid lg:grid-cols-2 gap-7 lg:gap-12 items-center">
        {/* Text */}
        <div className="py-4">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted">
            {t.heroEyebrow}
          </p>
          <h1 className="font-display font-extrabold text-ink leading-[1.03] tracking-tight text-4xl sm:text-5xl lg:text-7xl mt-4 sm:mt-5 text-balance">
            {t.heroHeading}
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-md mt-6"> {t.heroBody}</p>

          <div className="flex items-center gap-3 mt-10">
            <Image
              src="/gio-avatar-1x1.jpg"
              alt="Gio, real estate agent in Cabarete"
              width={52}
              height={52}
              className="w-[52px] h-[52px] rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-sm text-ink">Gio</div>
              <div className="text-muted text-[13px]">
                {t.heroRole}
              </div>
            </div>
          </div>
        </div>

        {/* Portrait */}
        {/* 4:5 at every width. The old fixed lg:h-[600px] made the frame ~0.97,
            which suited the square photo that used to live here but crops 130px
            off a 4:5 portrait — straight through the top of her head. */}
        <div className="relative rounded-[28px] overflow-hidden bg-accent aspect-[4/5]">
          <Image
            src="/gio-portrait-4x5.jpg"
            alt="Gio, real estate agent, at a beachfront property in Cabarete, Dominican Republic"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
