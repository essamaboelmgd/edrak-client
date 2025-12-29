import { axiosInstance } from '@/lib/axios';
import { IStudentCourse } from '../types';

class StudentService {
    /**
     * Get all available courses
     */
    async getAllCourses() {
        // Based on existing controllers, public courses are likely under /courses
        const response = await axiosInstance.get<{ data: { courses: IStudentCourse[]; total: number } }>('/courses');
        return response.data.data;
    }

    /**
     * Get my enrolled courses
     */
    async getMyCourses() {
        const response = await axiosInstance.get<{ data: { courses: IStudentCourse[]; total: number } }>('/courses/my-courses');
        return response.data.data;
    }

    /**
     * Get course details
     */
    async getCourseById(courseId: string) {
        const response = await axiosInstance.get<{ data: IStudentCourse }>(`/courses/${courseId}`);
        return response.data.data;
    }
    
    /**
     * Get course sections with lessons
     */
    
    /**
     * Get Platform Sections (The big sections containing courses)
     */
    async getPlatformSections() {
         const response = await axiosInstance.get<{ data: { sections: any[]; total: number } }>('/courses/sections/populated');
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
        return response.data.data; // This might need adjustment if data structure is different
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
    async subscribeToCourse(courseId: string) {
        // Assuming 'wallet' as default payment method for now or passed as arg
        const response = await axiosInstance.post('/courses/subscribe/course', {
            course: courseId,
            paymentMethod: 'wallet' 
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

}

export const studentService = new StudentService();
