import axiosClient from './axiosClient.js';

export const dashboardApi = {
  getStats: () => {
    return axiosClient.get('/dashboard');
  }
};

