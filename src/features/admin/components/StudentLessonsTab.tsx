import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
    Box,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { studentsService } from '../services/studentsService';

interface StudentLessonsTabProps {
    studentId: string;
}

export default function StudentLessonsTab({ studentId }: StudentLessonsTabProps) {
    const navigate = useNavigate();
    const toast = useToast();
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
    }, [studentId]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentLessons(studentId);
            if (response.success && response.data) {
                setLessons(response.data.lessons || []);
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

    if (loading) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <Stack spacing={4}>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height="100px" borderRadius="lg" />
                        ))}
                    </Stack>
                </CardBody>
            </Card>
        );
    }

    if (lessons.length === 0) {
        return (
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
                                الدروس المشترك بها
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {lessons.length} درس
                            </Text>
                        </Stack>
                    </HStack>
                </Stack>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {lessons.map((lesson) => (
                    <Card
                        key={lesson._id}
                        borderRadius="xl"
                        border="1px"
                        borderColor="gray.200"
                        boxShadow="sm"
                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)', cursor: 'pointer' }}
                        transition="all 0.2s"
                        onClick={() => navigate(`/admin/lessons/${lesson._id}`)}
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
                                    <Text fontSize="xs" color="gray.500">
                                        {new Date(lesson.subscriptionDate).toLocaleDateString('ar-EG')}
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                    {lesson.title}
                                </Text>
                                {lesson.course && (
                                    <Text fontSize="xs" color="gray.500">
                                        {lesson.course.title}
                                    </Text>
                                )}
                                <HStack justify="space-between" fontSize="xs" color="gray.500">
                                    <HStack spacing={1}>
                                        <Icon icon="solar:clock-circle-bold-duotone" width="14" height="14" />
                                        <Text>{lesson.duration || 0} دقيقة</Text>
                                    </HStack>
                                    <Text fontWeight="medium" color="green.600">
                                        EGP {lesson.finalPrice?.toLocaleString() || 0}
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

