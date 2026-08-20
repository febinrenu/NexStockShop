import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the `middleware.ts` file/export convention to
// `proxy.ts` / `export function proxy` (the `middleware` export name and
// filename are deprecated, not removed yet — see node_modules/next/dist/docs
// /01-app/02-guides/upgrading/version-16.md, "`middleware` to `proxy`").
// next-intl's createMiddleware() still just returns a standard
// (request) => NextResponse handler, so it's re-exported under the new name.
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  return handleI18nRouting(request);
}

export const config = {
  // Skip /api routes (none live in this app — all API calls go straight
  // to Person A's backend), Next internals, and static/image files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
