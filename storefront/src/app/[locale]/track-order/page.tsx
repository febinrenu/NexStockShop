"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/store/auth";
import * as commerce from "@/lib/api/commerce";
import type { OrderRaw, PaginatedRaw } from "@/lib/api/raw-types";

/**
 * Backend order tracking (GET /v1/orders/{order}/tracking) is
 * auth:customer only — there's no guest lookup-by-order-number endpoint,
 * so this looks up among the signed-in shopper's own orders rather than
 * accepting an arbitrary order number from anyone.
 */
export default function TrackOrderPage() {
  const t = useTranslations("orders");
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<PaginatedRaw<OrderRaw> | null>(null);
  const [query, setQuery] = useState("");
  const [tracking, setTracking] = useState<{ order_number: string; status: string; history: OrderRaw["statusHistory"] } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !customer) router.replace("/login");
  }, [loading, customer, router]);

  useEffect(() => {
    if (customer) commerce.listOrders().then(setOrders);
  }, [customer]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNotFound(false);
    setTracking(null);
    const match = orders?.data.find((o) => o.order_number.toLowerCase() === query.trim().toLowerCase());
    if (!match) {
      setNotFound(true);
      return;
    }
    setTracking(await commerce.getOrderTracking(match.id));
  }

  if (!customer) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-6">{t("trackTitle")}</h1>

      <form onSubmit={onSubmit} className="flex gap-2 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ORD-XXXXXXXXXX"
          className="flex-1 rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
        />
        <button type="submit" className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark transition text-white text-sm font-semibold">
          {t("trackLookup")}
        </button>
      </form>

      {notFound && <p className="text-sm text-accent">No matching order found.</p>}

      {tracking && (
        <div>
          <p className="font-semibold mb-1">{t("orderNumber", { number: tracking.order_number })}</p>
          <p className="text-sm text-ink-muted mb-4">{t("status")}: {tracking.status}</p>
          <h2 className="font-semibold mb-2">{t("trackHistory")}</h2>
          <ol className="space-y-2">
            {tracking.history?.map((h) => (
              <li key={h.id} className="text-sm flex justify-between">
                <span className="capitalize">{h.status}</span>
                <span className="text-ink-muted">{h.note}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
