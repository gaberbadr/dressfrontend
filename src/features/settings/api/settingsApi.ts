import api from '../../../services/api/axios';
import type { Settings } from '../../../types/models';
import type { ApiResponse } from '../../../types/api';

let settingsCache: ApiResponse<Settings> | null = null;
let settingsCachePromise: Promise<ApiResponse<Settings>> | null = null;

export const settingsApi = {
  getSettings: async (): Promise<ApiResponse<Settings>> => {
    if (settingsCache) return settingsCache;
    if (settingsCachePromise) return settingsCachePromise;
    
    settingsCachePromise = api.get('/settings').then(res => {
      settingsCache = res.data;
      settingsCachePromise = null;
      return res.data;
    }).catch(err => {
      settingsCachePromise = null;
      throw err;
    });
    return settingsCachePromise;
  },
  updateSettings: async (data: Partial<Settings>): Promise<ApiResponse<Settings>> => {
    const response = await api.put('/settings', data);
    if (response.data.success) {
      settingsCache = response.data; // Update cache
    }
    return response.data;
  }
};
