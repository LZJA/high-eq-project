import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { quotaAPI } from '@/lib/api';
import { QuotaStatus, SubscriptionTier } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface QuotaContextType {
  quota: QuotaStatus | null;
  isLoading: boolean;
  error: string | null;
  tier: SubscriptionTier;
  remainingQuota: number;
  isUnlimited: boolean;
  refresh: () => Promise<void>;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function QuotaProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await quotaAPI.getQuotaStatus();
      if (response.code === 200) {
        setQuota(response.data);
      } else {
        setError(response.message || '获取配额失败');
      }
    } catch (err: any) {
      console.error('Failed to load quota:', err);
      setError(err.message || '获取配额失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setQuota(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    loadQuota();
  }, [isAuthenticated, isAuthLoading, loadQuota]);

  const tier: SubscriptionTier = (quota?.tier as SubscriptionTier) || 'free';
  const remainingQuota = quota?.remainingQuota ?? 0;
  const isUnlimited = quota?.isUnlimited ?? false;

  return (
    <QuotaContext.Provider
      value={{
        quota,
        isLoading,
        error,
        tier,
        remainingQuota,
        isUnlimited,
        refresh: loadQuota,
      }}
    >
      {children}
    </QuotaContext.Provider>
  );
}

export function useQuota() {
  const context = useContext(QuotaContext);
  if (context === undefined) {
    throw new Error('useQuota must be used within a QuotaProvider');
  }
  return context;
}
