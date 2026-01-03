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
} from '@chakra-ui/react';
import { getImageUrl } from '@/lib/axios';
import { sectionsService, ISectionAdmin } from '@/features/admin/services/sectionsService';
import SectionStudentsTab from '@/features/admin/components/SectionStudentsTab';
import SectionCoursesTab from '@/features/admin/components/SectionCoursesTab';
import SectionLessonsTab from '@/features/admin/components/SectionLessonsTab';
import SectionQuestionBankTab from '@/features/admin/components/SectionQuestionBankTab';
import SectionExamsTab from '@/features/admin/components/SectionExamsTab';
import SectionHomeworksTab from '@/features/admin/components/SectionHomeworksTab';

const tabs = [
    {
        name: 'ملخص القسم',
        key: 'summary',
        icon: 'solar:info-circle-bold-duotone',
    },
    {
        name: 'ملخص الطلاب',
        key: 'students-summary',
        icon: 'solar:users-group-rounded-bold-duotone',
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
        name: 'الامتحانات',
        key: 'exams',
        icon: 'solar:document-text-bold-duotone',
    },
    {
        name: 'الواجبات',
        key: 'homeworks',
        icon: 'solar:clipboard-list-bold-duotone',
    },
    {
        name: 'بنك الأسئلة',
        key: 'question-bank',
        icon: 'solar:question-circle-bold-duotone',
    },
    {
        name: 'الاعدادات',
        key: 'settings',
        icon: 'solar:settings-bold-duotone',
    },
];

