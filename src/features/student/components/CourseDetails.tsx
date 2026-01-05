import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Skeleton, 
    Stack, 
    Text, 
    Center
} from '@chakra-ui/react';
import { useCourseContent, useStudentSubscriptions } from '@/features/student/hooks/useStudentCourses';
import { useMemo } from 'react';
import PrePurchaseCourseDetails from './course-details/PrePurchaseCourseDetails';
import SubscribedCourseDetails from './course-details/subscribed/SubscribedCourseDetails';

const StudentCourseDetails = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    
    // Data fetching
    const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useStudentSubscriptions();
    const { data: courseData, isLoading: isLoadingCourse } = useCourseContent(courseId || '');

    // Legacy structure mapping
    const course = courseData?.course;
    const sections = useMemo(() => courseData?.months || [], [courseData]); // Legacy "months" are "sections"
    const lessons = useMemo(() => courseData?.lessons || [], [courseData]);
    const exams = useMemo(() => courseData?.exams || [], [courseData]);
    const homeworks = useMemo(() => courseData?.homeworks || [], [courseData]);
    const lessonSubscriptions = useMemo(() => courseData?.lesson_subscriptions || [], [courseData]);

    // Derived State: Sections with Content (Backend provides items, we ensure it's passed)
    const sectionsWithContent = useMemo(() => {
        if (!sections.length) return [];
        return sections; // Backend now handles population of items
    }, [sections]);

    // Derived State: Subscription
    const isSubscribed = useMemo(() => {
        if (!subscriptions || !courseId) return false;
        
        // Handle initial empty state (default []) or loading
        if (Array.isArray(subscriptions) && subscriptions.length === 0) return false;

        // 1. Check Course Subscription
        // Structure: subscriptions.courses = [{ subscription, content, ... }]
        const hasCourseAccess = subscriptions.courses?.some((item: any) => 
            item.content?._id === courseId
        );
        
        // 2. Check Course Section Subscription (if matches course's section)
        const hasSectionAccess = subscriptions.courseSections?.some((item: any) => 
            // Check if any of the courses in this section match our courseId
            item.courses?.some((c: any) => c._id === courseId)
        );

        if (hasCourseAccess || hasSectionAccess) return true;

        // 3. Check Lesson Subscriptions
        if (lessonSubscriptions.length > 0) return true;

        // 4. Check Free
        if (course?.isFree) return true;

        return false;
    }, [subscriptions, courseId, course, lessonSubscriptions]);

    const handleSubscribe = () => {
        navigate(`/student/courses/${courseId}/subscribe`);
    };

    if (isLoadingCourse || isLoadingSubscriptions) {
        return (
            <Container maxW="container.xl" py={8}>
                <Stack spacing={6}>
                    <Skeleton height="200px" borderRadius="xl" />
                    <Skeleton height="400px" borderRadius="xl" />
                </Stack>
            </Container>
        );
    }

    if (!course) {
        return (
            <Container maxW="container.xl" py={10}>
                <Center>
                    <Stack align="center" spacing={4}>
                         <Text fontSize="xl" color="gray.500">الكورس غير موجود</Text>
                         <Text color="blue.500" cursor="pointer" onClick={() => navigate('/student/courses')}>العودة للكورسات</Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    // Unsubscribed / Pre-purchase View - Legacy Design
    if (!isSubscribed && !course.isFree) {
        return (
            <PrePurchaseCourseDetails 
                course={course}
                sections={sections}
                lessons={lessons}
                homeworks={homeworks}
                exams={exams}
                onSubscribe={handleSubscribe}
            />
        );
    }

    // Subscribed View
    return (
        <Container maxW="container.xl" py={8}>
            <SubscribedCourseDetails 
                course={course}
                sections={sectionsWithContent}
                lessons={lessons}
                exams={exams}
                homeworks={homeworks}
            />
        </Container>
    );
};

export default StudentCourseDetails;
