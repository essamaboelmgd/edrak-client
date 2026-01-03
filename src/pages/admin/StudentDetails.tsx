import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import {
    Box,
    Button,
    Card,
    Stack,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    VStack,
    Badge,
    useToast,
    Skeleton,
    SkeletonText,
    Flex,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import { studentsService, IStudentAdmin } from '@/features/admin/services/studentsService';
import EditStudentModal from '@/features/admin/components/EditStudentModal';
import WalletManagementModal from '@/features/admin/components/WalletManagementModal';
import StudentOverviewTab from '@/features/admin/components/StudentOverviewTab';
import StudentCoursesTab from '@/features/admin/components/StudentCoursesTab';
import StudentLessonsTab from '@/features/admin/components/StudentLessonsTab';
import StudentSectionsTab from '@/features/admin/components/StudentSectionsTab';
import StudentHomeworksTab from '@/features/admin/components/StudentHomeworksTab';
import StudentExamsTab from '@/features/admin/components/StudentExamsTab';
import StudentGradesTab from '@/features/admin/components/StudentGradesTab';
import StudentSubscriptionsTab from '@/features/admin/components/StudentSubscriptionsTab';
import StudentPaymentsTab from '@/features/admin/components/StudentPaymentsTab';

const tabs = [
    {
        name: 'ملخص الطالب',
        key: 'overview',
        icon: 'solar:info-circle-bold-duotone',
    },
    {
        name: 'الكورسات',
        key: 'courses',
        icon: 'solar:book-bold-duotone',
    },
    {
        name: 'الدروس',
        key: 'lessons',
        icon: 'solar:play-circle-bold-duotone',
    },
    {
        name: 'الأقسام',
        key: 'sections',
        icon: 'solar:folder-bold-duotone',
    },
    {
        name: 'الواجبات',
        key: 'homeworks',
        icon: 'solar:clipboard-list-bold-duotone',
    },
    {
        name: 'الامتحانات',
        key: 'exams',
        icon: 'solar:document-text-bold-duotone',
    },
    {
        name: 'الدرجات',
        key: 'grades',
        icon: 'solar:diploma-bold-duotone',
    },
    {
        name: 'الاشتراكات',
        key: 'subscriptions',
        icon: 'solar:card-bold-duotone',
    },
    {
        name: 'المدفوعات',
        key: 'payments',
        icon: 'solar:wallet-money-bold-duotone',
    },
    {
        name: 'الاعدادات',
        key: 'settings',
        icon: 'solar:settings-bold-duotone',
    },
];

export default function StudentDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [student, setStudent] = useState<IStudentAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [teachers, setTeachers] = useState<any[]>([]);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (id) {
            fetchStudentDetails();
            fetchTeachers();
        }
    }, [id]);

    const fetchTeachers = async () => {
        try {
            const response = await studentsService.getStudentTeachers(id!);
            if (response.success && response.data) {
                setTeachers(response.data.teachers || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchStudentDetails = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentById(id!);
            if (response.success && response.data?.student) {
                setStudent(response.data.student as any);
            } else {
                toast({
                    status: 'error',
                    description: 'فشل في جلب بيانات الطالب',
                });
                navigate('/admin/students');
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الطالب',
            });
            navigate('/admin/students');
        } finally {
            setLoading(false);
        }
    };


    const handleToggleActivation = async () => {
        try {
            await studentsService.changeUserActivation(id!);
            toast({
                status: 'success',
                description: 'تم تغيير حالة التنشيط بنجاح',
            });
            fetchStudentDetails();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء التحديث',
            });
        }
    };

    const handleResetLevel = async () => {
        if (!window.confirm('هل أنت متأكد من إعادة تعيين المستوى؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return;
        }
        try {
            await studentsService.resetLevel(id!);
            toast({
                status: 'success',
                description: 'تم إعادة تعيين المستوى بنجاح',
            });
            fetchStudentDetails();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين المستوى',
            });
        }
    };

    const handleResetRank = async () => {
        if (!window.confirm('هل أنت متأكد من إعادة تعيين الترتيب؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return;
        }
        try {
            await studentsService.resetRank(id!);
            toast({
                status: 'success',
                description: 'تم إعادة تعيين الترتيب بنجاح',
            });
            fetchStudentDetails();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين الترتيب',
            });
        }
    };

    const handleDelete = async () => {
        try {
            await studentsService.deleteStudent(id!);
            toast({
                status: 'success',
                description: 'تم حذف الطالب بنجاح',
            });
            onDeleteClose();
            navigate('/admin/students');
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الطالب',
            });
        }
    };

    if (loading) {
        return (
            <Box p={6}>
                <Stack spacing={4}>
                    <Skeleton height="200px" />
                    <SkeletonText noOfLines={10} />
                </Stack>
            </Box>
        );
    }

    if (!student) {
        return (
            <Box p={6}>
                <Text>الطالب غير موجود</Text>
            </Box>
        );
    }


    return (
        <Box bg="gray.50" minH="100vh">
            <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }}>
                {/* Header Section */}
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
                        w="full"
                    >
                        <HStack spacing={4} flex={1}>
                            {/* Student Avatar/Icon */}
                            <Box
                                w={{ base: '80px', md: '120px' }}
                                h={{ base: '80px', md: '120px' }}
                                borderRadius="xl"
                                overflow="hidden"
                                bg="whiteAlpha.200"
                                backdropFilter="blur(10px)"
                                border="3px solid"
                                borderColor="whiteAlpha.300"
                                flexShrink={0}
                            >
                                <VStack
                                    w="100%"
                                    h="100%"
                                    justify="center"
                                    bg="whiteAlpha.100"
                                >
                                    <Icon
                                        icon="solar:user-bold-duotone"
                                        width="48"
                                        height="48"
                                        style={{ color: 'white' }}
                                    />
                                </VStack>
                            </Box>

                            <VStack align="start" spacing={2} flex={1}>
                                <HStack spacing={2} flexWrap="wrap">
                                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="white">
                                        {student.fullName}
                                    </Text>
                                    <Badge colorScheme={student.isActive ? 'green' : 'gray'} fontSize="xs" px={2} py={1} borderRadius="full">
                                        {student.isActive ? 'مفعل' : 'معطل'}
                                    </Badge>
                                </HStack>
                                <HStack spacing={4} flexWrap="wrap">
                                    <HStack spacing={2}>
                                        <Box
                                            w="8px"
                                            h="8px"
                                            borderRadius="full"
                                            bg="white"
                                        />
                                        <Text fontSize="sm" color="whiteAlpha.900">
                                            {student.email}
                                        </Text>
                                    </HStack>
                                    {student.mobileNumber && (
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {student.mobileNumber}
                                        </Text>
                                    )}
                                    {student.educationalLevel && (
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {student.educationalLevel.name || student.educationalLevel.shortName}
                                        </Text>
                                    )}
                                    {student.wallet && (
                                        <Text fontSize="sm" color="whiteAlpha.800" fontWeight="bold">
                                            رصيد: EGP {student.wallet.amount.toLocaleString()}
                                        </Text>
                                    )}
                                </HStack>
                                {teachers.length > 0 && (
                                    <HStack spacing={2} flexWrap="wrap" mt={2}>
                                        <Icon
                                            icon="solar:user-id-bold-duotone"
                                            width="16"
                                            height="16"
                                            style={{ color: 'white' }}
                                        />
                                        <Text fontSize="sm" color="whiteAlpha.900" fontWeight="medium">
                                            المعلمون:
                                        </Text>
                                        {teachers.slice(0, 3).map((teacher) => (
                                            <Badge
                                                key={teacher._id}
                                                colorScheme="cyan"
                                                fontSize="xs"
                                                px={2}
                                                py={1}
                                                borderRadius="full"
                                            >
                                                {teacher.fullName}
                                            </Badge>
                                        ))}
                                        {teachers.length > 3 && (
                                            <Text fontSize="sm" color="whiteAlpha.800">
                                                +{teachers.length - 3} آخرين
                                            </Text>
                                        )}
                                    </HStack>
                                )}
                            </VStack>
                        </HStack>

                        {/* Actions */}
                        <HStack spacing={2}>
                            <Button
                                bg="white"
                                color="purple.600"
                                _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                                onClick={() => navigate('/admin/students')}
                                leftIcon={<Icon icon="solar:arrow-right-bold-duotone" width="20" height="20" />}
                                size={{ base: 'md', md: 'lg' }}
                                borderRadius="xl"
                                shadow="md"
                                transition="all 0.3s"
                            >
                                رجوع
                            </Button>
                        </HStack>
                    </Flex>
                </Box>

                {/* Tabs Section */}
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="lg">
                    <Tabs
                        position="relative"
                        variant="soft-rounded"
                        colorScheme="indigo"
                        p={{ base: 3, md: 4 }}
                    >
                        <TabList
                            whiteSpace="nowrap"
                            overflowX="auto"
                            overflowY="hidden"
                            css={{
                                '&::-webkit-scrollbar': {
                                    height: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#F7FAFC',
                                    borderRadius: '10px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'linear-gradient(90deg, #805AD5 0%, #3182CE 50%, #38B2AC 100%)',
                                    borderRadius: '10px',
                                },
                            }}
                        >
                            {tabs.map((tab) => (
                                <Tab
                                    key={tab.key}
                                    _selected={{
                                        bgGradient: 'linear(135deg, purple.600 0%, blue.500 50%, teal.400 100%)',
                                        color: 'white',
                                        boxShadow: 'lg',
                                    }}
                                    _hover={{
                                        bg: 'purple.50',
                                    }}
                                    px={4}
                                    py={2}
                                    borderRadius="lg"
                                    fontWeight="medium"
                                    gap={2}
                                >
                                    <Icon
                                        icon={tab.icon}
                                        width="18"
                                        height="18"
                                        style={{ marginLeft: '6px' }}
                                    />
                                    {tab.name}
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels mt={4}>
                            {/* Overview Tab */}
                            <TabPanel px={0}>
                                <StudentOverviewTab studentId={id!} />
                            </TabPanel>

                            {/* Courses Tab */}
                            <TabPanel px={0}>
                                <StudentCoursesTab studentId={id!} />
                            </TabPanel>

                            {/* Lessons Tab */}
                            <TabPanel px={0}>
                                <StudentLessonsTab studentId={id!} />
                            </TabPanel>

                            {/* Sections Tab */}
                            <TabPanel px={0}>
                                <StudentSectionsTab studentId={id!} />
                            </TabPanel>

                            {/* Homeworks Tab */}
                            <TabPanel px={0}>
                                <StudentHomeworksTab studentId={id!} />
                            </TabPanel>

                            {/* Exams Tab */}
                            <TabPanel px={0}>
                                <StudentExamsTab studentId={id!} />
                            </TabPanel>

                            {/* Grades Tab */}
                            <TabPanel px={0}>
                                <StudentGradesTab studentId={id!} />
                            </TabPanel>

                            {/* Subscriptions Tab */}
                            <TabPanel px={0}>
                                <StudentSubscriptionsTab studentId={id!} />
                            </TabPanel>

                            {/* Payments Tab */}
                            <TabPanel px={0}>
                                <StudentPaymentsTab studentId={id!} />
                            </TabPanel>

                            {/* Settings Tab */}
                            <TabPanel px={0}>
                                <Stack spacing={4}>
                                    {/* Edit Student Data */}
                                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                                        <Stack p={5} spacing={4}>
                                            <HStack spacing={3}>
                                                <Box
                                                    w={10}
                                                    h={10}
                                                    borderRadius="lg"
                                                    bg="blue.100"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Icon
                                                        icon="solar:pen-bold-duotone"
                                                        width="24"
                                                        height="24"
                                                        style={{ color: 'var(--chakra-colors-blue-600)' }}
                                                    />
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                                        تعديل بيانات الطالب
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        تحديث معلومات الطالب الشخصية والمعلمين
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <EditStudentModal
                                                student={student}
                                                isOpen={showEditModal}
                                                onClose={() => setShowEditModal(false)}
                                                onSuccess={() => {
                                                    setShowEditModal(false);
                                                    fetchStudentDetails();
                                                    fetchTeachers();
                                                }}
                                            />
                                            <Button
                                                colorScheme="blue"
                                                onClick={() => setShowEditModal(true)}
                                                leftIcon={<Icon icon="solar:pen-bold-duotone" width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                تعديل بيانات الطالب
                                            </Button>
                                        </Stack>
                                    </Card>

                                    {/* Wallet Management */}
                                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                                        <Stack p={5} spacing={4}>
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
                                                        icon="solar:wallet-bold-duotone"
                                                        width="24"
                                                        height="24"
                                                        style={{ color: 'var(--chakra-colors-green-600)' }}
                                                    />
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                                        إدارة المحفظة
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        إضافة أو سحب من رصيد الطالب
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <HStack spacing={2}>
                                                <Text fontSize="sm" color="gray.600">
                                                    الرصيد الحالي:
                                                </Text>
                                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                                    EGP {student.wallet?.amount.toLocaleString() || 0}
                                                </Text>
                                            </HStack>
                                            <WalletManagementModal
                                                isOpen={showWalletModal}
                                                onClose={() => setShowWalletModal(false)}
                                                studentId={id!}
                                                studentName={student.fullName}
                                                currentBalance={student.wallet?.amount || 0}
                                                onSuccess={() => {
                                                    setShowWalletModal(false);
                                                    fetchStudentDetails();
                                                }}
                                            />
                                            <Button
                                                colorScheme="green"
                                                onClick={() => setShowWalletModal(true)}
                                                leftIcon={<Icon icon="solar:wallet-money-bold-duotone" width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                إدارة المحفظة
                                            </Button>
                                        </Stack>
                                    </Card>

                                    {/* Account Management */}
                                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                                        <Stack p={5} spacing={4}>
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
                                                        icon="solar:power-bold-duotone"
                                                        width="24"
                                                        height="24"
                                                        style={{ color: 'var(--chakra-colors-purple-600)' }}
                                                    />
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                                        إدارة الحساب
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        تفعيل أو تعطيل الحساب
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                                                <HStack spacing={2}>
                                                    <Icon
                                                        icon="solar:power-bold-duotone"
                                                        width="20"
                                                        height="20"
                                                        style={{ color: 'var(--chakra-colors-gray-600)' }}
                                                    />
                                                    <Text fontSize="sm" color="gray.700">
                                                        حالة الحساب
                                                    </Text>
                                                </HStack>
                                                <Badge
                                                    colorScheme={student.isActive ? 'green' : 'gray'}
                                                    fontSize="xs"
                                                    px={2}
                                                    py={1}
                                                    borderRadius="full"
                                                >
                                                    {student.isActive ? 'مفعل' : 'معطل'}
                                                </Badge>
                                            </HStack>
                                            <Button
                                                size="md"
                                                colorScheme={student.isActive ? 'red' : 'green'}
                                                onClick={handleToggleActivation}
                                                leftIcon={<Icon icon={student.isActive ? 'solar:power-bold-duotone' : 'solar:check-circle-bold-duotone'} width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                {student.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                            </Button>
                                        </Stack>
                                    </Card>

                                    {/* Gamification Management */}
                                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                                        <Stack p={5} spacing={4}>
                                            <HStack spacing={3}>
                                                <Box
                                                    w={10}
                                                    h={10}
                                                    borderRadius="lg"
                                                    bg="yellow.100"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Icon
                                                        icon="solar:star-bold-duotone"
                                                        width="24"
                                                        height="24"
                                                        style={{ color: 'var(--chakra-colors-yellow-600)' }}
                                                    />
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                                        إدارة المستويات والترتيب
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        إعادة تعيين المستوى والترتيب
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <Stack spacing={3}>
                                                <HStack justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                                                    <HStack spacing={2}>
                                                        <Icon
                                                            icon="solar:star-bold-duotone"
                                                            width="20"
                                                            height="20"
                                                            style={{ color: 'var(--chakra-colors-gray-600)' }}
                                                        />
                                                        <Text fontSize="sm" color="gray.700">
                                                            المستوى الحالي
                                                        </Text>
                                                    </HStack>
                                                    <Text fontSize="sm" fontWeight="bold" color="yellow.600">
                                                        {student.level?.value || 0}
                                                    </Text>
                                                </HStack>
                                                <HStack justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                                                    <HStack spacing={2}>
                                                        <Icon
                                                            icon="solar:cup-star-bold-duotone"
                                                            width="20"
                                                            height="20"
                                                            style={{ color: 'var(--chakra-colors-gray-600)' }}
                                                        />
                                                        <Text fontSize="sm" color="gray.700">
                                                            الترتيب الحالي
                                                        </Text>
                                                    </HStack>
                                                    <Text fontSize="sm" fontWeight="bold" color="purple.600">
                                                        {student.leaderboardRank?.value || 0}
                                                    </Text>
                                                </HStack>
                                            </Stack>
                                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                                <Button
                                                    size="sm"
                                                    colorScheme="yellow"
                                                    onClick={handleResetLevel}
                                                    leftIcon={<Icon icon="solar:refresh-bold-duotone" width="16" height="16" />}
                                                >
                                                    إعادة تعيين المستوى
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    colorScheme="purple"
                                                    onClick={handleResetRank}
                                                    leftIcon={<Icon icon="solar:refresh-bold-duotone" width="16" height="16" />}
                                                >
                                                    إعادة تعيين الترتيب
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Card>

                                    {/* Danger Zone */}
                                    <Card borderRadius="xl" border="1px" borderColor="red.200" bg="red.50" boxShadow="sm">
                                        <Stack p={5} spacing={4}>
                                            <HStack spacing={3}>
                                                <Box
                                                    w={10}
                                                    h={10}
                                                    borderRadius="lg"
                                                    bg="red.100"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Icon
                                                        icon="solar:danger-triangle-bold-duotone"
                                                        width="24"
                                                        height="24"
                                                        style={{ color: 'var(--chakra-colors-red-600)' }}
                                                    />
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" fontSize="lg" color="red.700">
                                                        منطقة الخطر
                                                    </Text>
                                                    <Text fontSize="xs" color="red.600">
                                                        إجراءات لا يمكن التراجع عنها
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <Text fontSize="sm" color="red.700">
                                                في حالة حذف الطالب بالخطأ أو بالقصد لن يعد لديك أي صلاحية لاسترجاع البيانات من حيث محتوى الطالب،
                                                الاشتراكات، الدرجات. وفي هذه الحالة سيتضطر في إنشاء حساب جديد للطالب.
                                                إذا كنت تريد بالتأكيد الحذف قم بالنقر على زر الحذف التالي.
                                            </Text>
                                            <Button
                                                colorScheme="red"
                                                size="md"
                                                onClick={onDeleteOpen}
                                                leftIcon={<Icon icon="solar:trash-bin-trash-bold-duotone" width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                حذف الطالب
                                            </Button>
                                        </Stack>
                                    </Card>
                                </Stack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Card>
            </Stack>

            {/* Delete Confirmation Modal */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
                            حذف الطالب
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack align="start" spacing={3}>
                                <Text>
                                    هل أنت متأكد من حذف الطالب <strong>{student.fullName}</strong>؟
                                </Text>
                                <Text fontSize="sm" color="red.600" fontWeight="medium">
                                    ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    سيتم حذف جميع بيانات الطالب بما في ذلك:
                                </Text>
                                <Box as="ul" fontSize="sm" color="gray.600" pl={4}>
                                    <li>معلومات الحساب الشخصية</li>
                                    <li>جميع الاشتراكات</li>
                                    <li>الدرجات والنتائج</li>
                                    <li>سجل المدفوعات</li>
                                    <li>جميع البيانات المرتبطة بالطالب</li>
                                </Box>
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    إذا كنت تريد بالتأكيد الحذف، قم بالنقر على "حذف" أدناه.
                                </Text>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                إلغاء
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                حذف
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}

