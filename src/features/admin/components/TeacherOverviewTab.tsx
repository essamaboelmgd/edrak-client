import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    SimpleGrid,
    Skeleton,
    SkeletonText,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { teachersService } from '../services/teachersService';

interface TeacherOverviewTabProps {
    teacherId: string;
}

export default function TeacherOverviewTab({ teacherId }: TeacherOverviewTabProps) {
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, [teacherId]);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherOverview(teacherId);
            if (response.success && response.data?.overview) {
                setOverview(response.data.overview);
            }
        } catch (error) {
            console.error('Error fetching overview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Stack spacing={4}>
                <Skeleton height="200px" />
                <SkeletonText noOfLines={10} />
            </Stack>
        );
    }

    if (!overview) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <Text>لا توجد بيانات</Text>
                </CardBody>
            </Card>
        );
    }

    return (
        <Stack spacing={{ base: 4, md: 6 }}>
            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
                <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="sm">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    عدد الكورسات
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                    {overview.coursesCount || 0}
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
                                    {overview.lessonsCount || 0}
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
                                    عدد الأقسام
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                    {overview.sectionsCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="purple.50">
                                <Icon
                                    icon="solar:folder-bold-duotone"
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
                                    عدد الطلاب
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                                    {overview.studentsCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="orange.50">
                                <Icon
                                    icon="solar:users-group-rounded-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-orange-500)' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Additional Stats */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
                <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="sm">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    عدد الواجبات
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                                    {overview.homeworksCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="teal.50">
                                <Icon
                                    icon="solar:clipboard-list-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-teal-500)' }}
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
                                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                                    {overview.examsCount || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="red.50">
                                <Icon
                                    icon="solar:document-text-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-red-500)' }}
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
                                <Text fontSize="2xl" fontWeight="bold" color="cyan.600">
                                    EGP {overview.totalRevenue?.toLocaleString() || 0}
                                </Text>
                            </VStack>
                            <Box p={3} borderRadius="lg" bg="cyan.50">
                                <Icon
                                    icon="solar:wallet-money-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'var(--chakra-colors-cyan-500)' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </Stack>
    );
}

