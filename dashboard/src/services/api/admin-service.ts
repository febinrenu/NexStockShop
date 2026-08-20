import { apiClient } from './client';

export interface AdminLoginParams {
  email: string;
  password: string;
}

export interface AdminUser {
  id: number | string;
  name: string;
  email: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminUser;
}

export interface ModerationFlag {
  id: number | string;
  status: 'pending' | 'actioned' | 'dismissed';
  trigger_type?: string;
  reason: string;
  violating_content?: string;
  reporter?: string;
  created_at: string;
  actioned_at?: string | null;
  actioned_by?: number | string | null;
}

export interface PlatformTenant {
  id: string;
  name: string;
  domain: string;
  status: 'pending' | 'active' | 'suspended';
  mrr: number;
  created_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  billing_interval: string;
  product_limit: number | null;
  staff_limit: number | null;
  feature_flags: Record<string, boolean>;
  is_active: boolean;
}

export interface BillingInvoice {
  id: string;
  tenant_name: string;
  amount_formatted: string;
  status: 'paid' | 'failed' | 'open';
  created_at: string;
}

// In-Memory Mock database for Platform Tenants & Plans (No backend endpoints exist)
const mockTenants: PlatformTenant[] = [
  { id: 't-01', name: 'Aurum Jewelers', domain: 'aurum.trippleshop.test', status: 'active', mrr: 99.00, created_at: '2026-08-01' },
  { id: 't-02', name: 'Fresh Fruits Market', domain: 'fresh.trippleshop.test', status: 'active', mrr: 29.00, created_at: '2026-08-05' },
  { id: 't-03', name: 'Luxe Furniture Home', domain: 'luxehome.trippleshop.test', status: 'pending', mrr: 0.00, created_at: '2026-08-10' },
  { id: 't-04', name: 'Future Gadgets', domain: 'future.trippleshop.test', status: 'suspended', mrr: 29.00, created_at: '2026-08-12' },
];

const mockPlans: SubscriptionPlan[] = [
  { id: 1, name: 'Starter', slug: 'starter', price_cents: 0, currency: 'USD', billing_interval: 'month', product_limit: 25, staff_limit: 1, feature_flags: { ai_onboarding: false, custom_domain: false }, is_active: true },
  { id: 2, name: 'Growth', slug: 'growth', price_cents: 2900, currency: 'USD', billing_interval: 'month', product_limit: 500, staff_limit: 5, feature_flags: { ai_onboarding: true, custom_domain: true }, is_active: true },
  { id: 3, name: 'Scale', slug: 'scale', price_cents: 9900, currency: 'USD', billing_interval: 'month', product_limit: null, staff_limit: null, feature_flags: { ai_onboarding: true, custom_domain: true, priority_support: true }, is_active: true },
];

const mockInvoices: BillingInvoice[] = [
  { id: 'inv_001', tenant_name: 'Aurum Jewelers', amount_formatted: '$99.00 USD', status: 'paid', created_at: '2026-08-01' },
  { id: 'inv_002', tenant_name: 'Future Gadgets', amount_formatted: '$29.00 USD', status: 'paid', created_at: '2026-08-12' },
  { id: 'inv_003', tenant_name: 'Luxe Furniture Home', amount_formatted: '$29.00 USD', status: 'failed', created_at: '2026-08-15' },
];

let isPlatformOffline = false;

let mockSettings: Record<string, string> = {
  allow_new_signups: 'true',
  system_maintenance: 'false',
  registration_limit: '500',
  default_pricing_tier: 'starter',
};

let mockFlags: ModerationFlag[] = [
  { id: 1, status: 'pending', trigger_type: 'System Scan', reason: 'Profanity in product description: "Bada** Jewelry"', violating_content: 'Bada** Jewelry', reporter: 'Description Filter Engine', created_at: '2026-08-19 14:32:00' },
  { id: 2, status: 'pending', trigger_type: 'Risk Engine', reason: 'Unusual checkout refund rate spike (>40%)', violating_content: 'Refund rate flag', reporter: 'Transactions Analyzer', created_at: '2026-08-18 09:12:00' },
  { id: 3, status: 'actioned', trigger_type: 'User Report', reason: 'Copyright infringement claim', violating_content: 'Trademark logo mismatch', reporter: 'Legal Counsel', created_at: '2026-08-15 11:22:00', actioned_at: '2026-08-15 15:00:00', actioned_by: 1 },
];

