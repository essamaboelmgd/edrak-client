import { useState, useEffect, useCallback } from 'react';
import {
    Box,
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
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { sectionsService } from '../services/sectionsService';

interface SectionQuestionBankTabProps {
    sectionId: string;
}

export default function SectionQuestionBankTab({ sectionId }: SectionQuestionBankTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const toast = useToast();

    const fetchQuestions = useCallback(async () => {
        if (!sectionId) return;

        try {
            setLoading(true);
            const response = await sectionsService.getSectionQuestionBank(sectionId);

            if (response.success && response.data) {
                setQuestions(response.data.questions || []);
                setTotal(response.data.total || 0);
            } else {
                setQuestions([]);
                setTotal(0);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الأسئلة',
            });
            setQuestions([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [sectionId, toast]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const filteredQuestions = questions.filter((question) => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            question.question?.toLowerCase().includes(searchLower) ||
            question.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
    });

    const getQuestionTypeLabel = (type: string): string => {
        const types: Record<string, string> = {
            mcq: 'اختيار من متعدد',
            true_false: 'صح/خطأ',
            written: 'مقالي',
        };
        return types[type] || type;
    };

    const getQuestionTypeColor = (type: string): string => {
        const colors: Record<string, string> = {
            mcq: 'blue',
            true_false: 'green',
            written: 'purple',
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

    const questionsByType = {
        mcq: filteredQuestions.filter((q) => q.questionType === 'mcq').length,
        true_false: filteredQuestions.filter((q) => q.questionType === 'true_false').length,
        written: filteredQuestions.filter((q) => q.questionType === 'written').length,
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
                    >
                        <Stack>
                            <HStack spacing={3}>
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="lg"
                                    bg="purple.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon
                                        icon="solar:question-circle-bold-duotone"
                                        width="24"
                                        height="24"
                                        style={{ color: 'var(--chakra-colors-purple-600)' }}
                                    />
                                </Box>
                                <Stack spacing={0}>
                                    <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                        بنك الأسئلة
                                    </Heading>
                                    <Text fontSize="xs" color="gray.500">
                                        إدارة جميع أسئلة القسم
                                    </Text>
                                </Stack>
                            </HStack>
                        </Stack>
                    </Flex>

                    <Flex direction={{ base: 'column', md: 'row' }} gap={3} align={{ base: 'stretch', md: 'center' }}>
                        <InputGroup flex={1} maxW={{ base: '100%', md: '400px' }} size="md">
                            <InputLeftElement pointerEvents="none">
                                <Icon
                                    icon="lucide:search"
                                    width="18"
                                    height="18"
                                    style={{ color: 'var(--chakra-colors-gray-400)' }}
                                />
                            </InputLeftElement>
                            <Input
                                type="search"
                                placeholder="ابحث في الأسئلة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg="white"
                                border="1px"
                                borderColor="gray.300"
                            />
                        </InputGroup>
                    </Flex>

                    {!loading && (
                        <HStack spacing={3} flexWrap="wrap">
                            <HStack
                                spacing={2}
                                bg="purple.50"
                                px={4}
                                py={2.5}
                                borderRadius="lg"
                                border="1px"
                                borderColor="purple.200"
                            >
                                <Icon
                                    icon="solar:question-circle-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-purple-600)' }}
                                />
                                <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                                    {total} سؤال
                                </Text>
                            </HStack>
                            {questionsByType.mcq > 0 && (
                                <HStack
                                    spacing={2}
                                    bg="blue.50"
                                    px={4}
                                    py={2.5}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor="blue.200"
                                >
                                    <Icon
                                        icon="solar:list-check-bold-duotone"
                                        width="20"
                                        height="20"
                                        style={{ color: 'var(--chakra-colors-blue-600)' }}
                                    />
                                    <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                                        {questionsByType.mcq} اختيار من متعدد
                                    </Text>
                                </HStack>
                            )}
                            {questionsByType.true_false > 0 && (
                                <HStack
                                    spacing={2}
                                    bg="green.50"
                                    px={4}
                                    py={2.5}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor="green.200"
                                >
                                    <Icon
                                        icon="solar:check-circle-bold-duotone"
                                        width="20"
                                        height="20"
                                        style={{ color: 'var(--chakra-colors-green-600)' }}
                                    />
                                    <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                        {questionsByType.true_false} صح/خطأ
                                    </Text>
                                </HStack>
                            )}
                            {questionsByType.written > 0 && (
                                <HStack
                                    spacing={2}
                                    bg="orange.50"
                                    px={4}
                                    py={2.5}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor="orange.200"
                                >
                                    <Icon
                                        icon="solar:document-text-bold-duotone"
                                        width="20"
                                        height="20"
                                        style={{ color: 'var(--chakra-colors-orange-600)' }}
                                    />
                                    <Text fontSize="sm" fontWeight="semibold" color="orange.700">
                                        {questionsByType.written} مقالي
                                    </Text>
                                </HStack>
                            )}
                        </HStack>
                    )}
                </Stack>
            </Card>

            {loading ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <Stack spacing={4}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} height="100px" borderRadius="lg" />
                            ))}
                        </Stack>
                    </CardBody>
                </Card>
            ) : filteredQuestions.length === 0 ? (
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
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody px={0}>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>السؤال</Th>
                                        <Th>النوع</Th>
                                        <Th>الصعوبة</Th>
                                        <Th>الكورس</Th>
                                        <Th>الدرس</Th>
                                        <Th>النقاط</Th>
                                        <Th>الحالة</Th>
                                        <Th>الإجراءات</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredQuestions.map((question) => (
                                        <Tr key={question._id}>
                                            <Td>
                                                <Text fontWeight="medium" noOfLines={2}>
                                                    {question.question}
                                                </Text>
                                                {question.tags && question.tags.length > 0 && (
                                                    <HStack spacing={1} mt={1} flexWrap="wrap">
                                                        {question.tags.slice(0, 3).map((tag: string, idx: number) => (
                                                            <Badge
                                                                key={idx}
                                                                colorScheme="gray"
                                                                fontSize="xs"
                                                                px={1.5}
                                                                py={0.5}
                                                                borderRadius="sm"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {question.tags.length > 3 && (
                                                            <Text fontSize="xs" color="gray.500">
                                                                +{question.tags.length - 3}
                                                            </Text>
                                                        )}
                                                    </HStack>
                                                )}
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
                                                <Badge
                                                    colorScheme={getDifficultyColor(question.difficulty)}
                                                    fontSize="xs"
                                                    px={2}
                                                    py={1}
                                                    borderRadius="full"
                                                >
                                                    {getDifficultyLabel(question.difficulty)}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.600">
                                                    {question.course?.title || '-'}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.600">
                                                    {question.lesson?.title || '-'}
                                                </Text>
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
                                                    <Tooltip label="عرض">
                                                        <IconButton
                                                            aria-label="عرض"
                                                            icon={<Icon icon="solar:eye-bold-duotone" width="18" height="18" />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="تعديل">
                                                        <IconButton
                                                            aria-label="تعديل"
                                                            icon={<Icon icon="solar:pen-bold-duotone" width="18" height="18" />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="green"
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
            )}
        </Stack>
    );
}

