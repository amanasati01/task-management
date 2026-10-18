import axiosClient from './axiosClient.js';
import axios from 'axios';

export const taskApi = {
  getTasks: (params) => {
    return axiosClient.get('/tasks', { params });
  },

  getTask: (id) => {
    return axiosClient.get(`/tasks/${id}`);
  },

  createTask: (data) => {
    return axiosClient.post('/tasks', data);
  },

  updateTask: (id, data) => {
    return axiosClient.put(`/tasks/${id}`, data);
  },

  updateTaskStatus: (id, status) => {
    return axiosClient.put(`/tasks/${id}/status`, { status });
  },

  deleteTask: (id) => {
    return axiosClient.delete(`/tasks/${id}`);
  },

  exportTasksCsv: async (params) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const response = await axios.get(`${baseURL}/tasks/export`, {
      params,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
