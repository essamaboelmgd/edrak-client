import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Flex, Heading, Text, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge, Icon, Skeleton, useToast } from '@chakra-ui/react';
import { PlayCircle, Clock, FileText, Lock, BookOpen } from 'lucide-react';
import { useCourseDetails, useSubscribeToCourse, useLessonSections, useLessonsByCourse } from '@/features/student/hooks/useStudentCourses';
import { useMemo, useState } from 'react';

const StudentCourseDetails = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    
    const { data: course, isLoading: isLoadingCourse } = useCourseDetails(courseId || '');
    const { data: sectionsData, isLoading: isLoadingSections } = useLessonSections(courseId || '');
    const { data: lessonsData, isLoading: isLoadingLessons } = useLessonsByCourse(courseId || '');
    
    const { mutate: subscribe, isPending: isSubscribing } = useSubscribeToCourse();
    const [isProcessing, setIsProcessing] = useState(false);

    // Group lessons by section
    const sectionsWithLessons = useMemo(() => {
        const sections = sectionsData?.sections || [];
        const lessons = lessonsData?.lessons || [];
        
        return sections.map((section: any) => ({
            ...section,
            lessons: lessons.filter((l: any) => l.lessonSection === section._id)
        }));
    }, [sectionsData, lessonsData]);

    const handleSubscribe = () => {
        if (!courseId) return;
        setIsProcessing(true);
        subscribe(courseId, {
            onSuccess: () => {
                toast({
                    title: 'تم الاشتراك بنجاح',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                setIsProcessing(false);
            },
            onError: (error: any) => {
                toast({
                    title: 'حدث خطأ أثناء الاشتراك',
                    description: error.response?.data?.message || 'يرجى المحاولة مرة أخرى',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                setIsProcessing(false);
            }
        });
    };

    if (isLoadingCourse || isLoadingSections || isLoadingLessons) {
        return (
            <Container maxW="container.xl" py={10}>
                <Skeleton height="300px" borderRadius="xl" mb={8} />
                <Skeleton height="40px" width="300px" mb={4} />
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
        <Container maxW="container.xl" py={8}>
            {/* Course Header */}
            <Box mb={8} bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100">
                <Flex justify="space-between" align="start" direction={{ base: 'column', md: 'row' }} gap={4}>
                    <Box>
                        <Badge colorScheme="blue" mb={2}>{course.educationalLevel?.name}</Badge>
                        <Heading size="xl" mb={2}>{course.title}</Heading>
                        <Text color="gray.600" fontSize="lg" mb={4}>{course.description}</Text>
                        
                        <Flex gap={4} align="center" color="gray.500">
                            <Flex align="center" gap={1}>
                                <Icon as={FileText} />
                                <Text>{sectionsData?.sections?.length || 0} أقسام</Text>
                            </Flex>
                            <Flex align="center" gap={1}>
                                <Icon as={PlayCircle} />
                                <Text>{lessonsData?.lessons?.length || 0} درس</Text>
                            </Flex>
                        </Flex>
                    </Box>

                    <Box textAlign={{ base: 'left', md: 'right' }}>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={4}>
                            {course.isFree ? 'مجاني' : `${course.finalPrice} ج.م`}
                        </Text>
                        {!course.isSubscribed ? (
                            <Button 
                                colorScheme="blue" 
                                size="lg" 
                                rightIcon={<Icon as={BookOpen} />}
                                isLoading={isSubscribing || isProcessing}
                                onClick={handleSubscribe}
                                w="full"
                            >
                                اشترك الآن
                            </Button>
                        ) : (
                            <Button colorScheme="green" size="lg" w="full" isDisabled cursor="default">
                                مشترك بالفعل
                            </Button>
                        )}
                    </Box>
                </Flex>
            </Box>

            {/* Content - Lesson Sections */}
            <VStack align="stretch" spacing={4}>
                <Heading size="lg" mb={4}>محتوى الكورس</Heading>
                
                {sectionsWithLessons.length > 0 ? (
                    <Accordion allowMultiple defaultIndex={[0]}>
                        {sectionsWithLessons.map((section: any) => (
                            <AccordionItem key={section._id} border="1px" borderColor="gray.200" borderRadius="lg" mb={4} overflow="hidden" bg="white">
                                <h2>
                                    <AccordionButton _hover={{ bg: 'gray.50' }} py={4}>
                                        <Box flex="1" textAlign="right">
                                            <Text fontWeight="bold" fontSize="lg">{section.title}</Text>
                                            <Text fontSize="sm" color="gray.500">{section.lessons?.length || 0} دروس</Text>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <VStack align="stretch" spacing={2}>
                                        {section.lessons?.length > 0 ? (
                                            section.lessons.map((lesson: any) => (
                                                <Flex 
                                                    key={lesson._id} 
                                                    p={3} 
                                                    bg="gray.50" 
                                                    borderRadius="md" 
                                                    border="1px" 
                                                    borderColor="gray.100"
                                                    justify="space-between"
                                                    align="center"
                                                    _hover={{ bg: 'blue.50', borderColor: 'blue.100', cursor: (course.isSubscribed || lesson.isFree) ? 'pointer' : 'default' }}
                                                    transition="all 0.2s"
                                                    onClick={() => {
                                                        if (course.isSubscribed || lesson.isFree) {
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
                                                        <Box>
                                                            <Text fontWeight="medium">{lesson.title}</Text>
                                                            <Flex gap={2} fontSize="xs" color="gray.500">
                                                                <Flex align="center" gap={1}>
                                                                    <Icon as={Clock} boxSize={3} />
                                                                    <Text>{lesson.duration || 0} دقيقة</Text>
                                                                </Flex>
                                                            </Flex>
                                                        </Box>
                                                    </Flex>
                                                    
                                                    {!course.isSubscribed && !lesson.isFree ? (
                                                        <Icon as={Lock} color="gray.400" />
                                                    ) : (
                                                        <Icon as={PlayCircle} color="blue.500" />
                                                    )}
                                                </Flex>
                                            ))
                                        ) : (
                                            <Text color="gray.500" fontSize="sm" fontStyle="italic" textAlign="center" py={2}>لا توجد دروس في هذا القسم بعد</Text>
                                        )}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <Box textAlign="center" py={10} bg="gray.50" borderRadius="lg">
                        <Text color="gray.500">لا يوجد محتوى متاح للكورس حالياً</Text>
                    </Box>
                )}
            </VStack>
        </Container>
    );
};
