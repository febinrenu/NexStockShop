"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function SearchBar({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search")}
        className="w-full rounded-full bg-surface-alt border border-current/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}
