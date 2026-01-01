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
    Badge,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Heading,
    Skeleton,
    useToast,
    Flex,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { sectionsService } from '../services/sectionsService';

interface SectionLessonsTabProps {
    sectionId: string;
}

export default function SectionLessonsTab({ sectionId }: SectionLessonsTabProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const toast = useToast();
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await sectionsService.getSectionLessons(sectionId, {
                page,
                limit: 30,
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });

            if (response.success && response.data) {
                setLessons(response.data.lessons || []);
                setTotal(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الدروس',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, [page, statusFilter, sectionId]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            if (page === 1) {
                fetchLessons();
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

    const activeLessons = lessons.filter((l) => l.status === 'active').length;
    const inactiveLessons = lessons.filter((l) => l.status === 'inactive' || l.status === 'draft').length;

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
                                        icon="solar:play-circle-bold-duotone"
                                        width="24"
                                        height="24"
                                        style={{ color: 'var(--chakra-colors-green-600)' }}
                                    />
                                </Box>
                                <Stack spacing={0}>
                                    <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                        الدروس
                                    </Heading>
                                    <Text fontSize="xs" color="gray.500">
                                        إدارة جميع دروس القسم
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
                                placeholder="ابحث عن درس بالعنوان أو الوصف..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                                bg={statusFilter === 'all' ? 'green.100' : 'green.50'}
                                px={4}
                                py={2.5}
                                borderRadius="lg"
                                border="1px"
                                borderColor="green.200"
                                cursor="pointer"
                                onClick={() => setStatusFilter('all')}
                                transition="all 0.2s"
                                _hover={{ bg: 'green.100', transform: 'translateY(-1px)' }}
                            >
                                <Icon
                                    icon="solar:play-circle-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-green-600)' }}
                                />
                                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                    {total} درس
                                </Text>
                            </HStack>
                            <HStack
                                spacing={2}
                                bg={statusFilter === 'active' ? 'blue.100' : 'blue.50'}
                                px={4}
                                py={2.5}
                                borderRadius="lg"
                                border="1px"
                                borderColor="blue.200"
                                cursor="pointer"
                                onClick={() => setStatusFilter('active')}
                                transition="all 0.2s"
                                _hover={{ bg: 'blue.100', transform: 'translateY(-1px)' }}
                            >
                                <Icon
                                    icon="solar:check-circle-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-blue-600)' }}
                                />
                                <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                                    {activeLessons} نشط
                                </Text>
                            </HStack>
                            <HStack
                                spacing={2}
                                bg={statusFilter === 'inactive' ? 'gray.100' : 'gray.50'}
                                px={4}
                                py={2.5}
                                borderRadius="lg"
                                border="1px"
                                borderColor="gray.200"
                                cursor="pointer"
                                onClick={() => setStatusFilter('inactive')}
                                transition="all 0.2s"
                                _hover={{ bg: 'gray.100', transform: 'translateY(-1px)' }}
                            >
                                <Icon
                                    icon="solar:close-circle-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-gray-600)' }}
                                />
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    {inactiveLessons} غير نشط
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
                                <Skeleton key={i} height="80px" borderRadius="lg" />
                            ))}
                        </Stack>
                    </CardBody>
                </Card>
            ) : lessons.length === 0 ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack py={12} spacing={4}>
                            <Icon
                                icon="solar:play-circle-bold-duotone"
                                width="64"
                                height="64"
                                style={{ color: 'var(--chakra-colors-gray-300)' }}
                            />
                            <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                لا توجد دروس
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>
            ) : (
                <>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {lessons.map((lesson) => (
                            <Card
                                key={lesson._id}
                                borderRadius="xl"
                                border="1px"
                                borderColor="gray.200"
                                boxShadow="sm"
                                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justify="space-between">
                                            <Badge
                                                colorScheme={lesson.status === 'active' ? 'green' : 'gray'}
                                                fontSize="xs"
                                                px={2}
                                                py={1}
                                                borderRadius="full"
                                            >
                                                {lesson.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                            {lesson.isFree && (
                                                <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="full">
                                                    مجاني
                                                </Badge>
                                            )}
                                        </HStack>
                                        <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                            {lesson.title}
                                        </Text>
                                        {lesson.description && (
                                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                {lesson.description}
                                            </Text>
                                        )}
                                        {lesson.course && (
                                            <Badge colorScheme="purple" fontSize="xs" w="fit-content">
                                                {lesson.course.title}
                                            </Badge>
                                        )}
                                        <HStack justify="space-between" fontSize="xs" color="gray.500">
                                            <HStack spacing={1}>
                                                <Icon icon="solar:clock-circle-bold-duotone" width="14" height="14" />
                                                <Text>{lesson.duration || 0} دقيقة</Text>
                                            </HStack>
                                            {!lesson.isFree && (
                                                <Text fontWeight="medium" color="green.600">
                                                    EGP {lesson.finalPrice?.toLocaleString() || 0}
                                                </Text>
                                            )}
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>

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

