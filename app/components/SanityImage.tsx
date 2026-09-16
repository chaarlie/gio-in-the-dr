"use client";

import Image, { type ImageProps } from "next/image";
import { sanityLoader } from "../lib/sanity-image";

// Keep the loader within the client boundary so server-rendered cards can use
// Sanity's resizing without passing a function across the server/client boundary.
export default function SanityImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image {...props} alt={alt} loader={sanityLoader} />;
}
