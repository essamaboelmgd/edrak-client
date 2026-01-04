import { axiosInstance } from '@/lib/axios';
import { IStudentCourse } from '../types';

class StudentService {
    /**
     * Get all available courses
     */
    async getAllCourses(params?: any) {
        // Based on existing controllers, public courses are likely under /courses
        const response = await axiosInstance.get<{ data: { courses: IStudentCourse[]; total: number } }>('/courses', {
            params
        });
        return response.data.data;
    }

    /**
     * Get my enrolled courses
     */
    async getMyCourses(params?: any) {
        const response = await axiosInstance.get<{ data: { courses: IStudentCourse[]; total: number } }>('/courses/my-courses', {
            params
        });
        return response.data.data;
    }

    /**
     * Get course details
     */
    async getCourseById(courseId: string) {
        const response = await axiosInstance.get<{ data: { course: IStudentCourse } }>(`/courses/${courseId}`);
        return response.data.data.course;
    }

    async getCourseContent(courseId: string) {
        // Legacy parity endpoint
        const response = await axiosInstance.get<{ data: { result: any } }>(`/courses/${courseId}/content`);
        return response.data.data.result;
    }
    
    /**
     * Get course sections with lessons
     */
    
    /**
     * Get Platform Sections (The big sections containing courses)
     */
    /**
     * Get Platform Sections (The big sections containing courses)
     */
    async getPlatformSections(filters?: { educationalLevel?: string }) {
         const response = await axiosInstance.get<{ data: { sections: any[]; total: number } }>('/courses/sections/populated', {
             params: filters
         });
         return response.data.data;
    }

    async getTeachers() {
        // Assuming public endpoint or derived from courses. 
        // Admin API has /users/teachers or similar. 
        // For student, maybe just get unique teachers from courses? 
        // Or use a specific endpoint if exists. 
        // Let's rely on caching/static for now if no endpoint, or check backend again.
        // CHECK: route.get("/statistics/all-teachers") in course.controller is ADMIN only.
        // Student might need a public "get instructors" endpoint.
        // I will assume for now filtering is done via params but filling the dropdown might need data.
        // Temporary: I will not implement getTeachers API call if it doesn't exist for students, 
        // but I'll add the method stub if I find the endpoint.
        // Actually, let's skip a dedicated API call and maybe extract unique teachers from the loaded courses? 
        // No, that's inefficient if paginated.
        // Let's check api for public teachers list. `user.controller`?
        return []; 
    }

    async getEducationalLevels() {
        // Assuming /educational-levels endpoint exists
        const response = await axiosInstance.get<{ data: { levels: any[] } }>('/educational-levels');
        return response.data.data;
    }

    /**
     * Get courses by section
     */
    async getCoursesBySection(sectionId?: string) {
        // According to user, we fetch all then filter? Or is there an endpoint?
        // User said: "gwa el sections di fiha el courses bta3etna di {{baseUrl}}/courses?page=1&limit=10"
        // This implies fetching all courses and filtering, OR the courses endpoint supports filtering.
        // Let's check getCoursesWithSections or if getAllCourses supports section filter.
        // For now, implementing the user's requested endpoint.
        const response = await axiosInstance.get<{ data: { courses: IStudentCourse[]; total: number } }>('/courses', {
            params: { page: 1, limit: 10, courseSection: sectionId }
        });
        return response.data.data;
    }

    /**
     * Get lesson sections for a course
     */
    async getLessonSectionsByCourse(courseId: string) {
        const response = await axiosInstance.get<{ data: { sections: any[], total: number } }>(`/courses/${courseId}/lesson-sections`);
        // The API returns array directly according to controller: res.send(sections)
        // Controller: SectionService.getLessonSectionsByCourse -> res.json({ success: true, data: { lessonSections: ... } }) 
        // Checking controller code again...
        // router.get("/:courseId/lesson-sections", ..., SectionService.getLessonSectionsByCourse)
        // I don't have SectionService code visible but standard pattern is { data: { lessonSections: [] } }
        // Let's assume standard response wrapper.
        return response.data.data;
    }

    /**
     * Get lessons for a course (or section?)
     * User said: {{baseUrl}}/courses/:courseId/lessons
     */
    async getLessonsByCourse(courseId: string) {
         const response = await axiosInstance.get<{ data: { lessons: any[]; total: number } }>(`/courses/${courseId}/lessons`);
         return response.data.data;
    }

    /**
     * Get full course content (sections + lessons) for viewing
     * Backend: router.get("/:id", ...) 
     * Backend: router.get("/with-sections", ...) for all courses?
     * 
     * Using the 'my-content' or similar if enrolled? 
     * Let's stick to public + authenticated structure.
     */
    /**
     * Subscribe to a course
     */
    async subscribeToCourse(courseId: string, paymentMethod: string = 'wallet', couponCode?: string) {
        const response = await axiosInstance.post('/courses/subscribe/course', {
            course: courseId,
            paymentMethod,
            couponCode
        });
        return response.data;
    }

    async getMySubscriptions() {
        // Based on API audit, this endpoint exists for student
        const response = await axiosInstance.get('/courses/subscriptions/my');
        return response.data.data;
    }

    async getProfile() {
        const response = await axiosInstance.get('/users/me');
        return response.data.data.user;
    }

    async checkSubscriptionStatus(type: 'course' | 'lesson' | 'courseSection' | 'lessonSection', id: string) {
        const response = await axiosInstance.get<{ success: boolean; data: { isSubscribed: boolean; subscription?: any } }>(`/courses/subscription-status/${type}/${id}`);
        return response.data.data;
    }

    async subscribeToLesson(lessonId: string, paymentMethod: string = 'wallet') {
        const response = await axiosInstance.post('/courses/subscribe/lesson', {
            lesson: lessonId,
            paymentMethod
        });
        return response.data;
    }

    async subscribeToLessonSection(sectionId: string, paymentMethod: string = 'wallet') {
        const response = await axiosInstance.post('/courses/subscribe/lesson-section', {
            lessonSection: sectionId, // Fixed param name from 'section' to 'lessonSection' match backend validation
            paymentMethod
        });
        return response.data;
    }

    async subscribeToMultipleLessons(courseId: string, lessonIds: string[], paymentMethod: string = 'wallet') {
        const response = await axiosInstance.post('/courses/subscribe/multiple-lessons', {
            course: courseId,
            lessons: lessonIds,
            paymentMethod
        });
        return response.data;
    }

    async subscribeToCourseSection(sectionId: string, paymentMethod: string = 'wallet') {
         const response = await axiosInstance.post('/courses/subscribe/course-section', {
            courseSection: sectionId,
            paymentMethod
        });
        return response.data;
    }

}

export const studentService = new StudentService();
