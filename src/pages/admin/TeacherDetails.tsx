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
    Image,
} from '@chakra-ui/react';
import { getImageUrl } from '@/lib/axios';
import { teachersService, ITeacherAdmin } from '@/features/admin/services/teachersService';
import EditTeacherModal from '@/features/admin/components/EditTeacherModal';
import TeacherOverviewTab from '@/features/admin/components/TeacherOverviewTab';
import TeacherCoursesTab from '@/features/admin/components/TeacherCoursesTab';
import TeacherLessonsTab from '@/features/admin/components/TeacherLessonsTab';
import TeacherSectionsTab from '@/features/admin/components/TeacherSectionsTab';
import TeacherHomeworksTab from '@/features/admin/components/TeacherHomeworksTab';
import TeacherExamsTab from '@/features/admin/components/TeacherExamsTab';
import TeacherSubscriptionsAsStudentTab from '@/features/admin/components/TeacherSubscriptionsAsStudentTab';
import TeacherSubscriptionPlanTab from '@/features/admin/components/TeacherSubscriptionPlanTab';
import TeacherSubscriptionHistoryTab from '@/features/admin/components/TeacherSubscriptionHistoryTab';
import TeacherPaymentsTab from '@/features/admin/components/TeacherPaymentsTab';

const tabs = [
    {
        name: 'ملخص المدرس',
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
        name: 'الاشتراكات كطالب',
        key: 'subscriptions-as-student',
        icon: 'solar:card-bold-duotone',
    },
    {
        name: 'خطة الاشتراك',
        key: 'subscription-plan',
        icon: 'solar:card-send-bold-duotone',
    },
    {
        name: 'سجل الاشتراكات',
        key: 'subscription-history',
        icon: 'solar:history-bold-duotone',
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

export default function TeacherDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [teacher, setTeacher] = useState<ITeacherAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (id) {
            fetchTeacherDetails();
        }
    }, [id]);

    const fetchTeacherDetails = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherById(id!);
            if (response.success && response.data?.teacher) {
                setTeacher(response.data.teacher as any);
            } else {
                toast({
                    status: 'error',
                    description: 'فشل في جلب بيانات المدرس',
                });
                navigate('/admin/teachers');
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات المدرس',
            });
            navigate('/admin/teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActivation = async () => {
        try {
            if (teacher?.platformStatus === 'suspended') {
                await teachersService.unsuspendTeacher(id!);
            } else {
                await teachersService.suspendTeacher(id!);
            }
            toast({
                status: 'success',
                description: 'تم تغيير حالة التنشيط بنجاح',
            });
            fetchTeacherDetails();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء التحديث',
            });
        }
    };

    const handleDelete = async () => {
        try {
            await teachersService.deleteTeacher(id!);
            toast({
                status: 'success',
                description: 'تم حذف المدرس بنجاح',
            });
            onDeleteClose();
            navigate('/admin/teachers');
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف المدرس',
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

    if (!teacher) {
        return (
            <Box p={6}>
                <Text>المدرس غير موجود</Text>
            </Box>
        );
    }

    const getStatusBadge = () => {
        const isInTrial = teacher.trial?.isInTrial || teacher.platformStatus === 'trial';
        const hasActiveSubscription = teacher.subscription?.isActive && !isInTrial;
        const isSuspended = teacher.platformStatus === 'suspended';
        const isExpired = teacher.platformStatus === 'expired';

        if (isSuspended) {
            return <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">معطل</Badge>;
        }
        if (isExpired) {
            return <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">منتهي</Badge>;
        }
        if (isInTrial) {
            return <Badge colorScheme="yellow" fontSize="xs" px={2} py={1} borderRadius="full">تجريبي</Badge>;
        }
        if (hasActiveSubscription) {
            return <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">نشط</Badge>;
        }
        return <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">غير نشط</Badge>;
    };

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
                            {/* Teacher Avatar/Icon */}
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
                                {teacher.photo ? (
                                    <Image
                                        src={getImageUrl(teacher.photo)}
                                        alt={teacher.fullName}
                                        w="100%"
                                        h="100%"
                                        objectFit="cover"
                                    />
                                ) : (
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
                                )}
                            </Box>

                            <VStack align="start" spacing={2} flex={1}>
                                <HStack spacing={2} flexWrap="wrap">
                                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="white">
                                        {teacher.fullName}
                                    </Text>
                                    {getStatusBadge()}
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
                                            {teacher.email}
                                        </Text>
                                    </HStack>
                                    {teacher.mobileNumber && (
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {teacher.mobileNumber}
                                        </Text>
                                    )}
                                    {teacher.platformName && (
                                        <Text fontSize="sm" color="whiteAlpha.800" fontWeight="bold">
                                            {teacher.platformName}
                                        </Text>
                                    )}
                                    {teacher.specialization && (
                                        <Text fontSize="sm" color="whiteAlpha.800">
                                            {teacher.specialization}
                                        </Text>
                                    )}
                                </HStack>
                                {teacher.stats && (
                                    <HStack spacing={4} flexWrap="wrap" mt={2}>
                                        <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                            <Icon
                                                icon="solar:users-group-rounded-bold-duotone"
                                                width="16"
                                                height="16"
                                                style={{ color: 'white' }}
                                            />
                                            <Text fontSize="sm" color="white" fontWeight="medium">
                                                {teacher.stats.totalStudents || 0} طالب
                                            </Text>
                                        </HStack>
                                        <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                            <Icon
                                                icon="solar:book-bold-duotone"
                                                width="16"
                                                height="16"
                                                style={{ color: 'white' }}
                                            />
                                            <Text fontSize="sm" color="white" fontWeight="medium">
                                                {teacher.stats.activeCourses || 0} كورس
                                            </Text>
                                        </HStack>
                                        <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                            <Icon
                                                icon="solar:dollar-minimalistic-bold-duotone"
                                                width="16"
                                                height="16"
                                                style={{ color: 'white' }}
                                            />
                                            <Text fontSize="sm" color="white" fontWeight="medium">
                                                EGP {teacher.stats.totalRevenue?.toLocaleString() || 0}
                                            </Text>
                                        </HStack>
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
                                onClick={() => navigate('/admin/teachers')}
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
                                <TeacherOverviewTab teacherId={id!} />
                            </TabPanel>

                            {/* Courses Tab */}
                            <TabPanel px={0}>
                                <TeacherCoursesTab teacherId={id!} />
                            </TabPanel>

                            {/* Lessons Tab */}
                            <TabPanel px={0}>
                                <TeacherLessonsTab teacherId={id!} />
                            </TabPanel>

                            {/* Sections Tab */}
                            <TabPanel px={0}>
                                <TeacherSectionsTab teacherId={id!} />
                            </TabPanel>

                            {/* Homeworks Tab */}
                            <TabPanel px={0}>
                                <TeacherHomeworksTab teacherId={id!} />
                            </TabPanel>

                            {/* Exams Tab */}
                            <TabPanel px={0}>
                                <TeacherExamsTab teacherId={id!} />
                            </TabPanel>

                            {/* Subscriptions as Student Tab */}
                            <TabPanel px={0}>
                                <TeacherSubscriptionsAsStudentTab teacherId={id!} />
                            </TabPanel>

                            {/* Subscription Plan Tab */}
                            <TabPanel px={0}>
                                <TeacherSubscriptionPlanTab teacherId={id!} />
                            </TabPanel>

                            {/* Subscription History Tab */}
                            <TabPanel px={0}>
                                <TeacherSubscriptionHistoryTab teacherId={id!} />
                            </TabPanel>

                            {/* Payments Tab */}
                            <TabPanel px={0}>
                                <TeacherPaymentsTab teacherId={id!} />
                            </TabPanel>

                            {/* Settings Tab */}
                            <TabPanel px={0}>
                                <Stack spacing={4}>
                                    {/* Edit Teacher Data */}
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
                                                        تعديل بيانات المدرس
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        تحديث معلومات المدرس الشخصية
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <EditTeacherModal
                                                teacher={teacher}
                                                isOpen={showEditModal}
                                                onClose={() => setShowEditModal(false)}
                                                onSuccess={() => {
                                                    setShowEditModal(false);
                                                    fetchTeacherDetails();
                                                }}
                                            />
                                            <Button
                                                colorScheme="blue"
                                                onClick={() => setShowEditModal(true)}
                                                leftIcon={<Icon icon="solar:pen-bold-duotone" width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                تعديل بيانات المدرس
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
                                                {getStatusBadge()}
                                            </HStack>
                                            <Button
                                                size="md"
                                                colorScheme={teacher.platformStatus === 'suspended' ? 'green' : 'red'}
                                                onClick={handleToggleActivation}
                                                leftIcon={<Icon icon={teacher.platformStatus === 'suspended' ? 'solar:check-circle-bold-duotone' : 'solar:power-bold-duotone'} width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                {teacher.platformStatus === 'suspended' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                                            </Button>
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
                                                في حالة حذف المدرس بالخطأ أو بالقصد لن يعد لديك أي صلاحية لاسترجاع البيانات من حيث محتوى المدرس،
                                                الكورسات، الدروس، الأقسام، الاشتراكات، الطلاب. وفي هذه الحالة سيتضطر في إنشاء حساب جديد للمدرس.
                                                إذا كنت تريد بالتأكيد الحذف قم بالنقر على زر الحذف التالي.
                                            </Text>
                                            <Button
                                                colorScheme="red"
                                                size="md"
                                                onClick={onDeleteOpen}
                                                leftIcon={<Icon icon="solar:trash-bin-trash-bold-duotone" width="18" height="18" />}
                                                w="fit-content"
                                            >
                                                حذف المدرس
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
                            حذف المدرس
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack align="start" spacing={3}>
                                <Text>
                                    هل أنت متأكد من حذف المدرس <strong>{teacher.fullName}</strong>؟
                                </Text>
                                <Text fontSize="sm" color="red.600" fontWeight="medium">
                                    ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    سيتم حذف جميع بيانات المدرس بما في ذلك:
                                </Text>
                                <Box as="ul" fontSize="sm" color="gray.600" pl={4}>
                                    <li>معلومات الحساب الشخصية</li>
                                    <li>جميع الكورسات والدروس والأقسام</li>
                                    <li>جميع الاشتراكات</li>
                                    <li>سجل المدفوعات</li>
                                    <li>جميع البيانات المرتبطة بالمدرس</li>
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

