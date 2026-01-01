import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import {
    Box,
    Button,
    Card,
    CardBody,
    Stack,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SimpleGrid,
    HStack,
    VStack,
    Badge,
    Divider,
    Grid,
    useToast,
    Skeleton,
    SkeletonText,
    Flex,
    Image,
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
    Tooltip,
    IconButton,
    Heading,
    Spacer,
} from '@chakra-ui/react';
import { getImageUrl } from '@/lib/axios';
import { coursesService } from '@/features/admin/services/coursesService';
import EditCourseModal from '@/features/admin/components/EditCourseModal';
import CourseStudentsTab from '@/features/admin/components/CourseStudentsTab';
import CourseLessonsTab from '@/features/admin/components/CourseLessonsTab';
import CourseQuestionBankTab from '@/features/admin/components/CourseQuestionBankTab';

interface CourseDetailsData {
    _id: string;
    title: string;
    description: string;
    poster?: string;
    teacher: {
        _id: string;
        fullName: string;
        email: string;
    };
    educationalLevel: {
        _id: string;
        name: string;
        shortName: string;
    };
    courseSection?: {
        _id: string;
        title: string;
        name?: string;
        nameArabic?: string;
    };
    price: number;
    discount: number;
    finalPrice: number;
    status: string;
    isFree: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    statistics?: {
        subscribersCount: number;
        lessonsCount: number;
        examsCount: number;
        homeworksCount: number;
        totalRevenue: number;
        viewsCount: number;
    };
    exams?: Array<{
        _id: string;
        title: string;
        description?: string;
        duration?: number;
        status?: string;
        draft?: boolean;
        createdAt?: string;
        lesson?: {
            _id: string;
            title: string;
        };
    }>;
    homeworks?: Array<{
        _id: string;
        name: string;
        details?: string;
        level?: string;
        date?: string;
        createdAt?: string;
        lesson?: {
            _id: string;
            title: string;
        };
    }>;
    questionBankQuestions?: Array<{
        _id: string;
        question: string;
        questionType: string;
        difficulty?: string;
        points?: number;
        createdAt?: string;
    }>;
}

