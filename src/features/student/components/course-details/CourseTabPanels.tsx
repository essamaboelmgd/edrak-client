import { TabPanel, TabPanels, Box, Grid, Text, Center, Stack, Icon } from "@chakra-ui/react";
import { BookOpen } from "lucide-react";
import LessonDetails from "./LessonDetails";
import LessonList from "./LessonList";
import { IStudentCourse, IStudentCourseSection, IStudentLesson } from "../../types";

interface CourseTabPanelsProps {
    course: IStudentCourse;
    sections: IStudentCourseSection[];
    selectedLesson: IStudentLesson | null; // Using null instead of undefined for safer checks
    onLessonClick: (lesson: IStudentLesson) => void;
    isSubscribed: boolean;
    exams?: any[]; // Using any[] temporarily or IStudentExam[] if imported
}

import { ExamCard } from "./ExamCard";

export default function CourseTabPanels({
    course,
    sections,
    selectedLesson,
    onLessonClick,
    isSubscribed,
    exams = []
}: CourseTabPanelsProps) {
    
    // Flatten lessons for easier checking if any exist
    const hasLessons = sections.some(s => s.lessons && s.lessons.length > 0);

    return (
        <TabPanels>
            {/* Lessons Tab */}
            <TabPanel px={0}>
                {hasLessons ? (
                    <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={6}>
                        {/* Sidebar (List) - Right Side in RTL */}
                        <Box order={{ base: 2, lg: 1 }}>
                            <LessonList 
                                sections={sections} 
                                selectedLessonId={selectedLesson?._id}
                                onLessonClick={onLessonClick}
                                isSubscribed={isSubscribed}
                            />
                        </Box>

                        {/* Main Content (Video) - Left Side in RTL */}
                        <Box order={{ base: 1, lg: 2 }}>
                            {selectedLesson ? (
                                <LessonDetails 
                                    lesson={selectedLesson} 
                                    course={course} 
                                    isSubscribed={isSubscribed} 
                                />
                            ) : (
                                <Center h="400px" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                    <Stack spacing={4} align="center">
                                        <Icon as={BookOpen} boxSize={12} color="gray.300" />
                                        <Text color="gray.500">اختر درساً لبدء المشاهدة</Text>
                                    </Stack>
                                </Center>
                            )}
                        </Box>
                    </Grid>
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
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }} gap={6}>
                        {exams.map((exam: any) => (
                            <ExamCard key={exam._id} exam={exam} isSubscribed={isSubscribed} />
                        ))}
                    </Grid>
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
