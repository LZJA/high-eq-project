import apiClient, { guestHeaders } from './api';

const analyticsHeaders = () => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? undefined : { headers: guestHeaders() };
};

export const analytics = {
  trackUpgradeClick: async (targetTier: 'lite' | 'pro') => {
    try {
      await apiClient.post('/analytics/upgrade-click', { targetTier }, analyticsHeaders());
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }
};
