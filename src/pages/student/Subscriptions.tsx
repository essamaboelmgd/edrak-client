import { Box, Container, Heading, Text, VStack, SimpleGrid, Card, CardBody, Badge, Stack, Flex, Icon } from '@chakra-ui/react';
import { useStudentSubscriptions } from '@/features/student/hooks/useStudentCourses';
import { IStudentSubscription, IMySubscriptionsResponse } from '@/features/student/types';
import { Calendar, CreditCard, AlertCircle } from 'lucide-react';

const StudentSubscriptions = () => {
    const { data, isLoading } = useStudentSubscriptions();

    if (isLoading) return <Box p={8}>جاري التحميل...</Box>;

    const subscriptions = data as unknown as IMySubscriptionsResponse;
    const hasSubscriptions = subscriptions && (
        subscriptions.courses?.length > 0 ||
        subscriptions.lessons?.length > 0 ||
        subscriptions.courseSections?.length > 0 ||
        subscriptions.lessonSections?.length > 0
    );

    const SubscriptionCard = ({ sub, title }: { sub: IStudentSubscription, title: string }) => (
        <Card key={sub._id} borderRadius="xl" overflow="hidden" variant="outline">
            <Box bg={sub.status === 'active' ? 'green.500' : 'gray.400'} h="4px" />
            <CardBody>
                <Stack spacing={4}>
                    <Flex justify="space-between" align="start">
                        <Badge colorScheme={sub.status === 'active' ? 'green' : 'gray'} fontSize="sm" px={2} py={1}>
                            {sub.status === 'active' ? 'نشط' : 'منتهي'}
                        </Badge>
                        <Text fontWeight="bold" fontSize="lg">
                            {sub.finalPrice} ج.م
                        </Text>
                    </Flex>

                    <Box>
                        <Heading size="md" mb={2} noOfLines={2}>
                            {title}
                        </Heading>
                        <Flex align="center" gap={2} mt={2} color="gray.500" fontSize="sm">
                            <Icon as={CreditCard} size={14} />
                            <Text>{sub.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : sub.paymentMethod}</Text>
                        </Flex>
                    </Box>

                    <Box bg="gray.50" p={3} borderRadius="md" fontSize="sm">
                        <Flex justify="space-between" mb={1}>
                            <Flex align="center" gap={1}>
                                <Icon as={Calendar} size={14} />
                                <Text>تاريخ البدء:</Text>
                            </Flex>
                            <Text fontWeight="medium">{new Date(sub.startDate).toLocaleDateString('ar-EG')}</Text>
                        </Flex>
                        <Flex justify="space-between">
                            <Flex align="center" gap={1}>
                                <Icon as={AlertCircle} size={14} />
                                <Text>تاريخ الانتهاء:</Text>
                            </Flex>
                            <Text fontWeight="medium">{sub.endDate ? new Date(sub.endDate).toLocaleDateString('ar-EG') : 'مفتوح'}</Text>
                        </Flex>
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    );

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>اشتراكاتي</Heading>
                    <Text color="gray.600">سجل بجميع اشتراكاتك الحالية والسابقة</Text>
                </Box>

                {!hasSubscriptions ? (
                    <Box textAlign="center" py={10} bg="gray.50" borderRadius="lg">
                        <Text color="gray.500">لا توجد اشتراكات حتى الآن</Text>
                    </Box>
                ) : (
                    <VStack spacing={8} align="stretch">
                        {subscriptions.courses?.length > 0 && (
                            <Box>
                                <Heading size="md" mb={4}>الكورسات ({subscriptions.courses.length})</Heading>
                                <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                                    {subscriptions.courses.map((item) => (
                                        <SubscriptionCard key={item.subscription._id} sub={item.subscription} title={item.content.title} />
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}
                        
                        {subscriptions.courseSections?.length > 0 && (
                            <Box>
                                <Heading size="md" mb={4}>أقسام الكورسات ({subscriptions.courseSections.length})</Heading>
                                <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                                    {subscriptions.courseSections.map((item) => (
                                        <SubscriptionCard key={item.subscription._id} sub={item.subscription} title={item.content.name} />
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}

                        {subscriptions.lessons?.length > 0 && (
                            <Box>
                                <Heading size="md" mb={4}>الدروس ({subscriptions.lessons.length})</Heading>
                                <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                                    {subscriptions.lessons.map((item) => (
                                        <SubscriptionCard key={item.subscription._id} sub={item.subscription} title={item.content.title} />
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}

                         {subscriptions.lessonSections?.length > 0 && (
                            <Box>
                                <Heading size="md" mb={4}>أقسام الدروس ({subscriptions.lessonSections.length})</Heading>
                                <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                                    {subscriptions.lessonSections.map((item) => (
                                        <SubscriptionCard key={item.subscription._id} sub={item.subscription} title={item.content.name} />
                                    ))}
                                </SimpleGrid>
                            </Box>
                        )}
                    </VStack>
                )}
            </VStack>
        </Container>
    );
};

export default StudentSubscriptions;
