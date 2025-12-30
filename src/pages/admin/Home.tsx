import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Stack,
  SimpleGrid,
  VStack,
  Text,
  Badge,
  Avatar,
  Grid,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';
import { getImageUrl } from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

interface AdminSummary {
  total_teachers: number;
  total_students: number;
  total_courses: number;
  active_subscriptions: number;
  total_transactions_amount: number;
  total_lessons: number;
  total_exams: number;
  total_homeworks: number;
  total_lesson_views: number;
  total_revenue: number;
  top_teachers: Array<{
    id: string;
    name: string;
    subject: string;
    courses_count: number;
    students_count: number;
  }>;
  recent_teachers: Array<{
    id: string;
    name: string;
    subject: string;
    photo: string;
    is_active: boolean;
    created_at: string;
  }>;
  // Backward compatibility
  total_courses_count?: number;
  total_users_count?: number;
  total_students_count?: number;
  total_subscriptions_count?: number;
  total_sales_amount?: number;
  total_subscriptions_amount?: number;
  top_ten_courses?: Array<{
    id: string;
    title: string;
    subscribers_count: number;
    teacher: string;
  }>;
  recent_users?: Array<{
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getAdminSummary();
        setSummary(response.data.result);
      } catch (err: any) {
        console.error('Failed to fetch admin summary', err);
        setError(err?.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Enhanced stats with gradients and better icons
  const stats = [
    {
      label: 'إجمالي المعلمين',
      value: loading ? '...' : String(summary?.total_teachers || 0),
      icon: 'solar:user-id-bold-duotone',
      color: 'purple',
      gradient: 'linear(to-r, purple.500, purple.600)',
      link: '/admin/teachers',
      change: '+5',
      changeType: 'increase',
    },
    {
      label: 'إجمالي الطلاب',
      value: loading ? '...' : String(summary?.total_students || 0),
      icon: 'solar:users-group-two-rounded-line-duotone',
      color: 'blue',
      gradient: 'linear(to-r, blue.500, blue.600)',
      link: '/admin/students',
      change: '+12',
      changeType: 'increase',
    },
    {
      label: 'إجمالي الكورسات',
      value: loading ? '...' : String(summary?.total_courses || 0),
      icon: 'solar:inbox-archive-bold',
      color: 'green',
      gradient: 'linear(to-r, green.500, green.600)',
      link: '/admin/courses',
      change: '+3',
      changeType: 'increase',
    },
    {
      label: 'الاشتراكات النشطة',
      value: loading ? '...' : String(summary?.active_subscriptions || 0),
      icon: 'solar:check-circle-bold-duotone',
      color: 'teal',
      gradient: 'linear(to-r, teal.500, teal.600)',
      link: '/admin/subscriptions',
      change: '+8',
      changeType: 'increase',
    },
    {
      label: 'إجمالي الإيرادات',
      value: loading
        ? '...'
        : `EGP ${Number(summary?.total_revenue || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      icon: 'solar:dollar-minimalistic-bold-duotone',
      color: 'orange',
      gradient: 'linear(to-r, orange.500, orange.600)',
      link: '/admin/transactions',
      change: '+15%',
      changeType: 'increase',
    },
    {
      label: 'المعاملات المالية',
      value: loading
        ? '...'
        : `EGP ${Number(summary?.total_transactions_amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      icon: 'solar:wallet-money-bold-duotone',
      color: 'cyan',
      gradient: 'linear(to-r, cyan.500, cyan.600)',
      link: '/admin/transactions',
      change: '+10%',
      changeType: 'increase',
    },
  ];

  const quickActions = [
    {
      title: 'إدارة المعلمين',
      description: 'عرض وإدارة جميع المعلمين على المنصة',
      icon: 'solar:user-id-bold-duotone',
      color: 'purple',
      link: '/admin/teachers',
      gradient: 'linear(to-r, purple.500, purple.600)',
    },
    {
      title: 'جميع الطلاب',
      description: 'عرض وإدارة جميع الطلاب على المنصة',
      icon: 'solar:users-group-two-rounded-line-duotone',
      color: 'blue',
      link: '/admin/students',
      gradient: 'linear(to-r, blue.500, blue.600)',
    },
    {
      title: 'التقارير والإحصائيات',
      description: 'عرض تقارير شاملة للمنصة مع رسوم بيانية',
      icon: 'solar:chart-2-bold-duotone',
      color: 'green',
      link: '/admin/reports',
      gradient: 'linear(to-r, green.500, green.600)',
    },
    {
      title: 'المعاملات المالية',
      description: 'عرض جميع المعاملات المالية والمدفوعات',
      icon: 'solar:wallet-money-bold-duotone',
      color: 'orange',
      link: '/admin/transactions',
      gradient: 'linear(to-r, orange.500, orange.600)',
    },
  ];

  const topTeachers = summary?.top_teachers || [];
  const recentTeachers = summary?.recent_teachers || [];

  // Loading state
  if (loading) {
    return (
      <VStack p={6} spacing={4} justify="center" minH="400px">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text color="gray.600" fontSize="lg">
          جاري تحميل البيانات...
        </Text>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Stack p={6} spacing={6}>
        <Alert status="error" borderRadius="lg" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Welcome Section with Gradient */}
      <Box
        bgGradient="linear(to-r, purple.500, purple.600)"
        borderRadius="xl"
        p={{ base: 4, md: 6 }}
        color="white"
        boxShadow="xl"
      >
        <HStack spacing={4} flexWrap="wrap">
          <VStack align="start" spacing={2} flex={1} minW="200px">
            <Text fontSize="xs" color="whiteAlpha.800" fontWeight="medium">
              مرحباً بك
            </Text>
            <Heading as="h1" size={{ base: 'md', md: 'lg' }} color="white">
              لوحة تحكم المدير العام
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="whiteAlpha.900">
              إدارة شاملة للمنصة التعليمية - المعلمين، الطلاب، والإعدادات
            </Text>
          </VStack>
          <Box
            display={{ base: 'none', md: 'block' }}
            p={4}
            bg="whiteAlpha.200"
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <Icon icon="solar:widget-5-bold-duotone" width="80" height="80" style={{ color: 'white' }} />
          </Box>
        </HStack>
      </Box>

      {/* Main Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing={{ base: 4, md: 6 }}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            bgGradient={stat.gradient}
            color="white"
            borderRadius="xl"
            boxShadow="lg"
            _hover={{
              transform: 'translateY(-8px)',
              boxShadow: '2xl',
              cursor: 'pointer',
            }}
            transition="all 0.3s"
            onClick={() => navigate(stat.link)}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative background */}
            <Box
              position="absolute"
              top="-50%"
              right="-50%"
              width="200%"
              height="200%"
              bg="whiteAlpha.100"
              borderRadius="full"
              opacity={0.3}
            />

            <CardBody position="relative" zIndex={1}>
              <VStack spacing={3} align="start">
                <HStack spacing={3} justify="space-between" w="full">
                  <Box
                    p={3}
                    borderRadius="xl"
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                  >
                    <Icon icon={stat.icon} width="28" height="28" style={{ color: 'white' }} />
                  </Box>
                  {stat.change && (
                    <Badge
                      bg="whiteAlpha.300"
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                    >
                      {stat.changeType === 'increase' ? '↑' : '↓'} {stat.change}
                    </Badge>
                  )}
                </HStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="whiteAlpha.800" fontWeight="medium">
                    {stat.label}
                  </Text>
                  <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="white">
                    {stat.value}
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Two Column Layout: Quick Actions & Top Teachers */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 4, md: 6 }}>
        {/* Quick Actions */}
        <Card borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.100">
          <CardBody>
            <HStack mb={4} justify="space-between">
              <Heading as="h2" size="md" color="gray.800">
                الإجراءات السريعة
              </Heading>
              <Icon
                icon="solar:bolt-bold-duotone"
                width="24"
                height="24"
                style={{ color: 'var(--chakra-colors-purple-500)' }}
              />
            </HStack>
            <Stack spacing={3}>
              {quickActions.map((action, index) => (
                <Box
                  key={index}
                  p={4}
                  borderRadius="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{
                    bg: `${action.color}.50`,
                    borderColor: `${action.color}.300`,
                    transform: 'translateX(-4px)',
                    cursor: 'pointer',
                    boxShadow: 'md',
                  }}
                  transition="all 0.3s"
                  onClick={() => navigate(action.link)}
                >
                  <HStack spacing={4}>
                    <Box
                      p={2.5}
                      borderRadius="lg"
                      bgGradient={action.gradient}
                      boxShadow="sm"
                    >
                      <Icon
                        icon={action.icon}
                        width="24"
                        height="24"
                        style={{ color: 'white' }}
                      />
                    </Box>
                    <Stack spacing={0.5} flex={1}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.800">
                        {action.title}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {action.description}
                      </Text>
                    </Stack>
                    <Icon
                      icon="solar:arrow-left-line-duotone"
                      width="20"
                      height="20"
                      style={{ color: 'var(--chakra-colors-gray-400)' }}
                    />
                  </HStack>
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>

        {/* Top Teachers */}
        <Card borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.100">
          <CardBody>
            <HStack mb={4} justify="space-between">
              <Heading as="h2" size="md" color="gray.800">
                أفضل المعلمين
              </Heading>
              <Icon
                icon="solar:cup-star-bold-duotone"
                width="24"
                height="24"
                style={{ color: 'var(--chakra-colors-yellow-500)' }}
              />
            </HStack>
            <Stack spacing={3}>
              {topTeachers.length > 0 ? (
                topTeachers.slice(0, 5).map((teacher: any, index: number) => (
                  <HStack
                    key={teacher.id || index}
                    p={3}
                    borderRadius="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{
                      bg: 'purple.50',
                      borderColor: 'purple.300',
                      cursor: 'pointer',
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                  >
                    <HStack spacing={3} flex={1}>
                      <Badge
                        colorScheme={
                          index === 0
                            ? 'yellow'
                            : index === 1
                              ? 'gray'
                              : index === 2
                                ? 'orange'
                                : 'gray'
                        }
                        fontSize="sm"
                        p={1}
                        borderRadius="md"
                        minW="32px"
                        textAlign="center"
                      >
                        #{index + 1}
                      </Badge>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="sm" color="gray.800">
                          {teacher.name || 'غير معروف'}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {teacher.subject || ''}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold" color="purple.600">
                        {teacher.students_count || 0} طالب
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {teacher.courses_count || 0} كورس
                      </Text>
                    </VStack>
                  </HStack>
                ))
              ) : (
                <Text color="gray.500" textAlign="center" py={4} fontSize="sm">
                  لا يوجد معلمين بعد
                </Text>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Additional Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
        <Card
          borderRadius="xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => navigate('/admin/courses')}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  إجمالي الدروس
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  {summary?.total_lessons || 0}
                </Text>
              </VStack>
              <Box p={3} borderRadius="lg" bg="cyan.50">
                <Icon
                  icon="solar:play-circle-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'var(--chakra-colors-cyan-500)' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => navigate('/admin/exams')}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  إجمالي الامتحانات
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  {summary?.total_exams || 0}
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

        <Card
          borderRadius="xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => navigate('/admin/homeworks')}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  إجمالي الواجبات
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  {summary?.total_homeworks || 0}
                </Text>
              </VStack>
              <Box p={3} borderRadius="lg" bg="yellow.50">
                <Icon
                  icon="solar:clipboard-list-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'var(--chakra-colors-yellow-500)' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => navigate('/admin/reports')}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  إجمالي المشاهدات
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  {summary?.total_lesson_views
                    ? Number(summary.total_lesson_views).toLocaleString()
                    : 0}
                </Text>
              </VStack>
              <Box p={3} borderRadius="lg" bg="pink.50">
                <Icon
                  icon="solar:eye-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'var(--chakra-colors-pink-500)' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Recent Teachers */}
      {recentTeachers.length > 0 && (
        <Card borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.100">
          <CardBody>
            <HStack mb={4} justify="space-between">
              <Heading as="h2" size="md" color="gray.800">
                المعلمين الجدد
              </Heading>
              <Icon
                icon="solar:user-plus-bold-duotone"
                width="24"
                height="24"
                style={{ color: 'var(--chakra-colors-green-500)' }}
              />
            </HStack>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
              {recentTeachers.slice(0, 5).map((teacher: any, index: number) => (
                <Box
                  key={teacher.id || index}
                  p={4}
                  borderRadius="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  textAlign="center"
                  _hover={{
                    bg: 'purple.50',
                    borderColor: 'purple.300',
                    cursor: 'pointer',
                    transform: 'translateY(-4px)',
                    boxShadow: 'md',
                  }}
                  transition="all 0.3s"
                  onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                >
                  <Avatar
                    size="md"
                    name={teacher.name}
                    src={teacher.photo ? getImageUrl(teacher.photo) : undefined}
                    mb={2}
                    bg="purple.500"
                    color="white"
                  />
                  <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
                    {teacher.name || 'غير معروف'}
                  </Text>
                  <Text fontSize="xs" color="gray.600" noOfLines={1} mt={1}>
                    {teacher.subject || ''}
                  </Text>
                  <Badge
                    mt={2}
                    colorScheme={teacher.is_active ? 'green' : 'gray'}
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {teacher.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
