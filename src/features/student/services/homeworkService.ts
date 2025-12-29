import { axiosInstance } from '@/lib/axios';
import { IStudentHomework } from '../types';

class HomeworkService {
    /**
     * Get available homework for student
     */
    async getMyHomework() {
        const response = await axiosInstance.get<{ data: { homework: IStudentHomework[] } }>('/homework/my-homework');
        return response.data.data;
    }

    /**
     * Submit homework (upload PDF)
     */
    async submitHomework(homeworkId: string, file: File) {
        const formData = new FormData();
        formData.append('homeworkId', homeworkId);
        formData.append('submissionPdfFile', file);

        const response = await axiosInstance.post('/homework/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    /**
     * Get homework details/results
     */
    async getHomeworkResults(homeworkId: string) {
        const response = await axiosInstance.get<{ data: any }>(`/homework/${homeworkId}/my-results`);
        return response.data.data;
    }
}

export const homeworkService = new HomeworkService();
