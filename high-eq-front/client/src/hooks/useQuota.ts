import { useState, useEffect, useCallback } from 'react';
import { quotaAPI } from '@/lib/api';
import { QuotaStatus, SubscriptionTier } from '@/types';

interface UseQuotaReturn {
  quota: QuotaStatus | null;
  isLoading: boolean;
  error: string | null;
  tier: SubscriptionTier;
  remainingQuota: number;
  isUnlimited: boolean;
  refresh: () => Promise<void>;
}

export function useQuota(): UseQuotaReturn {
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
    loadQuota();
  }, [loadQuota]);

  const tier: SubscriptionTier = (quota?.tier as SubscriptionTier) || 'free';
  const remainingQuota = quota?.remainingQuota ?? 0;
  const isUnlimited = quota?.isUnlimited ?? false;

  return {
    quota,
    isLoading,
    error,
    tier,
    remainingQuota,
    isUnlimited,
    refresh: loadQuota,
  };
}
