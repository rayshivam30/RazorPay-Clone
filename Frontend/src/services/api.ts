import axios from 'axios';
import type {
  CreateOrderRequest,
  Order,
  Payment,
  PaymentInitRequest,
  Refund,
  RefundRequest,
  ApiKey,
  ApiKeyCreateResponse,
  WebhookEvent,
  Settlement,
  TokenizeRequest,
  TokenizeResponse,
  Merchant,
  LoginResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/v1`
  : 'http://localhost:8080/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('jwtToken', token);
  } else {
    localStorage.removeItem('jwtToken');
  }
};

export const setApiKeyCredentials = (keyId: string | null, keySecret: string | null) => {
  if (keyId && keySecret) {
    localStorage.setItem('apiKeyId', keyId);
    localStorage.setItem('apiKeySecret', keySecret);
  } else {
    localStorage.removeItem('apiKeyId');
    localStorage.removeItem('apiKeySecret');
  }
};

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const token = localStorage.getItem('jwtToken');
  const keyId = localStorage.getItem('apiKeyId');
  const keySecret = localStorage.getItem('apiKeySecret');

  // Auth and API key management endpoints use JWT
  if (url.includes('/auth') || url.includes('/merchants/api-keys')) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // Payment operations require API keys - no JWT fallback
    const isPaymentOperation = url.includes('/orders') || 
                              url.includes('/payments') || 
                              url.includes('/refunds') || 
                              url.includes('/vault') ||
                              url.includes('/operations');
    
    if (isPaymentOperation) {
      if (keyId && keySecret) {
        const encoded = btoa(`${keyId}:${keySecret}`);
        config.headers.Authorization = `Basic ${encoded}`;
      } else {
        // Reject payment operations without API key
        throw new Error('API key required for payment operations. Please set up API keys in the API Keys section.');
      }
    } else {
      // Non-payment operations can use either API key or JWT
      if (keyId && keySecret) {
        const encoded = btoa(`${keyId}:${keySecret}`);
        config.headers.Authorization = `Basic ${encoded}`;
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.fieldErrors && Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
        const details = data.fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join(' | ');
        error.userFriendlyMessage = `${data.message || 'Validation failed'}: ${details}`;
      } else if (data.message) {
        error.userFriendlyMessage = data.message;
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (err: any): string => {
  if (err?.userFriendlyMessage) return err.userFriendlyMessage;
  if (err?.response?.data?.fieldErrors?.length) {
    return err.response.data.fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join(' | ');
  }
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return 'An unexpected request error occurred';
};

export const authApi = {
  signup: async (data: { name: string; email: string; password: string; businessName?: string; businessType?: string }): Promise<Merchant> => {
    const response = await api.post<Merchant>('/auth/signup', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  me: async (): Promise<Merchant> => {
    const response = await api.get<Merchant>('/auth/me');
    return response.data;
  },
};

export const apiKeyApi = {
  create: async (data: { environment: 'TEST' | 'LIVE' }): Promise<ApiKeyCreateResponse> => {
    const response = await api.post<ApiKeyCreateResponse>('/merchants/api-keys', data);
    return response.data;
  },
  list: async (): Promise<ApiKey[]> => {
    const response = await api.get<ApiKey[]>('/merchants/api-keys');
    return response.data;
  },
  revoke: async (keyId: string): Promise<void> => {
    await api.delete(`/merchants/api-keys/${keyId}`);
  },
  rotate: async (keyId: string): Promise<ApiKeyCreateResponse> => {
    const response = await api.post<ApiKeyCreateResponse>(`/merchants/api-keys/${keyId}/rotate`);
    return response.data;
  },
};

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },
  getById: async (orderId: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  },
  cancel: async (orderId: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  },
  listPayments: async (orderId: string): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/orders/${orderId}/payments`);
    return response.data;
  },
};

export const paymentsApi = {
  initiate: async (data: PaymentInitRequest): Promise<Payment> => {
    const response = await api.post<Payment>('/payments', data);
    return response.data;
  },
  capture: async (paymentId: string): Promise<Payment> => {
    const response = await api.post<Payment>(`/payments/${paymentId}/capture`);
    return response.data;
  },
  getById: async (paymentId: string): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  },
  list: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  },
};

export const refundsApi = {
  create: async (paymentId: string, data: RefundRequest): Promise<Refund> => {
    const response = await api.post<Refund>(`/payments/${paymentId}/refunds`, data);
    return response.data;
  },
  getById: async (refundId: string): Promise<Refund> => {
    const response = await api.get<Refund>(`/refunds/${refundId}`);
    return response.data;
  },
  listByPayment: async (paymentId: string): Promise<Refund[]> => {
    const response = await api.get<Refund[]>(`/payments/${paymentId}/refunds`);
    return response.data;
  },
  listAll: async (): Promise<Refund[]> => {
    const response = await api.get<Refund[]>('/refunds');
    return response.data;
  },
};

export const operationsApi = {
  getWebhooks: async (): Promise<WebhookEvent[]> => {
    const response = await api.get<WebhookEvent[]>('/operations/webhooks');
    return response.data;
  },
  getSettlements: async (): Promise<Settlement[]> => {
    const response = await api.get<Settlement[]>('/operations/settlements');
    return response.data;
  },
  triggerSettlement: async (): Promise<string> => {
    const response = await api.post<string>('/operations/settlements/trigger');
    return response.data;
  },
};

export const vaultApi = {
  tokenize: async (data: TokenizeRequest): Promise<TokenizeResponse> => {
    const response = await api.post<TokenizeResponse>('/vault/tokenize', data);
    return response.data;
  },
};