export const adminService = {
  // --- Platform Authentication ---
  async login(params: AdminLoginParams): Promise<AdminLoginResponse> {
    const response = await apiClient.post('/central/auth/login', params);
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/central/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_admin');
    }
  },

  getCurrentAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const adminStr = localStorage.getItem('auth_admin');
    return adminStr ? JSON.parse(adminStr) : null;
  },

  // --- Platform Settings (Live GET/PATCH) ---
  async getSettings(): Promise<Record<string, string>> {
    if (isPlatformOffline) {
      return { ...mockSettings };
    }

    try {
      const response = await apiClient.get('/central/platform/settings');
      return response.data;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        if (!isPlatformOffline) {
          isPlatformOffline = true;
          console.warn('Central Platform API server is offline. Dashboard is falling back to platform mock settings.');
        }
      } else {
        console.error('Failed to retrieve platform settings:', e);
      }
      return { ...mockSettings };
    }
  },

  async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    if (isPlatformOffline) {
      mockSettings = { ...mockSettings, ...settings };
      return { ...mockSettings };
    }

    try {
      const response = await apiClient.patch('/central/platform/settings', { settings });
      return response.data;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        if (!isPlatformOffline) {
          isPlatformOffline = true;
          console.warn('Central Platform API server is offline. Saving updates to local mock settings.');
        }
        mockSettings = { ...mockSettings, ...settings };
      } else {
        console.error('Failed to update platform settings:', e);
        throw e;
      }
      return { ...mockSettings };
    }
  },

  // --- Content Moderation (Live GET/POST) ---
  async getModerationQueue(status?: string): Promise<{ data: ModerationFlag[]; total: number }> {
    if (isPlatformOffline) {
      let filtered = [...mockFlags];
      if (status) {
        filtered = filtered.filter(f => f.status === status);
      }
      return { data: filtered, total: filtered.length };
    }

    try {
      const response = await apiClient.get('/central/platform/moderation-queue', {
        params: { status },
      });
      const data = response.data?.data || [];
      const total = response.data?.total || 0;
      return { data, total };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        if (!isPlatformOffline) {
          isPlatformOffline = true;
          console.warn('Central Platform API server is offline. Falling back to mock moderation flags.');
        }
      } else {
        console.error('Failed to retrieve moderation queue:', e);
      }
      
      let filtered = [...mockFlags];
      if (status) {
        filtered = filtered.filter(f => f.status === status);
      }
      return { data: filtered, total: filtered.length };
    }
  },

  async actionModerationFlag(flagId: number | string, status: 'actioned' | 'dismissed'): Promise<ModerationFlag> {
    if (isPlatformOffline) {
      let updatedFlag: ModerationFlag | null = null;
      mockFlags = mockFlags.map((f) => {
        if (String(f.id) === String(flagId)) {
          updatedFlag = {
            ...f,
            status,
            actioned_at: new Date().toISOString().replace('T', ' ').split('.')[0],
            actioned_by: 'Platform Super Admin',
          };
          return updatedFlag;
        }
        return f;
      });
      if (!updatedFlag) throw new Error('Moderation flag not found');
      return updatedFlag;
    }

    try {
      const response = await apiClient.post(`/central/platform/moderation-queue/${flagId}/action`, { status });
      return response.data;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        if (!isPlatformOffline) {
          isPlatformOffline = true;
          console.warn('Central Platform API server is offline. Actioning flag in mock database.');
        }
        let updatedFlag: ModerationFlag | null = null;
        mockFlags = mockFlags.map((f) => {
          if (String(f.id) === String(flagId)) {
            updatedFlag = {
              ...f,
              status,
              actioned_at: new Date().toISOString().replace('T', ' ').split('.')[0],
              actioned_by: 'Platform Super Admin',
            };
            return updatedFlag;
          }
          return f;
        });
        if (!updatedFlag) throw new Error('Moderation flag not found');
        return updatedFlag;
      } else {
        console.error('Failed to action moderation flag:', e);
        throw e;
      }
    }
  },

  // --- Mock Platforms views ---
  async getTenantsList(): Promise<PlatformTenant[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockTenants;
  },

  async getPlansList(): Promise<SubscriptionPlan[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockPlans;
  },

  async getBillingLogs(): Promise<BillingInvoice[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockInvoices;
  },
};
