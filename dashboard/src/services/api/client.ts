import axios from 'axios';

// Laravel API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to attach Sanctum bearer tokens
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle common response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    return Promise.reject(error);
  }
);

// Pre-defined service skeletons to be implemented in future milestones
export const sellerApi = {
  // Placeholder for products CRUD, inventory updates, order fulfillment, settings, analytics
};

export const adminApi = {
  // Placeholder for tenant control, subscription management, plans editing, moderation actioning
};

export const onboardingApi = {
  // Placeholder for registration, theme onboarding step, shop activation
};

export const authApi = {
  // Placeholder for logins, logouts, passwords resetting, user self profile fetching
};

export const aiApi = {
  // Placeholder for theme auto-generation, translation assists, description writing
};
