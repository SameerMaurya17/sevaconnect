import axios from "axios";

export const TOKEN_KEY = "seva_auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Attach "Authorization: Basic ..." to every request except register/login endpoints.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isPublic = config.url && config.url.startsWith("/api/auth");
  if (token && !isPublic) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});

// If the saved credentials stop working, send the user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname;
    const onAuthPage = path.startsWith("/login") || path.startsWith("/register");
    if (error.response && error.response.status === 401 && !onAuthPage) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err && err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  if (err && err.message === "Network Error") {
    return "Cannot reach the server. Check that the backend is running.";
  }
  return fallback;
}

export default api;
