"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { PaginatedRaw, ReviewRaw } from "@/lib/api/raw-types";
import { useAuth } from "@/lib/store/auth";
import { submitReview } from "@/lib/api/commerce";

export function ReviewList({ productId, reviews }: { productId: number; reviews: PaginatedRaw<ReviewRaw> }) {
  const t = useTranslations("product");
  const tr = useTranslations("reviews");
  const { customer } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mt-16">
      <h2 className="font-display text-xl font-bold mb-6">{t("reviews")}</h2>

      {reviews.data.length === 0 ? (
        <p className="text-sm text-ink-muted mb-8">—</p>
      ) : (
        <ul className="space-y-4 mb-8">
          {reviews.data.map((review) => (
            <li key={review.id} className="p-4 rounded-lg bg-surface-alt">
              <div className="flex items-center gap-2 mb-1">
                <Stars rating={review.rating} />
                <span className="text-sm font-medium">{review.customer?.name}</span>
              </div>
              {review.title && <p className="font-semibold text-sm">{review.title}</p>}
              {review.body && <p className="text-sm text-ink-muted mt-1">{review.body}</p>}
            </li>
          ))}
        </ul>
      )}

      {customer && !submitted && <ReviewForm productId={productId} onSubmitted={() => setSubmitted(true)} />}
      {submitted && <p className="text-sm font-medium">{tr("submit")} ✓</p>}
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-accent text-sm" aria-label={`${rating} / 5`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: number; onSubmitted: () => void }) {
  const t = useTranslations("product");
  const tr = useTranslations("reviews");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitReview(productId, rating, title, body);
    setLoading(false);
    onSubmitted();
  }

  return (
    <form onSubmit={onSubmit} className="p-4 rounded-lg bg-surface-alt space-y-3 max-w-md">
      <p className="font-semibold text-sm">{t("writeReview")}</p>
      <div>
        <label className="block text-sm mb-1">{tr("rating")}</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-lg bg-surface border border-current/10 px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-lg bg-surface border border-current/10 px-3 py-2 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={tr("comment")}
        rows={3}
        className="w-full rounded-lg bg-surface border border-current/10 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark transition text-white text-sm font-semibold disabled:opacity-60"
      >
        {tr("submit")}
      </button>
    </form>
  );
}
