import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeworkService } from '../services/homeworkService';

export const useStudentHomework = () => {
    return useQuery({
        queryKey: ['student', 'homework', 'my'],
        queryFn: () => homeworkService.getMyHomework(),
    });
};

export const useSubmitHomework = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { homeworkId: string; file: File }) => 
            homeworkService.submitHomework(data.homeworkId, data.file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'homework'] });
        },
    });
};
