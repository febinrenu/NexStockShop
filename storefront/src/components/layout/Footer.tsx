"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { subscribeNewsletter } from "@/lib/api/commerce";

export function Footer({ storeName }: { storeName: string }) {
  const tf = useTranslations("footer");
  const tn = useTranslations("nav");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    await subscribeNewsletter(email.trim());
    setStatus("done");
    setEmail("");
  }

  return (
    <footer className="mt-auto bg-surface-alt border-t border-current/10 shadow-nav-up">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold mb-2">{storeName}</p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/shop">{tn("shop")}</Link>
          <Link href="/brands">{tn("brands")}</Link>
          <Link href="/deals">{tn("deals")}</Link>
        </nav>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/about">{tn("about")}</Link>
          <Link href="/help">{tn("help")}</Link>
          <Link href="/track-order">{tn("trackOrder")}</Link>
        </nav>

        <div>
          <p className="font-semibold mb-1">{tf("newsletterTitle")}</p>
          <p className="text-sm text-ink-muted mb-3">{tf("newsletterBody")}</p>
          {status === "done" ? (
            <p className="text-sm font-medium">{tf("subscribeSuccess")}</p>
          ) : (
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tf("emailPlaceholder")}
                className="flex-1 min-w-0 rounded-lg bg-surface border border-current/10 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-primary hover:bg-primary-dark transition text-white text-sm font-semibold px-4 py-2 shrink-0 disabled:opacity-60"
              >
                {tf("subscribe")}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-current/10 py-4 text-center text-xs text-ink-muted">
        &copy; {new Date().getFullYear()} {storeName}. {tf("rights")}
      </div>
    </footer>
  );
}
