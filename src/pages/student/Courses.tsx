import { useState, useRef } from 'react';
import { usePlatformSections, useMyCourses } from '@/features/student/hooks/useStudentCourses';
import { CourseCard } from '@/features/student/components/CourseCard';
import { Box, Heading, Text, Flex, Container, VStack, Center, Spinner } from '@chakra-ui/react';
import { CoursesHero } from './components/CoursesHero';
import { CoursesFilters } from './components/CoursesFilters';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Reuse the Row component logic, maybe extract later
const CourseSectionRow = ({ section, index }: { section: any, index: number }) => {
    const courses = section.courses || [];
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (courses.length === 0) return null;

    const bgProps = index % 2 === 0 ? { bg: 'transparent' } : { bg: 'gray.50', py: 8, borderRadius: '2xl', my: 4 };

    return (
        <Box {...bgProps} className="group" position="relative" px={index % 2 === 0 ? 0 : 4}>
             <Flex align="center" gap={3} mb={6}>
                 <Box w="6px" h="24px" bg="blue.500" borderRadius="full" />
                 <Heading size="lg" fontWeight="bold" color="gray.800">
                     {section.title || section.name}
                 </Heading>
             </Flex>

             <Box position="relative">
                 {/* Scroll Buttons */}
                 <Flex 
                     position="absolute" 
                     left="-20px" 
                     top="50%" 
                     transform="translateY(-50%)" 
                     zIndex={2}
                     opacity={0}
                     _groupHover={{ opacity: 1 }}
                     transition="all 0.3s"
                 >
                      <Box
                         as="button"
                         onClick={() => scroll('left')}
                         bg="white"
                         w="40px" 
                         h="40px"
                         borderRadius="full"
                         boxShadow="lg"
                         display="flex"
                         alignItems="center"
                         justifyContent="center"
                         color="gray.600"
                         _hover={{ bg: 'blue.50', color: 'blue.600', transform: 'scale(1.1)' }}
                         transition="all 0.2s"
                     >
                         <ChevronRight size={24} />
                     </Box>
                 </Flex>

                 <Flex 
                     position="absolute" 
                     right="-20px" 
                     top="50%" 
                     transform="translateY(-50%)" 
                     zIndex={2}
                     opacity={0}
                     _groupHover={{ opacity: 1 }}
                     transition="all 0.3s"
                 >
                     <Box
                         as="button"
                         onClick={() => scroll('right')}
                         bg="white"
                         w="40px" 
                         h="40px"
                         borderRadius="full"
                         boxShadow="lg"
                         display="flex"
                         alignItems="center"
                         justifyContent="center"
                         color="gray.600"
                         _hover={{ bg: 'blue.50', color: 'blue.600', transform: 'scale(1.1)' }}
                         transition="all 0.2s"
                     >
                         <ChevronLeft size={24} />
                     </Box>
                 </Flex>

                 <Flex 
                     ref={scrollContainerRef}
                     gap={6} 
                     overflowX="auto" 
                     pb={8}
                     pt={2}
                     px={2}
                     sx={{
                         scrollbarWidth: 'none',
                         '::-webkit-scrollbar': { display: 'none' }
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
        </Box>
    );
};

export default function StudentCourses() {
    // Filters State
    const [searchValue, setSearchValue] = useState('');
    const [levelValue, setLevelValue] = useState('');

    // Fetch Data
    const { data: sectionsData, isLoading: isLoadingSections } = usePlatformSections(); // We should update hook to accept filters if needed, or filter client side for smooth UX if data is small
    const { data: myCoursesData, isLoading: isLoadingMyCourses } = useMyCourses();

    // NOTE for Senior Dev:
    // Ideally, we pass filters to the API. 
    // `usePlatformSections` is currently using cached data without params. 
    // To implement real server-side filtering, we would need to pass params to `usePlatformSections({ educationalLevel: levelValue })`.
    // For now, let's implement CLIENT-SIDE filtering for the 'search' on sections, 
    // assuming 'educationalLevel' might come from the API later.
    
    // Derived Data
    const myCourses = myCoursesData?.courses || [];
    const allSections = sectionsData?.sections || [];
    
    // Filter Logic
    const filteredSections = allSections.map((section: any) => {
        // Filter courses inside section
        const filteredCourses = (section.courses || []).filter((c: any) => {
            const matchesSearch = c.title.toLowerCase().includes(searchValue.toLowerCase());
            // const matchesLevel = levelValue ? c.educationalLevel?._id === levelValue : true;
            return matchesSearch;
        });
        return { ...section, courses: filteredCourses };
    }).filter((section: any) => section.courses.length > 0);

    const totalCourses = allSections.reduce((acc: number, sec: any) => acc + (sec.courses?.length || 0), 0);

    const isLoading = isLoadingSections || isLoadingMyCourses;

    if (isLoading) {
        return (
             <Center h="80vh">
                 <Spinner size="xl" color="blue.500" thickness="4px" />
             </Center>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50" pb={20}>
            {/* Main Content Container - constrained width */}
            <Container maxW="container.xl" pt={8} px={{ base: 4, md: 8 }}>
                
                <CoursesHero 
                    totalCourses={totalCourses}
                    enrolledCount={myCourses.length}
                    availableCount={totalCourses} // Should technically be total - enrolled, but for now Total is fine
                />

                <CoursesFilters 
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    levelValue={levelValue}
                    onLevelChange={setLevelValue}
                    levels={[]} // TODO: Fetch levels properly
                    onClearFilters={() => { setSearchValue(''); setLevelValue(''); }}
                />

                <VStack spacing={12} align="stretch">
                    {/* My Courses Section */}
                    {myCourses.length > 0 && !searchValue && (
                         <Box>
                             <Flex align="center" gap={3} mb={6}>
                                 <Box w="6px" h="24px" bg="green.500" borderRadius="full" />
                                 <Heading size="lg" fontWeight="bold" color="gray.800">
                                     كورساتي
                                 </Heading>
                             </Flex>
                             {/* Reusing Row for My Courses? Or Grid? Legacy used Category Grouping. */}
                             {/* Let's use a single row for 'My Courses' for now for consistency */}
                             <CourseSectionRow section={{ title: 'كورساتي', courses: myCourses }} index={1} />
                         </Box>
                    )}

                    {/* Catalog Sections */}
                    <Box>
                        {filteredSections.length > 0 ? (
                            filteredSections.map((section: any, index: number) => (
                                <CourseSectionRow 
                                    key={section._id} 
                                    section={section} 
                                    index={index} 
                                />
                            ))
                        ) : (
                             <Center py={20} flexDirection="column">
                                 <Text fontSize="xl" fontWeight="bold" color="gray.400">لا توجد كورسات مطابقة للبحث</Text>
                             </Center>
                        )}
                    </Box>
                </VStack>

            </Container>
        </Box>
    );
}

