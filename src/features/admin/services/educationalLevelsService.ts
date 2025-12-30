import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface IEducationalLevel {
    _id: string;
    name: string;
    shortName: string;
    grade?: number;
    stage?: string;
}

export interface IEducationalLevelsResponse {
    educationalLevels: IEducationalLevel[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class EducationalLevelsService {
    private readonly BASE_PATH = '/educational-levels';

    /**
     * Get all educational levels
     */
    async getAllEducationalLevels(query?: {
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<IEducationalLevelsResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());

        const response = await axiosInstance.get<ApiResponse<IEducationalLevelsResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }
}

export const educationalLevelsService = new EducationalLevelsService();
export default educationalLevelsService;

