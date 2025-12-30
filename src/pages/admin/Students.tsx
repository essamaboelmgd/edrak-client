import { useState, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import {
    useToast,
    HStack,
    VStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Button,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuOptionGroup,
    MenuItemOption,
    Badge,
    Box,
    SimpleGrid,
    Card,
    CardBody,
    Stack,
    Flex,
    Spacer,
} from '@chakra-ui/react';
import { studentsService, IStudentAdmin } from '@/features/admin/services/studentsService';
import { teachersService } from '@/features/admin/services/teachersService';
import { educationalLevelsService } from '@/features/admin/services/educationalLevelsService';
import StudentsTable from '@/features/admin/components/StudentsTable';
import StudentDetailsModal from '@/features/admin/components/StudentDetailsModal';
import CreateStudentModal from '@/features/admin/components/CreateStudentModal';
import EditStudentModal from '@/features/admin/components/EditStudentModal';
import WalletManagementModal from '@/features/admin/components/WalletManagementModal';

export default function AdminStudents() {
    const toast = useToast();
    const [students, setStudents] = useState<IStudentAdmin[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState<IStudentAdmin | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [educationalLevelFilter, setEducationalLevelFilter] = useState<string>('all');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);

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

    const fetchEducationalLevels = async () => {
        try {
            const response = await educationalLevelsService.getAllEducationalLevels({ limit: 1000 });
            if (response.success && response.data) {
                setEducationalLevels(response.data.educationalLevels || []);
            }
        } catch (error) {
            console.error('Error fetching educational levels:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getAllStudents({
                page,
                limit: 20,
                search: searchTerm || undefined,
                teacher: teacherFilter !== 'all' ? teacherFilter : undefined,
                educationalLevel: educationalLevelFilter !== 'all' ? educationalLevelFilter : undefined,
            });

            if (response.success && response.data) {
                let filteredStudents = response.data.students;

                // Apply status filters on frontend (since backend doesn't support multi-status filter yet)
                if (statusFilters.length > 0) {
                    filteredStudents = filteredStudents.filter((student) => {
                        if (statusFilters.includes('active') && student.status === 'active') return true;
                        if (statusFilters.includes('blocked') && student.status === 'blocked') return true;
                        if (statusFilters.includes('reviewing') && student.status === 'reviewing') return true;
                        return false;
                    });
                }

                setStudents(filteredStudents);
                setTotalPages(response.data.pagination.totalPages);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast({
                status: 'error',
                description: 'حدث خطأ أثناء جلب البيانات',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
        fetchEducationalLevels();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchStudents();
            } else {
                setPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, teacherFilter, educationalLevelFilter, statusFilters]);

    const handleViewDetails = (student: IStudentAdmin) => {
        setSelectedStudent(student);
        setShowDetailsModal(true);
        setShowEditModal(false); // Ensure edit modal is closed
    };

    const handleEdit = async (student: IStudentAdmin) => {
        try {
            // Fetch full student details to ensure all fields are available
            const response = await studentsService.getStudentById(student._id);
            if (response.success && response.data?.student) {
                setSelectedStudent(response.data.student);
                setShowEditModal(true);
                setShowDetailsModal(false); // Ensure details modal is closed
            } else {
                // Fallback to the student from list if fetch fails
                setSelectedStudent(student);
                setShowEditModal(true);
                setShowDetailsModal(false);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            // Fallback to the student from list if fetch fails
            setSelectedStudent(student);
            setShowEditModal(true);
            setShowDetailsModal(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        try {
            await studentsService.deleteStudent(studentId);
            toast({
                status: 'success',
                description: 'تم حذف الطالب بنجاح',
            });
            fetchStudents();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الطالب',
            });
        }
    };

    const handleBlock = async (studentId: string) => {
        try {
            await studentsService.blockUser(studentId);
            toast({
                status: 'success',
                description: 'تم حظر الطالب بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حظر الطالب',
            });
        }
    };

    const handleUnblock = async (studentId: string) => {
        try {
            await studentsService.unblockUser(studentId);
            toast({
                status: 'success',
                description: 'تم إلغاء حظر الطالب بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إلغاء حظر الطالب',
            });
        }
    };

    const handleManageWallet = (student: IStudentAdmin) => {
        setSelectedStudent(student);
        setShowWalletModal(true);
    };

    const handleResetLevel = async (studentId: string) => {
        try {
            await studentsService.resetLevel(studentId);
            toast({
                status: 'success',
                description: 'تم إعادة تعيين المستوى بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين المستوى',
            });
        }
    };

    const handleResetRank = async (studentId: string) => {
        try {
            await studentsService.resetRank(studentId);
            toast({
                status: 'success',
                description: 'تم إعادة تعيين الترتيب بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين الترتيب',
            });
        }
    };

    const handleChangeStatus = async (studentId: string) => {
        try {
            await studentsService.changeUserStatus(studentId);
            toast({
                status: 'success',
                description: 'تم تغيير حالة الحساب بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة',
            });
        }
    };

    const handleAllowModifications = async (studentId: string) => {
        try {
            await studentsService.allowModifications(studentId);
            toast({
                status: 'success',
                description: 'تم تحديث صلاحية التعديل بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء التحديث',
            });
        }
    };

    const handleToggleActivation = async (studentId: string) => {
        try {
            await studentsService.changeUserActivation(studentId);
            toast({
                status: 'success',
                description: 'تم تغيير حالة التنشيط بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء التحديث',
            });
        }
    };

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map((s) => s._id));
        }
    };

    const handleActivateMultiple = async () => {
        if (selectedStudents.length === 0) {
            toast({
                status: 'warning',
                description: 'لم يتم تحديد أي طالب',
            });
            return;
        }

        try {
            await studentsService.activateMultipleUsers(selectedStudents);
            toast({
                status: 'success',
                description: `تم تفعيل ${selectedStudents.length} حساب بنجاح`,
            });
            setSelectedStudents([]);
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء التفعيل',
            });
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await studentsService.exportStudents({
                user_type: 'user',
                search: searchTerm || undefined,
                status: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
                educational_level: educationalLevelFilter !== 'all' ? educationalLevelFilter : undefined,
                teacher_id: teacherFilter !== 'all' ? teacherFilter : undefined,
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students-export-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                status: 'success',
                description: 'تم تصدير البيانات بنجاح',
            });
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء التصدير',
            });
        } finally {
            setExporting(false);
        }
    };

    // Calculate stats
    const stats = {
        total,
        active: students.filter((s) => s.isActive).length,
        inactive: students.filter((s) => !s.isActive).length,
        withTeachers: students.filter((s) => s.assignedTeachers && s.assignedTeachers.length > 0).length,
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Modern Hero Header */}
            <Box
                bgGradient="linear(135deg, purple.600 0%, blue.500 50%, teal.400 100%)"
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
                            <Icon icon="solar:users-group-rounded-bold-duotone" width={24} height={24} />
                            <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                                إدارة المنصة
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                            جميع الطلاب
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة {total} طالب على المنصة
                        </Text>
                    </VStack>
                    <Button
                        bg="white"
                        color="purple.600"
                        _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                        onClick={() => setShowCreateModal(true)}
                        leftIcon={<Icon icon="solar:user-plus-bold-duotone" width="20" height="20" />}
                        size={{ base: 'md', md: 'lg' }}
                        borderRadius="xl"
                        shadow="md"
                        transition="all 0.3s"
                    >
                        إضافة طالب جديد
                    </Button>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
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
                                    إجمالي الطلاب
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    طالب مسجل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, blue.400, blue.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:users-group-rounded-bold-duotone"
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
                                    الطلاب النشطين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {stats.active}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    طالب نشط
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
                                    الطلاب غير النشطين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                                    {stats.inactive}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    طالب غير نشط
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, red.400, red.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:eye-closed-bold-duotone"
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
                                    مرتبطين بمعلمين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {stats.withTeachers}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    طالب لديه معلم
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:user-id-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters and Controls */}
            <Card borderRadius="xl" border="1px" borderColor="gray.200">
                <CardBody>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        gap={4}
                        align={{ base: 'stretch', md: 'center' }}
                    >
                        <InputGroup flex={{ base: '1', md: '0 0 300px' }} size="md">
                            <InputLeftElement pointerEvents="none">
                                <Icon
                                    icon="solar:magnifer-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-gray-400)' }}
                                />
                            </InputLeftElement>
                            <Input
                                type="search"
                                placeholder="ابحث بالاسم أو الموبايل..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg="white"
                                borderRadius="lg"
                            />
                        </InputGroup>

                        <Select
                            value={teacherFilter}
                            onChange={(e) => setTeacherFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">جميع المعلمين</option>
                            {teachers.map((teacher) => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.fullName}
                                </option>
                            ))}
                        </Select>

                        <Select
                            value={educationalLevelFilter}
                            onChange={(e) => setEducationalLevelFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">جميع المستويات</option>
                            {educationalLevels.map((level) => (
                                <option key={level._id} value={level._id}>
                                    {level.name}
                                </option>
                            ))}
                        </Select>

                        <Menu closeOnSelect={false}>
                            <MenuButton
                                as={Button}
                                bg="white"
                                variant="outline"
                                size="sm"
                                rightIcon={<Icon icon="mdi:chevron-down" width={16} height={16} />}
                            >
                                حالة الحساب
                                {statusFilters.length > 0 && (
                                    <Badge ml={2} colorScheme="blue">
                                        {statusFilters.length}
                                    </Badge>
                                )}
                            </MenuButton>
                            <MenuList minWidth="240px">
                                <MenuOptionGroup
                                    type="checkbox"
                                    value={statusFilters}
                                    onChange={(values) => setStatusFilters(values as string[])}
                                >
                                    <MenuItemOption value="active">نشط</MenuItemOption>
                                    <MenuItemOption value="blocked">محظور</MenuItemOption>
                                    <MenuItemOption value="reviewing">قيد المراجعة</MenuItemOption>
                                </MenuOptionGroup>
                            </MenuList>
                        </Menu>

                        <Spacer />

                        {selectedStudents.length > 0 && (
                            <Button
                                size="sm"
                                colorScheme="teal"
                                leftIcon={<Icon icon="lucide:check-circle" width={20} height={20} />}
                                onClick={handleActivateMultiple}
                                rounded={2}
                                fontWeight="medium"
                            >
                                تفعيل الحسابات ({selectedStudents.length})
                            </Button>
                        )}

                        <Button
                            alignItems="center"
                            size="sm"
                            colorScheme="gray"
                            rounded={2}
                            onClick={handleExport}
                            gap={1.5}
                            isDisabled={exporting}
                            isLoading={exporting}
                            fontWeight="medium"
                            fontSize={16}
                        >
                            <Icon icon="prime:file-export" width={20} height={20} />
                            <Text fontSize="smaller">تصدير</Text>
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm('');
                                setTeacherFilter('all');
                                setEducationalLevelFilter('all');
                                setStatusFilters([]);
                            }}
                            leftIcon={<Icon icon="solar:restart-bold-duotone" width="16" height="16" />}
                        >
                            إعادة تعيين
                        </Button>
                    </Flex>
                </CardBody>
            </Card>

            {/* Results Count */}
            <HStack justify="space-between" px={2}>
                <Text fontSize="sm" color="gray.600">
                    عرض {students.length} من {total} طالب
                </Text>
                {totalPages > 0 && (
                    <Text fontSize="sm" color="gray.600">
                        صفحة {page} من {totalPages}
                    </Text>
                )}
            </HStack>

            {/* Content */}
            <StudentsTable
                students={students}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onManageWallet={handleManageWallet}
                onResetLevel={handleResetLevel}
                onResetRank={handleResetRank}
                onChangeStatus={handleChangeStatus}
                onAllowModifications={handleAllowModifications}
                onToggleActivation={handleToggleActivation}
                selectedStudents={selectedStudents}
                onSelectStudent={handleSelectStudent}
                onSelectAll={handleSelectAll}
                loading={loading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <Card borderRadius="xl" border="1px" borderColor="gray.200">
                    <CardBody>
                        <Flex justify="center" align="center" gap={4} flexWrap="wrap">
                            <Button
                                size="sm"
                                isDisabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                leftIcon={<Icon icon="solar:alt-arrow-right-bold-duotone" width="16" height="16" />}
                                fontWeight="medium"
                            >
                                السابق
                            </Button>
                            <HStack spacing={2}>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            size="sm"
                                            colorScheme={page === pageNum ? 'blue' : 'gray'}
                                            variant={page === pageNum ? 'solid' : 'outline'}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </HStack>
                            <Button
                                size="sm"
                                isDisabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                rightIcon={<Icon icon="solar:alt-arrow-left-bold-duotone" width="16" height="16" />}
                                fontWeight="medium"
                            >
                                التالي
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>
            )}

            {/* Modals */}
            <StudentDetailsModal
                student={selectedStudent}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedStudent(null);
                }}
                onEdit={(student) => {
                    setShowDetailsModal(false);
                    handleEdit(student);
                }}
                onDelete={handleDelete}
                onBlock={(studentId) => {
                    handleBlock(studentId);
                    setShowDetailsModal(false);
                }}
                onUnblock={(studentId) => {
                    handleUnblock(studentId);
                    setShowDetailsModal(false);
                }}
                onManageWallet={handleManageWallet}
            />

            <CreateStudentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchStudents}
            />

            <EditStudentModal
                student={selectedStudent}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                }}
                onSuccess={fetchStudents}
            />

            <WalletManagementModal
                isOpen={showWalletModal}
                onClose={() => {
                    setShowWalletModal(false);
                    setSelectedStudent(null);
                }}
                studentId={selectedStudent?._id || ''}
                studentName={selectedStudent?.fullName || ''}
                currentBalance={selectedStudent?.wallet?.amount || 0}
                onSuccess={fetchStudents}
            />
        </Stack>
    );
}

