import axios from "axios";

const STORAGE_KEY = "blush-bloom-store";
const API_BASE_URL = (() => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  return configuredBaseUrl ? configuredBaseUrl.replace(/\/+$/, "") : "/api";
})();

const getApiOrigin = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export const resolveMediaUrl = (value) => {
  if (!value) {
    return value;
  }

  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  const apiOrigin = getApiOrigin();

  if (!apiOrigin) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  try {
    return new URL(normalizedPath, apiOrigin).toString();
  } catch {
    return value;
  }
};

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) =>
    Promise.reject(
      error.response?.data ?? {
        message: error.message || "Unexpected request error."
      }
    )
);

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  updateProfile: (payload) => api.put("/auth/profile", payload)
};

export const serviceApi = {
  list: (params) => api.get("/services", { params }),
  detail: (id) => api.get(`/services/${id}`),
  categories: () => api.get("/service-categories")
};

export const productApi = {
  list: (params) => api.get("/products", { params }),
  detail: (id) => api.get(`/products/${id}`),
  categories: () => api.get("/product-categories")
};

export const staffApi = {
  list: (params) => api.get("/staff", { params }),
  detail: (id) => api.get(`/staff/${id}`)
};

export const appointmentApi = {
  create: (payload) => api.post("/appointments", payload),
  mine: () => api.get("/appointments/my-appointments"),
  detail: (id) => api.get(`/appointments/${id}`),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  adminList: (params) => api.get("/admin/appointments", { params }),
  updateStatus: (id, payload) => api.put(`/admin/appointments/${id}/status`, payload)
};

export const cartApi = {
  get: () => api.get("/cart"),
  add: (payload) => api.post("/cart/add", payload),
  update: (itemId, payload) => api.put(`/cart/update/${itemId}`, payload),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete("/cart/clear")
};

export const orderApi = {
  create: (payload) => api.post("/orders", payload),
  mine: () => api.get("/orders/my-orders"),
  detail: (id) => api.get(`/orders/${id}`),
  adminList: (params) => api.get("/admin/orders", { params }),
  updateStatus: (id, payload) => api.put(`/admin/orders/${id}/status`, payload)
};

export const discountApi = {
  apply: (payload) => api.post("/discounts/apply", payload),
  adminList: () => api.get("/admin/discounts"),
  create: (payload) => api.post("/admin/discounts", payload),
  update: (id, payload) => api.put(`/admin/discounts/${id}`, payload),
  remove: (id) => api.delete(`/admin/discounts/${id}`)
};

export const adminApi = {
  dashboardStats: () => api.get("/admin/dashboard/statistics"),
  revenue: () => api.get("/admin/dashboard/revenue"),
  todayAppointments: () => api.get("/admin/dashboard/today-appointments"),
  bestSellingProducts: () => api.get("/admin/dashboard/best-selling-products"),
  topServices: () => api.get("/admin/dashboard/top-services"),
  users: (params) => api.get("/admin/users", { params }),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  createService: (payload) => api.post("/admin/services", payload),
  updateService: (id, payload) => api.put(`/admin/services/${id}`, payload),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  createServiceCategory: (payload) => api.post("/admin/service-categories", payload),
  updateServiceCategory: (id, payload) => api.put(`/admin/service-categories/${id}`, payload),
  deleteServiceCategory: (id) => api.delete(`/admin/service-categories/${id}`),
  createProduct: (payload) => api.post("/admin/products", payload),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  createProductCategory: (payload) => api.post("/admin/product-categories", payload),
  updateProductCategory: (id, payload) => api.put(`/admin/product-categories/${id}`, payload),
  deleteProductCategory: (id) => api.delete(`/admin/product-categories/${id}`),
  createStaff: (payload) => api.post("/admin/staff", payload),
  updateStaff: (id, payload) => api.put(`/admin/staff/${id}`, payload),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`)
};
