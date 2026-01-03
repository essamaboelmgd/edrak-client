import {
    TabPanel,
    TabPanels,
    Grid,
    GridItem,
    Stack,
    Center,
    Text,
    Card,
    Icon,
    Box
} from "@chakra-ui/react";
import { IStudentCourse, IStudentCourseSection, IStudentLesson, IStudentExam, IStudentHomework } from "@/features/student/types";
import CourseSectionList from "@/features/student/components/course-details/subscribed/CourseSectionList";
import LessonPlayer from "@/features/student/components/course-details/subscribed/LessonPlayer";
import { Video, FileText } from "lucide-react";

interface CoursePlayerTabPanelsProps {
    course: IStudentCourse;
    sections: IStudentCourseSection[];
    lessons: IStudentLesson[];
    exams: IStudentExam[];
    homeworks: IStudentHomework[];
    selectedContent: any;
    viewMode: { section: "all" | "video" | "homework" | "exam"; targetId?: string };
    onLessonClick: (lesson: any, disabled: boolean, view?: any) => void;
}

export default function CoursePlayerTabPanels({
    course, 
    sections,
    lessons,
    exams,
    homeworks,
    selectedContent,
    viewMode,
    onLessonClick
}: CoursePlayerTabPanelsProps) {

    // Helper to determine if we have any lessons
    const hasLessons = sections.length > 0 || lessons.length > 0;

    return (
        <TabPanels>
            {/* Lessons Tab */}
            <TabPanel px={0}>
                <Stack spacing={6} p={4}>
                    {hasLessons ? (
                        <Grid templateColumns={{ base: "1fr", lg: "360px 1fr" }} gap={4} alignItems="start">
                            <GridItem order={{ base: 2, lg: 1 }}>
                                <CourseSectionList 
                                    sections={sections} 
                                    lessons={lessons}
                                    exams={exams}
                                    homeworks={homeworks}
                                    selectedContent={selectedContent}
                                    onLessonClick={onLessonClick}
                                />
                            </GridItem>
                            <GridItem order={{ base: 1, lg: 2 }}>
                                {selectedContent ? (
                                    <LessonPlayer 
                                        lesson={selectedContent}
                                        course={course}
                                        viewMode={viewMode}
                                        homeworks={homeworks}
                                        exams={exams}
                                    />
                                ) : (
                                    <Center
                                        py={8}
                                        borderRadius="xl"
                                        border="1px dashed"
                                        borderColor="gray.300"
                                        bg="gray.50"
                                        minH="400px"
                                    >
                                        <Stack spacing={4} align="center">
                                            <Box
                                                bg="#dd6b35"
                                                p={3}
                                                borderRadius="full"
                                                color="white"
                                            >
                                                <Icon as={Video} boxSize={8} />
                                            </Box>
                                            <Text color="gray.600" fontWeight="medium">
                                                اختر درساً لعرض تفاصيله
                                            </Text>
                                        </Stack>
                                    </Center>
                                )}
                            </GridItem>
                        </Grid>
                    ) : (
                        <Card borderRadius="2xl" border="1px dashed" borderColor="gray.200" bg="gray.50" py={10}>
                            <Center>
                                <Stack spacing={4} textAlign="center">
                                    <Icon as={Video} boxSize={12} color="gray.400" />
                                    <Text color="gray.500">لا توجد دروس متاحة حالياً</Text>
                                </Stack>
                            </Center>
                        </Card>
                    )}
                </Stack>
            </TabPanel>

            {/* Exams Tab */}
            <TabPanel>
                 {/* Placeholder for Exams Grid */}
                 <Stack spacing={6}>
                    {exams.length > 0 ? (
                        <Grid templateColumns="1fr" gap={4}>
                            {exams.map(exam => (
                                <Card key={exam._id} p={4} variant="outline">
                                    <Text>{exam.title}</Text>
                                </Card>
                            ))}
                        </Grid>
                    ) : (
                         <Card borderRadius="2xl" border="1px dashed" borderColor="gray.200" bg="gray.50" py={10}>
                            <Center>
                                <Stack spacing={4} textAlign="center">
                                    <Icon as={FileText} boxSize={12} color="gray.400" />
                                    <Text color="gray.500">لا توجد امتحانات حالياً</Text>
                                </Stack>
                            </Center>
                        </Card>
                    )}
                 </Stack>
            </TabPanel>

             {/* Lives Tab - Placeholder */}
             <TabPanel>
                <Text>لا يوجد بث مباشر حالياً</Text>
             </TabPanel>

             {/* Homeworks Tab - Placeholder */}
             <TabPanel>
                <Text>لا توجد واجبات حالياً</Text>
             </TabPanel>
             
             {/* Posts Tab - Placeholder */}
             <TabPanel>
                <Text>المنشورات</Text>
             </TabPanel>

             {/* Pending Posts - Placeholder */}
             <TabPanel>
                <Text>المنشورات المعلقة</Text>
             </TabPanel>
             
              {/* Leaderboard - Placeholder */}
             <TabPanel>
                <Text>الاوائل</Text>
             </TabPanel>
        </TabPanels>
    );
}
