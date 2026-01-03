import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface ISectionAdmin {
    _id: string;
    title: string;
    description?: string;
    poster?: string;
    teacher: {
        _id: string;
        fullName: string;
        email: string;
    };
    educationalLevel: {
        _id: string;
        name: string;
        shortName: string;
    };
    price: number;
    discount: number;
    finalPrice: number;
    status: string;
    order: number;
    stats: {
        totalCourses: number;
        totalStudents: number;
    };
    statistics?: {
        subscribersCount: number;
        coursesCount: number;
        lessonsCount: number;
        examsCount: number;
        homeworksCount: number;
        totalRevenue: number;
    };
    courses?: Array<{
        _id: string;
        title: string;
        description?: string;
        poster?: string;
        teacher: {
            _id: string;
            fullName: string;
            email: string;
        };
        educationalLevel: {
            _id: string;
            name: string;
            shortName: string;
        };
        price: number;
        discount: number;
        finalPrice: number;
        status: string;
        isFree: boolean;
    }>;
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
        lesson?: {
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
        lesson?: {
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
        lesson?: {
            _id: string;
            title: string;
        };
    }>;
    createdAt: string;
    updatedAt: string;
}

class SectionsService {
    private readonly BASE_PATH = '/courses/sections';

    /**
     * Get section by ID with full details
     */
    async getSectionById(sectionId: string): Promise<ApiResponse<{ section: ISectionAdmin }>> {
        const response = await axiosInstance.get<ApiResponse<{ section: ISectionAdmin }>>(
            `${this.BASE_PATH}/${sectionId}`
        );
        return response.data;
    }

    /**
     * Get section courses with pagination
     */
    async getSectionCourses(
        sectionId: string,
        query?: {
            page?: number;
            limit?: number;
            search?: string;
            status?: string;
        }
    ): Promise<ApiResponse<{
        courses: Array<{
            _id: string;
            title: string;
            description?: string;
            poster?: string;
            teacher: {
                _id: string;
                fullName: string;
                email: string;
            };
            educationalLevel: {
                _id: string;
                name: string;
                shortName: string;
            };
            price: number;
            discount: number;
            finalPrice: number;
            status: string;
            isFree: boolean;
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
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<{
            courses: Array<any>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/${sectionId}/courses?${params.toString()}`);
        return response.data;
    }

    /**
     * Get section lessons with pagination
     */
    async getSectionLessons(
        sectionId: string,
        query?: {
            page?: number;
            limit?: number;
            search?: string;
            status?: string;
        }
    ): Promise<ApiResponse<{
        lessons: Array<{
            _id: string;
            title: string;
            description?: string;
            poster?: string;
            videoUrl?: string;
            videoProvider?: string;
            duration?: number;
            order?: number;
            status: string;
            isFree: boolean;
            price: number;
            discount: number;
            finalPrice: number;
            course?: {
                _id: string;
                title: string;
            };
            lessonSection?: {
                _id: string;
                title: string;
            };
            createdAt: string;
            updatedAt: string;
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
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<{
            lessons: Array<any>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/${sectionId}/lessons?${params.toString()}`);
        return response.data;
    }

    /**
     * Get section question bank
     */
    async getSectionQuestionBank(
        sectionId: string
    ): Promise<ApiResponse<{
        questions: Array<{
            _id: string;
            question: string;
            questionType: string;
            difficulty?: string;
            points?: number;
            tags?: string[];
            isActive?: boolean;
            course?: {
                _id: string;
                title: string;
            };
            lesson?: {
                _id: string;
                title: string;
            };
            createdAt?: string;
        }>;
        total: number;
    }>> {
        const response = await axiosInstance.get<ApiResponse<{
            questions: Array<any>;
            total: number;
        }>>(`${this.BASE_PATH}/${sectionId}/question-bank`);
        return response.data;
    }

    /**
     * Get section exams
     */
    async getSectionExams(
        sectionId: string
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
            lesson?: {
                _id: string;
                title: string;
            };
        }>;
        total: number;
    }>> {
        const response = await axiosInstance.get<ApiResponse<{
            exams: Array<any>;
            total: number;
        }>>(`${this.BASE_PATH}/${sectionId}/exams`);
        return response.data;
    }

    /**
     * Get section homeworks
     */
    async getSectionHomeworks(
        sectionId: string
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
            lesson?: {
                _id: string;
                title: string;
            };
        }>;
        total: number;
    }>> {
        const response = await axiosInstance.get<ApiResponse<{
            homeworks: Array<any>;
            total: number;
        }>>(`${this.BASE_PATH}/${sectionId}/homeworks`);
        return response.data;
    }

    /**
     * Get section students with pagination
     */
    async getSectionStudents(
        sectionId: string,
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
            students: Array<any>;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/${sectionId}/students?${params.toString()}`);
        return response.data;
    }

    /**
     * Update section (Admin)
     */
    async updateSection(
        sectionId: string,
        data: FormData
    ): Promise<ApiResponse<{ section: ISectionAdmin }>> {
        const response = await axiosInstance.put<ApiResponse<{ section: ISectionAdmin }>>(
            `${this.BASE_PATH}/${sectionId}`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    /**
     * Delete section (Admin)
     */
    async deleteSection(sectionId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${sectionId}`
        );
        return response.data;
    }
}

// Export singleton instance
export const sectionsService = new SectionsService();
export default sectionsService;

