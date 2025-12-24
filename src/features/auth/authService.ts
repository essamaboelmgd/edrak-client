import { axiosInstance } from '@/lib/axios';
import {
    ILogin,
    IStudentSignup,
    ITeacherSignup,
    ILoginResponse,
    ApiResponse
} from '@/types/auth.types';

class AuthService {
    private readonly BASE_PATH = '/auth';

    /**
     * Student signup
     */
    async signupStudent(data: IStudentSignup): Promise<ApiResponse<{ user: any }>> {
        const response = await axiosInstance.post<ApiResponse<{ user: any }>>(
            `${this.BASE_PATH}/signup/student`,
            data
        );
        return response.data;
    }

    /**
     * Teacher signup
     */
    async signupTeacher(data: ITeacherSignup): Promise<ApiResponse<{ user: any }>> {
        const response = await axiosInstance.post<ApiResponse<{ user: any }>>(
            `${this.BASE_PATH}/signup/teacher`,
            data
        );
        return response.data;
    }

    /**
     * Login (for all user types)
     */
    async login(credentials: ILogin): Promise<ApiResponse<ILoginResponse>> {
        const response = await axiosInstance.post<ApiResponse<ILoginResponse>>(
            `${this.BASE_PATH}/login`,
            credentials
        );
        return response.data;
    }

    /**
     * Logout - clears token (handled in context)
     */
    logout(): void {
        // Token clearing is handled by AuthContext
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

