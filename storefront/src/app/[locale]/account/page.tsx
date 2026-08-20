"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/store/auth";
import { browserApiClient } from "@/lib/api/client-browser";
import * as commerce from "@/lib/api/commerce";
import type { OrderRaw, PaginatedRaw } from "@/lib/api/raw-types";
import { formatMinor } from "@/lib/money";

export default function AccountPage() {
  const t = useTranslations("account");
  const to = useTranslations("orders");
  const locale = useLocale();
  const { customer, loading, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<PaginatedRaw<OrderRaw> | null>(null);

  useEffect(() => {
    if (!loading && !customer) router.replace("/login");
  }, [loading, customer, router]);

  useEffect(() => {
    // Seeds editable form fields once the async-loaded customer arrives —
    // genuine sync-from-external-source, not derivable during render since
    // these fields are then user-editable independently of `customer`.
    if (customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(customer.name);
      setPhone(customer.phone ?? "");
      commerce.listOrders().then(setOrders);
    }
  }, [customer]);

  if (!customer) return null;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    await browserApiClient().PATCH("/v1/me", { body: { name, phone: phone || null } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <button onClick={() => logout().then(() => router.push("/"))} className="text-sm text-ink-muted hover:text-accent">
          Sign Out
        </button>
      </div>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">{t("profile")}</h2>
        <form onSubmit={onSave} className="space-y-3 max-w-sm">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          />
          <input value={customer.email} disabled className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm opacity-60" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          />
          <button type="submit" className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark transition text-white text-sm font-semibold">
            {saved ? "✓" : t("save")}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">{t("orders")}</h2>
        {!orders || orders.data.length === 0 ? (
          <p className="text-sm text-ink-muted">{t("noOrders")}</p>
        ) : (
          <ul className="divide-y divide-current/10">
            {orders.data.map((order) => (
              <li key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{to("orderNumber", { number: order.order_number })}</p>
                  <p className="text-xs text-ink-muted">{order.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatMinor(order.total_minor, order.currency, locale)}</span>
                  <Link href={`/orders/${order.id}`} className="text-sm text-primary font-semibold">
                    {to("viewDetails")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
