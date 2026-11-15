
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from "axios";
import { store } from "../redux/app/store";
import { setToken } from "../redux/features/auth/authSlice";

const SHARED_API_URL = import.meta.env.VITE_API_SHARED as string | undefined;

const API_URLS = {
  shared: SHARED_API_URL,
  investor: import.meta.env.VITE_API_INVESTOR,
  entrepreneur: import.meta.env.VITE_API_ENTREPRENEUR,
  admin:import.meta.env.VITE_API_ADMIN,
  stripe:import.meta.env.VITE_API_STRIPE,
  seats:import.meta.env.VITE_API_SEATS,
  chat:import.meta.env.VITE_API_CHAT,
  group:
    (import.meta.env.VITE_API_GROUP as string | undefined) ??
    SHARED_API_URL?.replace(/\/shared\/?$/, "/group"),
} as const;

export type UserRole = keyof typeof API_URLS;

const REFRESH_URLS: Partial<Record<UserRole, string>> = {
  shared: API_URLS.shared,
  entrepreneur: API_URLS.shared,
  investor: API_URLS.shared,
  admin: API_URLS.admin,
  group: API_URLS.shared,
};

let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const refreshAccessToken = async (role: UserRole): Promise<string | null> => {
  const refreshUrl = REFRESH_URLS[role];

  if (!refreshUrl) {
    return null;
  }

  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.error("Max refresh attempts reached, stopping retries");
    isRefreshing = false;
    refreshQueue = [];
    store.dispatch(setToken({ token: "" }));
    window.location.href = "/signin";
    return null;
  }

  try {
    refreshAttempts++;
    const response = await axios.post(
      `${refreshUrl}/refresh-token`,
      {},
      { withCredentials: true }
    );

    const newToken = response.data?.accessToken;
    if (newToken) {
      store.dispatch(setToken({ token: newToken }));
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      refreshAttempts = 0;
      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  } finally {
    isRefreshing = false;
  }
};

const createAxiosInstance = (role: UserRole): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URLS[role],
    timeout: 10000,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const isUnauthorized = error.response?.status === 401;

      if (!originalRequest || originalRequest._retry || !isUnauthorized) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      if (!REFRESH_URLS[role]) {
        return Promise.reject(error);
      }

      isRefreshing = true;
      originalRequest._retry = true;

      const newToken = await refreshAccessToken(role);
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      }
       
      console.error("Refresh failed, rejecting request");
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = {
  shared: createAxiosInstance("shared"),
  investor: createAxiosInstance("investor"),
  entrepreneur: createAxiosInstance("entrepreneur"),
  admin:createAxiosInstance("admin"),
  stripe:createAxiosInstance("stripe"),
  seats:createAxiosInstance("seats"), // Assuming seats API is under shared
  chat:createAxiosInstance("chat"),
  group:createAxiosInstance("group"),
};


