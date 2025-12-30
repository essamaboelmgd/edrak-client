import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface IStudentEducationalLevel {
    _id: string;
    name: string;
    shortName: string;
    grade?: number;
    stage?: string;
}

export interface IStudentAssignedTeacher {
    _id: string;
    fullName: string;
}

export interface IStudentAdmin {
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
    educationalLevel?: IStudentEducationalLevel;
    assignedTeachers: IStudentAssignedTeacher[];
    isActive: boolean;
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    status?: "active" | "blocked" | "reviewing";
    canUpdateInfo?: boolean;
    wallet?: {
        amount: number;
    };
    leaderboardRank?: {
        value: number;
    };
    level?: {
        value: number;
    };
    lastLogin?: string;
    parentInfo?: {
        parentName?: string;
        parentMobile?: string;
        parentWhatsapp?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IStudentsListResponse {
    students: IStudentAdmin[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

class StudentsService {
    private readonly BASE_PATH = '/users/students';

    /**
     * Get all students with pagination and filters
     */
    async getAllStudents(query?: {
        page?: number;
        limit?: number;
        search?: string;
        educationalLevel?: string;
        teacher?: string;
    }): Promise<ApiResponse<IStudentsListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);
        if (query?.educationalLevel) params.append('educationalLevel', query.educationalLevel);
        if (query?.teacher) params.append('teacher', query.teacher);

        const response = await axiosInstance.get<ApiResponse<IStudentsListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get student by ID
     */
    async getStudentById(studentId: string): Promise<ApiResponse<{ student: IStudentAdmin }>> {
        const response = await axiosInstance.get<ApiResponse<{ student: IStudentAdmin }>>(
            `${this.BASE_PATH}/${studentId}`
        );
        return response.data;
    }

    /**
     * Create student (Admin only)
     */
    async createStudent(data: {
        firstName: string;
        middleName: string;
        lastName: string;
        email: string;
        password: string;
        mobileNumber: string;
        gender: string;
        governorate: string;
        educationalLevel?: string;
        assignedTeachers?: string[];
        parentInfo?: {
            parentName?: string;
            parentMobile?: string;
            parentWhatsapp?: string;
        };
    }): Promise<ApiResponse<{ student: IStudentAdmin }>> {
        const response = await axiosInstance.post<ApiResponse<{ student: IStudentAdmin }>>(
            this.BASE_PATH,
            data
        );
        return response.data;
    }

    /**
     * Update student (Admin only)
     */
    async updateStudent(
        studentId: string,
        data: {
            firstName?: string;
            middleName?: string;
            lastName?: string;
            email?: string;
            mobileNumber?: string;
            gender?: string;
            governorate?: string;
            educationalLevel?: string;
            assignedTeachers?: string[];
            isActive?: boolean;
            parentInfo?: {
                parentName?: string;
                parentMobile?: string;
                parentWhatsapp?: string;
            };
        }
    ): Promise<ApiResponse<{ student: IStudentAdmin }>> {
        const response = await axiosInstance.put<ApiResponse<{ student: IStudentAdmin }>>(
            `${this.BASE_PATH}/${studentId}`,
            data
        );
        return response.data;
    }

    /**
     * Delete student (Admin only)
     */
    async deleteStudent(studentId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${studentId}`
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
     * Manage wallet (Admin only)
     */
    async manageWallet(userId: string, amount: number, type: "deposit" | "withdraw"): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/manage-wallet`,
            { userId, amount, type }
        );
        return response.data;
    }

    /**
     * Change user status (Admin only)
     */
    async changeUserStatus(userId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/change-status`
        );
        return response.data;
    }

    /**
     * Allow/Disallow modifications (Admin only)
     */
    async allowModifications(userId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/allow-modifications`
        );
        return response.data;
    }

    /**
     * Change user activation (Admin only)
     */
    async changeUserActivation(userId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/change-activation`
        );
        return response.data;
    }

    /**
     * Reset user level (Admin only)
     */
    async resetLevel(userId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/reset-level`
        );
        return response.data;
    }

    /**
     * Reset user leaderboard rank (Admin only)
     */
    async resetRank(userId: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/${userId}/reset-rank`
        );
        return response.data;
    }

    /**
     * Activate multiple users (Admin only)
     */
    async activateMultipleUsers(userIds: string[]): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/activate-multiple`,
            { userIds }
        );
        return response.data;
    }

    /**
     * Export students (Admin only)
     */
    async exportStudents(query?: {
        user_type?: string;
        search?: string;
        status?: string;
        city_id?: string;
        state_id?: string;
        educational_level?: string;
        teacher_id?: string;
    }): Promise<Blob> {
        const params = new URLSearchParams();
        if (query?.user_type) params.append('user_type', query.user_type);
        if (query?.search) params.append('search', query.search);
        if (query?.status) params.append('status', query.status);
        if (query?.city_id) params.append('city_id', query.city_id);
        if (query?.state_id) params.append('state_id', query.state_id);
        if (query?.educational_level) params.append('educational_level', query.educational_level);
        if (query?.teacher_id) params.append('teacher_id', query.teacher_id);

        const response = await axiosInstance.get(
            `/users/export?${params.toString()}`,
            { responseType: 'blob' }
        );
        return response.data;
    }
}

// Export singleton instance
export const studentsService = new StudentsService();
export default studentsService;

