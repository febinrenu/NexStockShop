import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/router/redirect/usePathname — always prefix hrefs
// with the active locale automatically instead of every call site having
// to remember to do it.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
