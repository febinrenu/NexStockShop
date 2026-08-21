import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Product/branding images are served from whichever tenant's own
    // domain the storefront is currently on, plus the central app for
    // shared/demo assets — both resolved at request time, so this can't
    // be a fixed hostname allowlist.
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
