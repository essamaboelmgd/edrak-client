import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  SimpleGrid,
  VStack,
  Flex,
  Badge,
  Avatar,
  Center,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';
import { getImageUrl } from '@/lib/axios';

interface AdminSummary {
  total_courses_count: number;
  total_users_count: number;
  total_students_count: number;
  total_subscriptions_count: number;
  total_sales_amount: number;
  total_subscriptions_amount: number;
  total_transactions_amount: number;
  top_ten_courses: Array<{
    id: string;
    title: string;
    subscribers_count: number;
    teacher: string;
  }>;
  recent_users: Array<{
    id: string;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    mobile: string;
    photo: string;
    created_at: string;
  }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await userService.getAdminSummary();
        setSummary(response.data.result);
      } catch (error) {
        console.error('Failed to fetch admin summary', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const stats = [
    {
      title: 'إجمالي الكورسات',
      value: summary?.total_courses_count || 0,
      icon: 'solar:book-bold-duotone',
      color: 'purple',
      gradient: 'linear(135deg, purple.400, purple.600)',
      bgGradient: 'linear(to-br, purple.50, purple.100)',
    },
    {
      title: 'إجمالي المدرسين',
      value: summary?.total_users_count || 0,
      icon: 'solar:users-group-two-rounded-bold-duotone',
      color: 'blue',
      gradient: 'linear(135deg, blue.400, blue.600)',
      bgGradient: 'linear(to-br, blue.50, blue.100)',
    },
    {
      title: 'إجمالي الطلاب',
      value: summary?.total_students_count || 0,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'green',
      gradient: 'linear(135deg, green.400, green.600)',
      bgGradient: 'linear(to-br, green.50, green.100)',
    },
    {
      title: 'عدد الاشتراكات',
      value: summary?.total_subscriptions_count || 0,
      icon: 'solar:confetti-minimalistic-bold',
      color: 'orange',
      gradient: 'linear(135deg, orange.400, orange.600)',
      bgGradient: 'linear(to-br, orange.50, orange.100)',
    },
    {
      title: 'مبيعات المرفقات',
      value: formatCurrency(summary?.total_sales_amount || 0),
      icon: 'solar:document-text-bold-duotone',
      color: 'teal',
      gradient: 'linear(135deg, teal.400, teal.600)',
      bgGradient: 'linear(to-br, teal.50, teal.100)',
    },
    {
      title: 'إجمالي اشتراكات الكورسات',
      value: formatCurrency(summary?.total_subscriptions_amount || 0),
      icon: 'solar:playlist-bold-duotone',
      color: 'cyan',
      gradient: 'linear(135deg, cyan.400, cyan.600)',
      bgGradient: 'linear(to-br, cyan.50, cyan.100)',
    },
    {
      title: 'إجمالي المعاملات المالية',
      value: formatCurrency(summary?.total_transactions_amount || 0),
      icon: 'solar:card-bold-duotone',
      color: 'pink',
      gradient: 'linear(135deg, pink.400, pink.600)',
      bgGradient: 'linear(to-br, pink.50, pink.100)',
    },
  ];

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, red.600 0%, orange.500 50%, pink.400 100%)"
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
        >
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon icon="solar:chart-2-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                لوحة التحكم
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              لوحة تحكم المسؤول
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              مرحباً، {user?.firstName || 'المسؤول'} - نظرة شاملة على إحصائيات المنصة
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Statistics Cards */}
      <Box>
        <HStack spacing={2} mb={4}>
          <Icon
            icon="solar:graph-up-bold-duotone"
            width="24"
            height="24"
            style={{ color: 'var(--chakra-colors-purple-500)' }}
          />
          <Heading size="md" color="gray.800">
            الإحصائيات الرئيسية
          </Heading>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor="gray.200"
              bgGradient={stat.bgGradient}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              <CardBody>
                <HStack spacing={4} justify="space-between">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.700`}>
                      {typeof stat.value === 'string' ? (
                        stat.value
                      ) : (
                        stat.value.toLocaleString('ar-EG')
                      )}
                    </Text>
                    <Text color="gray.600" fontSize="sm" fontWeight="medium">
                      {stat.title}
                    </Text>
                  </VStack>
                  <Center
                    w={14}
                    h={14}
                    borderRadius="xl"
                    bgGradient={stat.gradient}
                    color="white"
                    boxShadow="md"
                  >
                    <Icon icon={stat.icon} width="28" height="28" />
                  </Center>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Top Courses Chart */}
      <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
        <CardBody>
          <HStack spacing={2} mb={4}>
            <Icon
              icon="solar:chart-2-bold-duotone"
              width="24"
              height="24"
              style={{ color: 'var(--chakra-colors-purple-500)' }}
            />
            <Heading size="md" color="gray.800">
              أكثر الكورسات نشاطاً
            </Heading>
          </HStack>
          <Stack>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Stack
                  key={index}
                  direction={{ base: 'column', lg: 'row' }}
                  alignItems={{ base: 'flex-start', lg: 'center' }}
                >
                  <Skeleton
                    w={{ base: undefined, lg: (4 / 12) * 100 + '%' }}
                    bg="gray.50"
                    h={4}
                    rounded={2}
                  />
                  <Skeleton
                    w={{ base: '100%', lg: (8 / 12) * 100 + '%' }}
                    bg="gray.50"
                    h={4}
                    rounded={2}
                  />
                </Stack>
              ))
            ) : summary?.top_ten_courses && summary.top_ten_courses.length > 0 ? (
              <Box position="relative" h="400px" w="100%">
                <SimpleGrid columns={1} spacing={2}>
                  {summary.top_ten_courses.map((course, idx) => {
                    const maxSubscribers = Math.max(
                      ...summary.top_ten_courses.map((c) => c.subscribers_count),
                      1
                    );
                    const percentage = (course.subscribers_count / maxSubscribers) * 100;
                    return (
                      <Box key={course.id} mb={2}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium" color="gray.700" noOfLines={1}>
                            {course.title}
                          </Text>
                          <Badge colorScheme="purple" borderRadius="full" px={2}>
                            {course.subscribers_count} مشترك
                          </Badge>
                        </HStack>
                        <Box
                          w="100%"
                          h="8"
                          bg="gray.100"
                          borderRadius="md"
                          overflow="hidden"
                          position="relative"
                        >
                          <Box
                            w={`${percentage}%`}
                            h="100%"
                            bgGradient="linear(135deg, purple.400, purple.600)"
                            borderRadius="md"
                            transition="width 0.5s ease"
                          />
                        </Box>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          المدرس: {course.teacher}
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            ) : (
              <Center py={12}>
                <VStack spacing={4}>
                  <Box mx="auto" color="gray">
                    <Icon icon="solar:inbox-archive-bold" width="60" height="60" />
                  </Box>
                  <Heading as="h2" fontSize="large" fontWeight="bold" textAlign="center">
                    لا توجد بيانات للعرض
                  </Heading>
                </VStack>
              </Center>
            )}
          </Stack>
        </CardBody>
      </Card>

      {/* Recent Students Table */}
      <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
        <CardBody>
          <HStack spacing={2} mb={4}>
            <Icon
              icon="solar:users-group-two-rounded-bold-duotone"
              width="24"
              height="24"
              style={{ color: 'var(--chakra-colors-purple-500)' }}
            />
            <Heading size="md" color="gray.800">
              أحدث الطلاب
            </Heading>
          </HStack>
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.700" fontWeight="semibold">#</Th>
                  <Th color="gray.700" fontWeight="semibold">الاسم</Th>
                  <Th color="gray.700" fontWeight="semibold">البريد الإلكتروني</Th>
                  <Th color="gray.700" fontWeight="semibold">رقم الموبايل</Th>
                  <Th color="gray.700" fontWeight="semibold">تاريخ الانضمام</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Td key={index}>
                            <Skeleton h={4} rounded={3} />
                          </Td>
                        ))}
                      </Tr>
                    ))
                  : summary?.recent_users && summary.recent_users.length > 0
                    ? summary.recent_users.map((user) => (
                        <Tr
                          key={user.id}
                          _hover={{ bg: 'gray.50' }}
                          transition="background-color 0.2s"
                        >
                          <Td>
                            <Badge colorScheme="purple" borderRadius="full" px={2}>
                              {user.id}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                name={user.full_name}
                                src={user.photo ? getImageUrl(user.photo) : undefined}
                                size="sm"
                              />
                              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                {user.full_name}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600" noOfLines={1}>
                              {user.email || 'غير محدد'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600" noOfLines={1}>
                              {user.mobile || 'غير محدد'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="md">
                              {new Date(user.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Badge>
                          </Td>
                        </Tr>
                      ))
                    : !loading && (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            لا توجد بيانات للعرض
                          </Td>
                        </Tr>
                      )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Stack>
  );
}
