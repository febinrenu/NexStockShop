import { getTranslations } from "next-intl/server";

const FAQ_KEYS = ["shipping", "returns", "payment", "sizing", "contact"] as const;

export default async function HelpPage() {
  const t = await getTranslations("help");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>

      <dl className="divide-y divide-current/10">
        {FAQ_KEYS.map((key) => (
          <div key={key} className="py-4">
            <dt className="font-semibold capitalize mb-1">{key}</dt>
            <dd className="text-sm text-ink-muted">
              Contact support if you have questions about {key} — we typically reply within one business day.
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
