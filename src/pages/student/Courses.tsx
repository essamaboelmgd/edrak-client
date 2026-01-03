import {
  Box,
  Center,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Components
import CoursesHeader from "@/features/student/components/CoursesHeader";
import SectionHeader from "@/features/student/components/SectionHeader";
import CourseCategorySection from "@/features/student/components/CourseCategorySection";

// Hooks & Services
import {
  useAllCourses,
  useMyCourses,
  useStudentSubscriptions
} from "@/features/student/hooks/useStudentCourses";
import { studentService } from "@/features/student/services/studentService";
import { useQuery } from "@tanstack/react-query";

export default function StudentCourses() {
  const [params, setParams] = useSearchParams({ page: "1" });
  
  // Filter states
  const [searchValue, setSearchValue] = useState(params.get("search") || "");
  const [typeValue, setTypeValue] = useState(params.get("type") || "");
  const [teacherValue, setTeacherValue] = useState(params.get("teacher_id") || "");
  const [levelValue, setLevelValue] = useState(params.get("level") || "");

  // Fetch data
  const { data: myCoursesData, isLoading: myCoursesLoading } = useMyCourses({
    page: "1",
    limit: "1000",
    ...(searchValue && { search: searchValue }),
    ...(typeValue && { type: typeValue }),
    ...(teacherValue && { teacher_id: teacherValue }),
    ...(levelValue && { educational_level: levelValue }),
  });

  const { data: allCoursesData, isLoading: allCoursesLoading } = useAllCourses({
    page: "1",
    limit: "1000",
    status: "active",
    ...(searchValue && { search: searchValue }),
    ...(typeValue && { type: typeValue }),
    ...(teacherValue && { teacher_id: teacherValue }),
    ...(levelValue && { educational_level: levelValue }),
  });

  const { data: subscriptionsData } = useStudentSubscriptions();

  // Fetch auxiliary data for filters
  const { data: levelsData } = useQuery({
      queryKey: ['educational-levels'],
      queryFn: () => studentService.getEducationalLevels(),
  });

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
  const { enrolledCourses, availableCourses, categoriesMap } = useMemo(() => {
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

    allCourses.forEach((course: any) => {
        if (hasAccess(course)) {
            enrolled.push({
                ...course,
                isSubscribed: true,
                showProgress: true,
                progress: course.progress || 0,
            });
        } else {
            available.push(course);
        }
    });
    
    // Also ensure any courses in `myCourses` that weren't in `allCourses` (e.g. inactive but enrolled?) are added
    myCourses.forEach((c: any) => {
        if (!enrolled.find(e => e._id === c._id)) {
             enrolled.push({
                ...c,
                isSubscribed: true,
                showProgress: true,
                progress: c.progress || 0,
            });
        }
    });

    // Build categories map (Using Educational Level as Category)
    const catMap = new Map<string, { id: string | null; name: string; description?: string }>();
    
    [...enrolled, ...available].forEach((course: any) => {
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
    };
  }, [myCoursesData, allCoursesData, subscriptionsData]);

  const enrolledByCategory = useMemo(
      () => groupCoursesByCategory(enrolledCourses),
      [enrolledCourses]
  );

  const availableByCategory = useMemo(
      () => groupCoursesByCategory(availableCourses),
      [availableCourses]
  );

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setParams((p) => {
      if (value) p.set("search", value);
      else p.delete("search");
      return p;
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeValue(value);
    setParams((p) => {
      if (value) p.set("type", value);
      else p.delete("type");
      return p;
    });
  };

  const handleTeacherChange = (value: string) => {
    setTeacherValue(value);
    setParams((p) => {
      if (value) p.set("teacher_id", value);
      else p.delete("teacher_id");
      return p;
    });
  };

  const handleLevelChange = (value: string) => {
    setLevelValue(value);
    setParams((p) => {
      if (value) p.set("level", value);
      else p.delete("level");
      return p;
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setTypeValue("");
    setTeacherValue("");
    setLevelValue("");
    setParams({ page: "1" });
  };

  const isLoading = myCoursesLoading || allCoursesLoading;

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

  return (
    // <AppLayout> 
    // Layout is likely handled by parent route or wrapper. 
    // Checking legacy: it used <AppLayout>. 
    // New project `StudentLayout.tsx` exists in `components`.
    // But usually pages are rendered inside the layout in `router`.
    // I will verify if I need to wrap it. `Courses.tsx` probe showed simple Box.
    // I'll assume layout is external or I should use `PageContainer` (if exists).
    // I'll stick to Box for now as per `ModernCourses.tsx` structure inside AppLayout.
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
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          typeValue={typeValue}
          onTypeChange={handleTypeChange}
          teacherValue={teacherValue}
          onTeacherChange={handleTeacherChange}
          levelValue={levelValue}
          onLevelChange={handleLevelChange}
          teachers={teachers}
          levels={levelsData?.levels || []}
          totalCourses={enrolledCourses.length + availableCourses.length}
          enrolledCount={enrolledCourses.length}
          availableCount={availableCourses.length}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {isLoading && (
          <Center py={20} bg="white" borderRadius="3xl" boxShadow="lg" minH="400px">
            <VStack spacing={6}>
              <Box position="relative">
                <Box
                  position="absolute"
                  inset={0}
                  bg="blue.100"
                  borderRadius="full"
                  filter="blur(20px)"
                  opacity={0.6}
                />
                <Spinner
                  size="xl"
                  color="blue.500"
                  thickness="4px"
                  speed="0.8s"
                  position="relative"
                />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  جاري تحميل الكورسات
                </Text>
                <Text fontSize="sm" color="gray.500">
                  الرجاء الانتظار...
                </Text>
              </VStack>
            </VStack>
          </Center>
        )}

        {/* Content */}
        {!isLoading && (
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
            {!isLoading &&
              enrolledCourses.length === 0 &&
              availableCourses.length === 0 && (
                <Box
                  bg="white"
                  borderRadius="3xl"
                  p={12}
                  boxShadow="lg"
                  textAlign="center"
                >
                  <VStack spacing={6}>
                    <Box
                      p={6}
                      bg="gray.100"
                      borderRadius="full"
                      display="inline-flex"
                    >
                      <Icon
                        icon="solar:inbox-archive-bold-duotone"
                        width="80"
                        height="80"
                        style={{ color: 'var(--chakra-colors-gray-400)' }}
                      />
                    </Box>
                    <VStack spacing={3}>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        لا توجد كورسات
                      </Text>
                      <Text fontSize="md" color="gray.500" maxW="500px">
                        لم يتم العثور على أي كورسات تطابق معايير البحث. جرب البحث بكلمات مختلفة أو مسح الفلاتر.
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              )}
          </Stack>
        )}
      </Box>
    </Box>
    // </AppLayout>
  );
}