export default function SectionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [section, setSection] = useState<ISectionAdmin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSectionDetails();
        }
    }, [id]);

    const fetchSectionDetails = async () => {
        try {
            setLoading(true);
            const response = await sectionsService.getSectionById(id!);
            if (response.success && response.data?.section) {
                setSection(response.data.section as any);
            } else {
                toast({
                    status: 'error',
                    description: 'فشل في جلب بيانات القسم',
                });
                navigate('/admin/courses');
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات القسم',
            });
            navigate('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSection = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return;
        }

        try {
            await sectionsService.deleteSection(id!);
            toast({
                status: 'success',
                description: 'تم حذف القسم بنجاح',
            });
            navigate('/admin/courses');
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف القسم',
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

    if (!section) {
        return (
            <Box p={6}>
                <Text>القسم غير موجود</Text>
            </Box>
        );
    }

    const getStatusBadge = () => {
        if (section.status === 'active') {
            return <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">نشط</Badge>;
        }
        if (section.status === 'draft') {
            return <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">مسودة</Badge>;
        }
        return <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">معطل</Badge>;
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }}>
            {/* Header Section */}
            <Box
                bgGradient="linear(to-r, purple.500, purple.600)"
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
                            {/* Section Image/Icon */}
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
                                {section.poster ? (
                                    <Image
                                        src={getImageUrl(section.poster)}
                                        alt={section.title}
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
                                            icon="solar:folder-bold-duotone"
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
                                        {section.title}
                                    </Text>
                                    {getStatusBadge()}
                                </HStack>
                                {section.description && (
                                    <Text
                                        fontSize="sm"
                                        color="whiteAlpha.900"
                                        noOfLines={2}
                                        maxW={{ base: '100%', md: '600px' }}
                                    >
                                        {section.description}
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
                                            {section.teacher.fullName}
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="whiteAlpha.800">
                                        {section.educationalLevel.name || section.educationalLevel.shortName}
                                    </Text>
                                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="bold">
                                        {section.finalPrice === 0 ? 'مجاني' : `EGP ${section.finalPrice.toLocaleString()}`}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>

                        {/* Actions */}
                        <HStack spacing={2}>
                            <Button
                                bg="white"
                                color="purple.600"
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
                    {section.statistics && (
                        <HStack spacing={4} flexWrap="wrap">
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:users-group-rounded-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {section.statistics.subscribersCount} مشترك
                                </Text>
                            </HStack>
                            <HStack spacing={2} bg="whiteAlpha.200" px={3} py={2} borderRadius="lg" backdropFilter="blur(10px)">
                                <Icon
                                    icon="solar:book-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }}
                                />
                                <Text fontSize="sm" color="white" fontWeight="medium">
                                    {section.statistics.coursesCount} كورس
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
                                    {section.statistics.lessonsCount} درس
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
                                    {section.statistics.examsCount} امتحان
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
                                    {section.statistics.homeworksCount} واجب
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
                    colorScheme="purple"
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
                                background: 'linear-gradient(90deg, #805AD5 0%, #6B46C1 100%)',
                                borderRadius: '10px',
                            },
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.key}
                                _selected={{
                                    bg: 'purple.500',
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
                        {/* Section Summary Tab */}
                        <TabPanel px={0}>
                            <SectionSummaryTab section={section} />
                        </TabPanel>

                        {/* Student Summary Tab */}
                        <TabPanel px={0}>
                            <SectionStudentsTab sectionId={id!} />
                        </TabPanel>

                        {/* Courses Tab */}
                        <TabPanel px={0}>
                            <SectionCoursesTab sectionId={id!} />
                        </TabPanel>

                        {/* Lessons Tab */}
                        <TabPanel px={0}>
                            <SectionLessonsTab sectionId={id!} />
                        </TabPanel>

                        {/* Exams Tab */}
                        <TabPanel px={0}>
                            <SectionExamsTab sectionId={id!} />
                        </TabPanel>

                        {/* Homeworks Tab */}
                        <TabPanel px={0}>
                            <SectionHomeworksTab sectionId={id!} />
                        </TabPanel>

                        {/* Question Bank Tab */}
                        <TabPanel px={0}>
                            <SectionQuestionBankTab sectionId={id!} />
                        </TabPanel>

                        {/* Settings Tab */}
                        <TabPanel px={0}>
                            <Stack spacing={4}>
                                <Card borderRadius="xl" border="1px" borderColor="gray.200" p={4}>
                                    <Text fontSize="sm" color="gray.600" mb={4}>
                                        تعديل بيانات القسم - قريباً
                                    </Text>
                                </Card>
                                <DeleteSectionCard onDelete={handleDeleteSection} />
                            </Stack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Card>
        </Stack>
    );
}

// Section Summary Tab Component
function SectionSummaryTab({ section }: { section: ISectionAdmin }) {
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
                                    {section.statistics?.subscribersCount || 0}
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
                                    عدد الكورسات
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                    {section.statistics?.coursesCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="blue.50">
                                <Icon
                                    icon="solar:book-bold-duotone"
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
                                    عدد الدروس
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                    {section.statistics?.lessonsCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="green.50">
                                <Icon
                                    icon="solar:play-circle-bold-duotone"
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
                                    EGP {section.statistics?.totalRevenue.toLocaleString() || 0}
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

            {/* Section Details */}
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
                                        تفاصيل القسم
                                    </Text>
                                </HStack>

                                <Divider />

                                {/* Title */}
                                <Box
                                    p={3}
                                    borderRadius="lg"
                                    bg="purple.50"
                                    borderLeft="4px solid"
                                    borderLeftColor="purple.500"
                                >
                                    <Text fontSize="xs" color="purple.600" fontWeight="medium" mb={1}>
                                        العنوان
                                    </Text>
                                    <Text color="gray.800" fontWeight="medium" fontSize="md">
                                        {section.title || '-'}
                                    </Text>
                                </Box>

                                {/* Description */}
                                {section.description && (
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
                                            {section.description}
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
                                            EGP {section.price.toLocaleString()}
                                        </Text>
                                    </Box>

                                    {section.discount > 0 && (
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
                                                {section.discount}%
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
                                            {section.educationalLevel.name || section.educationalLevel.shortName}
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
                                            {new Date(section.createdAt).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                    </Box>
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>
                </Stack>

                {/* Sidebar */}
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
                                        معلومات إضافية
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
                                        icon="solar:info-circle-bold-duotone"
                                        width="48"
                                        height="48"
                                        style={{ color: 'var(--chakra-colors-gray-300)' }}
                                    />
                                    <Text color="gray.500" fontSize="sm" mt={2}>
                                        معلومات إضافية عن القسم
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

// Delete Section Card Component
function DeleteSectionCard({ onDelete }: { onDelete: () => void }) {
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
                            حذف القسم؟
                        </Text>
                        <Text color="red.600" fontSize="sm">
                            في حالة حذف القسم بالخطأ أو بالقصد لن يعد لديك أي صلاحية لاسترجاع البيانات من حيث محتوى القسم،
                            الكورسات، الدروس، المشتركين. وفي هذه الحالة سيتضطر في إنشاء قسم جديد لرفعه على المنصة من جديد.
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
                    حذف القسم
                </Button>
            </Stack>
        </Card>
    );
}

