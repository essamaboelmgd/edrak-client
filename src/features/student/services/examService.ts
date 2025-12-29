import { axiosInstance } from '@/lib/axios';
import { IStudentExam, IExamAttempt } from '../types';

class ExamService {
    /**
     * Get available exams for student
     */
    async getMyExams() {
        const response = await axiosInstance.get<{ data: { exams: IStudentExam[] } }>('/exams/my-exams');
        return response.data.data;
    }

    /**
     * Start an exam attempt
     */
    async startExam(examId: string) {
        const response = await axiosInstance.post<{ data: { attempt: IExamAttempt, questions: any[] } }>('/exams/attempt/start', { examId });
        return response.data.data;
    }

    /**
     * Submit an answer
     */
    async submitAnswer(attemptId: string, questionId: string, answer: { selectedOptions?: string[], textAnswer?: string }) {
        const response = await axiosInstance.post(`/exams/attempt/${attemptId}/answer`, {
            questionId,
            ...answer
        });
        return response.data;
    }

    /**
     * Finish/Submit exam
     */
    async submitExam(attemptId: string) {
        const response = await axiosInstance.post(`/exams/attempt/${attemptId}/submit`);
        return response.data;
    }

    /**
     * Get exam results
     */
    async getExamResults(examId: string) {
        const response = await axiosInstance.get<{ data: any }>(`/exams/${examId}/my-results`);
        return response.data.data;
    }
}

export const examService = new ExamService();
