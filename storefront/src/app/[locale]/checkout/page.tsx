"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import { useAuth } from "@/lib/store/auth";
import * as commerce from "@/lib/api/commerce";
import type { CheckoutSessionRaw } from "@/lib/api/commerce";
import type { AddressRaw, OrderRaw } from "@/lib/api/raw-types";
import { formatMinor } from "@/lib/money";

type Step = "address" | "shipping" | "payment" | "confirm";
const STEPS: Step[] = ["address", "shipping", "payment", "confirm"];

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { cart, loading: cartLoading, clear } = useCart();
  const { customer } = useAuth();

  const [session, setSession] = useState<CheckoutSessionRaw | null>(null);
  const [step, setStep] = useState<Step>("address");
  const [order, setOrder] = useState<OrderRaw | null>(null);

  const [addresses, setAddresses] = useState<AddressRaw[]>([]);
  const [addressForm, setAddressForm] = useState({ recipient_name: "", line1: "", city: "", country: "" });
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState("card_on_file");

  useEffect(() => {
    if (cart && !session) commerce.createCheckoutSession(cart.id).then(setSession);
  }, [cart, session]);

  useEffect(() => {
    if (customer) commerce.listAddresses().then(setAddresses);
  }, [customer]);

  if (cartLoading || (!session && cart)) return null;

  // Placing the order clears the cart client-side (see goToConfirm), so
  // this guard must not fire once we've actually reached the confirmation
  // step — otherwise a successful order renders as "cart is empty".
  if (step !== "confirm" && (!cart || cart.items.length === 0)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-ink-muted mb-4">Your cart is empty.</p>
        <Link href="/shop" className="text-primary font-semibold">
          Continue shopping
        </Link>
      </div>
    );
  }

  async function goToShipping() {
    if (!session) return;
    let shippingAddressId = selectedAddressId;
    if (customer && !shippingAddressId && addressForm.recipient_name) {
      const created = await commerce.createAddress({ ...addressForm, label: null, phone: null, line2: null, state: null, postal_code: null, is_default: false });
      shippingAddressId = created.id;
    }
    const patch: Parameters<typeof commerce.updateCheckoutSession>[1] = { status: "shipping" };
    if (shippingAddressId) patch.shipping_address_id = shippingAddressId;
    setSession(await commerce.updateCheckoutSession(session.id, patch));
    setStep("shipping");
  }

  async function goToPayment() {
    if (!session) return;
    setSession(await commerce.updateCheckoutSession(session.id, { status: "payment", shipping_method: shippingMethod }));
    setStep("payment");
  }

  async function goToConfirm() {
    if (!session) return;
    await commerce.updateCheckoutSession(session.id, { status: "complete", payment_method: paymentMethod });
    const completedOrder = await commerce.completeCheckoutSession(session.id);
    setOrder(completedOrder);
    await clear();
    setStep("confirm");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>

      <ol className="flex items-center gap-2 mb-8 text-xs font-medium">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 ${step === s ? "text-primary" : "text-ink-muted"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step === s ? "bg-primary text-white" : "bg-surface-alt"}`}>
              {i + 1}
            </span>
            {t(`step${s[0].toUpperCase()}${s.slice(1)}` as "stepAddress")}
            {i < STEPS.length - 1 && <span className="w-4 h-px bg-current/20" />}
          </li>
        ))}
      </ol>

      {step === "address" && (
        <div className="space-y-4">
          <h2 className="font-semibold">{t("shippingAddress")}</h2>
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label key={a.id} className="flex items-start gap-2 p-3 rounded-lg bg-surface-alt cursor-pointer">
                  <input type="radio" name="address" checked={selectedAddressId === a.id} onChange={() => setSelectedAddressId(a.id)} />
                  <span className="text-sm">
                    {a.recipient_name}, {a.line1}, {a.city}, {a.country}
                  </span>
                </label>
              ))}
            </div>
          )}
          {!selectedAddressId && (
            <div className="space-y-3">
              <input
                placeholder={t("fullName")}
                value={addressForm.recipient_name}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
              />
              <input
                placeholder={t("line1")}
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder={t("city")}
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
                />
                <input
                  placeholder={t("country")}
                  maxLength={2}
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value.toUpperCase() })}
                  className="rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
                />
              </div>
              {!customer && <p className="text-xs text-ink-muted">Signed-in shoppers can save this address for next time.</p>}
            </div>
          )}
          <button onClick={goToShipping} className="w-full px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark transition text-white font-semibold">
            {t("continue")}
          </button>
        </div>
      )}

      {step === "shipping" && (
        <div className="space-y-4">
          <h2 className="font-semibold">{t("shippingMethod")}</h2>
          {(["standard", "express"] as const).map((method) => (
            <label key={method} className="flex items-center gap-2 p-3 rounded-lg bg-surface-alt cursor-pointer">
              <input type="radio" name="shipping" checked={shippingMethod === method} onChange={() => setShippingMethod(method)} />
              <span className="text-sm">{t(method)}</span>
            </label>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setStep("address")} className="flex-1 px-6 py-3 rounded-lg border border-current/20 font-semibold">
              {t("back")}
            </button>
            <button onClick={goToPayment} className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark transition text-white font-semibold">
              {t("continue")}
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-4">
          <h2 className="font-semibold">{t("paymentMethod")}</h2>
          <label className="flex items-center gap-2 p-3 rounded-lg bg-surface-alt cursor-pointer">
            <input type="radio" name="payment" checked={paymentMethod === "card_on_file"} onChange={() => setPaymentMethod("card_on_file")} />
            <span className="text-sm">{t("cardOnFile")}</span>
          </label>
          <div className="flex items-center justify-between border-t border-current/10 pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-lg">
              {/* step only reaches "payment" via goToPayment, which requires session,
                  which the effect above only ever sets once cart exists — so cart is
                  non-null here even though the guard above (scoped to step !== "confirm")
                  can't prove that to the type checker. */}
              {formatMinor(session?.totals?.subtotal_minor ?? cart!.subtotal_minor, cart!.currency, locale)}
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("shipping")} className="flex-1 px-6 py-3 rounded-lg border border-current/20 font-semibold">
              {t("back")}
            </button>
            <button onClick={goToConfirm} className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark transition text-white font-semibold">
              {t("placeOrder")}
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && order && (
        <div className="text-center py-8">
          <p className="text-xl font-semibold mb-2">{t("orderPlaced")}</p>
          <p className="text-ink-muted mb-6">
            {t("orderNumber")}: {order.order_number}
          </p>
          <Link href="/account" className="text-primary font-semibold">
            View your orders
          </Link>
        </div>
      )}
    </div>
  );
}
