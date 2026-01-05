import { axiosInstance } from '@/lib/axios';
import { IStudentExam, IExamAttempt } from '../types';

class ExamService {
    /**
     * Get available exams for student
     */
    async getMyExams() {
        const response = await axiosInstance.get<{ data: { availableExams: IStudentExam[], total: number } }>('/exams/my-exams');
        return response.data.data;
    }

    /**
     * Start an exam attempt
     */
    async startExam(examId: string) {
        const response = await axiosInstance.post<{ data: { attempt: IExamAttempt, exam: any } }>('/exams/attempt/start', { examId });
        return response.data.data;
    }

    /**
     * Submit an answer
     */
    async submitAnswer(attemptId: string, questionId: string, answer: { selectedAnswers?: string[], textAnswer?: string }) {
        const response = await axiosInstance.post(`/exams/attempt/${attemptId}/answer`, {
            questionId,
            ...answer
        });
        return response.data;
    }

    /**
     * Finish/Submit exam
     */
    async submitExam(attemptId: string, data: { answers: { questionId: string; selectedAnswers?: string[]; writtenAnswer?: string; timeSpent?: number }[] }) {
        const response = await axiosInstance.post(`/exams/attempt/${attemptId}/submit`, data);
        return response.data;
    }

    /**
     * Get exam results
     */
    async getExamResults(examId: string) {
        const response = await axiosInstance.get<{ data: any }>(`/exams/${examId}/my-results`);
        return response.data.data;
    }

    /**
     * Get specific attempt details
     */
    async getAttemptDetails(attemptId: string) {
        const response = await axiosInstance.get<{ data: { attempt: any } }>(`/exams/attempt/${attemptId}`);
        return response.data.data.attempt;
    }
}

export const examService = new ExamService();
