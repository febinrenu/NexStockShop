"use client";

import { use, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/store/auth";
import * as commerce from "@/lib/api/commerce";
import type { OrderRaw } from "@/lib/api/raw-types";
import { formatMinor } from "@/lib/money";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const to = useTranslations("orders");
  const locale = useLocale();
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderRaw | null>(null);

  useEffect(() => {
    if (!loading && !customer) router.replace("/login");
  }, [loading, customer, router]);

  useEffect(() => {
    if (customer) commerce.getOrder(Number(id)).then(setOrder);
  }, [customer, id]);

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">{to("orderNumber", { number: order.order_number })}</h1>
      <p className="text-sm text-ink-muted mb-6">{to("status")}: {order.status}</p>

      <ul className="divide-y divide-current/10 mb-6">
        {order.items?.map((item) => (
          <li key={item.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{item.product_name}</p>
              <p className="text-xs text-ink-muted">{item.quantity} × {formatMinor(item.unit_price_minor, order.currency, locale)}</p>
            </div>
            <span className="text-sm font-medium">{formatMinor(item.line_total_minor, order.currency, locale)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-current/10 pt-4">
        <span className="font-semibold">{to("total")}</span>
        <span className="font-semibold text-lg">{formatMinor(order.total_minor, order.currency, locale)}</span>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold mb-3">{to("trackHistory")}</h2>
          <ol className="space-y-2">
            {order.statusHistory.map((h) => (
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
