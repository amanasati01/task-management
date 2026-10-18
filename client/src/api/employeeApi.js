import axiosClient from './axiosClient.js';

export const employeeApi = {
  getEmployees: (params) => {
    return axiosClient.get('/employees', { params });
  },

  getEmployee: (id) => {
    return axiosClient.get(`/employees/${id}`);
  },

  createEmployee: (data) => {
    return axiosClient.post('/employees', data);
  },

  updateEmployee: (id, data) => {
    return axiosClient.put(`/employees/${id}`, data);
  },

  deleteEmployee: (id) => {
    return axiosClient.delete(`/employees/${id}`);
  },

  getEmployeeOptions: () => {
    return axiosClient.get('/employees/options');
  }
};

