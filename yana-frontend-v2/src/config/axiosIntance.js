import Axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL;

const axiosInstance = Axios.create({
  baseURL,
  timeout: 300000,
});

// Request interceptor to include tokens in each request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve access token from storage
    // const refreshToken = localStorage.getItem('refreshToken'); // Retrieve refresh token from storage

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    // if (refreshToken) {
    //   config.headers['Refresh-Token'] = `Bearer ${refreshToken}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Common API functions with token comparison
export const apiGet = async (url, params) => {
  try {
    const response = await axiosInstance.get(url, { params });
    const authHeader = response.headers['x-new-access-token'] || '';

    if (authHeader && authHeader !== '') {
      localStorage.setItem('accessToken', authHeader);
      // update access token in reducx
    };
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const apiPost = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data);

    const authHeader = response.headers['x-new-access-token'] || '';
    if (authHeader && authHeader !== '') {
      localStorage.setItem('accessToken', authHeader);
      // update access token in reducx
    };

    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const apiPut = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);
    const authHeader = response.headers['x-new-access-token'] || '';

    if (authHeader && authHeader !== '') {
      localStorage.setItem('accessToken', authHeader);
      // update access token in reducx
    };

    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const apiPatch = async (url, data) => {
  try {
    const response = await axiosInstance.patch(url, data);
    const authHeader = response.headers['x-new-access-token'] || '';

    if (authHeader && authHeader !== '') {
      localStorage.setItem('accessToken', authHeader);
      // update access token in reducx
    };

    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const apiDelete = async (url) => {
  try {
    const response = await axiosInstance.delete(url);
    const authHeader = response.headers['x-new-access-token'] || '';

    if (authHeader && authHeader !== '') {
      localStorage.setItem('accessToken', authHeader);
      // update access token in reducx
    };

    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export default axiosInstance;
