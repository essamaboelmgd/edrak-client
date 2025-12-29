import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';

export const useAllCourses = () => {
    return useQuery({
        queryKey: ['student', 'courses', 'all'],
        queryFn: () => studentService.getAllCourses(),
    });
};

export const useMyCourses = () => {
    return useQuery({
        queryKey: ['student', 'courses', 'my'],
        queryFn: () => studentService.getMyCourses(),
    });
};

export const useCourseDetails = (courseId: string) => {
    return useQuery({
        queryKey: ['student', 'course', courseId],
        queryFn: () => studentService.getCourseById(courseId),
        enabled: !!courseId,
    });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSubscribeToCourse = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (courseId: string) => studentService.subscribeToCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'course'] });
        },
    });
};

export const useStudentSubscriptions = () => {
    return useQuery({
        queryKey: ['student', 'subscriptions'],
        queryFn: () => studentService.getMySubscriptions(),
    });
};

export const useStudentProfile = () => {
    return useQuery({
        queryKey: ['student', 'profile'],
        queryFn: () => studentService.getProfile(),
    });
};

export const usePlatformSections = () => {
    return useQuery({
        queryKey: ['student', 'platform-sections'],
        queryFn: () => studentService.getPlatformSections(),
    });
};

export const useCoursesBySection = (sectionId?: string) => {
    return useQuery({
        queryKey: ['student', 'courses', 'section', sectionId],
        queryFn: () => studentService.getCoursesBySection(sectionId),
        enabled: !!sectionId,
    });
};

export const useLessonSections = (courseId: string) => {
    return useQuery({
        queryKey: ['student', 'course', courseId, 'sections'],
        queryFn: () => studentService.getLessonSectionsByCourse(courseId),
        enabled: !!courseId,
    });
};

export const useLessonsByCourse = (courseId: string) => {
    return useQuery({
        queryKey: ['student', 'course', courseId, 'lessons'],
        queryFn: () => studentService.getLessonsByCourse(courseId),
        enabled: !!courseId,
    });
};

