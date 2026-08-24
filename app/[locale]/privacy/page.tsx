import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage, { legalMetadata } from "../../components/LegalPage";
import { DEFAULT_LOCALE, isLocale } from "../../lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  return legalMetadata(isLocale(raw) ? raw : DEFAULT_LOCALE, "privacy");
}

export default async function PrivacyPolicy({ params }: PageProps) {
  const { locale: raw } = await params;
  // Same guard as every other route: a segment that is not a locale is a 404,
  // not English served under a second URL.
  if (raw && !isLocale(raw)) notFound();
  return <LegalPage locale={raw} slug="privacy" />;
}
