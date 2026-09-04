import type { TokenizeResponse } from '../types';

const VAULT_STORAGE_KEY = 'razorpay_saved_vault_cards';

export const getSavedVaultCards = (): TokenizeResponse[] => {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved vault cards', err);
    return [];
  }
};

export const addSavedVaultCard = (card: TokenizeResponse): TokenizeResponse[] => {
  try {
    const current = getSavedVaultCards();
    // Prevent duplicate cards based on token OR card fingerprint (lastFour + expiryMonth + expiryYear + brand)
    const filtered = current.filter((c) => {
      const isSameToken = c.token && card.token && c.token === card.token;
      const isSameCardNumberAndExpiry =
        c.lastFour === card.lastFour &&
        Number(c.expiryMonth) === Number(card.expiryMonth) &&
        Number(c.expiryYear) === Number(card.expiryYear) &&
        (c.brand || '').toLowerCase() === (card.brand || '').toLowerCase();

      return !isSameToken && !isSameCardNumberAndExpiry;
    });
    const updated = [card, ...filtered];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save vault card', err);
    return getSavedVaultCards();
  }
};

export const removeSavedVaultCard = (token: string): TokenizeResponse[] => {
  try {
    const current = getSavedVaultCards();
    const updated = current.filter((c) => c.token !== token);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove vault card', err);
    return getSavedVaultCards();
  }
};

export const clearAllSavedVaultCards = (): TokenizeResponse[] => {
  try {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear vault cards', err);
    return [];
  }
};
