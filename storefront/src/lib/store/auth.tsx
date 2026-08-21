"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { browserApiClient } from "@/lib/api/client-browser";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api/storage";

/**
 * Matches App\Models\Tenant\Customer's actual serialized shape ($hidden:
 * password, remember_token) — hand-declared because Scramble couldn't
 * statically infer it from `response()->json(['customer' => $customer])`
 * and generated `unknown[]` for it (see schema.ts's customerAuth.* ops).
 */
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  preferred_locale: string;
  created_at: string;
  updated_at: string;
}

const AuthContext = createContext<{
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage read has to happen post-mount (SSR has no localStorage),
    // so this can't be lazy useState init — genuine "sync with an external
    // system on mount" effect, not derived state.
    const token = getAuthToken();
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    // No dedicated GET /v1/me-for-token-check exists beyond the
    // customer-guard /v1/me profile endpoint, so use that directly to
    // both validate the stored token and hydrate the customer.
    browserApiClient()
      .GET("/v1/me")
      .then(({ data, error }) => {
        if (!error && data) setCustomer(data as unknown as Customer);
        else clearAuthToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await browserApiClient().POST("/v1/customer/auth/login", {
      body: { email, password },
    });
    if (error || !data) {
      const message =
        (error as { message?: string } | undefined)?.message ?? "Those credentials don't look right.";
      return { ok: false as const, message };
    }
    setAuthToken(data.token);
    setCustomer(data.customer as unknown as Customer);
    return { ok: true as const };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await browserApiClient().POST("/v1/customer/auth/register", {
      body: { name, email, password },
    });
    if (error || !data) {
      const message = (error as { message?: string } | undefined)?.message ?? "Registration failed.";
      return { ok: false as const, message };
    }
    setAuthToken(data.token);
    setCustomer(data.customer as unknown as Customer);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await browserApiClient().POST("/v1/customer/auth/logout");
    clearAuthToken();
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
