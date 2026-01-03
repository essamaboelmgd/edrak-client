import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Badge,
    SimpleGrid,
    Skeleton,
    useToast,
    Heading,
    Image,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { getImageUrl } from '@/lib/axios';
import { teachersService } from '../services/teachersService';

interface TeacherCoursesTabProps {
    teacherId: string;
}

export default function TeacherCoursesTab({ teacherId }: TeacherCoursesTabProps) {
    const navigate = useNavigate();
    const toast = useToast();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, [teacherId]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherCourses(teacherId);
            if (response.success && response.data) {
                setCourses(response.data.courses || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الكورسات',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <Stack spacing={4}>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height="120px" borderRadius="lg" />
                        ))}
                    </Stack>
                </CardBody>
            </Card>
        );
    }

    if (courses.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:book-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد كورسات
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        );
    }

    return (
        <Stack spacing={4}>
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
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
                                icon="solar:book-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-blue-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                الكورسات
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {courses.length} كورس
                            </Text>
                        </Stack>
                    </HStack>
                </Stack>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {courses.map((course) => (
                    <Card
                        key={course._id}
                        borderRadius="xl"
                        border="1px"
                        borderColor="gray.200"
                        boxShadow="sm"
                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)', cursor: 'pointer' }}
                        transition="all 0.2s"
                        onClick={() => navigate(`/admin/courses/${course._id}`)}
                    >
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                {course.poster && (
                                    <Box
                                        w="100%"
                                        h="120px"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        bg="gray.100"
                                    >
                                        <Image
                                            src={getImageUrl(course.poster)}
                                            alt={course.title}
                                            w="100%"
                                            h="100%"
                                            objectFit="cover"
                                        />
                                    </Box>
                                )}
                                <HStack justify="space-between">
                                    <Badge
                                        colorScheme={course.status === 'active' ? 'green' : 'gray'}
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="full"
                                    >
                                        {course.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500">
                                        {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                    {course.title}
                                </Text>
                                {course.description && (
                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                        {course.description}
                                    </Text>
                                )}
                                <HStack justify="space-between" fontSize="xs" color="gray.500">
                                    {course.educationalLevel && (
                                        <Text>{course.educationalLevel.name || course.educationalLevel.shortName}</Text>
                                    )}
                                    <Text fontWeight="medium" color="green.600">
                                        EGP {course.finalPrice?.toLocaleString() || 0}
                                    </Text>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>
        </Stack>
    );
}

