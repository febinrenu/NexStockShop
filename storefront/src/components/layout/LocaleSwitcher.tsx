"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="bg-transparent text-sm border border-current/20 rounded px-2 py-1 cursor-pointer"
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l} className="text-black">
          {l === "ar" ? "العربية" : "English"}
        </option>
      ))}
    </select>
  );
}
