import { useState, useEffect, useCallback } from 'react';
import {
    useToast,
    Box,
    Button,
    Card,
    CardBody,
  
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Badge,
    IconButton,
    SimpleGrid,
    VStack,
    Stack,
    Flex,
  
    Skeleton,
  
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
    activationCodesService,
    IActivationCode,
    ActivationTargetType,
} from '@/features/admin/services/activationCodesService';

import { teachersService } from '@/features/admin/services/teachersService';
import CreateActivationCodesModal from '@/features/admin/components/CreateActivationCodesModal';

export default function AdminActivationCodes() {
    const toast = useToast();
    const [codes, setCodes] = useState<IActivationCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [teachers, setTeachers] = useState<any[]>([]);

    const fetchCodes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await activationCodesService.getActivationCodes({
                page,
                limit: 20,
                targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as ActivationTargetType) : undefined,
                isUsed: statusFilter === 'used' ? true : statusFilter === 'unused' ? false : undefined,
                teacherId: teacherFilter !== 'all' ? teacherFilter : undefined,
                code: searchTerm || undefined,
            });

            if (response.success && response.data) {
                setCodes(response.data.codes);
                setTotalPages(response.data.totalPages);
                setTotal(response.data.total);
            }
        } catch (error: any) {
            console.error('Error fetching activation codes:', error);
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الأكواد',
            });
        } finally {
            setLoading(false);
        }
    }, [page, targetTypeFilter, statusFilter, teacherFilter, searchTerm, toast]);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    // Fetch teachers for filter
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await teachersService.getAllTeachers({ limit: 1000 });
                if (response.success && response.data) {
                    setTeachers(response.data.teachers);
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    const handleDelete = async (codeId: string, isUsed: boolean) => {
        if (isUsed) {
            toast({
                status: 'warning',
                description: 'لا يمكن حذف كود تم استخدامه بالفعل',
            });
            return;
        }

        if (!window.confirm('هل أنت متأكد من حذف هذا الكود؟')) {
            return;
        }

        try {
            await activationCodesService.deleteActivationCode(codeId);
            toast({
                status: 'success',
                description: 'تم حذف الكود بنجاح',
            });
            fetchCodes();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الكود',
            });
        }
    };

    const handleExport = () => {
        const header = ['#', 'الكود', 'النوع', 'الهدف', 'المدرس', 'السعر', 'الحالة', 'تم الاستخدام بواسطة', 'تاريخ الإنشاء'];
        const rows = codes.map((code, idx) => [
            idx + 1,
            code.code,
            getTargetTypeLabel(code.targetType),
            getTargetLabel(code),
            typeof code.teacher === 'object' ? `${code.teacher.firstName} ${code.teacher.lastName}` : '-',
            code.price.toLocaleString(),
            code.isUsed ? 'مستخدم' : 'متاح',
            code.usedBy ? `${code.usedBy.firstName} ${code.usedBy.lastName}` : '-',
            new Date(code.createdAt).toLocaleDateString('ar-EG'),
        ]);
        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activation_codes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTargetTypeLabel = (type: ActivationTargetType): string => {
        const labels: Record<ActivationTargetType, string> = {
            course: 'كورس',
            lesson: 'درس',
            courseSection: 'قسم كورسات',
            lessonSection: 'قسم دروس',
        };
        return labels[type] || type;
    };

    const getTargetLabel = (code: IActivationCode): string => {
        if (code.course) return code.course.title;
        if (code.lesson) return code.lesson.title;
        if (code.courseSection) return code.courseSection.name;
        if (code.lessonSection) return code.lessonSection.name;
        return '-';
    };

    // Calculate stats
    const stats = {
        total,
        used: codes.filter((c) => c.isUsed).length,
        unused: codes.filter((c) => !c.isUsed).length,
        course: codes.filter((c) => c.targetType === 'course').length,
        lesson: codes.filter((c) => c.targetType === 'lesson').length,
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
                            <Icon icon="solar:key-bold-duotone" width={24} height={24} />
                            <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                                إدارة المنصة
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                            أكواد التفعيل
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة جميع أكواد التفعيل ({total} كود)
                        </Text>
                    </VStack>
                    <HStack spacing={3}>
                        <Button
                            bg="whiteAlpha.200"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-2px)', shadow: 'lg' }}
                            onClick={handleExport}
                            leftIcon={<Icon icon="solar:download-bold-duotone" width="20" height="20" />}
                            size={{ base: 'md', md: 'lg' }}
                            borderRadius="xl"
                            shadow="md"
                            transition="all 0.3s"
                        >
                            تصدير
                        </Button>
                        <Button
                            bg="white"
                            color="teal.600"
                            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                            onClick={() => setShowCreateModal(true)}
                            leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="20" height="20" />}
                            size={{ base: 'md', md: 'lg' }}
                            borderRadius="xl"
                            shadow="md"
                            transition="all 0.3s"
                        >
                            إنشاء أكواد جديدة
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={{ base: 4, md: 6 }}>
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
                                    إجمالي الأكواد
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كود متاح
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, teal.400, teal.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:key-bold-duotone"
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
                                    الأكواد المستخدمة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                                    {stats.used}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كود مستخدم
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, red.400, red.600)"
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
                                    الأكواد المتاحة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {stats.unused}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كود متاح
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
                                    أكواد الكورسات
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {stats.course}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كود كورس
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, blue.400, blue.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:book-bookmark-bold-duotone"
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
                                    أكواد الدروس
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {stats.lesson}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كود درس
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:document-text-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters Section */}
            <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
                <CardBody>
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4} flexWrap="wrap">
                        <InputGroup flex="1" minW="200px">
                            <InputLeftElement pointerEvents="none">
                                <Icon icon="solar:magnifer-bold-duotone" width="20" height="20" color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="ابحث بالكود..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                bg="white"
                            />
                        </InputGroup>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={targetTypeFilter}
                            onChange={(e) => {
                                setTargetTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">كل الأنواع</option>
                            <option value="course">كورس</option>
                            <option value="lesson">درس</option>
                            <option value="courseSection">قسم كورسات</option>
                            <option value="lessonSection">قسم دروس</option>
                        </Select>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">الكل</option>
                            <option value="used">مستخدم</option>
                            <option value="unused">غير مستخدم</option>
                        </Select>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={teacherFilter}
                            onChange={(e) => {
                                setTeacherFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">كل المدرسين</option>
                            {teachers.map((teacher) => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                                </option>
                            ))}
                        </Select>
                    </Flex>
                </CardBody>
            </Card>

            {/* Table Section */}
            <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
                <CardBody>
                    <TableContainer>
                        <Table colorScheme="gray" rounded={10}>
                            <Thead>
                                <Tr>
                                    <Th>الكود</Th>
                                    <Th>النوع</Th>
                                    <Th>الهدف</Th>
                                    <Th>المدرس</Th>
                                    <Th>السعر</Th>
                                    <Th>الحالة</Th>
                                    <Th>تم الإنشاء بواسطة</Th>
                                    <Th>تم الاستخدام بواسطة</Th>
                                    <Th>تاريخ الإنشاء</Th>
                                    <Th>إجراءات</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <Tr key={idx}>
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <Td key={i}>
                                                    <Skeleton height="20px" />
                                                </Td>
                                            ))}
                                        </Tr>
                                    ))
                                ) : codes.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={10} textAlign="center" py={8}>
                                            <VStack spacing={2}>
                                                <Icon icon="solar:key-bold-duotone" width="48" height="48" color="gray.300" />
                                                <Text color="gray.500" fontSize="sm" fontWeight="medium">
                                                    لا توجد أكواد تفعيل
                                                </Text>
                                            </VStack>
                                        </Td>
                                    </Tr>
                                ) : (
                                    codes.map((code) => (
                                        <Tr key={code._id}>
                                            <Td>
                                                <Text fontFamily="mono" fontWeight="bold" fontSize="sm">
                                                    {code.code}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme="blue">
                                                    {getTargetTypeLabel(code.targetType)}
                                                </Badge>
                                            </Td>
                                            <Td fontSize="sm" fontWeight="medium">{getTargetLabel(code)}</Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {typeof code.teacher === 'object'
                                                    ? `${code.teacher.firstName} ${code.teacher.lastName}`
                                                    : '-'}
                                            </Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {code.price.toLocaleString()} ج.م
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={code.isUsed ? 'red' : 'green'}>
                                                    {code.isUsed ? 'مستخدم' : 'متاح'}
                                                </Badge>
                                            </Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {typeof code.createdBy === 'object'
                                                    ? `${code.createdBy.firstName} ${code.createdBy.lastName}`
                                                    : '-'}
                                            </Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {code.usedBy ? `${code.usedBy.firstName} ${code.usedBy.lastName}` : '-'}
                                            </Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {new Date(code.createdAt).toLocaleDateString('ar-EG')}
                                            </Td>
                                            <Td>
                                                <IconButton
                                                    aria-label="حذف"
                                                    icon={<Icon icon="solar:trash-bin-trash-bold-duotone" />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(code._id, code.isUsed)}
                                                    isDisabled={code.isUsed}
                                                    rounded={2}
                                                    h={8}
                                                />
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </CardBody>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
                    <CardBody>
                        <HStack justify="center" spacing={4}>
                            <Button
                                size="sm"
                                fontWeight="medium"
                                h={8}
                                rounded={2}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                isDisabled={page === 1}
                            >
                                السابق
                            </Button>
                            <Text fontSize="sm" fontWeight="medium">
                                صفحة {page} من {totalPages}
                            </Text>
                            <Button
                                size="sm"
                                fontWeight="medium"
                                h={8}
                                rounded={2}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                isDisabled={page === totalPages}
                            >
                                التالي
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>
            )}

            {/* Create Modal */}
            <CreateActivationCodesModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchCodes}
            />
        </Stack>
    );
}

