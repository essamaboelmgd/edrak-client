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
    photo?: string;
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
        middleName?: string;
        lastName: string;
        email: string;
        password: string;
        mobileNumber: string;
        gender: string;
        governorate: string;
        specialization?: string;
        yearsOfExperience?: number;
        platformName: string;
        subdomain?: string;
        photo?: File;
    }): Promise<ApiResponse<{ teacher: ITeacherAdmin }>> {
        // Always use FormData so multer can parse it on the backend
        const formData = new FormData();

        // Append all required fields explicitly
        formData.append('firstName', data.firstName);
        // Only append middleName if provided
        if (data.middleName) {
            formData.append('middleName', data.middleName);
        }
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('mobileNumber', data.mobileNumber);
        formData.append('gender', data.gender);
        formData.append('governorate', data.governorate);
        formData.append('platformName', data.platformName);

        if (data.subdomain) {
            formData.append('subdomain', data.subdomain);
        }

        if (data.specialization) {
            formData.append('specialization', data.specialization);
        }

        if (data.yearsOfExperience !== undefined && data.yearsOfExperience !== null) {
            formData.append('yearsOfExperience', String(data.yearsOfExperience));
        }

        // Append photo if provided
        if (data.photo) {
            formData.append('photo', data.photo);
        }

        console.log('Making API call to:', this.BASE_PATH);
        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
            console.log(key, ':', value instanceof File ? `File: ${value.name}` : value);
        }

        const response = await axiosInstance.post<ApiResponse<{ teacher: ITeacherAdmin }>>(
            this.BASE_PATH,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        console.log('API call successful:', response);
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

    /**
     * Get teacher overview/statistics (Admin only)
     */
    async getTeacherOverview(teacherId: string): Promise<ApiResponse<{ overview: any }>> {
        const response = await axiosInstance.get<ApiResponse<{ overview: any }>>(
            `${this.BASE_PATH}/${teacherId}/overview`
        );
        return response.data;
    }

    /**
     * Get teacher courses (Admin only)
     */
    async getTeacherCourses(teacherId: string): Promise<ApiResponse<{ courses: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ courses: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/courses`
        );
        return response.data;
    }

    /**
     * Get teacher lessons (Admin only)
     */
    async getTeacherLessons(teacherId: string): Promise<ApiResponse<{ lessons: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ lessons: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/lessons`
        );
        return response.data;
    }

    /**
     * Get teacher sections (Admin only)
     */
    async getTeacherSections(teacherId: string): Promise<ApiResponse<{ sections: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ sections: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/sections`
        );
        return response.data;
    }

    /**
     * Get teacher homeworks (Admin only)
     */
    async getTeacherHomeworks(teacherId: string): Promise<ApiResponse<{ homeworks: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ homeworks: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/homeworks`
        );
        return response.data;
    }

    /**
     * Get teacher exams (Admin only)
     */
    async getTeacherExams(teacherId: string): Promise<ApiResponse<{ exams: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ exams: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/exams`
        );
        return response.data;
    }

    /**
     * Get teacher subscriptions as student (Admin only)
     */
    async getTeacherSubscriptionsAsStudent(teacherId: string): Promise<ApiResponse<{ subscriptions: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ subscriptions: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/subscriptions-as-student`
        );
        return response.data;
    }

    /**
     * Get teacher subscription plan and features (Admin only)
     */
    async getTeacherSubscriptionPlan(teacherId: string): Promise<ApiResponse<{ subscription: any; selectedFeatures: any[] }>> {
        const response = await axiosInstance.get<ApiResponse<{ subscription: any; selectedFeatures: any[] }>>(
            `${this.BASE_PATH}/${teacherId}/subscription-plan`
        );
        return response.data;
    }

    /**
     * Get teacher subscription history (Admin only)
     */
    async getTeacherSubscriptionHistory(teacherId: string): Promise<ApiResponse<{ subscriptions: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ subscriptions: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/subscription-history`
        );
        return response.data;
    }

    /**
     * Get teacher payment history (Admin only)
     */
    async getTeacherPayments(teacherId: string): Promise<ApiResponse<{ payments: any[]; total: number }>> {
        const response = await axiosInstance.get<ApiResponse<{ payments: any[]; total: number }>>(
            `${this.BASE_PATH}/${teacherId}/payments`
        );
        return response.data;
    }
}

// Export singleton instance
export const teachersService = new TeachersService();
export default teachersService;

