import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }
      ).then((token) => {
        originalRequest.headers.Authorization =
          `Bearer ${token}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      isRefreshing = false;

      localStorage.clear();

      window.location.href = "/login";

      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/token/refresh/",
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken =
        response.data.access;

      localStorage.setItem(
        "access_token",
        newAccessToken
      );

      api.defaults.headers.common.Authorization =
        `Bearer ${newAccessToken}`;

      processQueue(
        null,
        newAccessToken
      );

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.clear();

      window.location.href = "/login";

      return Promise.reject(
        refreshError
      );
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;