const tabs = [
    {
        name: 'ملخص الكورس',
        key: 'summary',
        icon: 'solar:info-circle-bold-duotone',
    },
    {
        name: 'ملخص الطلاب',
        key: 'students-summary',
        icon: 'solar:users-group-rounded-bold-duotone',
    },
    {
        name: 'الدروس',
        key: 'lessons',
        icon: 'solar:play-circle-bold-duotone',
    },
    {
        name: 'الامتحانات',
        key: 'exams',
        icon: 'solar:document-text-bold-duotone',
    },
    {
        name: 'بنك الأسئلة',
        key: 'question-bank',
        icon: 'solar:question-circle-bold-duotone',
    },
    {
        name: 'الاوائل',
        key: 'leaderboard',
        icon: 'solar:cup-star-bold-duotone',
    },
    {
        name: 'الاعدادات',
        key: 'settings',
        icon: 'solar:settings-bold-duotone',
    },
];

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [course, setCourse] = useState<CourseDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCourseDetails();
        }
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await coursesService.getCourseById(id!);
            if (response.success && response.data?.course) {
                setCourse(response.data.course as any);
            } else {
                toast({
                    status: 'error',
                    description: 'فشل في جلب بيانات الكورس',
                });
                navigate('/admin/courses');
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الكورس',
            });
            navigate('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكورس؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return;
        }

        try {
            await coursesService.deleteCourse(id!);
            toast({
                status: 'success',
                description: 'تم حذف الكورس بنجاح',
            });
            navigate('/admin/courses');
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الكورس',
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

    if (!course) {
        return (
            <Box p={6}>
                <Text>الكورس غير موجود</Text>
            </Box>
        );
    }

    const getStatusBadge = () => {
        if (course.status === 'active') {
            return <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">نشط</Badge>;
        }
        if (course.status === 'draft') {
            return <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">مسودة</Badge>;
        }
        return <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">معطل</Badge>;
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }}>
            {/* Header Section */}
            <Box
                bgGradient="linear(to-r, green.500, green.600)"
                borderRadius="xl"
                p={{ base: 4, md: 6 }}
                color="white"
                boxShadow="xl"
                position="relative"
                overflow="hidden"
            >
                {/* Background Pattern */}
                <Box
                    position="absolute"
                    top={0}
                    right={0}
                    bottom={0}
                    left={0}
                    opacity={0.1}
                    backgroundImage={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}
                />

                <VStack align="start" spacing={4} position="relative" zIndex={1}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'start', md: 'center' }}
                        justify="space-between"
                        w="full"
                        gap={4}
                    >
                        <HStack spacing={4} flex={1}>
                            {/* Course Image/Icon */}
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
                                {course.poster ? (
                                    <Image
                                        src={getImageUrl(course.poster)}
                                        alt={course.title}
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
                                            icon="solar:book-bold-duotone"
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
                                        {course.title}
                                    </Text>
                                    {getStatusBadge()}
                                </HStack>
                                {course.description && (
                                    <Text
                                        fontSize="sm"
                                        color="whiteAlpha.900"
                                        noOfLines={2}
                                        maxW={{ base: '100%', md: '600px' }}
                                    >
                                        {course.description}
                                    </Text>
                                )}
                                <HStack spacing={4} flexWrap="wrap">
                                    <HStack spacing={2}>
                                        <Box
                                            w="8px"
                                            h="8px"
                                            borderRadius="full"
                                            bg="white"
                                        />
                                        <Text fontSize="sm" color="whiteAlpha.900">
                                            {course.teacher.fullName}
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="whiteAlpha.800">
                                        {course.educationalLevel.name || course.educationalLevel.shortName}
                                    </Text>
                                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="bold">
                                        {course.isFree ? 'مجاني' : `EGP ${course.finalPrice.toLocaleString()}`}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>

                        {/* Actions */}
                        <HStack spacing={2}>
                            <Button
                                bg="white"
                                color="green.600"
                                _hover={{ bg: 'whiteAlpha.900', transform: 'scale(1.05)' }}
                                onClick={() => navigate('/admin/courses')}
                                leftIcon={<Icon icon="solar:arrow-right-bold-duotone" width="20" height="20" />}
                                size={{ base: 'sm', md: 'md' }}
                            >
                                رجوع
                            </Button>
                        </HStack>
                    </Flex>

                    {/* Quick Stats */}
                    {course.statistics && (
                        <HStack spacing={4} flexWrap="wrap">
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:users-group-rounded-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {course.statistics.subscribersCount} مشترك
                                </Text>
                            </HStack>
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:play-circle-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {course.statistics.lessonsCount} درس
                                </Text>
                            </HStack>
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:document-text-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {course.statistics.examsCount} امتحان
                                </Text>
                            </HStack>
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:clipboard-list-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {course.statistics.homeworksCount} واجب
                                </Text>
                            </HStack>
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:eye-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {course.statistics.viewsCount.toLocaleString()} مشاهدة
                                </Text>
                            </HStack>
                        </HStack>
                    )}
                </VStack>
            </Box>

            {/* Tabs Section */}
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="lg">
                <Tabs
                    position="relative"
                    variant="soft-rounded"
                    colorScheme="green"
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
                                background: 'linear-gradient(90deg, #48BB78 0%, #38A169 100%)',
                                borderRadius: '10px',
                            },
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.key}
                                _selected={{
                                    bg: 'green.500',
                                    color: 'white',
                                    boxShadow: 'lg',
                                }}
                                _hover={{
                                    bg: 'green.50',
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
                        {/* Course Summary Tab */}
                        <TabPanel px={0}>
                            <CourseSummaryTab course={course} />
                        </TabPanel>

                        {/* Student Summary Tab */}
                        <TabPanel px={0}>
                            <CourseStudentsTab courseId={id!} />
                        </TabPanel>

                        {/* Lessons Tab */}
                        <TabPanel px={0}>
                            <CourseLessonsTab courseId={id!} />
                        </TabPanel>

                        {/* Exams Tab */}
                        <TabPanel px={0}>
                            <ExamsTab course={course} />
                        </TabPanel>

                        {/* Question Bank Tab */}
                        <TabPanel px={0}>
                            <CourseQuestionBankTab courseId={id!} />
                        </TabPanel>

                        {/* Leaderboard Tab */}
                        <TabPanel px={0}>
                            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                                <CardBody>
                                    <Text>الاوائل - قريباً</Text>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Settings Tab */}
                        <TabPanel px={0}>
                            <Stack spacing={4}>
                                <Card borderRadius="xl" border="1px" borderColor="gray.200" p={4}>
                                    <EditCourseModal
                                        course={course as any}
                                        isOpen={showEditModal}
                                        onClose={() => setShowEditModal(false)}
                                        onSuccess={() => {
                                            setShowEditModal(false);
                                            fetchCourseDetails();
                                        }}
                                    />
                                    <Button
                                        colorScheme="green"
                                        onClick={() => setShowEditModal(true)}
                                        leftIcon={<Icon icon="solar:pen-bold-duotone" width="18" height="18" />}
                                    >
                                        تعديل بيانات الكورس
                                    </Button>
                                </Card>
                                <DeleteCourseCard onDelete={handleDeleteCourse} />
                            </Stack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Card>
        </Stack>
    );
}

