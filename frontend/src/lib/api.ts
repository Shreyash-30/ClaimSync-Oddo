import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const resolvedBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api/v1";

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject Auth Token and Idempotency Key
api.interceptors.request.use(
  (config) => {
    // 1. Inject Authentication from LocalStorage Auth Context
    const storedUser = localStorage.getItem("erms_user");
    let token = null;

    if (storedUser) {
       try {
         const parsed = JSON.parse(storedUser);
         token = parsed.token; 
       } catch (err) {
         console.warn("Could not parse user token");
       }
    }

    if (!token) {
      token = localStorage.getItem("erms_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject Idempotency automatically on POST requests
    if (config.method?.toUpperCase() === 'POST') {
      config.headers["X-Idempotency-Key"] = uuidv4();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Mapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatically catch auth failures universally
    if (error.response?.status === 401) {
      localStorage.removeItem("erms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
