import {
    Box,
    Heading,
    Text,
    Stack,
    HStack,
    Card,
    CardBody,
    CardHeader,
    Button,
    Icon
} from "@chakra-ui/react";
import { Play, FileText, Clock } from "lucide-react";
import VideoPlayer from "@/components/ui/VideoPlayer"; // Adjust path if needed
import { IStudentHomework, IStudentExam } from "@/features/student/types";
import { useMemo } from "react";
// import ReactPlayer from 'react-player'; // Alternative if VideoPlayer not found

interface LessonPlayerProps {
    lesson: any; // IStudentLesson | ICourseContentItem
    course?: any; // kept for interface compat but unused
    viewMode?: any; // kept for interface compat but unused
    homeworks: IStudentHomework[];
    exams: IStudentExam[];
}

export default function LessonPlayer({
    lesson,
    homeworks,
    exams
}: LessonPlayerProps) {
    
    // Filter content related to this lesson
    const relatedHomeworks = useMemo(() => 
        homeworks.filter(h => h.lesson === lesson._id || (typeof h.lesson === 'object' && h.lesson?._id === lesson._id)), 
    [homeworks, lesson._id]);

    const relatedExams = useMemo(() => 
         exams.filter(e => e.lesson === lesson._id || (typeof e.lesson === 'object' && e.lesson?._id === lesson._id)),
    [exams, lesson._id]);

    return (
        <Stack spacing={6}>
            {/* Lesson Title Card */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                <CardHeader bg="blue.600" color="white" borderTopRadius="xl" py={4}>
                    <Heading size="md">{lesson.title}</Heading>
                </CardHeader>
                <CardBody>
                     {/* Video Player */}
                     {lesson.videoUrl || lesson.url ? ( // Assuming videoUrl or url property
                        <Box borderRadius="lg" overflow="hidden" boxShadow="md">
                             {/* Use custom VideoPlayer if available, else generic */}
                             <VideoPlayer url={lesson.videoUrl || lesson.url} />
                        </Box>
                     ) : (
                         <Box bg="gray.100" p={10} borderRadius="lg" textAlign="center">
                             <Icon as={Play} boxSize={12} color="gray.400" />
                             <Text mt={2} color="gray.500">لا يوجد فيديو لهذا الدرس</Text>
                         </Box>
                     )}
                     
                     {lesson.description && (
                         <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
                             <Text color="gray.700">{lesson.description}</Text>
                         </Box>
                     )}
                </CardBody>
            </Card>
            
            {/* Related Homeworks */}
            {relatedHomeworks.length > 0 && (
                 <Box>
                    <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                        <Icon as={FileText} color="purple.500" />
                        واجبات الدرس
                    </Heading>
                    <Stack spacing={3}>
                        {relatedHomeworks.map(hw => (
                            <Card key={hw._id} variant="outline" borderColor="purple.200">
                                <CardBody p={4}>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Box bg="purple.50" p={2} borderRadius="full" color="purple.600">
                                                 <Icon as={FileText} boxSize={5} />
                                            </Box>
                                            <Box>
                                                <Text fontWeight="bold">{hw.title}</Text>
                                                <Text fontSize="sm" color="gray.500">{hw.totalMarks} درجة</Text>
                                            </Box>
                                        </HStack>
                                        <Button size="sm" colorScheme="purple" variant="solid">
                                            عرض الواجب
                                        </Button>
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </Stack>
                 </Box>
            )}

             {/* Related Exams */}
             {relatedExams.length > 0 && (
                 <Box>
                    <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                        <Icon as={Clock} color="red.500" />
                        امتحانات الدرس
                    </Heading>
                    <Stack spacing={3}>
                        {relatedExams.map(exam => (
                            <Card key={exam._id} variant="outline" borderColor="red.200">
                                <CardBody p={4}>
                                    <HStack justify="space-between">
                                          <HStack>
                                            <Box bg="red.50" p={2} borderRadius="full" color="red.600">
                                                 <Icon as={Clock} boxSize={5} />
                                            </Box>
                                            <Box>
                                                <Text fontWeight="bold">{exam.title}</Text>
                                                <Text fontSize="sm" color="gray.500">{exam.questionsCount} سؤال • {exam.duration} دقيقة</Text>
                                            </Box>
                                        </HStack>
                                        <Button size="sm" colorScheme="red" variant="solid">
                                            بدء الامتحان
                                        </Button>
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </Stack>
                 </Box>
            )}

        </Stack>
    );
}
