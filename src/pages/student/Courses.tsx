import { useState, useCallback, useRef, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import {
  Box,
  Card,
  CardBody,
  Center,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  VStack,
  Flex,
  FormControl,
  Skeleton,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { useAllCourses, useMyCourses, usePlatformSections } from '@/features/student/hooks/useStudentCourses';
import { CourseCard } from '@/features/student/components/CourseCard';
import { axiosInstance } from '@/lib/axios';

export default function StudentCourses() {
  const [params, setParams] = useSearchParams({ page: '1' });
  const [searchTerm, setSearchTerm] = useState(params.get('search') || '');
  const [educationalLevel, setEducationalLevel] = useState(params.get('educationalLevel') || '');
  const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch data
  const { data: allCoursesData, isLoading: loadingCourses } = useAllCourses();
  const { data: myCoursesData, isLoading: loadingMyCourses } = useMyCourses();
  const { data: sectionsData, isLoading: loadingSections } = usePlatformSections();

  const allCourses = allCoursesData?.courses || [];
  const myCourses = myCoursesData?.courses || [];
  const sections = sectionsData?.sections || [];

  // Fetch educational levels
  useEffect(() => {
    const fetchEducationalLevels = async () => {
      try {
        const response = await axiosInstance.get('/educational-levels');
        const educationalLevelsData = response.data?.data?.educationalLevels;
        let levels: any[] = [];

        if (educationalLevelsData) {
          if (educationalLevelsData.primary) {
            levels = [...levels, ...educationalLevelsData.primary];
          }
          if (educationalLevelsData.preparatory) {
            levels = [...levels, ...educationalLevelsData.preparatory];
          }
          if (educationalLevelsData.secondary) {
            levels = [...levels, ...educationalLevelsData.secondary];
          }
        } else {
          levels = response.data?.data?.educationalLevels ||
            response.data?.data ||
            response.data?.educationalLevels ||
            response.data || [];
          levels = Array.isArray(levels) ? levels : [];
        }

        setEducationalLevels(levels);
      } catch (error) {
        console.error('Failed to fetch educational levels:', error);
        setEducationalLevels([]);
      }
    };
    fetchEducationalLevels();
  }, []);

  // Filter courses
  const filteredCourses = allCourses.filter((course: any) => {
    const matchesSearch = !searchTerm || course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !educationalLevel || course.educationalLevel?._id === educationalLevel;
    return matchesSearch && matchesLevel;
  });

  const total = filteredCourses.length;
  const isLoading = loadingCourses || loadingMyCourses || loadingSections;

  // Calculate stats
  const stats = {
    total,
    enrolled: myCourses.length,
    available: total - myCourses.length,
    free: filteredCourses.filter((c: any) => !c.price || c.price === 0).length,
    paid: filteredCourses.filter((c: any) => c.price && c.price > 0).length,
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(params);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1');
      setParams(newParams);
    }, 500);
  }, [params, setParams]);

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, blue.500 0%, teal.400 50%, purple.500 100%)"
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
              <Icon icon="solar:book-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                استكشف الكورسات
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              جميع الكورسات
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض {total} كورس متاح على المنصة
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, sm: 3, lg: 5 }} spacing={{ base: 4, md: 6 }}>
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  إجمالي الكورسات
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {stats.total}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كورس متاح
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, blue.400, blue.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:book-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  مسجل
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {stats.enrolled}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كورس مسجل
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, green.400, green.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  متاح
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  {stats.available}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كورس متاح
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, blue.400, blue.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:gift-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  مجاني
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                  {stats.free}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كورس مجاني
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, purple.400, purple.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:gift-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  مدفوع
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                  {stats.paid}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كورس مدفوع
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, orange.400, orange.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:wallet-money-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Search Filters */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
        <CardBody>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            align={{ base: 'stretch', md: 'center' }}
            wrap="wrap"
          >
            <InputGroup flex={1} minW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon icon="solar:magnifer-bold-duotone" width="18" height="18" />
              </InputLeftElement>
              <Input
                type="search"
                placeholder="اكتب عنوان \ وصف الكورس هنا .."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                bg="white"
              />
            </InputGroup>

            <FormControl minWidth={{ base: '100%', md: '200px' }}>
              <Select
                placeholder="جميع المراحل الدراسية"
                bg="white"
                value={educationalLevel}
                onChange={(e) => {
                  setEducationalLevel(e.target.value);
                  const newParams = new URLSearchParams(params);
                  if (e.target.value) {
                    newParams.set('educationalLevel', e.target.value);
                  } else {
                    newParams.delete('educationalLevel');
                  }
                  newParams.set('page', '1');
                  setParams(newParams);
                }}
              >
                {educationalLevels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name || level.nameArabic || level.title || level._id}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
        </CardBody>
      </Card>

      {/* Results Count & View Toggle */}
      <HStack justify="space-between" px={2}>
        <Text fontSize="sm" color="gray.600">
          {searchTerm || educationalLevel 
            ? `عرض ${filteredCourses.length} نتيجة بحث`
            : `عرض ${sections.length} قسم تعليمي`
          }
        </Text>
      </HStack>

      {/* Main Content Area */}
      {isLoading ? (
        <Grid templateColumns="repeat(auto-fill, minmax(17rem, 1fr))" gap={3}>
          {Array.from({ length: 8 }).fill(0).map((_, index) => (
            <GridItem key={index}>
              <Card borderRadius="xl" border="1px" borderColor="gray.200">
                <CardBody>
                  <VStack spacing={3}>
                    <Skeleton h="150px" w="100%" borderRadius="lg" />
                    <Skeleton h="20px" w="100%" />
                    <Skeleton h="16px" w="80%" />
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      ) : (searchTerm || educationalLevel) ? (
        /* Filtered View - Flat Grid */
        <Grid templateColumns="repeat(auto-fill, minmax(17rem, 1fr))" gap={3}>
           {filteredCourses.length === 0 ? (
            <Box gridColumn="1 / -1">
              <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="xl">
                <CardBody>
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Box>
                        <Icon icon="solar:inbox-archive-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                      </Box>
                      <VStack spacing={2}>
                        <Heading as="h2" fontSize="xl" fontWeight="bold" textAlign="center">
                          لا توجد نتائج
                        </Heading>
                        <Text textAlign="center" color="gray.500" fontSize="sm">
                          لم يتم العثور على كورسات تطابق بحثك
                        </Text>
                      </VStack>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>
            </Box>
          ) : (
            filteredCourses.map((course: any) => (
              <GridItem key={course._id || course.id}>
                <Box
                  transition="transform 0.3s ease"
                  _hover={{ transform: 'translateY(-8px)' }}
                >
                  <CourseCard course={course} />
                </Box>
              </GridItem>
            ))
          )}
        </Grid>
      ) : (
        /* Default View - Grouped by Sections */
        <Stack spacing={8}>
          {sections.length === 0 ? (
             <Card borderRadius="xl" border="1px" borderColor="gray.200" bg="white" boxShadow="xl">
                <CardBody>
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Box>
                        <Icon icon="solar:inbox-archive-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                      </Box>
                      <VStack spacing={2}>
                        <Heading as="h2" fontSize="xl" fontWeight="bold" textAlign="center">
                          لا توجد أقسام
                        </Heading>
                        <Text textAlign="center" color="gray.500" fontSize="sm">
                          لا توجد أقسام تعليمية متاحة حالياً
                        </Text>
                      </VStack>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>
          ) : (
            sections.map((section: any) => (
              <Box key={section._id}>
                <HStack mb={4} align="center" spacing={3}>
                   <Box p={2} borderRadius="lg" bg="blue.50" color="blue.600">
                      <Icon icon="solar:folder-with-files-bold-duotone" width={24} height={24} />
                   </Box>
                   <Heading as="h3" fontSize="xl" color="gray.700">
                     {section.name || section.title}
                   </Heading>
                   <Spacer />
                   <Badge colorScheme="blue" borderRadius="full" px={3}>
                      {section.courses?.length || 0} كورس
                   </Badge>
                </HStack>
                {(!section.courses || section.courses.length === 0) ? (
                    <Text color="gray.500" fontSize="sm" fontStyle="italic">لا توجد كورسات في هذا القسم</Text>
                ) : (
                  <Grid templateColumns="repeat(auto-fill, minmax(17rem, 1fr))" gap={3}>
                    {section.courses.map((course: any) => (
                      <GridItem key={course._id || course.id}>
                        <Box
                          transition="transform 0.3s ease"
                          _hover={{ transform: 'translateY(-8px)' }}
                        >
                          <CourseCard course={course} />
                        </Box>
                      </GridItem>
                    ))}
                  </Grid>
                )}
                <Divider mt={8} borderColor="gray.200" />
              </Box>
            ))
          )}
        </Stack>
      )}
    </Stack>
  );
}
