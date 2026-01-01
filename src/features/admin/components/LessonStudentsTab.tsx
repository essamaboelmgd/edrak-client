import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Input,
    InputGroup,
    InputLeftElement,
    Table,
    TableContainer,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spacer,
    Heading,
    Skeleton,
    useToast,
    Flex,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { lessonsService } from '../services/lessonsService';
import { getImageUrl } from '@/lib/axios';

interface LessonStudentsTabProps {
    lessonId: string;
}

export default function LessonStudentsTab({ lessonId }: LessonStudentsTabProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const toast = useToast();
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await lessonsService.getLessonStudents(lessonId, {
                page,
                limit: 30,
                search: search || undefined,
            });

            if (response.success && response.data) {
                setStudents(response.data.students || []);
                setTotal(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الطلاب',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page, lessonId]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            if (page === 1) {
                fetchStudents();
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

    return (
        <Stack spacing={4}>
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody as={Stack} px={4} py={4} spacing={4}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'stretch', md: 'center' }}
                        gap={4}
                        flexWrap="wrap"
                    >
                        <Stack flex={1}>
                            <HStack spacing={2}>
                                <Icon
                                    icon="solar:users-group-rounded-bold-duotone"
                                    width="24"
                                    height="24"
                                    style={{ color: 'var(--chakra-colors-blue-500)' }}
                                />
                                <Heading as="h2" fontSize="xl" fontWeight="bold">
                                    ملخص الطلاب
                                </Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                قائمة جميع الطلاب المشتركين في الدرس
                            </Text>
                            {!loading && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    إجمالي {total} طالب • الصفحة {page} من {totalPages}
                                </Text>
                            )}
                        </Stack>
                        <Spacer />
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
                                placeholder="بحث في الطلاب..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                bg="white"
                            />
                        </InputGroup>
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
            ) : students.length === 0 ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack py={12} spacing={4}>
                            <Icon
                                icon="solar:users-group-rounded-bold-duotone"
                                width="64"
                                height="64"
                                style={{ color: 'var(--chakra-colors-gray-300)' }}
                            />
                            <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                لا يوجد طلاب
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
                                            <Th>الطالب</Th>
                                            <Th>البريد الإلكتروني</Th>
                                            <Th>الهاتف</Th>
                                            <Th>المرحلة</Th>
                                            <Th>تاريخ الاشتراك</Th>
                                            <Th>المبلغ المدفوع</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {students.map((student) => (
                                            <Tr key={student._id}>
                                                <Td>
                                                    <HStack spacing={3}>
                                                        {student.photo ? (
                                                            <Box
                                                                as="img"
                                                                src={getImageUrl(student.photo)}
                                                                alt={student.fullName}
                                                                w={10}
                                                                h={10}
                                                                borderRadius="full"
                                                                objectFit="cover"
                                                            />
                                                        ) : (
                                                            <Box
                                                                w={10}
                                                                h={10}
                                                                borderRadius="full"
                                                                bg="blue.100"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                            >
                                                                <Icon
                                                                    icon="solar:user-bold-duotone"
                                                                    width="20"
                                                                    height="20"
                                                                    style={{ color: 'var(--chakra-colors-blue-500)' }}
                                                                />
                                                            </Box>
                                                        )}
                                                        <Text fontWeight="medium">{student.fullName}</Text>
                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {student.email || '-'}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {student.phoneNumber || '-'}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {student.educationalLevel?.name || student.educationalLevel?.shortName || '-'}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {student.subscription?.subscribedAt
                                                            ? new Date(student.subscription.subscribedAt).toLocaleDateString('ar-EG')
                                                            : '-'}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Text fontSize="sm" fontWeight="medium" color="green.600">
                                                        EGP {student.subscription?.finalPrice?.toLocaleString() || 0}
                                                    </Text>
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

