import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface ICourseAdmin {
    _id: string;
    title: string;
    description?: string;
    poster?: string;
    thumbnail?: string;
    teacher: {
        _id: string;
        fullName: string;
        email: string;
        specialization?: string;
    };
    educationalLevel: {
        _id: string;
        name: string;
        shortName: string;
        stage?: string;
    };
    courseSection?: {
        _id: string;
        title: string;
        name?: string;
        nameArabic?: string;
    };
    price: number;
    discount: number;
    finalPrice: number;
    status: string;
    type: string;
    isFree: boolean;
    startDate?: string;
    endDate?: string;
    stats: {
        totalLessons: number;
        totalStudents: number;
        totalRevenue: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ICoursesListResponse {
    courses: ICourseAdmin[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class CoursesService {
    private readonly BASE_PATH = '/courses';

    /**
     * Get all courses with pagination and filters (Admin)
     */
    async getAllCourses(query?: {
        page?: number;
        limit?: number;
        search?: string;
        teacher?: string;
        educationalLevel?: string;
        status?: string;
    }): Promise<ApiResponse<ICoursesListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);
        if (query?.teacher) params.append('teacher', query.teacher);
        if (query?.educationalLevel) params.append('educationalLevel', query.educationalLevel);
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<ICoursesListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get course by ID
     */
    async getCourseById(courseId: string): Promise<ApiResponse<{ course: ICourseAdmin }>> {
        const response = await axiosInstance.get<ApiResponse<{ course: ICourseAdmin }>>(
            `${this.BASE_PATH}/${courseId}`
        );
        return response.data;
    }

    /**
     * Create course (Admin - with teacher selection)
     */
    async createCourse(data: FormData): Promise<ApiResponse<{ course: ICourseAdmin }>> {
        const response = await axiosInstance.post<ApiResponse<{ course: ICourseAdmin }>>(
            this.BASE_PATH,
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
     * Update course (Admin)
     */
    async updateCourse(
        courseId: string,
        data: FormData | Partial<ICourseAdmin>
    ): Promise<ApiResponse<{ course: ICourseAdmin }>> {
        const isFormData = data instanceof FormData;
        const response = await axiosInstance.put<ApiResponse<{ course: ICourseAdmin }>>(
            `${this.BASE_PATH}/${courseId}`,
            data,
            isFormData
                ? {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
                : undefined
        );
        return response.data;
    }

    /**
     * Delete course (Admin)
     */
    async deleteCourse(courseId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${courseId}`
        );
        return response.data;
    }

    /**
     * Get courses with sections
     */
    async getCoursesWithSections(query?: {
        page?: number;
        limit?: number;
        teacher?: string;
        educationalLevel?: string;
        status?: string;
    }): Promise<ApiResponse<{
        courses: ICourseAdmin[];
        sections: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.teacher) params.append('teacher', query.teacher);
        if (query?.educationalLevel) params.append('educationalLevel', query.educationalLevel);
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<{
            courses: ICourseAdmin[];
            sections: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/with-sections?${params.toString()}`);
        return response.data;
    }

    /**
     * Get course sections
     */
    async getCourseSections(query?: {
        page?: number;
        limit?: number;
        teacher?: string;
        educationalLevel?: string;
        status?: string;
    }): Promise<ApiResponse<{
        sections: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.teacher) params.append('teacher', query.teacher);
        if (query?.educationalLevel) params.append('educationalLevel', query.educationalLevel);
        if (query?.status) params.append('status', query.status);

        const response = await axiosInstance.get<ApiResponse<{
            sections: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`${this.BASE_PATH}/sections?${params.toString()}`);
        return response.data;
    }

    /**
     * Create course section (Admin - with teacher selection)
     */
    async createCourseSection(data: FormData): Promise<ApiResponse<{ section: any }>> {
        const response = await axiosInstance.post<ApiResponse<{ section: any }>>(
            `${this.BASE_PATH}/sections`,
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
     * Update course section (Admin)
     */
    async updateCourseSection(
        sectionId: string,
        data: FormData
    ): Promise<ApiResponse<{ section: any }>> {
        const response = await axiosInstance.put<ApiResponse<{ section: any }>>(
            `${this.BASE_PATH}/sections/${sectionId}`,
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
     * Delete course section (Admin)
     */
    async deleteCourseSection(sectionId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/sections/${sectionId}`
        );
        return response.data;
    }

    /**
     * Get course students with pagination
     */
    async getCourseStudents(
        courseId: string,
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
        }>>(`${this.BASE_PATH}/${courseId}/students?${params.toString()}`);
        return response.data;
    }

    /**
     * Get course lessons with pagination
     */
    async getCourseLessons(
        courseId: string,
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
        }>>(`${this.BASE_PATH}/${courseId}/lessons?${params.toString()}`);
        return response.data;
    }
}

// Export singleton instance
export const coursesService = new CoursesService();
export default coursesService;

