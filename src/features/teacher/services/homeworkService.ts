import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
    ICreateHomeworkRequest,
    IUpdateHomeworkRequest,
    IGenerateHomeworkRequest,
    IGetHomeworkQuery,
    IHomeworkResponse,
    IHomeworkListResponse,
    IHomeworkWithQuestionsResponse,
    IGetSubmissionsQuery,
    IHomeworkSubmissionListResponse,
} from '@/types/homework.types';

class HomeworkService {
    private readonly BASE_PATH = '/homework';

    // ==================== HOMEWORK CRUD ==================== //

    /**
     * Get all homework with filters
     */
    async getHomeworks(query?: IGetHomeworkQuery): Promise<ApiResponse<IHomeworkListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.teacher) params.append('teacher', query.teacher);
        if (query?.homeworkType) params.append('homeworkType', query.homeworkType);
        if (query?.contentType) params.append('contentType', query.contentType);
        if (query?.status) params.append('status', query.status);
        if (query?.course) params.append('course', query.course);
        if (query?.lesson) params.append('lesson', query.lesson);
        if (query?.search) params.append('search', query.search);
        if (query?.activeOnly !== undefined) params.append('activeOnly', query.activeOnly.toString());

        const response = await axiosInstance.get<ApiResponse<IHomeworkListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get homework by ID
     */
    async getHomeworkById(id: string, includeQuestions = false): Promise<ApiResponse<{ homework: IHomeworkResponse | IHomeworkWithQuestionsResponse }>> {
        const response = await axiosInstance.get<ApiResponse<{ homework: IHomeworkResponse | IHomeworkWithQuestionsResponse }>>(
            `${this.BASE_PATH}/${id}${includeQuestions ? '?includeQuestions=true' : ''}`
        );
        return response.data;
    }

    /**
     * Create homework (with file uploads support)
     */
    async createHomework(data: ICreateHomeworkRequest, files?: {
        pdfFile?: File;
        solutionPdfFile?: File;
    }): Promise<ApiResponse<{ homework: IHomeworkResponse }>> {
        const formData = new FormData();

        // Append all data fields as JSON string or individual fields
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('homeworkType', data.homeworkType);
        formData.append('contentType', data.contentType);
        if (data.lesson) formData.append('lesson', data.lesson);
        if (data.course) formData.append('course', data.course);
        if (data.questions) formData.append('questions', JSON.stringify(data.questions));
        if (data.solutionVideoUrl) formData.append('solutionVideoUrl', data.solutionVideoUrl);
        if (data.settings) formData.append('settings', JSON.stringify(data.settings));
        if (data.teacher) formData.append('teacher', data.teacher);
        if (data.totalPoints !== undefined) formData.append('totalPoints', data.totalPoints.toString());

        // Append files
        if (files?.pdfFile) {
            formData.append('pdfFile', files.pdfFile);
        }
        if (files?.solutionPdfFile) {
            formData.append('solutionPdfFile', files.solutionPdfFile);
        }

        const response = await axiosInstance.post<ApiResponse<{ homework: IHomeworkResponse }>>(
            this.BASE_PATH,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    /**
     * Generate homework from question bank
     */
    async generateHomework(data: IGenerateHomeworkRequest): Promise<ApiResponse<{ homework: IHomeworkResponse; questionsGenerated: number }>> {
        const response = await axiosInstance.post<ApiResponse<{ homework: IHomeworkResponse; questionsGenerated: number }>>(
            `${this.BASE_PATH}/generate`,
            data
        );
        return response.data;
    }

    /**
     * Update homework
     */
    async updateHomework(id: string, data: IUpdateHomeworkRequest, files?: {
        pdfFile?: File;
        solutionPdfFile?: File;
    }): Promise<ApiResponse<{ homework: IHomeworkResponse }>> {
        const formData = new FormData();

        // Append data fields
        if (data.title) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description || '');
        if (data.solutionVideoUrl) formData.append('solutionVideoUrl', data.solutionVideoUrl);
        if (data.settings) formData.append('settings', JSON.stringify(data.settings));
        if (data.status) formData.append('status', data.status);
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
        if (data.totalPoints !== undefined) formData.append('totalPoints', data.totalPoints.toString());

        // Append files
        if (files?.pdfFile) {
            formData.append('pdfFile', files.pdfFile);
        }
        if (files?.solutionPdfFile) {
            formData.append('solutionPdfFile', files.solutionPdfFile);
        }

        const response = await axiosInstance.put<ApiResponse<{ homework: IHomeworkResponse }>>(
            `${this.BASE_PATH}/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    /**
     * Delete homework
     */
    async deleteHomework(id: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${id}`
        );
        return response.data;
    }

    /**
     * Publish homework
     */
    async publishHomework(id: string): Promise<ApiResponse<{ homework: IHomeworkResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ homework: IHomeworkResponse }>>(
            `${this.BASE_PATH}/${id}/publish`
        );
        return response.data;
    }

    /**
     * Unpublish homework
     */
    async unpublishHomework(id: string): Promise<ApiResponse<{ homework: IHomeworkResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ homework: IHomeworkResponse }>>(
            `${this.BASE_PATH}/${id}/unpublish`
        );
        return response.data;
    }

    // ==================== SUBMISSIONS ==================== //

    /**
     * Get homework submissions
     */
    async getHomeworkSubmissions(homeworkId: string, query?: IGetSubmissionsQuery): Promise<ApiResponse<IHomeworkSubmissionListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.status) params.append('status', query.status);
        if (query?.student) params.append('student', query.student);

        const response = await axiosInstance.get<ApiResponse<IHomeworkSubmissionListResponse>>(
            `${this.BASE_PATH}/${homeworkId}/submissions?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Grade submission
     */
    async gradeSubmission(submissionId: string, data: {
        score?: number;
        feedback?: string;
        status?: 'graded' | 'rejected' | 'accepted';
        adminNotes?: string;
    }): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `${this.BASE_PATH}/submission/${submissionId}/grade`,
            data
        );
        return response.data;
    }
}

// Export singleton instance
export const homeworkService = new HomeworkService();
export default homeworkService;

