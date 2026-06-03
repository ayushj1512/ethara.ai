import axios from "axios";
import toast from "react-hot-toast";

function getApiBaseUrl() {
  const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");
  return rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
}

export const api = axios.create({ baseURL: getApiBaseUrl() });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Request failed.";
    if (error.response?.status === 401) localStorage.removeItem("token");
    toast.error(message);
    return Promise.reject(error);
  }
);
