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
    // Avoid duplicate tokens
    const filtered = current.filter((c) => c.token !== card.token);
    const updated = [card, ...filtered];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save vault card', err);
    return getSavedVaultCards();
  }
};
