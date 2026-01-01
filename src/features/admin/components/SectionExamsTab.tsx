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

interface SectionExamsTabProps {
    sectionId: string;
}

export default function SectionExamsTab({ sectionId }: SectionExamsTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const toast = useToast();

    const fetchExams = useCallback(async () => {
        if (!sectionId) return;

        try {
            setLoading(true);
            const response = await sectionsService.getSectionExams(sectionId);

            if (response.success && response.data) {
                setExams(response.data.exams || []);
                setTotal(response.data.total || 0);
            } else {
                setExams([]);
                setTotal(0);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الامتحانات',
            });
            setExams([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [sectionId, toast]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const filteredExams = exams.filter((exam) => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            exam.title?.toLowerCase().includes(searchLower) ||
            exam.description?.toLowerCase().includes(searchLower)
        );
    });

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
                                    bg="green.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon
                                        icon="solar:document-text-bold-duotone"
                                        width="24"
                                        height="24"
                                        style={{ color: 'var(--chakra-colors-green-600)' }}
                                    />
                                </Box>
                                <Stack spacing={0}>
                                    <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                        الامتحانات
                                    </Heading>
                                    <Text fontSize="xs" color="gray.500">
                                        إدارة جميع امتحانات القسم
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
                                placeholder="ابحث في الامتحانات..."
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
                                bg="green.50"
                                px={4}
                                py={2.5}
                                borderRadius="lg"
                                border="1px"
                                borderColor="green.200"
                            >
                                <Icon
                                    icon="solar:document-text-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-green-600)' }}
                                />
                                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                    {total} امتحان
                                </Text>
                            </HStack>
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
            ) : filteredExams.length === 0 ? (
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
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody px={0}>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>العنوان</Th>
                                        <Th>الكورس</Th>
                                        <Th>الدرس</Th>
                                        <Th>المدة</Th>
                                        <Th>الحالة</Th>
                                        <Th>الإجراءات</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredExams.map((exam) => (
                                        <Tr key={exam._id}>
                                            <Td>
                                                <Text fontWeight="medium">{exam.title}</Text>
                                                {exam.description && (
                                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                        {exam.description}
                                                    </Text>
                                                )}
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.600">
                                                    {exam.course?.title || '-'}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.600">
                                                    {exam.lesson?.title || '-'}
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

