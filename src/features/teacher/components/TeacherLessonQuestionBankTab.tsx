import { useState, useEffect, useRef } from 'react';
import {
    Button,
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Badge,
    Input,
    InputGroup,
    InputLeftElement,
    Heading,
    Skeleton,
    useToast,
    Flex,
    Table,
    TableContainer,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tooltip,
    IconButton,
    useDisclosure,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { lessonsService } from '@/features/admin/services/lessonsService';
import AdminQuestionForm from '@/features/admin/components/AdminQuestionForm';
import { questionBankService } from '@/features/question-bank/questionBankService';
import { ICreateQuestionBankRequest } from '@/types/question-bank.types';

interface TeacherLessonQuestionBankTabProps {
    lessonId: string;
}

export default function TeacherLessonQuestionBankTab({ lessonId }: TeacherLessonQuestionBankTabProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const toast = useToast();
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await lessonsService.getLessonQuestionBank(lessonId, {
                page,
                limit: 30,
                search: search || undefined,
            });

            if (response.success && response.data) {
                setQuestions(response.data.questions || []);
                setTotal(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الأسئلة',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [page, lessonId]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            if (page === 1) {
                fetchQuestions();
            } else {
                setPage(1);
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    const handleSave = async (data: ICreateQuestionBankRequest | any) => {
        try {
            // Ensure the lesson ID is attached if not present
            const payload = { ...data, lesson: lessonId };

            if (selectedQuestion) {
                // Update existing question
                await questionBankService.updateQuestion(selectedQuestion._id, payload);
                toast({
                    status: 'success',
                    description: 'تم تحديث السؤال بنجاح',
                });
            } else {
                // Create new question
                await questionBankService.createQuestion(payload);
                toast({
                    status: 'success',
                    description: 'تم إضافة السؤال بنجاح',
                });
            }
            fetchQuestions();
            onClose();
            setSelectedQuestion(null);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حفظ السؤال',
            });
        }
    };

    const handleCancel = () => {
        onClose();
        setSelectedQuestion(null);
    };

    const handleCreateNew = () => {
        setSelectedQuestion(null);
        onOpen();
    };

    const handleEdit = (question: any) => {
        setSelectedQuestion(question);
        onOpen();
    };

    const getQuestionTypeLabel = (type: string): string => {
        const types: Record<string, string> = {
            mcq: 'اختيار من متعدد',
            true_false: 'صح/خطأ',
        };
        return types[type] || type;
    };

    const getQuestionTypeColor = (type: string): string => {
        const colors: Record<string, string> = {
            mcq: 'blue',
            true_false: 'green',
        };
        return colors[type] || 'gray';
    };

    const getDifficultyLabel = (difficulty: string): string => {
        const difficulties: Record<string, string> = {
            easy: 'سهل',
            medium: 'متوسط',
            hard: 'صعب',
        };
        return difficulties[difficulty] || difficulty;
    };

    const getDifficultyColor = (difficulty: string): string => {
        const colors: Record<string, string> = {
            easy: 'green',
            medium: 'yellow',
            hard: 'red',
        };
        return colors[difficulty] || 'gray';
    };

    return (
        <Stack spacing={4}>
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                <Stack p={5} spacing={4}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'stretch', md: 'center' }}
                        justify="space-between"
                        gap={4}
                        flexWrap="wrap"
                    >
                        <Stack flex={1}>
                            <HStack spacing={2}>
                                <Icon
                                    icon="solar:question-circle-bold-duotone"
                                    width="24"
                                    height="24"
                                    style={{ color: 'var(--chakra-colors-purple-500)' }}
                                />
                                <Heading as="h2" fontSize="xl" fontWeight="bold">
                                    بنك الأسئلة
                                </Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                إدارة جميع أسئلة الدرس
                            </Text>
                            {!loading && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    إجمالي {total} سؤال • الصفحة {page} من {totalPages}
                                </Text>
                            )}
                        </Stack>
                        <HStack spacing={2}>
                            <Button
                                colorScheme="purple"
                                leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="18" height="18" />}
                                onClick={handleCreateNew}
                            >
                                إضافة سؤال جديد
                            </Button>
                            <InputGroup w={{ base: '100%', sm: '300px' }} size="md">
                                <InputLeftElement pointerEvents="none">
                                    <Icon
                                        icon="lucide:search"
                                        width="18"
                                        height="18"
                                        style={{ color: 'var(--chakra-colors-gray-400)' }}
                                    />
                                </InputLeftElement>
                                <Input
                                    placeholder="بحث في الأسئلة..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    bg="white"
                                />
                            </InputGroup>
                        </HStack>
                    </Flex>
                </Stack>
            </Card>

            {isOpen && (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="lg" p={4}>
                    <AdminQuestionForm
                        question={selectedQuestion || undefined}
                        teachers={[]} // No need to fetch teachers for teacher view
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isTeacher={true}
                    />
                </Card>
            )}

            {loading ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <Stack spacing={4}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} height="60px" borderRadius="lg" />
                            ))}
                        </Stack>
                    </CardBody>
                </Card>
            ) : questions.length === 0 ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack py={12} spacing={4}>
                            <Icon
                                icon="solar:question-circle-bold-duotone"
                                width="64"
                                height="64"
                                style={{ color: 'var(--chakra-colors-gray-300)' }}
                            />
                            <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                لا توجد أسئلة
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>
            ) : (
                <>
                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                        <CardBody px={0}>
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>السؤال</Th>
                                            <Th>النوع</Th>
                                            <Th>الصعوبة</Th>
                                            <Th>النقاط</Th>
                                            <Th>الحالة</Th>
                                            <Th>الإجراءات</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {questions.map((question) => (
                                            <Tr key={question._id}>
                                                <Td>
                                                    <Text fontWeight="medium" noOfLines={2}>
                                                        {question.question}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={getQuestionTypeColor(question.questionType)}
                                                        fontSize="xs"
                                                        px={2}
                                                        py={1}
                                                        borderRadius="full"
                                                    >
                                                        {getQuestionTypeLabel(question.questionType)}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    {question.difficulty && (
                                                        <Badge
                                                            colorScheme={getDifficultyColor(question.difficulty)}
                                                            fontSize="xs"
                                                            px={2}
                                                            py={1}
                                                            borderRadius="full"
                                                        >
                                                            {getDifficultyLabel(question.difficulty)}
                                                        </Badge>
                                                    )}
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                                        {question.points || 0}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    {question.isActive ? (
                                                        <Badge colorScheme="green">نشط</Badge>
                                                    ) : (
                                                        <Badge colorScheme="gray">غير نشط</Badge>
                                                    )}
                                                </Td>
                                                <Td>
                                                    <HStack spacing={2}>
                                                        <Tooltip label="تعديل">
                                                            <IconButton
                                                                aria-label="تعديل"
                                                                icon={<Icon icon="solar:pen-bold-duotone" width="18" height="18" />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="green"
                                                                onClick={() => handleEdit(question)}
                                                            />
                                                        </Tooltip>
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </CardBody>
                    </Card>

                    {totalPages > 1 && (
                        <HStack justify="center" spacing={2}>
                            <Button
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                isDisabled={page === 1}
                                leftIcon={<Icon icon="solar:arrow-right-bold" width="16" height="16" />}
                            >
                                السابق
                            </Button>
                            <Text fontSize="sm" color="gray.600">
                                صفحة {page} من {totalPages}
                            </Text>
                            <Button
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                isDisabled={page === totalPages}
                                rightIcon={<Icon icon="solar:arrow-left-bold" width="16" height="16" />}
                            >
                                التالي
                            </Button>
                        </HStack>
                    )}
                </>
            )}
        </Stack>
    );
}