// Course Summary Tab Component
function CourseSummaryTab({ course }: { course: CourseDetailsData }) {
    return (
        <Stack spacing={{ base: 4, md: 6 }}>
            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
                <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="sm">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    عدد المشتركين
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                    {course.statistics?.subscribersCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="purple.50">
                                <Icon
                                    icon="solar:users-group-rounded-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-purple-500)' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="sm">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    عدد الدروس
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                    {course.statistics?.lessonsCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="blue.50">
                                <Icon
                                    icon="solar:play-circle-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-blue-500)' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="sm">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    عدد الامتحانات
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                    {course.statistics?.examsCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="green.50">
                                <Icon
                                    icon="solar:document-text-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-green-500)' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="sm">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    إجمالي الإيرادات
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                                    EGP {course.statistics?.totalRevenue.toLocaleString() || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="orange.50">
                                <Icon
                                    icon="solar:wallet-money-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-orange-500)' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Course Details */}
            <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={{ base: 4, md: 6 }}>
                {/* Main Details */}
                <Stack spacing={4}>
                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <HStack spacing={2} mb={2}>
                                    <Icon
                                        icon="solar:info-circle-bold-duotone"
                                        width="24"
                                        height="24"
                                        style={{ color: 'var(--chakra-colors-blue-500)' }}
                                    />
                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                        تفاصيل الكورس
                                    </Text>
                                </HStack>

                                <Divider />

                                {/* Title */}
                                <Box
                                    p={3}
                                    borderRadius="lg"
                                    bg="blue.50"
                                    borderLeft="4px solid"
                                    borderLeftColor="blue.500"
                                >
                                    <Text fontSize="xs" color="blue.600" fontWeight="medium" mb={1}>
                                        العنوان
                                    </Text>
                                    <Text color="gray.800" fontWeight="medium" fontSize="md">
                                        {course.title || '-'}
                                    </Text>
                                </Box>

                                {/* Description */}
                                {course.description && (
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="gray.50"
                                        borderLeft="4px solid"
                                        borderLeftColor="gray.400"
                                    >
                                        <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>
                                            الوصف
                                        </Text>
                                        <Text color="gray.700" fontSize="sm" whiteSpace="pre-wrap">
                                            {course.description}
                                        </Text>
                                    </Box>
                                )}

                                {/* Details Grid */}
                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="green.50"
                                        border="1px"
                                        borderColor="green.200"
                                    >
                                        <HStack spacing={2} mb={1}>
                                            <Icon
                                                icon="solar:dollar-minimalistic-bold-duotone"
                                                width="16"
                                                height="16"
                                                style={{ color: 'var(--chakra-colors-green-600)' }}
                                            />
                                            <Text fontSize="xs" color="green.700" fontWeight="medium">
                                                السعر
                                            </Text>
                                        </HStack>
                                        <Text color="green.800" fontWeight="bold" fontSize="lg">
                                            EGP {course.price.toLocaleString()}
                                        </Text>
                                    </Box>

                                    {course.discount > 0 && (
                                        <Box
                                            p={3}
                                            borderRadius="lg"
                                            bg="orange.50"
                                            border="1px"
                                            borderColor="orange.200"
                                        >
                                            <HStack spacing={2} mb={1}>
                                                <Icon
                                                    icon="solar:tag-price-bold-duotone"
                                                    width="16"
                                                    height="16"
                                                    style={{ color: 'var(--chakra-colors-orange-600)' }}
                                                />
                                                <Text fontSize="xs" color="orange.700" fontWeight="medium">
                                                    الخصم
                                                </Text>
                                            </HStack>
                                            <Text color="orange.800" fontWeight="bold" fontSize="lg">
                                                {course.discount}%
                                            </Text>
                                        </Box>
                                    )}

                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="purple.50"
                                        border="1px"
                                        borderColor="purple.200"
                                    >
                                        <HStack spacing={2} mb={1}>
                                            <Icon
                                                icon="solar:diploma-bold-duotone"
                                                width="16"
                                                height="16"
                                                style={{ color: 'var(--chakra-colors-purple-600)' }}
                                            />
                                            <Text fontSize="xs" color="purple.700" fontWeight="medium">
                                                المرحلة التعليمية
                                            </Text>
                                        </HStack>
                                        <Text color="purple.800" fontWeight="medium" fontSize="sm">
                                            {course.educationalLevel.name || course.educationalLevel.shortName}
                                        </Text>
                                    </Box>

                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="cyan.50"
                                        border="1px"
                                        borderColor="cyan.200"
                                    >
                                        <HStack spacing={2} mb={1}>
                                            <Icon
                                                icon="solar:calendar-bold-duotone"
                                                width="16"
                                                height="16"
                                                style={{ color: 'var(--chakra-colors-cyan-600)' }}
                                            />
                                            <Text fontSize="xs" color="cyan.700" fontWeight="medium">
                                                تاريخ الإنشاء
                                            </Text>
                                        </HStack>
                                        <Text color="cyan.800" fontWeight="medium" fontSize="sm">
                                            {new Date(course.createdAt).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                    </Box>

                                    {course.startDate && (
                                        <Box
                                            p={3}
                                            borderRadius="lg"
                                            bg="teal.50"
                                            border="1px"
                                            borderColor="teal.200"
                                        >
                                            <HStack spacing={2} mb={1}>
                                                <Icon
                                                    icon="solar:calendar-mark-bold-duotone"
                                                    width="16"
                                                    height="16"
                                                    style={{ color: 'var(--chakra-colors-teal-600)' }}
                                                />
                                                <Text fontSize="xs" color="teal.700" fontWeight="medium">
                                                    تاريخ بدء الخصم
                                                </Text>
                                            </HStack>
                                            <Text color="teal.800" fontWeight="medium" fontSize="sm">
                                                {new Date(course.startDate).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </Box>
                                    )}

                                    {course.endDate && (
                                        <Box
                                            p={3}
                                            borderRadius="lg"
                                            bg="red.50"
                                            border="1px"
                                            borderColor="red.200"
                                        >
                                            <HStack spacing={2} mb={1}>
                                                <Icon
                                                    icon="solar:calendar-remove-bold-duotone"
                                                    width="16"
                                                    height="16"
                                                    style={{ color: 'var(--chakra-colors-red-600)' }}
                                                />
                                                <Text fontSize="xs" color="red.700" fontWeight="medium">
                                                    تاريخ انتهاء الخصم
                                                </Text>
                                            </HStack>
                                            <Text color="red.800" fontWeight="medium" fontSize="sm">
                                                {new Date(course.endDate).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </Box>
                                    )}
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>
                </Stack>

                {/* Rules Sidebar */}
                <Stack spacing={4}>
                    <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <HStack spacing={2}>
                                    <Icon
                                        icon="solar:document-text-bold-duotone"
                                        width="24"
                                        height="24"
                                        style={{ color: 'var(--chakra-colors-purple-500)' }}
                                    />
                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                        شروط التسجيل
                                    </Text>
                                </HStack>
                                <Divider />
                                <Box
                                    p={6}
                                    borderRadius="lg"
                                    bg="gray.50"
                                    textAlign="center"
                                >
                                    <Icon
                                        icon="solar:document-text-bold-duotone"
                                        width="48"
                                        height="48"
                                        style={{ color: 'var(--chakra-colors-gray-300)' }}
                                    />
                                    <Text color="gray.500" fontSize="sm" mt={2}>
                                        لا توجد شروط مسجلة
                                    </Text>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>
                </Stack>
            </Grid>
        </Stack>
    );
}

// Exams Tab Component
function ExamsTab({ course }: { course: CourseDetailsData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const exams = course.exams || [];
    const filteredExams = exams.filter((exam) =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                إدارة جميع امتحانات الكورس
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                إجمالي {exams.length} امتحان
                            </Text>
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
                                placeholder="بحث في الامتحانات..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg="white"
                            />
                        </InputGroup>
                    </Flex>
                </CardBody>
            </Card>

            {filteredExams.length === 0 ? (
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


// Delete Course Card Component
function DeleteCourseCard({ onDelete }: { onDelete: () => void }) {
    return (
        <Card borderRadius="xl" border="1px" borderColor="red.200" bg="red.50" p={4}>
            <Stack spacing={3}>
                <HStack spacing={2}>
                    <Icon
                        icon="solar:danger-triangle-bold-duotone"
                        width="24"
                        height="24"
                        style={{ color: 'var(--chakra-colors-red-500)' }}
                    />
                    <Box>
                        <Text fontWeight="bold" fontSize="md" color="red.700">
                            حذف الكورس؟
                        </Text>
                        <Text color="red.600" fontSize="sm">
                            في حالة حذف الكورس بالخطأ أو بالقصد لن يعد لديك أي صلاحية لاسترجاع البيانات من حيث محتوى الكورس،
                            الدروس، المذكرات، المشتركين. وفي هذه الحالة سيتضطر في إنشاء كورس جديد لرفعه على المنصة من جديد للتسجيل من قبل الطلبة.
                            إذا كنت تريد بالتأكيد الحذف قم بالنقر على زر الحذف التالي.
                        </Text>
                    </Box>
                </HStack>
                <Divider borderColor="red.200" />
                <Button
                    colorScheme="red"
                    size="md"
                    width="150px"
                    maxWidth="100%"
                    leftIcon={<Icon icon="solar:trash-bin-trash-bold-duotone" width="18" height="18" />}
                    onClick={onDelete}
                >
                    حذف الكورس
                </Button>
            </Stack>
        </Card>
    );
}
