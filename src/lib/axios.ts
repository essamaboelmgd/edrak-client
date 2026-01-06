import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// API base URL - configure based on environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1';
export const API_ROOT_URL = API_BASE_URL.replace('/api/v1', '');

export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_ROOT_URL}${cleanPath}`;
};

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
                    // console.log('[Axios] Using token from Cookie:', token.substring(0, 10) + '...');
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                     // Fallback/Debug: Check if there's a token in localStorage that might be interfering?
                     // No, strictly use cookie as per design.
                     // console.log('[Axios] No token in Cookie');
                }
                
                // If data is FormData, remove Content-Type header to let axios set it automatically with boundary
                if (config.data instanceof FormData && config.headers) {
                    delete config.headers['Content-Type'];
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
                // Get the request URL to check if it's a login/signup request
                const requestUrl = error.config?.url || '';
                const isLoginRequest = requestUrl.includes('/auth/login');
                const isSignupRequest = requestUrl.includes('/auth/signup');
                const isAuthRequest = isLoginRequest || isSignupRequest;
                
                // Don't redirect or reload for login/signup errors - let components handle them
                if (isAuthRequest) {
                    // Just reject the error, don't do anything else
                    return Promise.reject(error);
                }
                
                // Handle 401 Unauthorized - Token expired or invalid (only for authenticated requests)
                if (error.response?.status === 401) {
                    this.clearToken();
                    // Only redirect if we're not already on the login page
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
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

