import { TabPanel, TabPanels, Box, Text, Center, Stack, Icon, SimpleGrid } from "@chakra-ui/react";
import { BookOpen } from "lucide-react";
import LessonDetails from "./LessonDetails";
import LessonList from "./LessonList";
import { IStudentCourse, IStudentCourseSection, IStudentLesson } from "../../types";

interface CourseTabPanelsProps {
    course: IStudentCourse;
    sections: IStudentCourseSection[]; // Now includes mixed items
    selectedContent: any | null; 
    onContentClick: (content: any) => void;
    isSubscribed: boolean;
    exams?: any[]; 
}

import { ExamCard } from "./ExamCard";

export default function CourseTabPanels({
    course,
    sections,
    selectedContent,
    onContentClick,
    isSubscribed,
    exams = []
}: CourseTabPanelsProps) {
    
    // Flatten check (backend guarantees items or lessons)
    const hasContent = sections.some(s => (s.items && s.items.length > 0) || (s.lessons && s.lessons.length > 0));

    return (
        <TabPanels>
            {/* Lessons Tab - Unified Curriculum */}
            <TabPanel px={0}>
                {hasContent ? (
                    <Stack direction={{ base: "column-reverse", lg: "row" }} spacing={6} align="start">
                        {/* Sidebar (List) */}
                        <Box w={{ base: "100%", lg: "300px" }} flexShrink={0}>
                            <LessonList 
                                sections={sections} 
                                selectedContentId={selectedContent?._id}
                                onContentClick={onContentClick}
                                isSubscribed={isSubscribed}
                            />
                        </Box>

                        {/* Main Content (Video/Exam/etc) */}
                        <Box flex={1} w="100%">
                            {selectedContent ? (
                                <>
                                    {selectedContent.type === 'lesson' && (
                                        <LessonDetails 
                                            lesson={selectedContent} 
                                            course={course} 
                                            isSubscribed={isSubscribed} 
                                            exams={exams}
                                        />
                                    )}
                                    {selectedContent.type === 'exam' && (
                                        <Box bg="white" p={8} borderRadius="xl" shadow="sm" textAlign="center">
                                            <Text fontSize="xl" fontWeight="bold" mb={4}>{selectedContent.title}</Text>
                                            <Text color="gray.600" mb={6}>{selectedContent.description || 'امتحان شامل'}</Text>
                                            <Box p={4} bg="orange.50" color="orange.700" borderRadius="lg" mb={6}>
                                                تنبيه: هذا الامتحان {selectedContent.isMandatory ? 'إلزامي' : 'اختياري'} ويجب اجتيازه للمتابعة.
                                            </Box>
                                            {/* Placeholder for Exam Start - In real app, navigate to exam runner or show inline */}
                                            <Box p={4} border="1px dashed" borderColor="gray.300" borderRadius="lg">
                                                <Text mb={2}>مكون الامتحان (سيتم إضافته قريباً)</Text>
                                                <Text fontSize="sm" color="gray.500">Duration: {selectedContent.settings?.duration || 0} mins | Pass: {selectedContent.settings?.passingScore || 50}%</Text>
                                            </Box>
                                        </Box>
                                    )}
                                    {selectedContent.type === 'homework' && (
                                        <Box bg="white" p={8} borderRadius="xl" shadow="sm" textAlign="center">
                                            <Text fontSize="xl" fontWeight="bold">واجب: {selectedContent.title}</Text>
                                            <Text mt={4} color="gray.500">نظام الواجبات قيد التطوير</Text>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Center h="400px" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                    <Stack spacing={4} align="center">
                                        <Icon as={BookOpen} boxSize={12} color="gray.300" />
                                        <Text color="gray.500">اختر محتوى لبدء المشاهدة</Text>
                                    </Stack>
                                </Center>
                            )}
                        </Box>
                    </Stack>
                ) : (
                     <Center py={12}>
                        <Stack spacing={4} textAlign="center">
                            <Text color="gray.500">لا توجد دروس متاحة حالياً</Text>
                        </Stack>
                    </Center>
                )}
            </TabPanel>

            {/* Exams Tab */}
            <TabPanel>
                {exams && exams.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                        {exams.map((exam: any) => (
                            <ExamCard key={exam._id} exam={exam} isSubscribed={isSubscribed} />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Center py={12}>
                        <Stack spacing={4} textAlign="center">
                            <Text color="gray.500">لا توجد امتحانات متاحة لهذا الكورس حالياً</Text>
                        </Stack>
                    </Center>
                )}
            </TabPanel>

            {/* Live Tab */}
            <TabPanel>
                <Center py={12}><Text color="gray.500">البث المباشر (قريباً)</Text></Center>
            </TabPanel>

            {/* Homeworks Tab */}
            <TabPanel>
                <Center py={12}><Text color="gray.500">الواجبات (قريباً)</Text></Center>
            </TabPanel>

             {/* Posts Tab */}
             <TabPanel>
                <Center py={12}><Text color="gray.500">المنشورات (قريباً)</Text></Center>
            </TabPanel>

             {/* Pending Posts Tab */}
             <TabPanel>
                <Center py={12}><Text color="gray.500">المنشورات المعلقة (قريباً)</Text></Center>
            </TabPanel>

            {/* Leaderboard Tab */}
            <TabPanel>
                <Center py={12}><Text color="gray.500">الاوائل (قريباً)</Text></Center>
            </TabPanel>
        </TabPanels>
    );
}
