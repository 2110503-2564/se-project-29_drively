import axios from 'axios';
import api from './api';

// Upgrade the user's membership tier
export const upgradeMembership = async (tier: string) => {
  const response = await api.post('/membership/upgrade', { tier }, { withCredentials: true });
  return response.data;
};

// Fetch current membership status
export const getMembershipStatus = async () => {
  const response = await api.get('/membership/status', { withCredentials: true });
  return response.data;
};

// Fetch all available membership tiers and their benefits
export const getMembershipTiers = async () => {
  const response = await api.get('/membership/tiers', { withCredentials: true });
  return response.data;
};
