/**
 * Maps a payment/refund/settlement status string to the corresponding CSS badge class.
 * Centralizes badge styling logic to avoid duplication across components.
 */
export const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    CAPTURED: 'badge-captured',
    PROCESSED: 'badge-processed',
    PAID: 'badge-paid',
    SETTLED: 'badge-settled',
    CREATED: 'badge-created',
    INITIATED: 'badge-initiating',
    AUTHORIZING: 'badge-authorizing',
    PENDING: 'badge-pending',
    FAILED: 'badge-failed',
    EXPIRED: 'badge-expired',
    CANCELLED: 'badge-cancelled',
    REFUNDED: 'badge-refunded',
    PARTIALLY_REFUNDED: 'badge-partially-refunded',
    DELIVERED: 'badge-captured',
    DEAD: 'badge-failed',
    ENABLED: 'badge-captured',
    REVOKED: 'badge-failed',
  };
  return map[status] || 'badge-created';
};
