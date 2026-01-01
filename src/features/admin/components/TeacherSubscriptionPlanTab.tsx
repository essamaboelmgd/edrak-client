import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Badge,
    Skeleton,
    SkeletonText,
    useToast,
    Heading,
    Box,
    SimpleGrid,
    Divider,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { teachersService } from '../services/teachersService';

interface TeacherSubscriptionPlanTabProps {
    teacherId: string;
}

export default function TeacherSubscriptionPlanTab({ teacherId }: TeacherSubscriptionPlanTabProps) {
    const toast = useToast();
    const [subscription, setSubscription] = useState<any>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptionPlan();
    }, [teacherId]);

    const fetchSubscriptionPlan = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherSubscriptionPlan(teacherId);
            if (response.success && response.data) {
                setSubscription(response.data.subscription);
                setSelectedFeatures(response.data.selectedFeatures || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب خطة الاشتراك',
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
                        <Skeleton height="200px" borderRadius="lg" />
                        <SkeletonText noOfLines={5} />
                    </Stack>
                </CardBody>
            </Card>
        );
    }

    if (!subscription) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:card-send-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا يوجد اشتراك نشط
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
                                icon="solar:card-send-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-purple-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                خطة الاشتراك الحالية
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                تفاصيل الاشتراك والميزات المختارة
                            </Text>
                        </Stack>
                    </HStack>
                </Stack>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                معلومات الاشتراك
                            </Text>
                            <Divider />
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">الخطة:</Text>
                                <Badge colorScheme="purple" fontSize="sm">
                                    {subscription.plan || 'غير محدد'}
                                </Badge>
                            </HStack>
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">السعر الأساسي:</Text>
                                <Text fontWeight="bold" color="blue.600">
                                    EGP {subscription.basePrice?.toLocaleString() || 0}
                                </Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">سعر الميزات:</Text>
                                <Text fontWeight="bold" color="green.600">
                                    EGP {subscription.featuresPrice?.toLocaleString() || 0}
                                </Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">السعر الإجمالي:</Text>
                                <Text fontWeight="bold" color="purple.600" fontSize="lg">
                                    EGP {subscription.totalPrice?.toLocaleString() || 0}
                                </Text>
                            </HStack>
                            {subscription.discount > 0 && (
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">الخصم:</Text>
                                    <Text fontWeight="bold" color="orange.600">
                                        {subscription.discount}%
                                    </Text>
                                </HStack>
                            )}
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">السعر النهائي:</Text>
                                <Text fontWeight="bold" color="green.600" fontSize="lg">
                                    EGP {subscription.finalPrice?.toLocaleString() || 0}
                                </Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">تاريخ البدء:</Text>
                                <Text fontSize="sm" color="gray.700">
                                    {new Date(subscription.startDate).toLocaleDateString('ar-EG')}
                                </Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">تاريخ الانتهاء:</Text>
                                <Text fontSize="sm" color="gray.700">
                                    {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
                                </Text>
                            </HStack>
                            {subscription.daysRemaining !== undefined && (
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">الأيام المتبقية:</Text>
                                    <Badge colorScheme={subscription.daysRemaining > 7 ? 'green' : 'orange'} fontSize="sm">
                                        {subscription.daysRemaining} يوم
                                    </Badge>
                                </HStack>
                            )}
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">الحالة:</Text>
                                <Badge colorScheme={subscription.isActive ? 'green' : 'gray'} fontSize="sm">
                                    {subscription.isActive ? 'نشط' : 'غير نشط'}
                                </Badge>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                الميزات المختارة
                            </Text>
                            <Divider />
                            {selectedFeatures.length === 0 ? (
                                <VStack py={8} spacing={2}>
                                    <Icon
                                        icon="solar:star-bold-duotone"
                                        width="48"
                                        height="48"
                                        style={{ color: 'var(--chakra-colors-gray-300)' }}
                                    />
                                    <Text fontSize="sm" color="gray.500">
                                        لا توجد ميزات مختارة
                                    </Text>
                                </VStack>
                            ) : (
                                <Stack spacing={3}>
                                    {selectedFeatures.map((feature: any, index: number) => (
                                        <Box
                                            key={index}
                                            p={3}
                                            borderRadius="lg"
                                            bg="gray.50"
                                            border="1px"
                                            borderColor="gray.200"
                                        >
                                            <HStack justify="space-between">
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="medium" fontSize="sm">
                                                        {feature.feature?.nameArabic || feature.feature?.name || 'ميزة'}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {new Date(feature.addedAt).toLocaleDateString('ar-EG')}
                                                    </Text>
                                                </VStack>
                                                <Text fontWeight="bold" color="green.600" fontSize="sm">
                                                    EGP {feature.price?.toLocaleString() || 0}
                                                </Text>
                                            </HStack>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </VStack>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </Stack>
    );
}

