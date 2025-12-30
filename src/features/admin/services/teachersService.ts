import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface ITeacherPlan {
    _id: string;
    name: string;
    nameArabic: string;
    price: number;
    duration: number;
    features: string[];
}

export interface ITeacherSubscription {
    _id: string;
    plan: ITeacherPlan | null;
    totalPrice?: number;
    finalPrice?: number;
    status: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface ITeacherFeature {
    _id: string;
    name: string;
    nameArabic: string;
}

export interface ITeacherAdmin {
    _id: string;
    fullName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    whatsappNumber?: string;
    gender: string;
    governorate: string;
    specialization?: string;
    yearsOfExperience?: number;
    platformName: string;
    theme: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    platformStatus: 'active' | 'suspended' | 'trial' | 'expired';
    trial: {
        isInTrial: boolean;
        trialStartDate?: string;
        trialEndDate?: string;
        trialDaysLeft?: number;
    };
    subscription: ITeacherSubscription | null;
    selectedFeatures: ITeacherFeature[];
    stats: {
        totalStudents: number;
        activeCourses: number;
        totalRevenue: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ITeachersListResponse {
    teachers: ITeacherAdmin[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

class TeachersService {
    private readonly BASE_PATH = '/users/teachers';

    /**
     * Get all teachers with pagination and filters
     */
    async getAllTeachers(query?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<ApiResponse<ITeachersListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<ITeachersListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get teacher by ID
     */
    async getTeacherById(teacherId: string): Promise<ApiResponse<{ teacher: ITeacherAdmin }>> {
        const response = await axiosInstance.get<ApiResponse<{ teacher: ITeacherAdmin }>>(
            `${this.BASE_PATH}/${teacherId}`
        );
        return response.data;
    }

    /**
     * Suspend teacher (Admin only)
     */
    async suspendTeacher(teacherId: string, reason?: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `${this.BASE_PATH}/${teacherId}/suspend`,
            { reason }
        );
        return response.data;
    }

    /**
     * Unsuspend teacher (Admin only)
     */
    async unsuspendTeacher(teacherId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `${this.BASE_PATH}/${teacherId}/unsuspend`
        );
        return response.data;
    }

    /**
     * Create teacher (Admin only)
     */
    async createTeacher(data: {
        firstName: string;
        middleName: string;
        lastName: string;
        email: string;
        password: string;
        mobileNumber: string;
        gender: string;
        governorate: string;
        specialization?: string;
        yearsOfExperience?: number;
        platformName: string;
        subdomain: string;
    }): Promise<ApiResponse<{ teacher: ITeacherAdmin }>> {
        const response = await axiosInstance.post<ApiResponse<{ teacher: ITeacherAdmin }>>(
            this.BASE_PATH,
            data
        );
        return response.data;
    }

    /**
     * Update teacher (Admin only)
     */
    async updateTeacher(
        teacherId: string,
        data: Partial<ITeacherAdmin>
    ): Promise<ApiResponse<{ teacher: ITeacherAdmin }>> {
        const response = await axiosInstance.put<ApiResponse<{ teacher: ITeacherAdmin }>>(
            `${this.BASE_PATH}/${teacherId}`,
            data
        );
        return response.data;
    }

    /**
     * Delete teacher (Admin only)
     */
    async deleteTeacher(teacherId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${teacherId}`
        );
        return response.data;
    }

    /**
     * Block user (Admin only)
     */
    async blockUser(userId: string, reason?: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/block`,
            { reason }
        );
        return response.data;
    }

    /**
     * Unblock user (Admin only)
     */
    async unblockUser(userId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/unblock`
        );
        return response.data;
    }
}

// Export singleton instance
export const teachersService = new TeachersService();
export default teachersService;

