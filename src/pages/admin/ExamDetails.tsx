import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Heading,
    HStack,
    Stack,
    Text,
    useToast,
    VStack,
    Badge,
    Grid,
    Flex,
    Skeleton,
    IconButton,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { getImageUrl } from '@/lib/axios';
import examService from '@/features/exams/examService';
import { IExamWithQuestionsResponse } from '@/types/exam.types';
import UpdateExam from '@/features/admin/components/exams/UpdateExam';
import AddQuestion from '@/features/admin/components/exams/AddQuestion';
import UpdateQuestion from '@/features/admin/components/exams/UpdateQuestion';
import DeleteQuestion from '@/features/admin/components/exams/DeleteQuestion';

export default function ExamDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [exam, setExam] = useState<IExamWithQuestionsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchExam();
        }
    }, [id]);

    const fetchExam = async () => {
        try {
            setLoading(true);
            const response = await examService.getExamById(id!, true);
            setExam(response.data.exam as IExamWithQuestionsResponse);
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في جلب بيانات الامتحان',
                status: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Stack p={{ base: 4, md: 6 }} spacing={4}>
                <Skeleton h={20} />
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} h={32} />
                    ))}
                </Grid>
                <Skeleton h={96} />
            </Stack>
        );
    }

    if (!exam) {
        return (
            <Stack p={{ base: 4, md: 6 }} spacing={4} align="center" justify="center" minH="400px">
                <Icon icon="solar:document-text-bold-duotone" width="64" height="64" color="gray.300" />
                <Text fontSize="lg" color="gray.500">
                    الامتحان غير موجود
                </Text>
                <Button onClick={() => navigate('/admin/exams')}>العودة إلى قائمة الامتحانات</Button>
            </Stack>
        );
    }

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Header Section */}
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                <CardBody p={5}>
                    <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap={4}>
                        <HStack spacing={4}>
                            <IconButton
                                aria-label="العودة"
                                icon={<Icon icon="solar:arrow-right-bold-duotone" width="20" height="20" />}
                                onClick={() => navigate(-1)}
                                variant="outline"
                                colorScheme="gray"
                                size="md"
                                borderRadius="lg"
                            />
                            <Box
                                w={12}
                                h={12}
                                borderRadius="lg"
                                bg="purple.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon
                                    icon="solar:document-text-bold-duotone"
                                    width="28"
                                    height="28"
                                    style={{ color: 'var(--chakra-colors-purple-600)' }}
                                />
                            </Box>
                            <Stack spacing={0}>
                                <Heading as="h1" fontSize="2xl" fontWeight="bold" color="gray.800">
                                    {exam.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.500">
                                    تفاصيل الامتحان والإعدادات
                                </Text>
                            </Stack>
                        </HStack>
                    </Flex>
                </CardBody>
            </Card>

            {/* Statistics Cards */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <Card borderRadius="xl" border="1px" borderColor="purple.200" boxShadow="sm" bgGradient="linear(to-br, purple.500, purple.600)" color="white">
                    <CardBody p={5}>
                        <VStack spacing={3} align="stretch">
                            <HStack spacing={2} justify="space-between">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="lg"
                                    bg="whiteAlpha.200"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                >
                                    <Icon icon="solar:clock-circle-bold-duotone" width="24" height="24" style={{ color: 'white' }} />
                                </Box>
                                <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="md" fontSize="sm">
                                    معلق
                                </Badge>
                            </HStack>
                            <Stack spacing={0}>
                                <Text fontSize="sm" fontWeight="medium" opacity={0.9}>
                                    الامتحانات المعلقة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {exam.stats?.totalAttempts || 0}
                                </Text>
                            </Stack>
                        </VStack>
                    </CardBody>
                </Card>

                <Card borderRadius="xl" border="1px" borderColor="blue.200" boxShadow="sm" bgGradient="linear(to-br, blue.500, blue.600)" color="white">
                    <CardBody p={5}>
                        <VStack spacing={3} align="stretch">
                            <HStack spacing={2} justify="space-between">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="lg"
                                    bg="whiteAlpha.200"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                >
                                    <Icon icon="solar:check-circle-bold-duotone" width="24" height="24" style={{ color: 'white' }} />
                                </Box>
                                <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="md" fontSize="sm">
                                    مكتمل
                                </Badge>
                            </HStack>
                            <Stack spacing={0}>
                                <Text fontSize="sm" fontWeight="medium" opacity={0.9}>
                                    الامتحانات المكتملة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {exam.stats?.totalStudents || 0}
                                </Text>
                            </Stack>
                        </VStack>
                    </CardBody>
                </Card>

                <Card borderRadius="xl" border="1px" borderColor="orange.200" boxShadow="sm" bgGradient="linear(to-br, orange.500, orange.600)" color="white">
                    <CardBody p={5}>
                        <VStack spacing={3} align="stretch">
                            <HStack spacing={2} justify="space-between">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="lg"
                                    bg="whiteAlpha.200"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                >
                                    <Icon icon="solar:users-group-rounded-bold-duotone" width="24" height="24" style={{ color: 'white' }} />
                                </Box>
                                <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="md" fontSize="sm">
                                    مسجل
                                </Badge>
                            </HStack>
                            <Stack spacing={0}>
                                <Text fontSize="sm" fontWeight="medium" opacity={0.9}>
                                    الطلبة المسجلين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {exam.stats?.totalStudents || 0}
                                </Text>
                            </Stack>
                        </VStack>
                    </CardBody>
                </Card>
            </Grid>

            {/* Exam Information */}
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                <CardHeader p={5} borderBottom="1px" borderColor="gray.200">
                    <HStack spacing={3}>
                        <Icon icon="solar:info-circle-bold-duotone" width="24" height="24" style={{ color: 'var(--chakra-colors-blue-600)' }} />
                        <Heading size="md" color="gray.800">
                            معلومات الامتحان
                        </Heading>
                    </HStack>
                </CardHeader>
                <CardBody p={5}>
                    <Stack spacing={5}>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
                            <VStack align="start" spacing={2} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                <HStack spacing={2}>
                                    <Icon icon="solar:document-text-bold-duotone" width="18" height="18" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        العنوان
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="md" color="gray.800">
                                    {exam.title}
                                </Text>
                            </VStack>
                            <VStack align="start" spacing={2} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                <HStack spacing={2}>
                                    <Icon icon="solar:book-bookmark-bold-duotone" width="18" height="18" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        الكورس
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="md" color="gray.800">
                                    {exam.course?.title || '-'}
                                </Text>
                            </VStack>
                            <VStack align="start" spacing={2} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                <HStack spacing={2}>
                                    <Icon icon="solar:notebook-bold-duotone" width="18" height="18" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        الدرس
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="md" color="gray.800">
                                    {exam.lesson?.title || '-'}
                                </Text>
                            </VStack>
                            <VStack align="start" spacing={2} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                <HStack spacing={2}>
                                    <Icon icon="solar:star-bold-duotone" width="18" height="18" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        درجة الامتحان
                                    </Text>
                                </HStack>
                                <Badge colorScheme="purple" fontSize="lg" px={3} py={1} borderRadius="md">
                                    {exam.totalPoints || 0}
                                </Badge>
                            </VStack>
                            <VStack align="start" spacing={2} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                <HStack spacing={2}>
                                    <Icon icon="solar:clock-circle-bold-duotone" width="18" height="18" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        مدة الامتحان
                                    </Text>
                                </HStack>
                                <Badge colorScheme="blue" fontSize="lg" px={3} py={1} borderRadius="md">
                                    {exam.settings?.duration || 0} دقيقة
                                </Badge>
                            </VStack>
                        </Grid>

                        {exam.description && (
                            <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                                <HStack spacing={2} mb={2}>
                                    <Icon icon="solar:text-field-bold-duotone" width="18" height="18" style={{ color: 'var(--chakra-colors-blue-600)' }} />
                                    <Text fontSize="xs" color="blue.700" fontWeight="medium">
                                        الوصف
                                    </Text>
                                </HStack>
                                <Box fontSize="sm" color="gray.700" dangerouslySetInnerHTML={{ __html: exam.description || '-' }} />
                            </Box>
                        )}

                        {/* Actions */}
                        <Flex wrap="wrap" gap={3} pt={2}>
                            <UpdateExam exam={exam} onSuccess={fetchExam} />
                            <Button
                                size="md"
                                colorScheme={exam.status === 'published' ? 'green' : 'blue'}
                                fontWeight="medium"
                                gap={2}
                                borderRadius="lg"
                                onClick={async () => {
                                    try {
                                        if (exam.status === 'published') {
                                            await examService.unpublishExam(exam._id);
                                            toast({
                                                title: 'نجح',
                                                description: 'تم إلغاء نشر الامتحان',
                                                status: 'success',
                                            });
                                        } else {
                                            await examService.publishExam(exam._id);
                                            toast({
                                                title: 'نجح',
                                                description: 'تم نشر الامتحان بنجاح',
                                                status: 'success',
                                            });
                                        }
                                        fetchExam();
                                    } catch (error: any) {
                                        toast({
                                            title: 'خطأ',
                                            description: error.response?.data?.message || 'فشل في تحديث حالة الامتحان',
                                            status: 'error',
                                        });
                                    }
                                }}
                                leftIcon={<Icon icon={exam.status === 'published' ? 'solar:check-circle-bold-duotone' : 'solar:eye-scan-bold-duotone'} width="18" height="18" />}
                            >
                                {exam.status === 'published' ? 'تم النشر' : 'نشر الامتحان'}
                            </Button>
                            <Button
                                size="md"
                                colorScheme="red"
                                fontWeight="medium"
                                gap={2}
                                borderRadius="lg"
                                onClick={async () => {
                                    if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;
                                    try {
                                        await examService.deleteExam(exam._id);
                                        toast({
                                            title: 'نجح',
                                            description: 'تم حذف الامتحان بنجاح',
                                            status: 'success',
                                        });
                                        navigate('/admin/exams');
                                    } catch (error: any) {
                                        toast({
                                            title: 'خطأ',
                                            description: error.response?.data?.message || 'فشل في حذف الامتحان',
                                            status: 'error',
                                        });
                                    }
                                }}
                                leftIcon={<Icon icon="solar:trash-bin-minimalistic-bold-duotone" width="18" height="18" />}
                            >
                                حذف الامتحان
                            </Button>
                        </Flex>
                    </Stack>
                </CardBody>
            </Card>

            <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={5}>
                {/* Settings */}
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                    <CardHeader p={5} borderBottom="1px" borderColor="gray.200">
                        <HStack spacing={3}>
                            <Icon icon="solar:settings-bold-duotone" width="24" height="24" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                            <Heading size="md" color="gray.800">
                                الإعدادات
                            </Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody p={5}>
                        <Stack spacing={3}>
                            <HStack
                                p={3}
                                border="1px"
                                borderColor={exam.settings?.showCorrectAnswers ? 'green.200' : 'gray.200'}
                                bg={exam.settings?.showCorrectAnswers ? 'green.50' : 'white'}
                                rounded="lg"
                                spacing={3}
                            >
                                <Icon
                                    icon={exam.settings?.showCorrectAnswers ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                                    width="24"
                                    height="24"
                                    style={{ color: exam.settings?.showCorrectAnswers ? 'var(--chakra-colors-green-600)' : 'var(--chakra-colors-gray-400)' }}
                                />
                                <Text fontWeight="medium" color="gray.700" flex={1}>
                                    عرض الاجابة الصحيحة
                                </Text>
                            </HStack>
                            <HStack
                                p={3}
                                border="1px"
                                borderColor={exam.settings?.shuffleQuestions ? 'green.200' : 'gray.200'}
                                bg={exam.settings?.shuffleQuestions ? 'green.50' : 'white'}
                                rounded="lg"
                                spacing={3}
                            >
                                <Icon
                                    icon={exam.settings?.shuffleQuestions ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                                    width="24"
                                    height="24"
                                    style={{ color: exam.settings?.shuffleQuestions ? 'var(--chakra-colors-green-600)' : 'var(--chakra-colors-gray-400)' }}
                                />
                                <Text fontWeight="medium" color="gray.700" flex={1}>
                                    خلط الأسئلة
                                </Text>
                            </HStack>
                            <HStack
                                p={3}
                                border="1px"
                                borderColor={exam.settings?.showResults ? 'green.200' : 'gray.200'}
                                bg={exam.settings?.showResults ? 'green.50' : 'white'}
                                rounded="lg"
                                spacing={3}
                            >
                                <Icon
                                    icon={exam.settings?.showResults ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                                    width="24"
                                    height="24"
                                    style={{ color: exam.settings?.showResults ? 'var(--chakra-colors-green-600)' : 'var(--chakra-colors-gray-400)' }}
                                />
                                <Text fontWeight="medium" color="gray.700" flex={1}>
                                    عرض نتيجة الامتحان
                                </Text>
                            </HStack>
                        </Stack>
                    </CardBody>
                </Card>

                {/* Questions Section */}
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                    <CardHeader p={5} borderBottom="1px" borderColor="gray.200">
                        <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
                            <HStack spacing={3}>
                                <Icon icon="solar:question-circle-bold-duotone" width="24" height="24" style={{ color: 'var(--chakra-colors-blue-600)' }} />
                                <Heading size="md" color="gray.800">
                                    الأسئلة
                                </Heading>
                                <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="md">
                                    {exam.questions?.length || 0}
                                </Badge>
                            </HStack>
                            <AddQuestion examId={exam._id} onSuccess={fetchExam} questionCount={exam.questions?.length || 0} />
                        </Flex>
                    </CardHeader>
                    <CardBody p={5}>
                        <Stack spacing={4}>
                            {exam.questions && exam.questions.length > 0 ? (
                                exam.questions.map((question: any, index: number) => (
                                    <Card
                                        key={question._id || index}
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor="gray.200"
                                        boxShadow="sm"
                                        bg="white"
                                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                                        transition="all 0.2s"
                                    >
                                        <CardBody p={5}>
                                            <Stack spacing={4}>
                                                <Flex align="start" justify="space-between" gap={4}>
                                                    <HStack spacing={3} flex={1}>
                                                        <Box
                                                            w={8}
                                                            h={8}
                                                            borderRadius="md"
                                                            bg="blue.100"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            flexShrink={0}
                                                        >
                                                            <Text fontSize="sm" fontWeight="bold" color="blue.700">
                                                                {index + 1}
                                                            </Text>
                                                        </Box>
                                                        <Heading as="h6" fontWeight="bold" fontSize="lg" color="gray.800" flex={1}>
                                                            {question.question || '-'}
                                                        </Heading>
                                                    </HStack>
                                                    <Badge colorScheme="red" fontSize="md" px={3} py={1.5} borderRadius="md">
                                                        {question.points || 0} درجة
                                                    </Badge>
                                                </Flex>

                                                {question.imageUrl && (
                                                    <Box>
                                                        <img src={getImageUrl(question.imageUrl)} alt="Question" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                                    </Box>
                                                )}

                                                <Accordion allowMultiple>
                                                    <AccordionItem border="1px" borderColor="gray.200" borderRadius="lg" bg="blue.50">
                                                        <AccordionButton _hover={{ bg: 'blue.100' }} borderRadius="lg">
                                                            <HStack spacing={2} flex={1}>
                                                                <Icon icon="solar:list-check-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-blue-600)' }} />
                                                                <Text fontWeight="bold" color="blue.700">
                                                                    الإجابات ({question.answers?.length || 0})
                                                                </Text>
                                                            </HStack>
                                                            <AccordionIcon />
                                                        </AccordionButton>
                                                        <AccordionPanel borderTop="1px" borderTopColor="gray.200" bg="white" borderRadius="lg" mt={2}>
                                                            <Stack spacing={2}>
                                                                {question.answers?.map((answer: any, ansIndex: number) => (
                                                                    <HStack
                                                                        key={ansIndex}
                                                                        p={3}
                                                                        border="1px"
                                                                        borderColor={answer.isCorrect ? 'green.300' : 'gray.200'}
                                                                        bg={answer.isCorrect ? 'green.50' : 'white'}
                                                                        borderRadius="md"
                                                                        spacing={3}
                                                                    >
                                                                        <Icon
                                                                            icon={answer.isCorrect ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                                                                            width="24"
                                                                            height="24"
                                                                            style={{ color: answer.isCorrect ? 'var(--chakra-colors-green-600)' : 'var(--chakra-colors-gray-400)' }}
                                                                        />
                                                                        <Box
                                                                            w={6}
                                                                            h={6}
                                                                            borderRadius="md"
                                                                            bg={answer.isCorrect ? 'green.100' : 'gray.100'}
                                                                            display="flex"
                                                                            alignItems="center"
                                                                            justifyContent="center"
                                                                            flexShrink={0}
                                                                        >
                                                                            <Text fontSize="xs" fontWeight="bold" color={answer.isCorrect ? 'green.700' : 'gray.600'}>
                                                                                {String.fromCharCode(65 + ansIndex)}
                                                                            </Text>
                                                                        </Box>
                                                                        <Text fontWeight="medium" color="gray.700" flex={1}>
                                                                            {answer.text}
                                                                        </Text>
                                                                        {answer.isCorrect && (
                                                                            <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
                                                                                صحيح
                                                                            </Badge>
                                                                        )}
                                                                    </HStack>
                                                                ))}
                                                            </Stack>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                </Accordion>

                                                <Flex gap={2} pt={2} borderTop="1px" borderColor="gray.200">
                                                    <UpdateQuestion question={question} examId={exam._id} onSuccess={fetchExam} />
                                                    <DeleteQuestion questionId={question._id} examId={exam._id} onSuccess={fetchExam} />
                                                </Flex>
                                            </Stack>
                                        </CardBody>
                                    </Card>
                                ))
                            ) : (
                                <Card borderRadius="xl" border="2px" borderStyle="dashed" borderColor="gray.300" bg="gray.50">
                                    <CardBody p={10}>
                                        <VStack spacing={4}>
                                            <Box
                                                w={20}
                                                h={20}
                                                borderRadius="full"
                                                bg="blue.100"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Icon
                                                    icon="solar:question-circle-bold-duotone"
                                                    width="48"
                                                    height="48"
                                                    style={{ color: 'var(--chakra-colors-blue-500)' }}
                                                />
                                            </Box>
                                            <Stack spacing={2} textAlign="center" maxW={500}>
                                                <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.700">
                                                    لا توجد أسئلة
                                                </Heading>
                                                <Text fontSize="sm" color="gray.500">
                                                    لم يتم إضافة أي أسئلة بعد. يمكنك إضافة سؤال جديد باستخدام الزر أعلاه.
                                                </Text>
                                            </Stack>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}
                        </Stack>
                    </CardBody>
                </Card>
            </Grid>
        </Stack>
    );
}

