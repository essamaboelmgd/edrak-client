import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Grid,
  GridItem,
  HStack,
  Image,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';
import { useAllCourses, useMyCourses, useStudentSubscriptions } from '@/features/student/hooks/useStudentCourses';
import { getImageUrl } from '@/lib/axios';
import moment from 'moment';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  
  // Fetch data using hooks
  const { data: allCoursesData, isLoading: loadingCourses } = useAllCourses();
  const { data: myCoursesData, isLoading: loadingMyCourses } = useMyCourses();
  const { isLoading: loadingSubscriptions } = useStudentSubscriptions();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const summaryRes = await userService.getStudentSummary();
        setSummary(summaryRes.data?.result);
      } catch (error) {
        console.error('Failed to fetch student summary', error);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, []);

  const loading = loadingSummary || loadingCourses || loadingMyCourses || loadingSubscriptions;
  const myCourses = myCoursesData?.courses || [];
  const allCourses = allCoursesData?.courses || [];
  
  // Get popular courses (top 3 by subscribers or views)
  const popularCourses = allCourses
    .sort((a: any, b: any) => (b.stats?.totalStudents || 0) - (a.stats?.totalStudents || 0))
    .slice(0, 3);

  if (loading) {
    return (
      <Center h="80vh">
        <Text>جاري التحميل...</Text>
      </Center>
    );
  }

  return (
    <Stack
      p={{ base: 4, md: 6 }}
      spacing={8}
      maxW="1400px"
      mx="auto"
      dir="rtl"
    >
      {/* Welcome Banner Section */}
      <Box
        bgGradient="linear(135deg, blue.500, teal.400, purple.500)"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 12 }}
        borderRadius="2xl"
        position="relative"
        overflow="hidden"
        boxShadow="2xl"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          bgGradient: 'radial(circle at top right, whiteAlpha.200, transparent)',
        }}
      >
        <HStack spacing={6} position="relative" zIndex={1}>
          <Stack flex={1} spacing={4}>
            <Text
              color="white"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              textShadow="0 2px 10px rgba(0,0,0,0.2)"
            >
              مرحباً، {user?.firstName || 'طالب'} 👋
            </Text>
            <Text
              color="whiteAlpha.900"
              fontSize={{ base: "md", md: "lg" }}
              maxW="600px"
              lineHeight="tall"
            >
              استمتع بتجربة تعليمية متميزة! اشترك في الكورسات واحصل على خصومات تصل إلى 80%
            </Text>
            <HStack mt={2} spacing={3} flexWrap="wrap">
              <Button
            onClick={() => navigate('/student/courses')}
                bg="white"
                color="blue.600"
                size="lg"
                borderRadius="full"
                boxShadow="xl"
                fontWeight="bold"
                px={8}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "2xl",
                }}
                transition="all 0.2s"
                leftIcon={<Icon icon="solar:book-bookmark-bold" width={20} height={20} />}
              >
                تصفح الكورسات
              </Button>
            </HStack>
          </Stack>
          <Image
            src="/home-banner-illustration.avif"
            width={{ base: 0, lg: 300 }}
            display={{ base: "none", lg: "block" }}
            mixBlendMode="screen"
            opacity={0.9}
            flexShrink={0}
            objectFit="contain"
            fallbackSrc="https://via.placeholder.com/300"
          />
        </HStack>
      </Box>

      {/* Statistics Cards Section */}
      <Box>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb={4}
          color="gray.800"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon icon="solar:chart-2-bold" width={28} height={28} style={{ color: 'var(--chakra-colors-blue-500)' }} />
          إحصائياتك
        </Text>
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 4 }}
          gap={4}
        >
          <Card
            bgGradient="linear(135deg, blue.500, blue.600)"
            color="white"
            borderRadius="xl"
            overflow="hidden"
            position="relative"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "2xl",
            }}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                <Center
                  w={14}
                  h={14}
                  borderRadius="xl"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                >
                  <Icon
                    icon="solar:inbox-archive-bold"
                    width="28"
                    height="28"
                  />
                </Center>
                <Stat flex={1}>
                  <StatNumber fontSize="3xl" fontWeight="bold">
                    {summary?.total_subscriptions_count || 0}
                  </StatNumber>
                  <StatLabel fontSize="sm" opacity={0.9}>
                    الاشتراكات
                  </StatLabel>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bgGradient="linear(135deg, teal.500, teal.600)"
            color="white"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "2xl",
            }}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                <Center
                  w={14}
                  h={14}
                  borderRadius="xl"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                >
                  <Icon
                    icon="solar:document-add-bold"
                    width="28"
                    height="28"
                  />
                </Center>
                <Stat flex={1}>
                  <StatNumber fontSize="3xl" fontWeight="bold">
                    {summary?.total_attachments || 0}
                  </StatNumber>
                  <StatLabel fontSize="sm" opacity={0.9}>
                    المذكرات
                  </StatLabel>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bgGradient="linear(135deg, purple.500, purple.600)"
            color="white"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "2xl",
            }}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                <Center
                  w={14}
                  h={14}
                  borderRadius="xl"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                >
                  <Icon
                    icon="solar:play-circle-bold"
                    width="28"
                    height="28"
                  />
                </Center>
                <Stat flex={1}>
                  <StatNumber fontSize="3xl" fontWeight="bold">
                    {summary?.total_lessons_views || 0}
                  </StatNumber>
                  <StatLabel fontSize="sm" opacity={0.9}>
                    المشاهدات
                  </StatLabel>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bgGradient="linear(135deg, orange.500, orange.600)"
            color="white"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "2xl",
            }}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                <Center
                  w={14}
                  h={14}
                  borderRadius="xl"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                >
                  <Icon
                    icon="solar:wallet-money-bold"
                    width="28"
                    height="28"
                  />
                </Center>
                <Stat flex={1}>
                  <StatNumber fontSize="2xl" fontWeight="bold">
                    {formatCurrency(summary?.wallet_amount?.amount || summary?.wallet_amount || 0)}
                  </StatNumber>
                  <StatLabel fontSize="sm" opacity={0.9}>
                    الرصيد
                  </StatLabel>
                </Stat>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Recent Views Section */}
      {!!summary?.recent_viewed_lessons?.length && (
        <Box>
          <HStack mb={4} justify="space-between" align="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="gray.800"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon icon="solar:history-bold" width={28} height={28} style={{ color: 'var(--chakra-colors-purple-500)' }} />
              آخر المشاهدات
            </Text>
            <Button
                onClick={() => navigate('/student/courses')}
              variant="ghost"
              colorScheme="blue"
              rightIcon={<Icon icon="solar:arrow-left-line-duotone" width={20} height={20} />}
            >
                عرض الكل
            </Button>
          </HStack>
          <Grid
            templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
            gap={4}
          >
            {summary.recent_viewed_lessons.map((item: any) => (
              <GridItem key={item.id}>
                <Card
                  as={Link}
                  to={`/student/courses/${item.subscription_id || item.lesson?.lesson_id}`}
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.3s"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "xl",
                    borderColor: "blue.300",
                  }}
                >
                  <CardBody p={4}>
                    <HStack spacing={4} align="start">
                      <Image
                        width={60}
                        height={60}
                        flexShrink={0}
                        fallbackSrc="/placeholder.png"
                        src={item.lesson?.poster ? getImageUrl(item.lesson.poster) : undefined}
                        borderRadius="lg"
                        objectFit="cover"
                      />
                      <Stack flex={1} spacing={2}>
                        <Text
                          noOfLines={2}
                          fontWeight="bold"
                          fontSize="md"
                          color="gray.800"
                        >
                          {item.lesson?.title || "-"}
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize="xs"
                        >
                          {moment(item.updated_at).fromNow()}
                        </Text>
                        <Box>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.600" fontWeight="medium">
                              التقدم
                            </Text>
                            <Text fontSize="xs" color="gray.600" fontWeight="medium">
                              {item.views || 0} / {item.total_views || 0}
                            </Text>
                          </HStack>
                          <Progress
                            value={((item.views || 0) / (item.total_views || 0)) * 100}
                            borderRadius="full"
                            size="sm"
                            colorScheme="blue"
                          />
                        </Box>
                      </Stack>
                    </HStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      {/* My Subscriptions Section */}
      {!!myCourses.length && (
        <Box>
          <HStack mb={4} justify="space-between" align="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="gray.800"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon icon="solar:bookmark-bold" width={28} height={28} style={{ color: 'var(--chakra-colors-teal-500)' }} />
              اشتراكاتي
            </Text>
            <Button
              onClick={() => navigate('/student/courses')}
              variant="ghost"
              colorScheme="teal"
              rightIcon={<Icon icon="solar:arrow-left-line-duotone" width={20} height={20} />}
            >
              عرض الكل
            </Button>
          </HStack>
          <Grid
            templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
            gap={4}
          >
            {myCourses.slice(0, 3).map((course: any) => (
              <GridItem key={course._id || course.id}>
                <Card
                  as={Link}
                  to={`/student/courses/${course._id || course.id}`}
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "xl",
                  }}
                >
                  <CardBody p={4}>
                    <Stack spacing={3}>
                      <Image
                        src={course.poster?.url || (course.poster ? getImageUrl(course.poster) : undefined)}
                        alt={course.title}
                        borderRadius="lg"
                        h="150px"
                        objectFit="cover"
                        fallbackSrc="/placeholder.png"
                      />
                      <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                        {course.title}
                      </Text>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      {/* Popular Courses Section */}
      {!!popularCourses.length && (
        <Box>
          <HStack mb={4} justify="space-between" align="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="gray.800"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon icon="solar:fire-bold" width={28} height={28} style={{ color: 'var(--chakra-colors-orange-500)' }} />
              أشهر الكورسات
            </Text>
            <Button
              onClick={() => navigate('/student/courses')}
              variant="ghost"
              colorScheme="orange"
              rightIcon={<Icon icon="solar:arrow-left-line-duotone" width={20} height={20} />}
            >
              عرض كل الكورسات
            </Button>
          </HStack>
          <Grid
            templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
            gap={4}
          >
            {popularCourses.map((course: any) => (
              <GridItem key={course._id || course.id}>
                <Card
                  as={Link}
                  to={`/student/courses/${course._id || course.id}`}
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "xl",
                  }}
                >
                  <CardBody p={4}>
                    <Stack spacing={3}>
                      <Image
                        src={course.poster?.url || (course.poster ? getImageUrl(course.poster) : undefined)}
                        alt={course.title}
                        borderRadius="lg"
                        h="150px"
                        objectFit="cover"
                        fallbackSrc="/placeholder.png"
                      />
                      <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                        {course.title}
                      </Text>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}
    </Stack>
  );
}
