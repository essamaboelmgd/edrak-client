import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface ILessonAdmin {
    _id: string;
    title: string;
    description?: string;
    poster?: string;
    thumbnail?: string;
    videoUrl?: string;
    videoProvider?: string;
    duration?: number;
    course?: {
        _id: string;
        title: string;
        teacher?: {
            _id: string;
            fullName: string;
            email: string;
        };
        educationalLevel?: {
            _id: string;
            name: string;
            shortName: string;
        };
    };
    lessonSection?: {
        _id: string;
        title?: string;
        name?: string;
        nameArabic?: string;
    };
    order: number;
    status: string;
    isFree: boolean;
    price: number;
    discount: number;
    finalPrice: number;
    attachments?: Array<{
        title: string;
        url: string;
        type: string;
        size?: number;
    }>;
    statistics?: {
        subscribersCount: number;
        examsCount: number;
        homeworksCount: number;
        totalRevenue: number;
        viewsCount: number;
    };
    exams?: Array<{
        _id: string;
        title: string;
        description?: string;
        duration?: number;
        status?: string;
        draft?: boolean;
        createdAt?: string;
        course?: {
            _id: string;
            title: string;
        };
    }>;
    homeworks?: Array<{
        _id: string;
        name: string;
        details?: string;
        level?: string;
        date?: string;
        createdAt?: string;
        course?: {
            _id: string;
            title: string;
        };
    }>;
    questionBankQuestions?: Array<{
        _id: string;
        question: string;
        questionType: string;
        difficulty?: string;
        points?: number;
        createdAt?: string;
        course?: {
            _id: string;
            title: string;
        };
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface ILessonsListResponse {
    lessons: ILessonAdmin[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class LessonsService {
    private readonly BASE_PATH = '/courses';

    /**
     * Get all lessons with pagination and filters (Admin)
     */
    async getAllLessons(query?: {
        page?: number;
        limit?: number;
        course?: string;
        status?: string;
        isFree?: boolean;
        search?: string;
    }): Promise<ApiResponse<ILessonsListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.course) params.append('course', query.course);
        if (query?.status) params.append('status', query.status);
        if (query?.isFree !== undefined) params.append('isFree', query.isFree.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<ILessonsListResponse>>(
            `${this.BASE_PATH}/lessons?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get lesson by ID
     */
    async getLessonById(lessonId: string): Promise<ApiResponse<{ lesson: ILessonAdmin }>> {
        const response = await axiosInstance.get<ApiResponse<{ lesson: ILessonAdmin }>>(
            `${this.BASE_PATH}/lessons/${lessonId}`
        );
        return response.data;
    }

    /**
     * Update lesson status
     */
    async updateLessonStatus(lessonId: string, status: string): Promise<ApiResponse<{ lesson: ILessonAdmin }>> {
        const response = await axiosInstance.put<ApiResponse<{ lesson: ILessonAdmin }>>(
            `${this.BASE_PATH}/lessons/${lessonId}`,
            { status }
        );
        return response.data;
    }

    /**
     * Delete lesson (Admin)
     */
    async deleteLesson(lessonId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/lessons/${lessonId}`
        );
        return response.data;
    }

    /**
     * Get lesson students with pagination
     */
    async getLessonStudents(
        lessonId: string,
        query?: {
            page?: number;
            limit?: number;
            search?: string;
        }
    ): Promise<ApiResponse<{
        students: Array<{
            _id: string;
            fullName: string;
            firstName?: string;
            middleName?: string;
            lastName?: string;
            email?: string;
            phoneNumber?: string;
            photo?: string;
            educationalLevel?: {
                _id: string;
                name: string;
                shortName: string;
                stage?: string;
            };
            subscription: {
                _id: string;
                subscribedAt: string;
                paymentMethod: string;
                finalPrice: number;
            };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<{
            students: Array<{
                _id: string;
                fullName: string;
                firstName?: string;
                middleName?: string;
                lastName?: string;
                email?: string;
                phoneNumber?: string;
                photo?: string;
                educationalLevel?: {
                    _id: string;
                    name: string;
                    shortName: string;
                    stage?: string;
                };
                subscription: {
                    _id: string;
                    subscribedAt: string;
                    paymentMethod: string;
                    finalPrice: number;
                };
            }>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/lessons/${lessonId}/students?${params.toString()}`);
        return response.data;
    }

    /**
     * Get lesson exams with pagination
     */
    async getLessonExams(
        lessonId: string,
        query?: {
            page?: number;
            limit?: number;
            search?: string;
        }
    ): Promise<ApiResponse<{
        exams: Array<{
            _id: string;
            title: string;
            description?: string;
            duration?: number;
            status?: string;
            draft?: boolean;
            createdAt?: string;
            course?: {
                _id: string;
                title: string;
            };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<{
            exams: Array<{
                _id: string;
                title: string;
                description?: string;
                duration?: number;
                status?: string;
                draft?: boolean;
                createdAt?: string;
                course?: {
                    _id: string;
                    title: string;
                };
            }>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/lessons/${lessonId}/exams?${params.toString()}`);
        return response.data;
    }

    /**
     * Get lesson homeworks with pagination
     */
    async getLessonHomeworks(
        lessonId: string,
        query?: {
            page?: number;
            limit?: number;
            search?: string;
        }
    ): Promise<ApiResponse<{
        homeworks: Array<{
            _id: string;
            name: string;
            details?: string;
            level?: string;
            date?: string;
            createdAt?: string;
            course?: {
                _id: string;
                title: string;
            };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<{
            homeworks: Array<{
                _id: string;
                name: string;
                details?: string;
                level?: string;
                date?: string;
                createdAt?: string;
                course?: {
                    _id: string;
                    title: string;
                };
            }>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/lessons/${lessonId}/homeworks?${params.toString()}`);
        return response.data;
    }

    /**
     * Get lesson question bank with pagination
     */
    async getLessonQuestionBank(
        lessonId: string,
        query?: {
            page?: number;
            limit?: number;
            search?: string;
        }
    ): Promise<ApiResponse<{
        questions: Array<{
            _id: string;
            question: string;
            questionType: string;
            difficulty?: string;
            points?: number;
            tags?: string[];
            isActive?: boolean;
            createdAt?: string;
            course?: {
                _id: string;
                title: string;
            };
            lesson?: {
                _id: string;
                title: string;
            };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<{
            questions: Array<{
                _id: string;
                question: string;
                questionType: string;
                difficulty?: string;
                points?: number;
                tags?: string[];
                isActive?: boolean;
                createdAt?: string;
                course?: {
                    _id: string;
                    title: string;
                };
                lesson?: {
                    _id: string;
                    title: string;
                };
            }>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/lessons/${lessonId}/question-bank?${params.toString()}`);
        return response.data;
    }
}

// Export singleton instance
export const lessonsService = new LessonsService();
export default lessonsService;

