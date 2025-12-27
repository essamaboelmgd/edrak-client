import { axiosInstance } from '@/lib/axios';
import { ApiResponse, IUserResponse, IStudentResponse, ITeacherResponse } from '@/types/auth.types';
import {
    ITeacherPublicView,
    ITeacherAdminView,
    IStudentListView,
    IStudentDetailView,
    IPaginatedResponse,
    ITeachersQuery,
    IStudentsQuery,
} from '@/types/user.types';

class UserService {
    private readonly BASE_PATH = '/users';

    /**
     * Get current authenticated user
     */
    async getMe(): Promise<ApiResponse<{ user: IUserResponse | IStudentResponse | ITeacherResponse }>> {
        const response = await axiosInstance.get<ApiResponse<{ user: IUserResponse | IStudentResponse | ITeacherResponse }>>(
            `${this.BASE_PATH}/me`
        );
        return response.data;
    }

    /**
     * Get all teachers (authenticated users)
     */
    async getAllTeachers(query?: ITeachersQuery): Promise<ApiResponse<{
        teachers: (ITeacherPublicView | ITeacherAdminView)[];
        pagination: IPaginatedResponse<any>['pagination'];
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<{
            teachers: (ITeacherPublicView | ITeacherAdminView)[];
            pagination: IPaginatedResponse<any>['pagination'];
        }>>(
            `${this.BASE_PATH}/teachers?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get teacher by ID
     */
    async getTeacherById(id: string): Promise<ApiResponse<{ teacher: ITeacherPublicView | ITeacherAdminView }>> {
        const response = await axiosInstance.get<ApiResponse<{ teacher: ITeacherPublicView | ITeacherAdminView }>>(
            `${this.BASE_PATH}/teachers/${id}`
        );
        return response.data;
    }

    /**
     * Get all students (Admin/Teacher only)
     */
    async getAllStudents(query?: IStudentsQuery): Promise<ApiResponse<{
        students: IStudentListView[];
        pagination: IPaginatedResponse<any>['pagination'];
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);
        if (query?.educationalLevel) params.append('educationalLevel', query.educationalLevel);

        const response = await axiosInstance.get<ApiResponse<{
            students: IStudentListView[];
            pagination: IPaginatedResponse<any>['pagination'];
        }>>(
            `${this.BASE_PATH}/students?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get student by ID
     */
    async getStudentById(id: string): Promise<ApiResponse<{ student: IStudentDetailView }>> {
        const response = await axiosInstance.get<ApiResponse<{ student: IStudentDetailView }>>(
            `${this.BASE_PATH}/students/${id}`
        );
        return response.data;
    }

    /**
     * Get my students (Teacher only)
     */
    async getMyStudents(query?: Omit<IStudentsQuery, 'educationalLevel'>): Promise<ApiResponse<{
        students: IStudentListView[];
        pagination: IPaginatedResponse<any>['pagination'];
    }>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);

        const response = await axiosInstance.get<ApiResponse<{
            students: IStudentListView[];
            pagination: IPaginatedResponse<any>['pagination'];
        }>>(
            `${this.BASE_PATH}/my-students?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get teacher by subdomain (PUBLIC - No Auth Required)
     */
    async getTeacherBySubdomain(subdomain: string): Promise<ApiResponse<{ teacher: ITeacherPublicView }>> {
        const response = await axiosInstance.get<ApiResponse<{ teacher: ITeacherPublicView }>>(
            `${this.BASE_PATH}/public/${subdomain}`
        );
        return response.data;
    }

    /**
     * Get teacher statistics (Teacher only)
     */
    async getTeacherStatistics(): Promise<ApiResponse<{
        statistics: {
            totalCourses: number;
            totalCourseSections: number;
            totalStudents: number;
            totalSubscriptions: number;
            totalRevenue: number;
            totalLessons: number;
            lastNewStudents: Array<{
                _id: string;
                fullName: string;
                email: string;
                subscribedAt: string;
                subscriptionType: string;
                amount: number;
            }>;
            revenueByMonth: Array<{
                month: string;
                revenue: number;
                count: number;
            }>;
            revenueByDay: Array<{
                day: string;
                revenue: number;
                count: number;
            }>;
            courses: Array<{
                courseId: string;
                courseName: string;
                statistics: {
                    totalSubscribers: number;
                    totalLessons: number;
                    totalLessonSections: number;
                    totalExams: number;
                    totalViews: number;
                    totalHomeworks: number;
                    totalRevenue: number;
                };
            }>;
        };
    }>> {
        const response = await axiosInstance.get<ApiResponse<{
            statistics: {
                totalCourses: number;
                totalCourseSections: number;
                totalStudents: number;
                totalSubscriptions: number;
                totalRevenue: number;
                totalLessons: number;
                lastNewStudents: Array<{
                    _id: string;
                    fullName: string;
                    email: string;
                    subscribedAt: string;
                    subscriptionType: string;
                    amount: number;
                }>;
                revenueByMonth: Array<{
                    month: string;
                    revenue: number;
                    count: number;
                }>;
                revenueByDay: Array<{
                    day: string;
                    revenue: number;
                    count: number;
                }>;
                courses: Array<{
                    courseId: string;
                    courseName: string;
                    statistics: {
                        totalSubscribers: number;
                        totalLessons: number;
                        totalLessonSections: number;
                        totalExams: number;
                        totalViews: number;
                        totalHomeworks: number;
                        totalRevenue: number;
                    };
                }>;
            };
        }>>(`${this.BASE_PATH}/teacher/statistics`);
        return response.data;
    }
}

// Export singleton instance
export const userService = new UserService();
export default userService;

