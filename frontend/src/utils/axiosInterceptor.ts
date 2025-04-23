// import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from "axios";
// import { store } from "../redux/app/store";
// import { setToken } from "../redux/features/auth/authSlice";

// const API_URLS = {
//   shared: import.meta.env.VITE_API_SHARED,
//   investor: import.meta.env.VITE_API_INVESTOR,
//   entrepreneur: import.meta.env.VITE_API_ENTREPRENEUR,
// } as const;

// export type UserRole = keyof typeof API_URLS;

// let isRefreshing = false;
// let refreshSubscribers: ((token: string) => void)[] = [];

// const refreshAuthToken = async (role: UserRole): Promise<string | null> => {
//   try {
//     const response = await axios.post(
//       `${API_URLS[role]}/refresh-token`,
//       {},
//       { withCredentials: true }
//     );

//     const newToken = response.data?.accessToken;
//     if (newToken) {
//       store.dispatch(setToken({ token: newToken }));
//       refreshSubscribers.forEach((cb) => cb(newToken));
//       refreshSubscribers = [];
//       return newToken;
//     }
//   } catch {
//     store.dispatch(setToken({ token: "" }));
//     window.location.href = `/signin`;
//   } finally {
//     isRefreshing = false;
//   }
//   return null;
// };

// const createAxiosInstance = (role: UserRole): AxiosInstance => {
//   const instance = axios.create({
//     baseURL: API_URLS[role],
//     timeout: 10000,
//     withCredentials: true,
//   });

//   instance.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//       const token = store.getState().auth.token;
//       console.log("LLLLLL",token)
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );

//   instance.interceptors.response.use(
//     (response: AxiosResponse) => response,
//     async (error: AxiosError) => {
//       const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

//       if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         return new Promise((resolve) => {
//           refreshSubscribers.push((token: string) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             resolve(instance(originalRequest));
//           });
//         });
//       }

//       isRefreshing = true;
//       originalRequest._retry = true;

//       const newToken = await refreshAuthToken(role);
//       if (newToken) {
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return instance(originalRequest);
//       }

//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };

// export const api = {
//   shared: createAxiosInstance("shared"),
//   investor: createAxiosInstance("investor"),
//   entrepreneur: createAxiosInstance("entrepreneur"),
// };




import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from "axios";
import { store } from "../redux/app/store";
import { setToken } from "../redux/features/auth/authSlice";

const API_URLS = {
  shared: import.meta.env.VITE_API_SHARED,
  investor: import.meta.env.VITE_API_INVESTOR,
  entrepreneur: import.meta.env.VITE_API_ENTREPRENEUR,
  admin:import.meta.env.VITE_API_ADMIN,
  stripe:import.meta.env.VITE_API_STRIPE
} as const;

export type UserRole = keyof typeof API_URLS;

let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const refreshAccessToken = async (role: UserRole): Promise<string | null> => {
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
    console.log(`Refresh attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS}`);
    const response = await axios.post(
      `${API_URLS[role]}/refresh-token`,
      {},
      { withCredentials: true }
    );

    const newToken = response.data?.accessToken;
    if (newToken) {
      console.log("New token received:", newToken);
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
      console.log("Attaching token to request:", token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("No token found in store for request:", config.url);
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
  stripe:createAxiosInstance("stripe")
};