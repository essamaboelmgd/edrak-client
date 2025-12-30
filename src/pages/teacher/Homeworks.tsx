import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardBody,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Skeleton,
    Spacer,
    Stack,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    Wrap,
    WrapItem,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    SimpleGrid,
    VStack,
    Flex,
    Center,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import homeworkService from '@/features/teacher/services/homeworkService';
import courseService from '@/features/teacher/services/courseService';
import { IHomeworkResponse, IGetHomeworkQuery } from '@/types/homework.types';
import CreateHomework from '@/features/homework/components/CreateHomework';

export default function TeacherHomeworks() {
    const [searchParams, setSearchParams] = useSearchParams({ page: '1' });
    const toast = useToast();

    const [homeworks, setHomeworks] = useState<IHomeworkResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [courses, setCourses] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Calculate stats
    const stats = {
        total,
        published: homeworks.filter(h => h.status === 'published').length,
        draft: homeworks.filter(h => h.status === 'draft').length,
        totalSubmissions: homeworks.reduce((sum, h) => sum + (h.stats?.totalSubmissions || 0), 0),
    };

    const fetchHomeworks = async () => {
        try {
            setIsFetching(true);
            const query: IGetHomeworkQuery = {
                page: parseInt(searchParams.get('page') || '1'),
                limit: 10,
            };

            if (searchParams.get('course')) query.course = searchParams.get('course')!;
            if (searchParams.get('homeworkType')) query.homeworkType = searchParams.get('homeworkType') as any;
            if (searchParams.get('status')) query.status = searchParams.get('status') as any;
            if (searchParams.get('search')) query.search = searchParams.get('search')!;

            const response = await homeworkService.getHomeworks(query);
            setHomeworks(response.data.homework);
            setTotal(response.data.total);
            setPage(response.data.page);
            setTotalPages(response.data.totalPages);
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في جلب الواجبات',
                status: 'error',
            });
        } finally {
            setIsFetching(false);
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await courseService.getMyCourses({ limit: 100 });
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchHomeworks();
        fetchCourses();
    }, [searchParams]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الواجب؟')) return;

        try {
            await homeworkService.deleteHomework(id);
            toast({
                title: 'نجح',
                description: 'تم حذف الواجب بنجاح',
                status: 'success',
            });
            fetchHomeworks();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في حذف الواجب',
                status: 'error',
            });
        }
    };

    const handleTogglePublish = async (homework: IHomeworkResponse) => {
        try {
            if (homework.status === 'published') {
                await homeworkService.unpublishHomework(homework._id);
                toast({
                    title: 'نجح',
                    description: 'تم إلغاء نشر الواجب',
                    status: 'success',
                });
            } else {
                await homeworkService.publishHomework(homework._id);
                toast({
                    title: 'نجح',
                    description: 'تم نشر الواجب بنجاح',
                    status: 'success',
                });
            }
            fetchHomeworks();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في تحديث حالة الواجب',
                status: 'error',
            });
        }
    };

    const handleSearch = (value: string) => {
        setSearchParams((prev) => {
            if (value) {
                prev.set('search', value);
            } else {
                prev.delete('search');
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            draft: { color: 'gray', label: 'مسودة' },
            published: { color: 'green', label: 'منشور' },
            archived: { color: 'orange', label: 'مؤرشف' },
        };
        const statusInfo = statusMap[status] || { color: 'gray', label: status };
        return <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>;
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Modern Hero Header */}
            <Box
                bgGradient="linear(135deg, teal.600 0%, cyan.500 50%, blue.400 100%)"
                position="relative"
                overflow="hidden"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                color="white"
                boxShadow="xl"
            >
                {/* Decorative Blobs */}
                <Box
                    position="absolute"
                    top="-50%"
                    right="-10%"
                    width="400px"
                    height="400px"
                    bgGradient="radial(circle, whiteAlpha.200, transparent)"
                    borderRadius="full"
                    filter="blur(60px)"
                />

                <Flex
                    position="relative"
                    zIndex={1}
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'start', md: 'center' }}
                    justify="space-between"
                    gap={4}
                >
                    <VStack align="start" spacing={2}>
                        <HStack>
                            <Icon icon="solar:notebook-bold-duotone" width={24} height={24} />
                            <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                                إدارة المنصة
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                            الواجبات
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة {total} واجب على المنصة
                        </Text>
                    </VStack>
                    <Button
                        bg="white"
                        color="teal.600"
                        _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                        onClick={() => setIsCreateModalOpen(true)}
                        leftIcon={<Icon icon="solar:notebook-add-bold-duotone" width="20" height="20" />}
                        size={{ base: 'md', md: 'lg' }}
                        borderRadius="xl"
                        shadow="md"
                        transition="all 0.3s"
                    >
                        إضافة واجب جديد
                    </Button>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={{ base: 4, md: 6 }}>
                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    إجمالي الواجبات
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    واجب مسجل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, teal.400, teal.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:notebook-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    منشور
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {stats.published}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    واجب منشور
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, green.400, green.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:check-circle-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    مسودة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                    {stats.draft}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    واجب مسودة
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, orange.400, orange.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:document-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    إجمالي التسليمات
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {stats.totalSubmissions}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    تسليم
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:clipboard-list-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card
                borderRadius="2xl"
                border="1px"
                borderColor="gray.200"
                bg="white"
                boxShadow="xl"
            >
                <CardBody>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        gap={4}
                        align={{ base: 'stretch', md: 'center' }}
                        wrap="wrap"
                    >
                        <InputGroup flex={1} minW={{ base: '100%', md: '200px' }}>
                            <InputLeftElement pointerEvents="none">
                                <Icon icon="solar:magnifer-bold-duotone" width="18" height="18" />
                            </InputLeftElement>
                            <Input
                                placeholder="بحث..."
                                bg="white"
                                defaultValue={searchParams.get('search') || ''}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch((e.target as HTMLInputElement).value);
                                    }
                                }}
                            />
                        </InputGroup>

                        <Select
                            bg="white"
                            value={searchParams.get('course') || 'all'}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    if (e.target.value && e.target.value !== 'all') {
                                        prev.set('course', e.target.value);
                                    } else {
                                        prev.delete('course');
                                    }
                                    prev.set('page', '1');
                                    return prev;
                                });
                            }}
                            placeholder="الكورسات"
                            minW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">جميع الكورسات</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.title}
                                </option>
                            ))}
                        </Select>

                        <Select
                            bg="white"
                            value={searchParams.get('homeworkType') || ''}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    if (e.target.value) {
                                        prev.set('homeworkType', e.target.value);
                                    } else {
                                        prev.delete('homeworkType');
                                    }
                                    prev.set('page', '1');
                                    return prev;
                                });
                            }}
                            placeholder="نوع الواجب"
                            minW={{ base: '100%', md: '150px' }}
                        >
                            <option value="general">عام</option>
                            <option value="course">كورس</option>
                            <option value="lesson">درس</option>
                        </Select>

                        <Select
                            bg="white"
                            value={searchParams.get('status') || ''}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    if (e.target.value) {
                                        prev.set('status', e.target.value);
                                    } else {
                                        prev.delete('status');
                                    }
                                    prev.set('page', '1');
                                    return prev;
                                });
                            }}
                            placeholder="الحالة"
                            minW={{ base: '100%', md: '150px' }}
                        >
                            <option value="draft">مسودة</option>
                            <option value="published">منشور</option>
                            <option value="archived">مؤرشف</option>
                        </Select>
                    </Flex>
                </CardBody>
            </Card>

            {/* Table */}
            <Card
                borderRadius="2xl"
                border="1px"
                borderColor="gray.200"
                bg="white"
                boxShadow="xl"
            >
                <CardBody>
                    <Stack spacing={4}>
                        <HStack justify="space-between" flexWrap="wrap">
                            <Stack>
                                <Heading fontSize="xl">الواجبات</Heading>
                                <Text fontSize="sm" color="gray.500">
                                    النتائج {page} / {totalPages} من {total}
                                </Text>
                            </Stack>
                        </HStack>

                        <TableContainer bg="white" rounded={10}>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>#</Th>
                                            <Th>العنوان</Th>
                                            <Th>النوع</Th>
                                            <Th>الكورس</Th>
                                            <Th>الدرس</Th>
                                            <Th>الحالة</Th>
                                            <Th>النقاط</Th>
                                            <Th>التسليمات</Th>
                                            <Th>تاريخ التسليم</Th>
                                            <Th>تاريخ الإنشاء</Th>
                                            <Th>الإجراءات</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {loading || isFetching ? (
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <Tr key={idx}>
                                                    {Array.from({ length: 11 }).map((_, i) => (
                                                        <Td key={i}>
                                                            <Skeleton h={4} rounded={3} />
                                                        </Td>
                                                    ))}
                                                </Tr>
                                            ))
                                        ) : homeworks.length === 0 ? (
                                            <Tr>
                                                <Td colSpan={11} textAlign="center" py={12}>
                                                    <VStack spacing={4}>
                                                        <Box>
                                                            <Icon icon="solar:inbox-archive-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                                                        </Box>
                                                        <VStack spacing={2}>
                                                            <Text fontSize="lg" fontWeight="bold" color="gray.600">
                                                                لا توجد بيانات للعرض
                                                            </Text>
                                                            <Text fontSize="sm" color="gray.500">
                                                                ليس هناك نتائج لعرضها
                                                            </Text>
                                                        </VStack>
                                                    </VStack>
                                                </Td>
                                            </Tr>
                                        ) : (
                                            homeworks.map((homework, idx) => (
                                                <Tr key={homework._id}>
                                                    <Td>{(page - 1) * 10 + idx + 1}</Td>
                                                    <Td>
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="medium"
                                                            minW={200}
                                                            maxW={200}
                                                            noOfLines={1}
                                                        >
                                                            {homework.title}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge>
                                                            {homework.homeworkType === 'lesson'
                                                                ? 'درس'
                                                                : homework.homeworkType === 'course'
                                                                    ? 'كورس'
                                                                    : 'عام'}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        {homework.course ? (
                                                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                                {homework.course.title}
                                                            </Text>
                                                        ) : (
                                                            <Badge>غير متوفر</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {homework.lesson ? (
                                                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                                {homework.lesson.title}
                                                            </Text>
                                                        ) : (
                                                            <Badge>غير متوفر</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>{getStatusBadge(homework.status)}</Td>
                                                    <Td>{homework.totalPoints || 0}</Td>
                                                    <Td>{homework.stats.totalSubmissions || 0}</Td>
                                                    <Td>
                                                        {homework.settings.dueDate ? (
                                                            <Text fontSize="sm">
                                                                {new Date(homework.settings.dueDate).toLocaleDateString('ar-EG')}
                                                            </Text>
                                                        ) : (
                                                            <Badge>غير محدد</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm">
                                                            {new Date(homework.createdAt).toLocaleDateString('ar-EG')}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Menu>
                                                            <MenuButton
                                                                as={IconButton}
                                                                icon={<Icon icon="lucide:more-vertical" width="16" height="16" />}
                                                                variant="ghost"
                                                                size="sm"
                                                            />
                                                            <MenuList>
                                                                <MenuItem
                                                                    onClick={() => handleTogglePublish(homework)}
                                                                >
                                                                    {homework.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                                                                </MenuItem>
                                                                <MenuItem
                                                                    color="red.500"
                                                                    onClick={() => handleDelete(homework._id)}
                                                                >
                                                                    حذف
                                                                </MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </Td>
                                                </Tr>
                                            ))
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            <Card
                                borderRadius="2xl"
                                border="1px"
                                borderColor="gray.200"
                                bg="white"
                                boxShadow="xl"
                            >
                                <CardBody>
                                    <HStack justify="flex-end" spacing={3}>
                                        <Button
                                            size="sm"
                                            fontWeight="medium"
                                            borderRadius="xl"
                                            h={8}
                                            isDisabled={isFetching || loading || page >= totalPages}
                                            isLoading={loading || isFetching}
                                            onClick={() => {
                                                setSearchParams((prev) => {
                                                    prev.set('page', (page + 1).toString());
                                                    return prev;
                                                });
                                            }}
                                        >
                                            التالية
                                        </Button>
                                        <Button
                                            size="sm"
                                            fontWeight="medium"
                                            borderRadius="xl"
                                            h={8}
                                            isDisabled={isFetching || loading || page === 1}
                                            isLoading={loading || isFetching}
                                            onClick={() => {
                                                setSearchParams((prev) => {
                                                    prev.set('page', (page - 1).toString());
                                                    return prev;
                                                });
                                            }}
                                        >
                                            السابقة
                                        </Button>
                                    </HStack>
                                </CardBody>
                            </Card>
                        </Stack>
                    </CardBody>
                </Card>

            <CreateHomework
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchHomeworks}
                isAdmin={false}
            />
        </Stack>
    );
}

