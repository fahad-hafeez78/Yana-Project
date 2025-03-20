import Axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL;

const axiosInstance = Axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor to include tokens in each request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve access token from storage
    const refreshToken = localStorage.getItem('refreshToken'); // Retrieve refresh token from storage

    if (accessToken) {
      config.headers['authorization'] =   `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers['refresh-token'] = refreshToken;
    }

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

    const receivedAccessToken = response.headers['authorization'];

    const storedAccessToken = localStorage.getItem('accessToken');

    if (receivedAccessToken && receivedAccessToken !== storedAccessToken) {
      localStorage.setItem('accessToken', receivedAccessToken.split(' ')[1]);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPost = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data);

    const receivedAccessToken = response.headers['authorization'];
    const receivedRefreshToken = response.headers['refresh-token'];
    const storedAccessToken = localStorage.getItem('accessToken');

    if (receivedAccessToken && receivedAccessToken !== storedAccessToken) {
      localStorage.setItem('accessToken', receivedAccessToken.split(' ')[1]);
    }

    if (receivedRefreshToken) {
      localStorage.setItem('refreshToken', receivedRefreshToken);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const apiPut = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);

    const receivedAccessToken = response.headers['authorization'];
    const storedAccessToken = localStorage.getItem('accessToken');

    if (receivedAccessToken && receivedAccessToken !== storedAccessToken) {
      localStorage.setItem('accessToken', receivedAccessToken.split(' ')[1]);
    }


    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiDelete = async (url) => {
  try {
    const response = await axiosInstance.delete(url);

    const receivedAccessToken = response.headers['authorization'];
    const storedAccessToken = localStorage.getItem('accessToken');

    if (receivedAccessToken && receivedAccessToken !== storedAccessToken) {
      localStorage.setItem('accessToken', receivedAccessToken.split(' ')[1]);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default axiosInstance;
