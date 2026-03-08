import apiClient from './api';

export const analytics = {
  trackUpgradeClick: async (targetTier: 'lite' | 'pro') => {
    try {
      await apiClient.post('/analytics/upgrade-click', { targetTier });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }
};
