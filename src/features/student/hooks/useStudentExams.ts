import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../services/examService';

export const useStudentExams = () => {
    return useQuery({
        queryKey: ['student', 'exams', 'my'],
        queryFn: () => examService.getMyExams(),
    });
};

export const useStartExam = () => {
    return useMutation({
        mutationFn: (examId: string) => examService.startExam(examId),
    });
};

export const useSubmitAnswer = () => {
    return useMutation({
        mutationFn: (data: { attemptId: string; questionId: string; answer: any }) => 
            examService.submitAnswer(data.attemptId, data.questionId, data.answer),
    });
};

export const useSubmitExam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (attemptId: string) => examService.submitExam(attemptId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'exams'] });
        },
    });
};
