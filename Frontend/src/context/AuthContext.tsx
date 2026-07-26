import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Merchant } from '../types';
import { setAuthToken, setApiKeyCredentials } from '../services/api';

interface AuthContextType {
  token: string | null;
  merchant: Merchant | null;
  apiKeyId: string | null;
  apiKeySecret: string | null;
  login: (token: string, merchantInfo?: Merchant) => void;
  logout: () => void;
  setActiveApiKey: (keyId: string, keySecret: string) => void;
  clearActiveApiKey: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));
  const [apiKeyId, setApiKeyId] = useState<string | null>(localStorage.getItem('apiKeyId'));
  const [apiKeySecret, setApiKeySecret] = useState<string | null>(localStorage.getItem('apiKeySecret'));
  const [merchant, setMerchant] = useState<Merchant | null>(() => {
    const saved = localStorage.getItem('merchantInfo');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = (newToken: string, merchantInfo?: Merchant) => {
    setToken(newToken);
    setAuthToken(newToken);
    if (merchantInfo) {
      setMerchant(merchantInfo);
      localStorage.setItem('merchantInfo', JSON.stringify(merchantInfo));
    }
  };

  const logout = () => {
    setToken(null);
    setMerchant(null);
    setApiKeyId(null);
    setApiKeySecret(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('merchantInfo');
    localStorage.removeItem('apiKeyId');
    localStorage.removeItem('apiKeySecret');
    localStorage.removeItem('env');
  };

  const setActiveApiKey = (keyId: string, keySecret: string) => {
    setApiKeyId(keyId);
    setApiKeySecret(keySecret);
    setApiKeyCredentials(keyId, keySecret);
  };

  const clearActiveApiKey = () => {
    setApiKeyId(null);
    setApiKeySecret(null);
    setApiKeyCredentials(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        merchant,
        apiKeyId,
        apiKeySecret,
        login,
        logout,
        setActiveApiKey,
        clearActiveApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
