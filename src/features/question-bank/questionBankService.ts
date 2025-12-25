import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
  ICreateQuestionBankRequest,
  IUpdateQuestionBankRequest,
  IGetQuestionBankQuery,
  IQuestionBankResponse,
  IQuestionBankListResponse,
  IQuestionBankStatistics,
} from '@/types/question-bank.types';

class QuestionBankService {
  private readonly BASE_PATH = '/exams/question-bank';

  /**
   * Create a new question
   */
  async createQuestion(data: ICreateQuestionBankRequest): Promise<ApiResponse<{ question: IQuestionBankResponse }>> {
    const response = await axiosInstance.post<ApiResponse<{ question: IQuestionBankResponse }>>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * Get all questions with filters
   */
  async getAllQuestions(query?: IGetQuestionBankQuery): Promise<ApiResponse<IQuestionBankListResponse>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.difficulty) params.append('difficulty', query.difficulty);
    if (query?.questionType) params.append('questionType', query.questionType);
    if (query?.course) params.append('course', query.course);
    if (query?.lesson) params.append('lesson', query.lesson);
    if (query?.isGeneral !== undefined) params.append('isGeneral', query.isGeneral.toString());
    if (query?.tags && query.tags.length > 0) {
      query.tags.forEach(tag => params.append('tags', tag));
    }
    if (query?.search) params.append('search', query.search);
    if (query?.activeOnly !== undefined) params.append('activeOnly', query.activeOnly.toString());
    if (query?.teacher) params.append('teacher', query.teacher);

    const response = await axiosInstance.get<ApiResponse<IQuestionBankListResponse>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<ApiResponse<{ question: IQuestionBankResponse }>> {
    const response = await axiosInstance.get<ApiResponse<{ question: IQuestionBankResponse }>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  /**
   * Update question
   */
  async updateQuestion(id: string, data: IUpdateQuestionBankRequest): Promise<ApiResponse<{ question: IQuestionBankResponse }>> {
    const response = await axiosInstance.put<ApiResponse<{ question: IQuestionBankResponse }>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  /**
   * Get questions by course
   */
  async getQuestionsByCourse(courseId: string): Promise<ApiResponse<{ questions: IQuestionBankResponse[]; total: number }>> {
    const response = await axiosInstance.get<ApiResponse<{ questions: IQuestionBankResponse[]; total: number }>>(
      `${this.BASE_PATH}/course/${courseId}`
    );
    return response.data;
  }

  /**
   * Get questions by difficulty
   */
  async getQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard"): Promise<ApiResponse<{ questions: IQuestionBankResponse[]; total: number; difficulty: string }>> {
    const response = await axiosInstance.get<ApiResponse<{ questions: IQuestionBankResponse[]; total: number; difficulty: string }>>(
      `${this.BASE_PATH}/difficulty/${difficulty}`
    );
    return response.data;
  }

  /**
   * Get general questions
   */
  async getGeneralQuestions(): Promise<ApiResponse<{ questions: IQuestionBankResponse[]; total: number }>> {
    const response = await axiosInstance.get<ApiResponse<{ questions: IQuestionBankResponse[]; total: number }>>(
      `${this.BASE_PATH}/general`
    );
    return response.data;
  }

  /**
   * Get question bank statistics
   */
  async getQuestionStatistics(): Promise<ApiResponse<{ statistics: IQuestionBankStatistics }>> {
    const response = await axiosInstance.get<ApiResponse<{ statistics: IQuestionBankStatistics }>>(
      `${this.BASE_PATH}/statistics`
    );
    return response.data;
  }
}

// Export singleton instance
export const questionBankService = new QuestionBankService();
export default questionBankService;

