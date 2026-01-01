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
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { lessonsService } from '../services/lessonsService';
import CreateExam from '@/features/exams/components/CreateExam';

interface LessonExamsTabProps {
    lessonId: string;
}

export default function LessonExamsTab({ lessonId }: LessonExamsTabProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const toast = useToast();
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await lessonsService.getLessonExams(lessonId, {
                page,
                limit: 30,
                search: search || undefined,
            });

            if (response.success && response.data) {
                setExams(response.data.exams || []);
                setTotal(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الامتحانات',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [page, lessonId]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            if (page === 1) {
                fetchExams();
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

    const handleSuccess = () => {
        fetchExams();
    };

    return (
        <Stack spacing={4}>
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody as={Stack} px={4} py={4} spacing={4}>
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
                                    icon="solar:document-text-bold-duotone"
                                    width="24"
                                    height="24"
                                    style={{ color: 'var(--chakra-colors-green-500)' }}
                                />
                                <Heading as="h2" fontSize="xl" fontWeight="bold">
                                    الامتحانات
                                </Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                إدارة جميع امتحانات الدرس
                            </Text>
                            {!loading && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    إجمالي {total} امتحان • الصفحة {page} من {totalPages}
                                </Text>
                            )}
                        </Stack>
                        <HStack spacing={2}>
                            <CreateExam
                                onSuccess={handleSuccess}
                                trigger={
                                    <Button
                                        colorScheme="green"
                                        leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="18" height="18" />}
                                    >
                                        إضافة امتحان جديد
                                    </Button>
                                }
                            />
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
                                    placeholder="بحث في الامتحانات..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    bg="white"
                                />
                            </InputGroup>
                        </HStack>
                    </Flex>
                </CardBody>
            </Card>

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
            ) : exams.length === 0 ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack py={12} spacing={4}>
                            <Icon
                                icon="solar:document-text-bold-duotone"
                                width="64"
                                height="64"
                                style={{ color: 'var(--chakra-colors-gray-300)' }}
                            />
                            <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                لا توجد امتحانات
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
                                            <Th>العنوان</Th>
                                            <Th>الوصف</Th>
                                            <Th>المدة</Th>
                                            <Th>الحالة</Th>
                                            <Th>تاريخ الإنشاء</Th>
                                            <Th>الإجراءات</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {exams.map((exam) => (
                                            <Tr key={exam._id}>
                                                <Td>
                                                    <Text fontWeight="medium">{exam.title}</Text>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                        {exam.description || '-'}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {exam.duration ? `${exam.duration} دقيقة` : '-'}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    {exam.draft ? (
                                                        <Badge colorScheme="gray">مسودة</Badge>
                                                    ) : (
                                                        <Badge colorScheme="green">نشط</Badge>
                                                    )}
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {exam.createdAt
                                                            ? new Date(exam.createdAt).toLocaleDateString('ar-EG')
                                                            : '-'}
                                                    </Text>
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

