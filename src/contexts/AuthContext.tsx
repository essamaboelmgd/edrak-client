import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import authService from '@/features/auth/authService';
import userService from '@/features/user/userService';
import {
    ILogin,
    IStudentSignup,
    ITeacherSignup,
    IUserResponse,
    IStudentResponse,
    ITeacherResponse
} from '@/types/auth.types';

// User roles enum
export enum UserRole {
    ADMIN = 'admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
}

interface AuthContextType {
    user: IUserResponse | IStudentResponse | ITeacherResponse | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: ILogin) => Promise<void>;
    signupStudent: (data: IStudentSignup) => Promise<void>;
    signupTeacher: (data: ITeacherSignup) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<IUserResponse | IStudentResponse | ITeacherResponse | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated by calling /me endpoint
     */
    const checkAuth = async () => {
        try {
            if (!apiClient.hasToken()) {
                setIsLoading(false);
                return;
            }

            const response = await userService.getMe();
            if (response.success && response.data.user) {
                setUser(response.data.user);
                setRole(response.data.user.role as UserRole);
            }
        } catch (error: any) {
            // If 401/403, token is invalid - clear it
            if (error.response?.status === 401 || error.response?.status === 403) {
                apiClient.clearToken();
                setUser(null);
                setRole(null);
            }
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login user
     */
    const login = async (credentials: ILogin) => {
        try {
            // Don't set global isLoading for login attempts to prevent form flickering
            // The login page handles its own loading state
            const response = await authService.login(credentials);

            if (response.success && response.data.token) {
                // Store token in cookie
                apiClient.setToken(response.data.token);

                // Set user and role
                setUser(response.data.user);
                setRole(response.data.user.role as UserRole);

                // Navigate based on role
                const userRole = response.data.user.role as UserRole;
                if (userRole === UserRole.ADMIN) {
                    navigate('/admin');
                } else if (userRole === UserRole.TEACHER) {
                    navigate('/teacher');
                } else if (userRole === UserRole.STUDENT) {
                    navigate('/student');
                } else {
                    navigate('/app');
                }
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    /**
     * Signup as student
     */
    const signupStudent = async (data: IStudentSignup) => {
        try {
            setIsLoading(true);
            const response = await authService.signupStudent(data);

            if (response.success) {
                // After signup, redirect to login
                navigate('/login');
            }
        } catch (error: any) {
            console.error('Student signup failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Signup as teacher
     */
    const signupTeacher = async (data: ITeacherSignup) => {
        try {
            setIsLoading(true);
            const response = await authService.signupTeacher(data);

            if (response.success) {
                // After signup, redirect to login
                navigate('/login');
            }
        } catch (error: any) {
            console.error('Teacher signup failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        apiClient.clearToken();
        setUser(null);
        setRole(null);
        navigate('/login');
    };

    /**
     * Refresh user data
     */
    const refreshUser = async () => {
        try {
            const response = await userService.getMe();
            if (response.success && response.data.user) {
                setUser(response.data.user);
                setRole(response.data.user.role as UserRole);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            // If refresh fails due to invalid token, logout
            if ((error as any).response?.status === 401 || (error as any).response?.status === 403) {
                logout();
            }
        }
    };

    const value: AuthContextType = {
        user,
        role,
        isAuthenticated: !!user && !!apiClient.hasToken(),
        isLoading,
        login,
        signupStudent,
        signupTeacher,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

