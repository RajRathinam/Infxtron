import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin API
export const adminAPI = {
  login: (email, password) =>
    api.post("/api/admin/login", { email, password }),

  logout: () => api.post("/api/admin/logout"),

  changePassword: (oldPassword, newPassword, confirmPassword) =>
    api.put("/api/admin/change-password", {
      oldPassword,
      newPassword,
      confirmPassword,
    }),
};

// Products API
export const productsAPI = {
  getAll: () => api.get("/api/products"),

  getById: (id) => api.get(`/api/products/${id}`),

  create: (formData) => api.post("/api/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  update: (id, formData) => api.put(`/api/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  delete: (id) => api.delete(`/api/products/${id}`),
};

// Orders API
export const ordersAPI = {
  placeOrder: (orderData) => api.post("/api/orders", orderData),

  getAll: () => api.get("/api/orders"),

  updateStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, { status }),
};

// Customers API
export const customersAPI = {
  submitContact: (contactData) => api.post("/api/customers/contact", contactData),
  
  getAll: () => api.get("/api/customers"),
};

export default api;
