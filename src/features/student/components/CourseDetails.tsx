import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Skeleton, 
    Stack, 
    Text, 
    Center, 
    Tabs, 
    Button, 
    HStack
} from '@chakra-ui/react';
import { useCourseContent, useStudentSubscriptions } from '@/features/student/hooks/useStudentCourses';
import { useMemo, useState, useEffect } from 'react';
import CourseHeader from './course-details/CourseHeader';
import CourseTabs from './course-details/CourseTabs';
import CourseTabPanels from './course-details/CourseTabPanels';
import SubscriptionSelector from './SubscriptionSelector';

const StudentCourseDetails = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Data fetching
    const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useStudentSubscriptions();
    const { data: courseData, isLoading: isLoadingCourse } = useCourseContent(courseId || '');

    // Legacy structure mapping
    const course = courseData?.course;
    const sections = useMemo(() => courseData?.months || [], [courseData]); // Legacy "months" are "sections"
    const lessons = useMemo(() => courseData?.lessons || [], [courseData]);
    const exams = useMemo(() => courseData?.exams || [], [courseData]);
    // const homeworks = useMemo(() => courseData?.homeworks || [], [courseData]); // Unused
    const lessonSubscriptions = useMemo(() => courseData?.lesson_subscriptions || [], [courseData]);

    const [activeTab, setActiveTab] = useState(0);

    const [selectedContent, setSelectedContent] = useState<any | null>(null);

    // Initial Content Selection from URL
    useEffect(() => {
        const contentId = searchParams.get('lesson') || searchParams.get('content');
        if (contentId && sections.length > 0) {
            // Find in sections.items (Preferred)
            for (const section of sections) {
                if (section.items && section.items.length > 0) {
                     const foundItem = section.items.find((i: any) => i._id === contentId);
                     if (foundItem) {
                         setSelectedContent(foundItem);
                         return;
                     }
                }
                // Fallback for older structure
                if (section.lessons) {
                    const foundLesson = section.lessons.find((l: any) => l._id === contentId);
                    if (foundLesson) {
                        setSelectedContent({ ...foundLesson, type: 'lesson' });
                        return;
                    }
                }
            }
             // Fallback for flat lessons list if not in sections
            const foundLesson = lessons.find((l: any) => l._id === contentId);
            if (foundLesson) {
                setSelectedContent({ ...foundLesson, type: 'lesson' });
            }
        }
    }, [searchParams, lessons, sections]);

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

    // Handler: Content Click
    const handleContentClick = (content: any) => {
        if (content.isLocked) return;
        setSelectedContent(content);
        setSearchParams({ lesson: content._id }); // Keep 'lesson' param for compatibility or use 'content'
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <Container maxW="container.xl" py={8}>
            <Stack spacing={6}>
                {/* Header */}
                <CourseHeader course={course} isSubscribed={isSubscribed} />

                {/* Subscription Options for Non-Subscribers */}
                {!isSubscribed && !course.isFree && (
                   <SubscriptionOptionsSection course={course} />
                )}

                {/* Content */}
                <Box>
                    <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" isLazy>
                        <CourseTabs 
                            lessonsCount={course.stats?.totalLessons || 0}
                            examsCount={course.stats?.totalExams || 0}
                            homeworksCount={course.stats?.totalHomeworks || 0}
                            livesCount={0} 
                            isSubscribed={isSubscribed}
                        />
                        
                        <Box mt={6}>
                            <CourseTabPanels 
                                course={course}
                                sections={sectionsWithContent}
                                selectedContent={selectedContent}
                                onContentClick={handleContentClick}
                                isSubscribed={isSubscribed}
                                exams={exams}
                            />
                        </Box>
                    </Tabs>
                </Box>
            </Stack>
        </Container>
    );
};

const SubscriptionOptionsSection = ({ course }: { course: any }) => {
    const navigate = useNavigate();
    const [subscriptionType, setSubscriptionType] = useState<'course' | 'section' | 'custom'>('course');
    const [selectedSection, setSelectedSection] = useState<string>("");
    const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
    const [computedPrice, setComputedPrice] = useState<number>(0);

    const handleSubscribe = () => {
        navigate(`/student/courses/${course._id}/subscribe`, {
            state: {
                type: subscriptionType,
                selectedSection,
                selectedLessons
            }
        });
    };

    return (
        <Box bg="white" p={6} rounded="xl" shadow="sm" border="1px" borderColor="gray.100">
            <SubscriptionSelector 
                courseId={course._id}
                coursePrice={course.price}
                courseFinalPrice={course.finalPrice}
                onChange={(state: any) => {
                    setSubscriptionType(state.type);
                    setSelectedSection(state.selectedSection);
                    setSelectedLessons(state.selectedLessons);
                    setComputedPrice(state.price);
                }}
            />
            <HStack mt={6} justify="flex-end">
                 <Box textAlign="right" mr={4}>
                     <Text fontSize="sm" color="gray.500">مشالي الاشتراك</Text>
                     <Text fontSize="xl" fontWeight="bold" color="blue.600">{computedPrice} ج.م</Text>
                 </Box>
                 <Button colorScheme="blue" size="lg" px={8} onClick={handleSubscribe}>
                     متابعة للدفع
                 </Button>
            </HStack>
        </Box>
    );
};

export default StudentCourseDetails;
