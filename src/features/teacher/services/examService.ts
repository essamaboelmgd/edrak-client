import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
    ICreateExamRequest,
    IUpdateExamRequest,
    IGenerateExamRequest,
    IAddQuestionToExamRequest,
    IGetExamsQuery,
    IExamResponse,
    IExamListResponse,
    IExamWithQuestionsResponse,
    IExamStatisticsResponse,
    ICreateQuestionBankRequest,
    IQuestionBankListResponse,
    IGetQuestionBankQuery,
    IQuestionBankResponse,
} from '@/types/exam.types';

class ExamService {
    private readonly BASE_PATH = '/exams';

    // ==================== EXAMS ==================== //

    /**
     * Get all exams with filters
     */
    async getExams(query?: IGetExamsQuery): Promise<ApiResponse<IExamListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.teacher) params.append('teacher', query.teacher);
        if (query?.examType) params.append('examType', query.examType);
        if (query?.contentType) params.append('contentType', query.contentType);
        if (query?.status) params.append('status', query.status);
        if (query?.course) params.append('course', query.course);
        if (query?.lesson) params.append('lesson', query.lesson);
        if (query?.search) params.append('search', query.search);
        if (query?.activeOnly !== undefined) params.append('activeOnly', query.activeOnly.toString());

        const response = await axiosInstance.get<ApiResponse<IExamListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Alias for getExams
     */
    async getAllExams(query?: IGetExamsQuery): Promise<ApiResponse<IExamListResponse>> {
        return this.getExams(query);
    }

    /**
     * Get exam by ID
     */
    async getExamById(id: string, includeQuestions = false): Promise<ApiResponse<{ exam: IExamResponse | IExamWithQuestionsResponse }>> {
        const response = await axiosInstance.get<ApiResponse<{ exam: IExamResponse | IExamWithQuestionsResponse }>>(
            `${this.BASE_PATH}/${id}${includeQuestions ? '?includeQuestions=true' : ''}`
        );
        return response.data;
    }

    /**
     * Create exam
     */
    async createExam(data: ICreateExamRequest): Promise<ApiResponse<{ exam: IExamResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ exam: IExamResponse }>>(
            this.BASE_PATH,
            data
        );
        return response.data;
    }

    /**
     * Generate exam from question bank
     */
    async generateExam(data: IGenerateExamRequest): Promise<ApiResponse<{ exam: IExamResponse; questionsGenerated: number }>> {
        const response = await axiosInstance.post<ApiResponse<{ exam: IExamResponse; questionsGenerated: number }>>(
            `${this.BASE_PATH}/generate`,
            data
        );
        return response.data;
    }

    /**
     * Update exam
     */
    async updateExam(id: string, data: IUpdateExamRequest): Promise<ApiResponse<{ exam: IExamResponse }>> {
        const response = await axiosInstance.put<ApiResponse<{ exam: IExamResponse }>>(
            `${this.BASE_PATH}/${id}`,
            data
        );
        return response.data;
    }

    /**
     * Delete exam
     */
    async deleteExam(id: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${id}`
        );
        return response.data;
    }

    /**
     * Publish exam
     */
    async publishExam(id: string): Promise<ApiResponse<{ exam: IExamResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ exam: IExamResponse }>>(
            `${this.BASE_PATH}/${id}/publish`
        );
        return response.data;
    }

    /**
     * Unpublish exam
     */
    async unpublishExam(id: string): Promise<ApiResponse<{ exam: IExamResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ exam: IExamResponse }>>(
            `${this.BASE_PATH}/${id}/unpublish`
        );
        return response.data;
    }

    /**
     * Add question to exam
     */
    async addQuestionToExam(id: string, data: IAddQuestionToExamRequest): Promise<ApiResponse<{ exam: IExamResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ exam: IExamResponse }>>(
            `${this.BASE_PATH}/${id}/questions`,
            data
        );
        return response.data;
    }

    /**
     * Remove question from exam
     */
    async removeQuestionFromExam(id: string, questionId: string): Promise<ApiResponse<{ exam: IExamResponse }>> {
        const response = await axiosInstance.delete<ApiResponse<{ exam: IExamResponse }>>(
            `${this.BASE_PATH}/${id}/questions/${questionId}`
        );
        return response.data;
    }

    /**
     * Get exam statistics
     */
    async getExamStatistics(id: string): Promise<ApiResponse<{ statistics: IExamStatisticsResponse }>> {
        const response = await axiosInstance.get<ApiResponse<{ statistics: IExamStatisticsResponse }>>(
            `${this.BASE_PATH}/${id}/statistics`
        );
        return response.data;
    }

    // ==================== QUESTION BANK ==================== //

    /**
     * Get questions from bank
     */
    async getQuestions(query?: IGetQuestionBankQuery): Promise<ApiResponse<IQuestionBankListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.teacher) params.append('teacher', query.teacher);
        if (query?.difficulty) params.append('difficulty', query.difficulty);
        if (query?.questionType) params.append('questionType', query.questionType);
        if (query?.course) params.append('course', query.course);
        if (query?.lesson) params.append('lesson', query.lesson);
        if (query?.isGeneral !== undefined) params.append('isGeneral', query.isGeneral.toString());
        if (query?.tags) query.tags.forEach(tag => params.append('tags', tag));
        if (query?.search) params.append('search', query.search);
        if (query?.activeOnly !== undefined) params.append('activeOnly', query.activeOnly.toString());

        const response = await axiosInstance.get<ApiResponse<IQuestionBankListResponse>>(
            `/exams/question-bank?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Create question in bank
     */
    async createQuestion(data: ICreateQuestionBankRequest): Promise<ApiResponse<{ question: IQuestionBankResponse }>> {
        const response = await axiosInstance.post<ApiResponse<{ question: IQuestionBankResponse }>>(
            '/exams/question-bank',
            data
        );
        return response.data;
    }

    /**
     * Get question by ID
     */
    async getQuestionById(id: string): Promise<ApiResponse<{ question: IQuestionBankResponse }>> {
        const response = await axiosInstance.get<ApiResponse<{ question: IQuestionBankResponse }>>(
            `/exams/question-bank/${id}`
        );
        return response.data;
    }
}

export const examService = new ExamService();
export default examService;

