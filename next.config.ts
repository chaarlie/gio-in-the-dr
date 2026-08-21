import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    next/root-params lets a server component read the [locale] segment without it
    being threaded down as a prop. Stable in 16.3; this project is on 16.2.10,
    where it is still behind a flag.

    Worth the flag because prop threading is what produced a real bug here: the
    sweep that added `locale` to every home section matched on `areas=` and
    skipped AreaMap, whose prop is `areas={areasPromise}`, so one heading stayed
    English while the rest of the page translated. Reading the value removes the
    class of mistake, not just that instance.

    If it becomes a problem, the escape is small: each converted component takes
    a `locale` prop again.
  */
  experimental: {
    rootParams: true,
  },
  images: {
    // Property photos come from Sanity's asset CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
