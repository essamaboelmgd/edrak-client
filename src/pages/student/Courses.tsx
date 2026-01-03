import {
  Box,
  Card,
  CardBody,
  Center,
  Spinner,
  Stack,
  Text,
  VStack,
  Flex,
  FormControl,
  SimpleGrid,
  Grid,
  GridItem,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack 
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Components
import CoursesHeader from "@/features/student/components/CoursesHeader";
import SectionHeader from "@/features/student/components/SectionHeader";
import CourseCategorySection from "@/features/student/components/CourseCategorySection";
import CourseCard from '@/features/student/components/CourseCard';

// Hooks & Services
import {
  useAllCourses,
  useMyCourses,
  useStudentSubscriptions
} from "@/features/student/hooks/useStudentCourses";
import { studentService } from "@/features/student/services/studentService";

export default function StudentCourses() {
  const [params, setParams] = useSearchParams({ page: '1' });
  const [searchTerm, setSearchTerm] = useState(params.get('search') || '');
  const [educationalLevel, setEducationalLevel] = useState(params.get('educationalLevel') || '');
  
  // Handlers for search/filters
  const handleSearch = (value: string) => {
      setSearchTerm(value);
      const newParams = new URLSearchParams(params);
      if (value) newParams.set('search', value);
      else newParams.delete('search');
      newParams.set('page', '1');
      setParams(newParams);
  };

  const handleLevelChange = (value: string) => {
      setEducationalLevel(value);
      const newParams = new URLSearchParams(params);
      if (value) newParams.set('educationalLevel', value);
      else newParams.delete('educationalLevel');
      newParams.set('page', '1');
      setParams(newParams);
  };

  const handleClearFilters = () => {
      setSearchTerm("");
      setEducationalLevel("");
      setParams({ page: "1" });
  };

  // Fetch data
  const { data: myCoursesData, isLoading: myCoursesLoading } = useMyCourses({
    page: "1",
    limit: "1000",
    ...(searchTerm && { search: searchTerm }),
    ...(educationalLevel && { educational_level: educationalLevel }),
  });

  const { data: allCoursesData, isLoading: allCoursesLoading } = useAllCourses({
    page: "1",
    limit: "1000",
    status: "active",
    ...(searchTerm && { search: searchTerm }),
    ...(educationalLevel && { educational_level: educationalLevel }),
  });

  const { data: subscriptionsData } = useStudentSubscriptions();

  // Fetch auxiliary data for filters
  const { data: levelsData } = useQuery({
      queryKey: ['educational-levels'],
      queryFn: () => studentService.getEducationalLevels(),
  });
  const educationalLevels = levelsData?.levels || [];

  // Helper: Group courses by category
  const groupCoursesByCategory = (courses: any[]) => {
      const grouped = new Map<string, any[]>();

      courses.forEach((course) => {
          const catId = course.educationalLevel?._id || "uncategorized";
          if (!grouped.has(catId)) {
              grouped.set(catId, []);
          }
          grouped.get(catId)!.push(course);
      });

      return grouped;
  };

  // Process courses
  const { enrolledCourses, availableCourses, categoriesMap, filteredCourses } = useMemo(() => {
    const myCourses = (myCoursesData?.courses || []) as any[];
    const allCourses = (allCoursesData?.courses || []) as any[];
    
    // Safety check for subscriptions data structure
    const subs = subscriptionsData || {};
    const subCourses = subs.courses || [];
    const subLessons = subs.lessons || [];
    const subLessonSections = subs.lessonSections || [];
    const subCourseSections = subs.courseSections || [];

    // 1. Direct Course Subscriptions
    const fullCourseIds = new Set(subCourses.map((s: any) => s.content?._id || s.content));

    // 2. Granular Subscriptions (Lesson/LessonSection) -> implied access to course wrapper
    const partialCourseIds = new Set<string>();
    subLessons.forEach((s: any) => {
        const cId = s.content?.course;
        if (cId) partialCourseIds.add(cId);
    });
    subLessonSections.forEach((s: any) => {
        const cId = s.content?.course;
        if (cId) partialCourseIds.add(cId);
    });

    // 3. Course Section Subscriptions (Bundle) -> implied access to child courses
    const subscribedSectionIds = new Set(subCourseSections.map((s: any) => s.content?._id));

    // Helper to check access
    const hasAccess = (course: any) => {
        if (fullCourseIds.has(course._id)) return true;
        if (partialCourseIds.has(course._id)) return true;
        if (course.courseSection && subscribedSectionIds.has(course.courseSection)) return true;
        // Check if course itself is in the myCourses list returned by backend (redundancy check)
        if (myCourses.some(c => c._id === course._id)) return true;
        return false;
    };

    // Split all courses into Enrolled vs Available
    const enrolled: any[] = [];
    const available: any[] = [];
    const filtered: any[] = []; // For search results

    // Combine all unique courses for filtering logic
    const uniqueCourses = new Map();
    [...myCourses, ...allCourses].forEach(c => uniqueCourses.set(c._id, c));
    const allUnique = Array.from(uniqueCourses.values());

    allUnique.forEach((course: any) => {
        // Enriched object
        const enriched = {
            ...course,
            isSubscribed: hasAccess(course),
            showProgress: hasAccess(course),
            progress: course.progress || 0
        };

        if (hasAccess(course)) {
            enrolled.push(enriched);
        } else {
            available.push(enriched);
        }

        // Apply filters locally if needed (though API does it too, but to be safe for mixed views)
        let match = true;
        if (searchTerm && !course.title?.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
        if (educationalLevel && course.educationalLevel?._id !== educationalLevel) match = false;
        
        if (match) filtered.push(enriched);
    });

    // Build categories map (Using Educational Level as Category)
    const catMap = new Map<string, { id: string | null; name: string; description?: string }>();
    
    allUnique.forEach((course: any) => {
        if (course.educationalLevel) {
            catMap.set(course.educationalLevel._id, {
                id: course.educationalLevel._id,
                name: course.educationalLevel.name,
                description: ""
            });
        } else {
             catMap.set("uncategorized", { id: null, name: "غير مصنف" });
        }
    });

    return {
      enrolledCourses: enrolled,
      availableCourses: available,
      categoriesMap: catMap,
      filteredCourses: filtered // Use this for search results
    };
  }, [myCoursesData, allCoursesData, subscriptionsData, searchTerm, educationalLevel]);

  const enrolledByCategory = useMemo(
      () => groupCoursesByCategory(enrolledCourses),
      [enrolledCourses]
  );

  const availableByCategory = useMemo(
      () => groupCoursesByCategory(availableCourses),
      [availableCourses]
  );

  const isLoading = myCoursesLoading || allCoursesLoading;
  
  // Calculate Stats
  const stats = useMemo(() => {
      const all = [...enrolledCourses, ...availableCourses];
      return {
          total: all.length,
          enrolled: enrolledCourses.length,
          available: availableCourses.length,
          free: all.filter(c => c.isFree).length,
          paid: all.filter(c => !c.isFree).length
      };
  }, [enrolledCourses, availableCourses]);

  // Extract unique teachers from all courses for the filter
  const teachers = useMemo(() => {
      const all = [...(myCoursesData?.courses || []), ...(allCoursesData?.courses || [])];
      const uniqueTeachers = new Map();
      all.forEach(c => {
          if (c.teacher) {
              uniqueTeachers.set(c.teacher._id, c.teacher);
          }
      });
      return Array.from(uniqueTeachers.values());
  }, [myCoursesData, allCoursesData]);

  // Total count
  const total = stats.total;

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg="gray.50"
      minH="100vh"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "400px",
        bgGradient: "linear(to-b, blue.50, transparent)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box maxW="1400px" mx="auto" position="relative" zIndex={1}>
        {/* Header with Filters */}
        <CoursesHeader
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          typeValue={""} // Simplified for now
          onTypeChange={() => {}} 
          teacherValue={""} 
          onTeacherChange={() => {}}
          levelValue={educationalLevel}
          onLevelChange={handleLevelChange}
          teachers={teachers}
          levels={levelsData?.levels || []}
          totalCourses={params.get('type') === 'enrolled' ? enrolledCourses.length : (enrolledCourses.length + availableCourses.length)}
          enrolledCount={enrolledCourses.length}
          availableCount={availableCourses.length}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {isLoading && (
          <Center py={20} bg="white" borderRadius="3xl" boxShadow="lg" minH="400px">
              <VStack spacing={6}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text>جاري تحميل الكورسات...</Text>
              </VStack>
          </Center>
        )}

        {/* Header Stats Title */}
        {!isLoading && (
        <Box mb={8}>
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
        )}

      {/* Stats Cards */}
      {!isLoading && (
      <SimpleGrid columns={{ base: 2, sm: 3, lg: 5 }} spacing={{ base: 4, md: 6 }} mb={8}>
        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">إجمالي الكورسات</Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">{stats.total}</Text>
                <Text fontSize="xs" color="gray.500">كورس متاح</Text>
              </VStack>
              <Box p={4} borderRadius="xl" bgGradient="linear(135deg, blue.400, blue.600)" shadow="md">
                <Icon icon="solar:book-bold-duotone" width="32" height="32" style={{ color: 'white' }} />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">مسجل</Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">{stats.enrolled}</Text>
                <Text fontSize="xs" color="gray.500">كورس مسجل</Text>
              </VStack>
              <Box p={4} borderRadius="xl" bgGradient="linear(135deg, green.400, green.600)" shadow="md">
                <Icon icon="solar:check-circle-bold-duotone" width="32" height="32" style={{ color: 'white' }} />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">متاح</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">{stats.available}</Text>
                <Text fontSize="xs" color="gray.500">كورس متاح</Text>
              </VStack>
              <Box p={4} borderRadius="xl" bgGradient="linear(135deg, blue.400, blue.600)" shadow="md">
                <Icon icon="solar:gift-bold-duotone" width="32" height="32" style={{ color: 'white' }} />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">مجاني</Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">{stats.free}</Text>
                <Text fontSize="xs" color="gray.500">كورس مجاني</Text>
              </VStack>
              <Box p={4} borderRadius="xl" bgGradient="linear(135deg, purple.400, purple.600)" shadow="md">
                <Icon icon="solar:gift-bold-duotone" width="32" height="32" style={{ color: 'white' }} />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">مدفوع</Text>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">{stats.paid}</Text>
                <Text fontSize="xs" color="gray.500">كورس مدفوع</Text>
              </VStack>
              <Box p={4} borderRadius="xl" bgGradient="linear(135deg, orange.400, orange.600)" shadow="md">
                <Icon icon="solar:wallet-money-bold-duotone" width="32" height="32" style={{ color: 'white' }} />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>
      )}

      {/* Search Filters */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white" boxShadow="xl" mb={6}>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align={{ base: 'stretch', md: 'center' }} wrap="wrap">
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
                onChange={(e) => handleLevelChange(e.target.value)}
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
      <HStack justify="space-between" px={2} mb={4}>
        <Text fontSize="sm" color="gray.600">
          {(searchTerm || educationalLevel) 
            ? `عرض ${filteredCourses.length} نتيجة بحث`
            : `عرض ${enrolledCourses.length + availableCourses.length} كورس`
          }
        </Text>
      </HStack>

      {/* Content */}
      {!isLoading && (
          (searchTerm || educationalLevel) ? (
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
                      <CourseCard c={course} />
                  </GridItem>
                ))
              )}
            </Grid>
          ) : (
             /* Default View: Categorized */
             <Stack spacing={8}>
                {/* My Courses Section */}
                {enrolledCourses.length > 0 && (
                  <Box>
                    <SectionHeader
                      title="كورساتي"
                      icon="solar:library-bold-duotone"
                      count={enrolledCourses.length}
                      description="الكورسات المشترك فيها"
                      colorScheme="green"
                    />
                    <Stack spacing={4}>
                      {Array.from(enrolledByCategory.entries()).map(
                        ([categoryId, courses]) => {
                          const category = categoriesMap.get(categoryId) || null;
                          return (
                            <CourseCategorySection
                              key={categoryId || "uncategorized-enrolled"}
                              category={category}
                              courses={courses}
                              isEnrolled={true}
                              defaultOpen={true}
                            />
                          );
                        }
                      )}
                    </Stack>
                  </Box>
                )}
    
                {/* Available Courses Section */}
                {availableCourses.length > 0 && (
                  <Box>
                    <SectionHeader
                      title="الكورسات المتاحة"
                      icon="solar:widget-bold-duotone"
                      count={availableCourses.length}
                      description="كورسات جديدة يمكنك الاشتراك فيها"
                      colorScheme="blue"
                    />
                    <Stack spacing={4}>
                      {Array.from(availableByCategory.entries()).map(
                        ([categoryId, courses]) => {
                          const category = categoriesMap.get(categoryId) || null;
                          return (
                            <CourseCategorySection
                              key={categoryId || "uncategorized-available"}
                              category={category}
                              courses={courses}
                              isEnrolled={false}
                              defaultOpen={true}
                            />
                          );
                        }
                      )}
                    </Stack>
                  </Box>
                )}
    
                {/* Empty State */}
                {enrolledCourses.length === 0 && availableCourses.length === 0 && (
                    <Box bg="white" borderRadius="3xl" p={12} boxShadow="lg" textAlign="center">
                      <VStack spacing={6}>
                        <Box p={6} bg="gray.100" borderRadius="full" display="inline-flex">
                          <Icon icon="solar:inbox-archive-bold-duotone" width="80" height="80" style={{ color: 'var(--chakra-colors-gray-400)' }} />
                        </Box>
                        <VStack spacing={3}>
                          <Text fontSize="2xl" fontWeight="bold" color="gray.800">لا توجد كورسات</Text>
                          <Text fontSize="md" color="gray.500" maxW="500px">لم يتم العثور على أي كورسات. رجاء المحاولة لاحقاً.</Text>
                        </VStack>
                      </VStack>
                    </Box>
                )}
            </Stack>
          )
        )}
      </Box>
    </Box>
  );
}
