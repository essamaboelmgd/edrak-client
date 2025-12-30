import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export type ActivationTargetType = 'course' | 'lesson' | 'courseSection' | 'lessonSection';

export interface IActivationCode {
    _id: string;
    code: string;
    targetType: ActivationTargetType;
    teacher: string | {
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        email: string;
    };
    course?: {
        _id: string;
        title: string;
    };
    lesson?: {
        _id: string;
        title: string;
    };
    courseSection?: {
        _id: string;
        name: string;
    };
    lessonSection?: {
        _id: string;
        name: string;
    };
    price: number;
    isUsed: boolean;
    createdBy: string | {
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        email: string;
    };
    usedBy?: {
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        email: string;
    };
    usedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IActivationCodesListResponse {
    codes: IActivationCode[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ICreateActivationCodesRequest {
    targetType: ActivationTargetType;
    targetId: string;
    quantity: number;
    price: number;
}

class ActivationCodesService {
    private readonly BASE_PATH = '/activation-codes';

    /**
     * Get all activation codes with pagination and filters
     */
    async getActivationCodes(query?: {
        page?: number;
        limit?: number;
        targetType?: ActivationTargetType;
        isUsed?: boolean;
        teacherId?: string;
        code?: string;
    }): Promise<ApiResponse<IActivationCodesListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.targetType) params.append('targetType', query.targetType);
        if (query?.isUsed !== undefined) params.append('isUsed', query.isUsed.toString());
        if (query?.teacherId) params.append('teacherId', query.teacherId);
        if (query?.code) params.append('code', query.code);

        const response = await axiosInstance.get<ApiResponse<IActivationCodesListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Create activation codes
     */
    async createActivationCodes(data: ICreateActivationCodesRequest): Promise<ApiResponse<{ codes: IActivationCode[]; total: number }>> {
        const response = await axiosInstance.post<ApiResponse<{ codes: IActivationCode[]; total: number }>>(
            this.BASE_PATH,
            data
        );
        return response.data;
    }

    /**
     * Delete activation code (only unused codes)
     */
    async deleteActivationCode(codeId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${codeId}`
        );
        return response.data;
    }
}

// Export singleton instance
export const activationCodesService = new ActivationCodesService();
export default activationCodesService;

