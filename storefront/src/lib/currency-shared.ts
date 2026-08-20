// Shared between the client CurrencyProvider (writes this cookie) and the
// server getSelectedCurrency() (reads it) — kept in its own file with no
// "server-only"/"use client" guard so both sides can import it safely.
export const CURRENCY_COOKIE = "trippleshop_currency";
