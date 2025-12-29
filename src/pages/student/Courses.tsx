import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { usePlatformSections } from '@/features/student/hooks/useStudentCourses';
import { CourseCard } from '@/features/student/components/CourseCard';
import { Box, Heading, Text, Flex, IconButton, Container } from '@chakra-ui/react';
import { useRef } from 'react';

const CourseSectionRow = ({ section, index }: { section: any, index: number }) => {
    // No more individual fetching!
    const courses = section.courses || [];
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (courses.length === 0) return null;

    // Alternating background for visual separation
    const bgProps = index % 2 === 0 ? { bg: 'transparent' } : { bg: 'gray.50', py: 8, borderRadius: '2xl' };

    return (
        <Box py={8} px={4} {...bgProps} position="relative">
            <Container maxW="container.xl" p={0}>
                <Flex align="center" justify="space-between" mb={6} px={2}>
                    <Box>
                        <Flex align="center" gap={3} mb={1}>
                            <Box w="6px" h="24px" bg="blue.500" borderRadius="full" />
                            <Heading size="lg" color="gray.800">{section.title}</Heading>
                        </Flex>
                        {section.description && <Text color="gray.500" fontSize="md" mt={1} mr={4}>{section.description}</Text>}
                    </Box>
                    
                    {/* Optional: 'View All' can be added here if we have a route for Section Details */}
                    {/* <Button variant="ghost" colorScheme="blue" size="sm" rightIcon={<ArrowLeft size={16} />}>عرض الكل</Button> */}
                </Flex>
                
                <Box position="relative" role="group">
                    {courses.length > 3 && (
                        <>
                            <IconButton
                                aria-label="Scroll Right"
                                icon={<ChevronRight />}
                                position="absolute"
                                right="-20px"
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                                borderRadius="full"
                                bg="white"
                                shadow="lg"
                                color="gray.700"
                                _hover={{ bg: 'blue.50', color: 'blue.600', transform: 'translateY(-50%) scale(1.1)' }}
                                onClick={() => scroll('right')}
                                display={{ base: 'none', md: 'flex' }}
                                opacity={0}
                                _groupHover={{ opacity: 1 }}
                                transition="all 0.2s"
                            />

                            <IconButton
                                aria-label="Scroll Left"
                                icon={<ChevronLeft />}
                                position="absolute"
                                left="-20px"
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                                borderRadius="full"
                                bg="white"
                                shadow="lg"
                                color="gray.700"
                                _hover={{ bg: 'blue.50', color: 'blue.600', transform: 'translateY(-50%) scale(1.1)' }}
                                onClick={() => scroll('left')}
                                display={{ base: 'none', md: 'flex' }}
                                opacity={0}
                                _groupHover={{ opacity: 1 }}
                                transition="all 0.2s"
                            />
                        </>
                    )}

                    <Flex 
                        ref={scrollContainerRef}
                        gap={6} 
                        overflowX="auto" 
                        pb={8}
                        pt={2}
                        px={2}
                        sx={{
                            scrollbarWidth: 'none', // Firefox
                            '::-webkit-scrollbar': { display: 'none' } // Chrome/Safari
                        }}
                    >
                        {courses.map((course: any) => (
                            <Box 
                                key={course._id} 
                                minW={{ base: "280px", md: "300px" }} 
                                maxW={{ base: "280px", md: "300px" }}
                                transition="transform 0.3s ease"
                                _hover={{ transform: 'translateY(-8px)' }}
                            >
                                <CourseCard course={course} />
                            </Box>
                        ))}
                    </Flex>
                </Box>
            </Container>
        </Box>
    );
};

export default function StudentCourses() {
  const { data: sectionsData, isLoading: isLoadingSections } = usePlatformSections();
  const sections = sectionsData?.sections || [];

  return (
    <div className="space-y-0" dir="rtl">
      <Container maxW="container.xl" py={4}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">استكشف الكورسات</h1>
            <p className="text-gray-500 mt-1">اختر الكورس المناسب لك وابدأ رحلتك التعليمية</p>
            </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
            type="text"
            placeholder="ابحث عن كورس..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent category-search-input"
            />
        </div>
      </Container>

      {/* Sections and Courses */}
      <Box>
          {isLoadingSections ? (
              <Box p={4} textAlign="center">جاري تحميل الأقسام...</Box>
          ) : (
              sections.length > 0 ? (
                  sections.map((section: any, index: number) => (
                      <CourseSectionRow key={section._id} section={section} index={index} />
                  ))
              ) : (
                  <Box p={8} textAlign="center" bg="gray.50" borderRadius="lg">
                      <Text color="gray.500">لا توجد أقسام متاحة حالياً</Text>
                  </Box>
              )
          )}
      </Box>
    </div>
  );
}

