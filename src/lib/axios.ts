import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// API base URL - configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Cookie configuration
export const TOKEN_COOKIE_NAME = 'edrak_auth_token';
const COOKIE_OPTIONS = {
    expires: 7, // 7 days
    secure: import.meta.env.PROD, // Only secure in production
    sameSite: 'strict' as const
};

class ApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor - Add token to headers
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = Cookies.get(TOKEN_COOKIE_NAME);
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle errors globally
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError<{ message: string; statusCode: number }>) => {
                // Handle 401 Unauthorized - Token expired or invalid
                if (error.response?.status === 401) {
                    this.clearToken();
                    window.location.href = '/login';
                }

                // Handle 403 Forbidden
                if (error.response?.status === 403) {
                    console.error('Access forbidden:', error.response.data?.message);
                }

                return Promise.reject(error);
            }
        );
    }

    // Token management methods
    public setToken(token: string): void {
        Cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
    }

    public getToken(): string | undefined {
        return Cookies.get(TOKEN_COOKIE_NAME);
    }

    public clearToken(): void {
        Cookies.remove(TOKEN_COOKIE_NAME);
    }

    public hasToken(): boolean {
        return !!this.getToken();
    }

    // Axios instance getter
    public getAxiosInstance(): AxiosInstance {
        return this.instance;
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export axios instance for direct use
export const axiosInstance = apiClient.getAxiosInstance();

export default apiClient;

