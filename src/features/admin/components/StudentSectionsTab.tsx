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

interface StudentSectionsTabProps {
    studentId: string;
}

export default function StudentSectionsTab({ studentId }: StudentSectionsTabProps) {
    const navigate = useNavigate();
    const toast = useToast();
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSections();
    }, [studentId]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentSections(studentId);
            if (response.success && response.data) {
                setSections(response.data.sections || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الأقسام',
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

    if (sections.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:folder-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد أقسام
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
                            bg="purple.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:folder-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-purple-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                الأقسام المشترك بها
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {sections.length} قسم
                            </Text>
                        </Stack>
                    </HStack>
                </Stack>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {sections.map((section) => (
                    <Card
                        key={section._id}
                        borderRadius="xl"
                        border="1px"
                        borderColor="gray.200"
                        boxShadow="sm"
                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)', cursor: 'pointer' }}
                        transition="all 0.2s"
                        onClick={() => navigate(`/admin/sections/${section._id}`)}
                    >
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                    <Badge
                                        colorScheme={section.status === 'active' ? 'green' : 'gray'}
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="full"
                                    >
                                        {section.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500">
                                        {new Date(section.subscriptionDate).toLocaleDateString('ar-EG')}
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                    {section.title}
                                </Text>
                                {section.teacher && (
                                    <Text fontSize="xs" color="gray.500">
                                        {section.teacher.fullName}
                                    </Text>
                                )}
                                <Text fontWeight="medium" color="green.600" fontSize="sm">
                                    EGP {section.finalPrice?.toLocaleString() || 0}
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>
        </Stack>
    );
}

