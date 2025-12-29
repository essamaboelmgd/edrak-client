import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Flex, Heading, Text, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge, Icon, Skeleton, useToast, Image, Tabs, TabList, TabPanels, Tab, TabPanel, Avatar, HStack } from '@chakra-ui/react';
import { PlayCircle, Clock, FileText, Lock, CheckCircle, GraduationCap, ShoppingCart } from 'lucide-react';
import { useCourseDetails, useSubscribeToCourse, useLessonSections, useLessonsByCourse, useStudentSubscriptions, useSubscribeToLesson, useSubscribeToLessonSection, useSubscribeToMultipleLessons } from '@/features/student/hooks/useStudentCourses';
import { useMemo, useState } from 'react';
import { getImageUrl } from '@/lib/axios';
import { SubscriptionDrawer } from './SubscriptionDrawer';
import { Checkbox } from '@chakra-ui/react';

const StudentCourseDetails = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    
    // Data fetching
    const { data: course, isLoading: isLoadingCourse } = useCourseDetails(courseId || '');
    const { data: sectionsData, isLoading: isLoadingSections } = useLessonSections(courseId || '');
    const { data: lessonsData, isLoading: isLoadingLessons } = useLessonsByCourse(courseId || '');
    const { data: subscriptions, isLoading: isLoadingSubscriptions } = useStudentSubscriptions();
    
    // Mutations
    const { mutate: subscribeToCourse, isPending: isSubscribingCourse } = useSubscribeToCourse();
    const { mutate: subscribeToSection, isPending: isSubscribingSection } = useSubscribeToLessonSection();
    const { mutate: subscribeToLesson, isPending: isSubscribingLesson } = useSubscribeToLesson();
    
    const { mutate: subscribeToMultipleLessons, isPending: isSubscribingMultiple } = useSubscribeToMultipleLessons();
    
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // Multi-selection state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
    
    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [subscriptionTarget, setSubscriptionTarget] = useState<{
        type: 'course' | 'lesson' | 'courseSection' | 'lessonSection' | 'multiple_lessons';
        title: string;
        price: number;
        finalPrice: number;
        id: string;
        lessonIds?: string[];
    } | null>(null);

    // Helper: Check Access
    const hasAccess = (type: 'course' | 'section' | 'lesson', id: string, parentSectionId?: string) => {
        if (!subscriptions || !courseId) return false;

        // 1. Check Course Access
        const hasCourseAccess = subscriptions.courses.some((sub: any) => 
            sub.content?._id === courseId || sub.subscription.course === courseId
        );
        if (hasCourseAccess) return true;

        if (type === 'course') return false;

        // 2. Check Section Access (for section or lesson in section)
        if (type === 'section' || type === 'lesson') {
            const sectionCheckId = type === 'section' ? id : parentSectionId;
            if (sectionCheckId) {
                const hasSectionAccess = subscriptions.lessonSections.some((sub: any) => 
                    sub.content?._id === sectionCheckId || sub.subscription.lessonSection === sectionCheckId
                );
                if (hasSectionAccess) return true;
            }
        }

        // 3. Check Lesson Access
        if (type === 'lesson') {
            return subscriptions.lessons.some((sub: any) => 
                sub.content?._id === id || sub.subscription.lesson === id
            );
        }

        return false;
    };

    // Group lessons by section
    const sectionsWithLessons = useMemo(() => {
        const sections = sectionsData?.sections || [];
        const lessons = lessonsData?.lessons || [];
        const safeSections = Array.isArray(sectionsData) ? sectionsData : sections;

        return safeSections.map((section: any) => ({
            ...section,
            lessons: lessons.filter((l: any) => l.lessonSection === section._id)
        }));
    }, [sectionsData, lessonsData]);

    const handleSubscribeClick = (
        type: 'course' | 'lessonSection' | 'lesson' | 'multiple_lessons', 
        item: any,
        lessonIds?: string[]
    ) => {
        const targetId = item._id || courseId;
        if (!targetId && type === 'multiple_lessons') {
            // Should not happen if courseId is present
             console.error("CourseId is missing for multiple_lessons subscription");
        }

        setSubscriptionTarget({
            type: type as any,
            title: item.title || item.name || (type === 'multiple_lessons' ? `${lessonIds?.length} دروس مختارة` : ''),
            price: item.price,
            finalPrice: item.finalPrice,
            id: targetId || '',
            lessonIds
        });
        setIsDrawerOpen(true);
    };

    const handleConfirmSubscription = async (paymentMethod: string) => {
        if (!subscriptionTarget) return;
        setIsDrawerOpen(false); // Close drawer first or keep open with loading? Better close or handle loading state inside.
        // Drawer handles loading state, so we just await.
        
        const type = subscriptionTarget.type;
        const id = subscriptionTarget.id;
        
        const callbacks = {
             onSuccess: () => {
                toast({ title: 'تم إرسال الطب بنجاح', description: paymentMethod === 'center_payment' ? 'يرجى انتظار موافقة المشرف' : 'تم الاشتراك بنجاح', status: 'success', duration: 5000, isClosable: true });
                setProcessingId(null);
                setIsDrawerOpen(false);
                setSubscriptionTarget(null);
                setSelectedLessons([]);
                setIsSelectionMode(false);
            },
            onError: (error: any) => {
                toast({ title: 'فشل الاشتراك', description: error.response?.data?.message || 'حدث خطأ ما', status: 'error', duration: 3000, isClosable: true });
                setProcessingId(null);
            }
        };

        if (type === 'course') {
             if (!id) {
                toast({ title: 'خطأ', description: 'بيانات الكورس غير مكتملة', status: 'error' });
                return;
             }
             subscribeToCourse({ courseId: id, paymentMethod }, callbacks);
        }
        else if (type === 'courseSection') subscribeToSection({ sectionId: id, paymentMethod }, callbacks); 
        else if (type === 'lessonSection') subscribeToSection({ sectionId: id, paymentMethod }, callbacks); 
        else if (type === 'lesson') subscribeToLesson({ lessonId: id, paymentMethod }, callbacks);
        else if (type === 'multiple_lessons') {
            if (!courseId) {
                toast({ title: 'خطأ', description: 'رقم الكورس مفقود', status: 'error' });
                return;
            }
            if (!subscriptionTarget.lessonIds || subscriptionTarget.lessonIds.length === 0) {
                 toast({ title: 'خطأ', description: 'يجب اختيار دروس', status: 'error' });
                 return;
            }
            subscribeToMultipleLessons({ courseId, lessonIds: subscriptionTarget.lessonIds, paymentMethod }, callbacks);
        }
    };

    const toggleLessonSelection = (lessonId: string) => {
        setSelectedLessons(prev => 
            prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
        );
    };

    const calculateSelectedTotal = () => {
        if (!lessonsData?.lessons) return { price: 0, finalPrice: 0 };
        const selected = lessonsData.lessons.filter((l: any) => selectedLessons.includes(l._id));
        return selected.reduce((acc: any, curr: any) => ({
            price: acc.price + curr.price,
            finalPrice: acc.finalPrice + (curr.isFree ? 0 : curr.finalPrice)
        }), { price: 0, finalPrice: 0 });
    };

    const isFullCourseOwned = hasAccess('course', courseId || '', '');

    if (isLoadingCourse || isLoadingSections || isLoadingLessons || isLoadingSubscriptions) {
        return (
            <Container maxW="container.xl" py={10}>
                <Skeleton height="300px" borderRadius="xl" mb={8} />
                <VStack spacing={4}>
                    <Skeleton height="60px" width="100%" />
                    <Skeleton height="60px" width="100%" />
                    <Skeleton height="60px" width="100%" />
                </VStack>
            </Container>
        );
    }

    if (!course) {
        return (
            <Container maxW="container.xl" py={10} textAlign="center">
                <Text fontSize="xl" color="gray.500">الكورس غير موجود</Text>
                <Button mt={4} onClick={() => navigate('/student/courses')}>العودة للكورسات</Button>
            </Container>
        );
    }

    return (
        <Box pb={20}>
            {/* Hero Section */}
            <Box bgGradient="linear(to-r, blue.800, purple.800)" color="white" py={12}>
                <Container maxW="container.xl">
                    <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="center">
                        <Box flex="1">
                            <Badge colorScheme="purple" fontSize="0.9em" mb={4} px={3} py={1} borderRadius="full">
                                {course.educationalLevel?.name || 'عام'}
                            </Badge>
                            <Heading size="2xl" mb={4} lineHeight="1.3">{course.title}</Heading>
                            <Text fontSize="xl" opacity={0.9} mb={6} maxW="800px">
                                {course.description}
                            </Text>
                            
                            <Flex gap={6} wrap="wrap" mb={8}>
                                <Flex align="center" gap={2}>
                                    <Icon as={Avatar} />
                                    <Text fontWeight="bold">{course.teacher?.fullName}</Text>
                                </Flex>
                                <Flex align="center" gap={2}>
                                    <Icon as={Clock} />
                                    <Text>آخر تحديث: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('ar-EG') : 'غير متوفر'}</Text>
                                </Flex>
                                <Flex align="center" gap={2}>
                                    <Icon as={GraduationCap} />
                                    <Text>{lessonsData?.total || 0} درس</Text>
                                </Flex>
                            </Flex>

                            {!isFullCourseOwned ? (
                                <Flex gap={4} align="center">
                                    <Text fontSize="3xl" fontWeight="bold" color="yellow.300">
                                        {course.isFree ? 'مجاني' : `${course.finalPrice || course.price} ج.م`}
                                    </Text>
                                    <Button 
                                        size="lg" 
                                        colorScheme="yellow" 
                                        color="blue.900"
                                        px={10}
                                        onClick={() => handleSubscribeClick('course', course)}
                                        isLoading={processingId === courseId}
                                        isDisabled={!!processingId}
                                    >
                                        اشترك في الكورس الكامل
                                    </Button>
                                    {!isFullCourseOwned && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            colorScheme="yellow"
                                            color="yellow.300"
                                            _hover={{ bg: 'whiteAlpha.200' }}
                                            onClick={() => {
                                                setIsSelectionMode(!isSelectionMode);
                                                setSelectedLessons([]);
                                            }}
                                        >
                                            {isSelectionMode ? 'إلغاء التحديد' : 'تحديد دروس معينة'}
                                        </Button>
                                    )}
                                </Flex>
                            ) : (
                                <Button 
                                    size="lg" 
                                    colorScheme="green" 
                                    leftIcon={<CheckCircle />}
                                    cursor="default"
                                >
                                    أنت مشترك في هذا الكورس
                                </Button>
                            )}
                        </Box>
                        
                        <Box w={{ base: '100%', md: '400px' }} flexShrink={0}>
                            <Box 
                                borderRadius="2xl" 
                                overflow="hidden" 
                                boxShadow="2xl" 
                                border="4px solid rgba(255,255,255,0.1)"
                            >
                                <Image 
                                    src={course.poster ? getImageUrl(typeof course.poster === 'string' ? course.poster : course.poster.url) : 'https://via.placeholder.com/400x300'} 
                                    w="full" 
                                    h="250px" 
                                    objectFit="cover"
                                />
                            </Box>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            {/* Content Tabs */}
            <Container maxW="container.xl" mt={8}>
                <Tabs colorScheme="blue" size="lg">
                    <TabList mb={6}>
                        <Tab fontWeight="bold">محتوى الكورس</Tab>
                        <Tab fontWeight="bold">عن الكورس</Tab>
                        <Tab fontWeight="bold">المدرس</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel p={0}>
                            {/* Syllabus */}
                            <VStack align="stretch" spacing={4}>
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Heading size="md">المنهج الدراسي</Heading>
                                    <Text color="gray.600">{sectionsData?.total || sectionsWithLessons.length} قسم • {lessonsData?.total || 0} درس</Text>
                                </Flex>
                                
                                {sectionsWithLessons.length > 0 ? (
                                    <Accordion allowMultiple defaultIndex={[0]}>
                                        {sectionsWithLessons.map((section: any) => {
                                            const isSectionOwned = hasAccess('section', section._id, section._id);
                                            
                                            return (
                                            <AccordionItem key={section._id} border="1px" borderColor="gray.200" borderRadius="lg" mb={4} overflow="hidden" bg="white">
                                                <h2>
                                                    <AccordionButton _hover={{ bg: 'gray.50' }} py={4}>
                                                        <Flex flex="1" justify="space-between" align="center" ml={4}>
                                                            <Box textAlign="right">
                                                                <Text fontWeight="bold" fontSize="lg">{section.title || section.name}</Text>
                                                                <Text fontSize="sm" color="gray.500">{section.lessons?.length || 0} دروس</Text>
                                                            </Box>
                                                            
                                                            {!isSectionOwned && section.price > 0 && !isFullCourseOwned && (
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    variant="outline"
                                                                    leftIcon={<ShoppingCart size={16} />}
                                                                        onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSubscribeClick('lessonSection', section);
                                                                    }}
                                                                    isLoading={processingId === section._id}
                                                                    isDisabled={!!processingId}
                                                                >
                                                                    شراء القسم ({section.finalPrice || section.price} ج.م)
                                                                </Button>
                                                            )}
                                                            {isSectionOwned && !isFullCourseOwned && (
                                                                <Badge colorScheme="green" ml={2}>تم الشراء</Badge>
                                                            )}
                                                        </Flex>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                </h2>
                                                <AccordionPanel pb={4}>
                                                    <VStack align="stretch" spacing={2}>
                                                        {section.lessons?.length > 0 ? (
                                                            section.lessons.map((lesson: any) => {
                                                                const isLessonOwned = isSectionOwned || hasAccess('lesson', lesson._id, section._id);
                                                                const canAccess = isLessonOwned || lesson.isFree;

                                                                return (
                                                                <Flex 
                                                                    key={lesson._id} 
                                                                    p={3} 
                                                                    bg={selectedLessons.includes(lesson._id) ? "blue.50" : "gray.50"} 
                                                                    borderRadius="md" 
                                                                    border="1px" 
                                                                    borderColor={selectedLessons.includes(lesson._id) ? "blue.400" : "gray.100"}
                                                                    justify="space-between"
                                                                    align="center"
                                                                    _hover={{ bg: 'blue.50', borderColor: 'blue.100', cursor: (canAccess || isSelectionMode) ? 'pointer' : 'default' }}
                                                                    transition="all 0.2s"
                                                                    onClick={() => {
                                                                        if (isSelectionMode && !isLessonOwned && !lesson.isFree) {
                                                                            toggleLessonSelection(lesson._id);
                                                                        } else if (canAccess) {
                                                                            navigate(`/student/courses/${courseId}/learn?lesson=${lesson._id}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Flex align="center" gap={3}>
                                                                        <Box 
                                                                            p={2} 
                                                                            bg={lesson.type === 'video' ? 'blue.100' : 'purple.100'} 
                                                                            color={lesson.type === 'video' ? 'blue.600' : 'purple.600'} 
                                                                            borderRadius="full"
                                                                        >
                                                                            <Icon as={lesson.type === 'video' ? PlayCircle : FileText} boxSize={5} />
                                                                        </Box>
                                                                        {isSelectionMode && !isLessonOwned && !lesson.isFree && (
                                                                            <Checkbox 
                                                                                isChecked={selectedLessons.includes(lesson._id)}
                                                                                onChange={() => toggleLessonSelection(lesson._id)}
                                                                                mr={2}
                                                                                size="lg"
                                                                                colorScheme="blue"
                                                                            />
                                                                        )}
                                                                        <Box>
                                                                            <Text fontWeight="medium">{lesson.title}</Text>
                                                                            <Flex gap={2} fontSize="xs" color="gray.500">
                                                                                <Flex align="center" gap={1}>
                                                                                    <Icon as={Clock} boxSize={3} />
                                                                                    <Text>{lesson.duration || 0} دقيقة</Text>
                                                                                </Flex>
                                                                                {!isLessonOwned && lesson.price > 0 && !isFullCourseOwned && (
                                                                                    <Badge colorScheme="yellow">{lesson.finalPrice || lesson.price} ج.م</Badge>
                                                                                )}
                                                                            </Flex>
                                                                        </Box>
                                                                    </Flex>
                                                                    
                                                                    <HStack>
                                                                        {!canAccess && lesson.price > 0 && !isFullCourseOwned && !isSelectionMode ? (
                                                                             <Button
                                                                                size="xs"
                                                                                colorScheme="blue"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleSubscribeClick('lesson', lesson);
                                                                                }}
                                                                                isLoading={processingId === lesson._id}
                                                                                isDisabled={!!processingId}
                                                                            >
                                                                                شراء
                                                                            </Button>
                                                                        ) : null}
                                                                        
                                                                        {!canAccess ? (
                                                                            <Icon as={Lock} color="gray.400" />
                                                                        ) : (
                                                                            <Icon as={PlayCircle} color="blue.500" />
                                                                        )}
                                                                    </HStack>
                                                                </Flex>
                                                            )}) 
                                                        ) : (
                                                            <Text color="gray.500" fontSize="sm" fontStyle="italic" textAlign="center" py={2}>لا توجد دروس في هذا القسم بعد</Text>
                                                        )}
                                                    </VStack>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        )}) }
                                    </Accordion>
                                ) : (
                                    <Box textAlign="center" py={10} bg="gray.50" borderRadius="lg">
                                        <Text color="gray.500">لا يوجد محتوى متاح للكورس حالياً</Text>
                                    </Box>
                                )}
                            </VStack>
                        </TabPanel>

                        <TabPanel>
                            <Box bg="white" p={6} borderRadius="xl" border="1px" borderColor="gray.100">
                                <Heading size="md" mb={4}>تفاصيل الكورس</Heading>
                                <Text color="gray.600" lineHeight="1.8">
                                    {course.description || 'لا يوجد وصف متاح.'}
                                </Text>
                            </Box>
                        </TabPanel>

                        <TabPanel>
                            <Box bg="white" p={6} borderRadius="xl" border="1px" borderColor="gray.100">
                                <Flex gap={6} align="center">
                                    <Avatar size="xl" name={course.teacher?.fullName || ''} src={getImageUrl(course.teacher?.image || '')} />
                                    <Box>
                                        <Heading size="md">{course.teacher?.fullName}</Heading>
                                        <Text color="gray.500" mb={2}>{course.teacher?.email}</Text>
                                        <Text color="gray.600">{course.teacher?.bio || 'مدرس في منصة إدراك'}</Text>
                                    </Box>
                                </Flex>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Container>

            {/* Selection Floating Bar */}
            {isSelectionMode && selectedLessons.length > 0 && (
                <Box 
                    position="fixed" 
                    bottom={0} 
                    left={0} 
                    right={0} 
                    bg="white" 
                    borderTop="1px" 
                    borderColor="gray.200" 
                    p={4} 
                    boxShadow="0 -4px 6px rgba(0,0,0,0.05)"
                    zIndex={100}
                >
                    <Container maxW="container.xl">
                        <Flex justify="space-between" align="center">
                            <VStack align="flex-start" spacing={0}>
                                <Text fontWeight="bold">{selectedLessons.length} دروس مختارة</Text>
                                <Text fontSize="sm" color="gray.600">
                                    الإجمالي: {calculateSelectedTotal().finalPrice} ج.م
                                </Text>
                            </VStack>
                            <HStack>
                                <Button variant="ghost" onClick={() => setSelectedLessons([])}>إلغاء التحديد</Button>
                                <Button 
                                    colorScheme="blue" 
                                    onClick={() => handleSubscribeClick('multiple_lessons', calculateSelectedTotal(), selectedLessons)}
                                >
                                    اشترك في المحدد
                                </Button>
                            </HStack>
                        </Flex>
                    </Container>
                </Box>
            )}

            {subscriptionTarget && (
                <SubscriptionDrawer 
                    isOpen={isDrawerOpen} 
                    onClose={() => setIsDrawerOpen(false)} 
                    selectedItems={subscriptionTarget}
                    course={course}
                    onConfirm={handleConfirmSubscription}
                    isLoading={isSubscribingCourse || isSubscribingSection || isSubscribingLesson || isSubscribingMultiple}
                />
            )}
        </Box>
    );
};

export default StudentCourseDetails;
