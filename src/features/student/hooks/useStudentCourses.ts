import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';

export const useAllCourses = (params?: any) => {
    return useQuery({
        queryKey: ['student', 'courses', 'all', params],
        queryFn: () => studentService.getAllCourses(params),
    });
};

export const useMyCourses = (params?: any) => {
    return useQuery({
        queryKey: ['student', 'courses', 'my', params],
        queryFn: () => studentService.getMyCourses(params),
    });
};

// Hook to fetch course content (Legacy parity)
export const useCourseContent = (courseId: string) => {
    return useQuery({
        queryKey: ['student', 'course-content', courseId],
        queryFn: () => studentService.getCourseContent(courseId),
        enabled: !!courseId,
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
        mutationFn: ({ courseId, paymentMethod }: { courseId: string; paymentMethod: string }) => 
            studentService.subscribeToCourse(courseId, paymentMethod),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'course'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'subscriptions'] });
        },
    });
};

export const useSubscribeToLesson = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ lessonId, paymentMethod }: { lessonId: string; paymentMethod: string }) => 
            studentService.subscribeToLesson(lessonId, paymentMethod),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'subscriptions'] });
        },
    });
};

export const useSubscribeToLessonSection = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ sectionId, paymentMethod }: { sectionId: string; paymentMethod: string }) => 
            studentService.subscribeToLessonSection(sectionId, paymentMethod),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'subscriptions'] });
        },
    });
};

export const useSubscribeToMultipleLessons = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ courseId, lessonIds, paymentMethod }: { courseId: string; lessonIds: string[]; paymentMethod: string }) => 
            studentService.subscribeToMultipleLessons(courseId, lessonIds, paymentMethod),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'subscriptions'] });
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

export const useCheckSubscription = (type: 'course' | 'lesson' | 'courseSection' | 'lessonSection', id: string) => {
    return useQuery({
        queryKey: ['student', 'subscription', type, id],
        queryFn: () => studentService.checkSubscriptionStatus(type, id),
        enabled: !!id,
    });
};
