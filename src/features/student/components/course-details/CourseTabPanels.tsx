import { TabPanel, TabPanels, Box, Text, Center, Stack, Icon, SimpleGrid, useToast, Button } from "@chakra-ui/react";
import { BookOpen } from "lucide-react";
import LessonDetails from "./LessonDetails";
import LessonList from "./LessonList";
import { IStudentCourse, IStudentCourseSection, IStudentHomework } from "../../types";
import { ExamCard } from "./ExamCard";
import HomeworkCard from "./HomeworkCard";
import SubmitHomeworkModal from "./SubmitHomeworkModal";
import { homeworkService } from "../../services/homeworkService";
import { useState } from "react";

interface CourseTabPanelsProps {
    course: IStudentCourse;
    sections: IStudentCourseSection[]; 
    selectedContent: any | null; 
    onContentClick: (content: any) => void;
    isSubscribed: boolean;
    exams?: any[]; 
    homeworks?: IStudentHomework[];
}

export default function CourseTabPanels({
    course,
    sections,
    selectedContent,
    onContentClick,
    isSubscribed,
    exams = [],
    homeworks = []
}: CourseTabPanelsProps) {
    
    // Flatten check (backend guarantees items or lessons)
    const hasContent = sections.some(s => (s.items && s.items.length > 0) || (s.lessons && s.lessons.length > 0));

    // Submit Homework Logic
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [selectedHw, setSelectedHw] = useState<IStudentHomework | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const toast = useToast();

    const handleOpenSubmit = (hw: IStudentHomework) => {
        setSelectedHw(hw);
        setIsSubmitOpen(true);
    };

    const handleFileUpload = async (file: File) => {
        if (!selectedHw) return;
        setIsUploading(true);
        try {
            await homeworkService.submitHomework(selectedHw._id, file);
            toast({ title: 'تم تسليم الواجب بنجاح', status: 'success', duration: 3000, isClosable: true });
            setIsSubmitOpen(false);
            window.location.reload(); 
        } catch (error: any) {
             toast({ 
                 title: 'حدث خطأ أثناء التسليم', 
                 description: error.response?.data?.message || 'يرجى المحاولة مرة أخرى', 
                 status: 'error',
                 duration: 4000,
                 isClosable: true
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box>
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
                                {selectedContent ? ((() => {
                                    // Calculate Lock Status for Selected Content
                                    // This logic mirrors LessonList.tsx for consistency
                                    let isSequenceLocked = false;
                                    
                                    // Flatten all items
                                    const allItems = sections.flatMap(s => ((s.items && s.items.length > 0) ? s.items : (s.lessons || [])) as any[]);
                                    
                                    for (const item of allItems) {
                                        if (item._id === selectedContent._id) break; // Reached current item
                                        
                                        // Check if this previous item breaks the sequence
                                        const settings = item.settings || {};
                                        const isMandatory = item.isMandatory || settings.requireAll || settings.requiredBeforeNextLesson;
                                        const isCompleted = item.isCompleted || item.isPassed || item.isSubmitted;
                                        
                                        if (isMandatory && !isCompleted) {
                                            isSequenceLocked = true;
                                            break;
                                        }
                                    }

                                    // Strict Sequential Locking as per user request
                                    // Ignored explicitLock and subscriptionLock for now to ensure we start "Open" and only lock based on sequence.
                                    const isLocked = isSequenceLocked;

                                    return (
                                    <>
                                        {selectedContent.type === 'lesson' && (
                                            <LessonDetails 
                                                lesson={selectedContent} 
                                                course={course} 
                                                isSubscribed={isSubscribed} 
                                                exams={exams}
                                                isLocked={isLocked}
                                            />
                                        )}
                                        {selectedContent.type === 'exam' && (
                                            <Box bg="white" p={8} borderRadius="xl" shadow="sm" textAlign="center" position="relative" overflow="hidden">
                                                {isLocked && (
                                                    <Center position="absolute" inset={0} bg="whiteAlpha.800" zIndex={10}>
                                                        <Stack align="center" spacing={3}>
                                                            <Icon as={BookOpen} boxSize={10} color="orange.400" />
                                                            <Text fontWeight="bold" fontSize="lg">الامتحان مقفل</Text>
                                                            <Text color="gray.600">يجب إكمال المتطلبات السابقة من دروس وواجبات أولاً</Text>
                                                        </Stack>
                                                    </Center>
                                                )}
                                                <Text fontSize="xl" fontWeight="bold" mb={4}>{selectedContent.title}</Text>
                                                <Text color="gray.600" mb={6}>{selectedContent.description || 'امتحان شامل'}</Text>
                                                <Box p={4} bg="orange.50" color="orange.700" borderRadius="lg" mb={6}>
                                                    تنبيه: هذا الامتحان {selectedContent.isMandatory || selectedContent.settings?.requireAll ? 'إلزامي' : 'اختياري'} ويجب اجتيازه للمتابعة.
                                                </Box>
                                                <Box p={4} border="1px dashed" borderColor="gray.300" borderRadius="lg">
                                                    <Text mb={2}>مكون الامتحان (سيتم إضافته قريباً)</Text>
                                                    <Text fontSize="sm" color="gray.500">Duration: {selectedContent.settings?.duration || 0} mins | Pass: {selectedContent.settings?.passingScore || 50}%</Text>
                                                </Box>
                                                {/* Start Exam Button Placeholder */}
                                                <Button mt={4} colorScheme="blue" isDisabled={isLocked}>
                                                    ابدأ الامتحان
                                                </Button>
                                            </Box>
                                        )}
                                        {selectedContent.type === 'homework' && (
                                            <Box bg="white" p={8} borderRadius="xl" shadow="sm" textAlign="center">
                                                <Text fontSize="xl" fontWeight="bold">واجب: {selectedContent.title}</Text>
                                                <HomeworkCard 
                                                    hw={selectedContent} 
                                                    isLocked={isLocked} 
                                                    onOpenSubmit={handleOpenSubmit}
                                                />
                                            </Box>
                                        )}
                                    </>
                                    );
                                })()) : (
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
                    {homeworks && homeworks.length > 0 ? (
                        <Stack spacing={4}>
                            {homeworks.map((hw: any) => (
                                <HomeworkCard 
                                    key={hw._id} 
                                    hw={hw} 
                                    isLocked={!isSubscribed && !hw.isFree} 
                                    onOpenSubmit={handleOpenSubmit}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Center py={12}>
                            <Stack spacing={4} textAlign="center">
                                <Text color="gray.500">لا توجد واجبات متاحة لهذا الكورس حالياً</Text>
                            </Stack>
                        </Center>
                    )}
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

            <SubmitHomeworkModal 
                isOpen={isSubmitOpen}
                onClose={() => setIsSubmitOpen(false)}
                selectedHomework={selectedHw}
                isUploading={isUploading}
                onFileUpload={handleFileUpload}
            />
        </Box>
    );
}
