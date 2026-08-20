import { apiClient } from './client';

export interface OnboardingSignupParams {
  business_name: string;
  subdomain: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface OnboardingSignupResponse {
  tenant_id: string;
  domain: string;
  status: string;
}

export interface OnboardingThemeParams {
  template_id: string;
  business_description?: string;
  primary_color?: string;
}

export interface OnboardingThemeResponse {
  tenant_id: string;
  branding_theme: string;
}

export interface OnboardingGoLiveResponse {
  tenant_id: string;
  status: string;
}

let isOnboardingOffline = false;

export const onboardingService = {
  async signup(params: OnboardingSignupParams): Promise<OnboardingSignupResponse> {
    if (isOnboardingOffline) {
      return {
        tenant_id: 'mock-tenant-uuid-12345',
        domain: `${params.subdomain}.localhost:3000`,
        status: 'pending',
      };
    }

    try {
      const response = await apiClient.post('/central/signup', params);
      return response.data;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isOnboardingOffline = true;
        console.warn('Central Onboarding API server is offline. Falling back to local mock signup.');
        return {
          tenant_id: 'mock-tenant-uuid-12345',
          domain: `${params.subdomain}.localhost:3000`,
          status: 'pending',
        };
      }
      throw e;
    }
  },

  async saveTheme(tenantId: string, params: OnboardingThemeParams): Promise<OnboardingThemeResponse> {
    if (isOnboardingOffline) {
      return {
        tenant_id: tenantId,
        branding_theme: params.template_id,
      };
    }

    try {
      const response = await apiClient.post(`/central/onboarding/${tenantId}/theme`, params);
      return response.data;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isOnboardingOffline = true;
        console.warn('Central Onboarding API server is offline. Falling back to local mock theme save.');
        return {
          tenant_id: tenantId,
          branding_theme: params.template_id,
        };
      }
      throw e;
    }
  },

  async goLive(tenantId: string): Promise<OnboardingGoLiveResponse> {
    if (isOnboardingOffline) {
      throw {
        response: {
          status: 422,
          data: {
            message: 'Add at least one product before going live. (Offline Backend Mock Validation)',
          },
        },
      };
    }

    try {
      const response = await apiClient.post(`/central/onboarding/${tenantId}/go-live`);
      return response.data;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        throw {
          response: {
            status: 422,
            data: {
              message: 'Add at least one product before going live. (Offline Network Fallback)',
            },
          },
        };
      }
      throw e;
    }
  },
};
