export type BusinessType = 'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED' | 'LLP' | 'NGO';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  businessType?: BusinessType;
}

export interface LoginResponse {
  accessToken: string;
}

export interface Money {
  amountUnits: number;
  currency: string;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'ATTEMPTED' | 'EXPIRED' | 'CANCELLED';

export interface Order {
  id: string;
  merchantId: string;
  amount: Money;
  status: OrderStatus;
  receipt?: string;
  notes?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateOrderRequest {
  amount: Money;
  receipt?: string;
  notes?: Record<string, any>;
  expiresAt?: string;
}

export type PaymentMethod = 'CARD' | 'UPI' | 'NETBANKING';

export type PaymentStatus =
  | 'INITIATED'
  | 'AUTHORIZING'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'SETTLED';

export interface Payment {
  id: string;
  orderId: string;
  merchantId: string;
  amount: Money;
  status: PaymentStatus;
  method: PaymentMethod;
  methodDetails?: Record<string, any>;
  bankReference?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  capturedAt?: string;
  refundedAt?: string;
  settledAt?: string;
}

export interface PaymentInitRequest {
  orderId: string;
  method: PaymentMethod;
  methodDetails?: Record<string, any>;
}

export type RefundStatus = 'PENDING' | 'PROCESSED' | 'FAILED';

export interface Refund {
  id: string;
  paymentId: string;
  merchantId: string;
  amount: Money;
  status: RefundStatus;
  reason?: string;
  notes?: Record<string, any>;
  createdAt: string;
}

export interface RefundRequest {
  paymentId?: string;
  amount: Money;
  reason?: string;
  notes?: Record<string, any>;
}

// Environment kept as a type for ApiKey display only — not used for mode switching
export type Environment = 'TEST' | 'LIVE';

export interface ApiKey {
  id: string;
  keyId: string;
  keySecret?: string;
  environment: Environment;
  enabled?: boolean;
  createdAt?: string;
}

export interface ApiKeyCreateResponse {
  id: string;
  keyId: string;
  keySecret: string;
  environment: Environment;
}

export interface WebhookEvent {
  id: string;
  merchantId: string;
  eventType: string;
  payload: string | Record<string, any>;
  targetUrl?: string;
  signature?: string;
  status: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  merchantId: string;
  grossAmount?: Money;
  refundAmount?: Money;
  netAmount?: Money;
  feeAmount?: Money;
  gstAmount?: Money;
  bankReference?: string;
  status: string;
  processedAt?: string;
  createdAt?: string;
}

export interface TokenizeRequest {
  pan: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  cardHolderName?: string;
  customerId?: string;
}

export interface TokenizeResponse {
  token: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  cardHolderName?: string;
}
