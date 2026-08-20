"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/store/auth";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.ok) router.push("/account");
    else setError(result.message);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-6 text-center">{t("registerTitle")}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("name")}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("email")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("password")}</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark transition text-white font-semibold disabled:opacity-60"
        >
          {t("registerCta")}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-ink-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary font-semibold">
          {t("loginCta")}
        </Link>
      </p>
    </div>
  );
}
