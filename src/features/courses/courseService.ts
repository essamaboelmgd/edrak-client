import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface ICourse {
    _id: string;
    title: string;
    description?: string;
    status?: string;
}

export interface ILesson {
    _id: string;
    title: string;
    description?: string;
    course?: string;
    status?: string;
}

export interface ICoursesListResponse {
    courses: ICourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ILessonsListResponse {
    lessons: ILesson[];
    total: number;
}

class CourseService {
    private readonly BASE_PATH = '/courses';

    /**
     * Get all courses for the authenticated teacher
     */
    async getMyCourses(query?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<ICoursesListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<ICoursesListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get courses and sections together
     */
    async getCoursesWithSections(query?: { page?: number; limit?: number; status?: string; educationalLevel?: string }): Promise<ApiResponse<{
        courses: ICourse[];
        sections: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.status) params.append('status', query.status);
        if (query?.educationalLevel) params.append('educationalLevel', query.educationalLevel);

        const response = await axiosInstance.get<ApiResponse<{
            courses: ICourse[];
            sections: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(
            `${this.BASE_PATH}/with-sections?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get all course sections
     */
    async getCourseSections(query?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{
        sections: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<{
            sections: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(
            `${this.BASE_PATH}/sections?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get lessons for a specific course
     */
    async getCourseLessons(courseId: string): Promise<ApiResponse<ILessonsListResponse>> {
        const response = await axiosInstance.get<ApiResponse<ILessonsListResponse>>(
            `${this.BASE_PATH}/${courseId}/lessons`
        );
        return response.data;
    }

    /**
     * Get all lessons (for teacher)
     */
    async getAllLessons(query?: { page?: number; limit?: number; course?: string; status?: string }): Promise<ApiResponse<ILessonsListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.course) params.append('course', query.course);
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<ILessonsListResponse>>(
            `${this.BASE_PATH}/lessons?${params.toString()}`
        );
        return response.data;
    }
}

// Export singleton instance
export const courseService = new CourseService();
export default courseService;

