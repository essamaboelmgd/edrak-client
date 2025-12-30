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
import { Link } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function TeacherHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await userService.getTeacherStatistics();
          setStatistics(response.data.statistics);
        } catch (error) {
          console.error('Failed to fetch teacher stats', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  const stats = [
    {
      title: 'إجمالي الكورسات',
      value: statistics?.totalCourses || 0,
      icon: 'solar:book-bold-duotone',
      color: 'green',
      gradient: 'linear(135deg, green.400, green.600)',
      bgGradient: 'linear(to-br, green.50, green.100)',
    },
    {
      title: 'إجمالي الطلاب',
      value: statistics?.totalStudents || 0,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'blue',
      gradient: 'linear(135deg, blue.400, blue.600)',
      bgGradient: 'linear(to-br, blue.50, blue.100)',
    },
    {
      title: 'إجمالي الأرباح',
      value: formatCurrency(statistics?.totalRevenue || 0),
      icon: 'solar:dollar-bold-duotone',
      color: 'green',
      gradient: 'linear(135deg, green.400, green.600)',
      bgGradient: 'linear(to-br, green.50, green.100)',
    },
    {
      title: 'إجمالي الدروس',
      value: statistics?.totalLessons || 0,
      icon: 'solar:document-text-bold-duotone',
      color: 'orange',
      gradient: 'linear(135deg, orange.400, orange.600)',
      bgGradient: 'linear(to-br, orange.50, orange.100)',
    },
    {
      title: 'عدد الاشتراكات',
      value: statistics?.totalSubscriptions || 0,
      icon: 'solar:confetti-minimalistic-bold',
      color: 'purple',
      gradient: 'linear(135deg, purple.400, purple.600)',
      bgGradient: 'linear(to-br, purple.50, purple.100)',
    },
    {
      title: 'أقسام الكورسات',
      value: statistics?.totalCourseSections || 0,
      icon: 'solar:layers-bold-duotone',
      color: 'teal',
      gradient: 'linear(135deg, teal.400, teal.600)',
      bgGradient: 'linear(to-br, teal.50, teal.100)',
    },
  ];

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, green.600 0%, teal.500 50%, cyan.400 100%)"
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
              مرحباً، {user?.firstName || 'مدرس'} 👋
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              إليك ملخص لما يحدث في منصتك اليوم
            </Text>
          </VStack>
          <Button
            as={Link}
            to="/teacher/courses"
            bg="white"
            color="green.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            leftIcon={<Icon icon="solar:book-plus-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
          >
            إضافة كورس جديد
          </Button>
        </Flex>
      </Box>

      {/* Statistics Cards */}
      <Box>
        <HStack spacing={2} mb={4}>
          <Icon
            icon="solar:graph-up-bold-duotone"
            width="24"
            height="24"
            style={{ color: 'var(--chakra-colors-green-500)' }}
          />
          <Heading size="md" color="gray.800">
            الإحصائيات الرئيسية
          </Heading>
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
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

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Revenue Chart */}
        <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
          <CardBody>
            <HStack spacing={2} mb={4}>
              <Icon
                icon="solar:chart-2-bold-duotone"
                width="24"
                height="24"
                style={{ color: 'var(--chakra-colors-green-500)' }}
              />
              <Heading size="md" color="gray.800">
                الإيرادات (آخر 30 يوم)
              </Heading>
            </HStack>
            {loading ? (
              <Skeleton h="300px" rounded="xl" />
            ) : statistics?.revenueByDay && statistics.revenueByDay.length > 0 ? (
              <Box
                h="300px"
                w="100%"
                bgGradient="linear(to-b, green.50, white)"
                rounded="xl"
                border="1px"
                borderColor="green.100"
                p={4}
                display="flex"
                alignItems="flex-end"
                justifyContent="space-between"
                gap={2}
                overflowX="auto"
              >
                {statistics.revenueByDay.map((day: any, i: number) => {
                  const maxRevenue = Math.max(
                    ...statistics.revenueByDay.map((d: any) => d.revenue),
                    1
                  );
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <VStack key={i} spacing={1} minW="40px" position="relative" group>
                      <Box
                        w="full"
                        bgGradient="linear(to-t, green.500, green.600)"
                        roundedTop="md"
                        opacity={0.8}
                        _groupHover={{ opacity: 1, transform: 'scaleY(1.1)' }}
                        transition="all 0.3s"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${day.day}: ${formatCurrency(day.revenue)} (${day.count} اشتراك)`}
                        cursor="pointer"
                      />
                      <Text fontSize="xs" color="gray.500" transform="rotate(-45deg)" whiteSpace="nowrap">
                        {day.day.split(' ')[0]}
                      </Text>
                    </VStack>
                  );
                })}
              </Box>
            ) : (
              <Center py={12}>
                <VStack spacing={4}>
                  <Icon icon="solar:chart-2-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                  <Text color="gray.500">لا توجد بيانات إيرادات بعد</Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Last New Students & Summary */}
        <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
          <CardBody>
            <HStack spacing={2} mb={4}>
              <Icon
                icon="solar:users-group-rounded-bold-duotone"
                width="24"
                height="24"
                style={{ color: 'var(--chakra-colors-green-500)' }}
              />
              <Heading size="md" color="gray.800">
                آخر الطلاب الجدد
              </Heading>
            </HStack>

            {loading ? (
              <Stack spacing={4}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} h="60px" rounded="lg" />
                ))}
              </Stack>
            ) : statistics?.lastNewStudents && statistics.lastNewStudents.length > 0 ? (
              <Stack spacing={3} mb={6}>
                {statistics.lastNewStudents.slice(0, 5).map((student: any, idx: number) => (
                  <HStack
                    key={idx}
                    p={3}
                    rounded="lg"
                    border="1px"
                    borderColor="gray.100"
                    _hover={{ borderColor: 'green.200', bg: 'green.50' }}
                    transition="all 0.2s"
                  >
                    <Avatar
                      name={student.fullName}
                      size="sm"
                      bgGradient="linear(135deg, green.400, green.600)"
                    />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="bold" color="gray.800" noOfLines={1}>
                        {student.fullName}
                      </Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {student.email}
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {new Date(student.subscribedAt).toLocaleDateString('ar-EG')} -{' '}
                        {formatCurrency(student.amount)}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </Stack>
            ) : (
              <Center py={8}>
                <VStack spacing={2}>
                  <Icon icon="solar:users-group-rounded-bold-duotone" width="32" height="32" style={{ color: '#718096' }} />
                  <Text fontSize="sm" color="gray.500">
                    لا يوجد طلاب جدد
                  </Text>
                </VStack>
              </Center>
            )}

            <Box pt={6} borderTop="1px" borderColor="gray.100">
              <Heading size="sm" mb={4} color="gray.700">
                ملخص سريع
              </Heading>
              <Stack spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    إجمالي الاشتراكات
                  </Text>
                  <Text fontWeight="bold" color="gray.800">
                    {statistics?.totalSubscriptions || 0}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    إجمالي الأقسام
                  </Text>
                  <Text fontWeight="bold" color="gray.800">
                    {statistics?.totalCourseSections || 0}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    إجمالي المشاهدات
                  </Text>
                  <Text fontWeight="bold" color="gray.800">
                    {statistics?.courses?.reduce(
                      (sum: number, course: any) => sum + (course.statistics?.totalViews || 0),
                      0
                    ) || 0}
                  </Text>
                </HStack>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Courses List */}
      {statistics?.courses && statistics.courses.length > 0 && (
        <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
          <CardBody>
            <HStack spacing={2} mb={4}>
              <Icon
                icon="solar:book-bold-duotone"
                width="24"
                height="24"
                style={{ color: 'var(--chakra-colors-green-500)' }}
              />
              <Heading size="md" color="gray.800">
                كورساتي
              </Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {statistics.courses.map((course: any) => (
                <Card
                  key={course.courseId}
                  as={Link}
                  to={`/teacher/courses/${course.courseId}/builder`}
                  p={4}
                  rounded="xl"
                  border="1px"
                  borderColor="gray.100"
                  _hover={{ borderColor: 'green.200', shadow: 'md' }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <HStack justify="space-between" mb={3}>
                    <Heading as="h4" fontSize="lg" color="gray.800" noOfLines={1}>
                      {course.courseName}
                    </Heading>
                    <Badge colorScheme="green" borderRadius="full" px={2}>
                      {course.statistics?.totalSubscribers || 0} مشترك
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={2} spacing={3} mt={3}>
                    <HStack spacing={2}>
                      <Icon icon="solar:document-text-bold-duotone" width="16" height="16" style={{ color: '#3182CE' }} />
                      <Text fontSize="sm" color="gray.600">
                        {course.statistics?.totalLessons || 0} درس
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon icon="solar:layers-bold-duotone" width="16" height="16" style={{ color: '#38A169' }} />
                      <Text fontSize="sm" color="gray.600">
                        {course.statistics?.totalLessonSections || 0} قسم
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon icon="solar:document-bold-duotone" width="16" height="16" style={{ color: '#DD6B20' }} />
                      <Text fontSize="sm" color="gray.600">
                        {course.statistics?.totalExams || 0} امتحان
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon icon="solar:dollar-bold-duotone" width="16" height="16" style={{ color: '#38A169' }} />
                      <Text fontSize="sm" color="gray.600">
                        {formatCurrency(course.statistics?.totalRevenue || 0)}
                      </Text>
                    </HStack>
                  </SimpleGrid>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
