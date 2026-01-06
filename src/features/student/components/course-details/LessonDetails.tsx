import { Box, Card, CardBody, CardHeader, Heading, Stack, Text, Button, Icon, HStack, Link } from "@chakra-ui/react";
import { Lock, FileText, Download } from "lucide-react";
import { IStudentLesson, IStudentCourse, IStudentExam } from "../../types";
import { useNavigate } from "react-router-dom";
import DisplayLessonExams from "./DisplayLessonExams";

import VideoPlayer from "@/components/ui/VideoPlayer";

// Simple fallback mock if VideoPlayer doesn't exist
// Removed DefaultVideoPlayer in favor of unified VideoPlayer


interface LessonDetailsProps {
    lesson: IStudentLesson;
    course: IStudentCourse;
    isSubscribed: boolean;
    exams?: IStudentExam[];
}

export default function LessonDetails({ lesson, course, isSubscribed, exams = [] }: LessonDetailsProps) {
    const navigate = useNavigate();
    const isLocked = !isSubscribed && !lesson.isFree;

    // Use imported VideoPlayer if available, else fallback. 
    // Since I don't recall seeing VideoPlayer in new structure, I'll use a basic implementation or check imports later.
    // For now, standard video tag or a simple wrapper.

    return (
        <Stack spacing={6}>
            <Card overflow="hidden" boxShadow="sm" border="1px" borderColor="gray.100">
                <CardHeader pb={0}>
                    <Heading size="md" color="gray.800">{lesson.title}</Heading>
                </CardHeader>
                <CardBody>
                    <Stack spacing={6}>
                        {lesson.videoUrl && (
                            <Box>
                                {isLocked ? (
                                    <Box 
                                        bg="gray.50" 
                                        p={12} 
                                        borderRadius="xl" 
                                        textAlign="center" 
                                        border="1px dashed" 
                                        borderColor="gray.300"
                                    >
                                        <Stack align="center" spacing={4}>
                                            <Box p={4} bg="white" borderRadius="full" boxShadow="sm">
                                                <Icon as={Lock} boxSize={8} color="gray.400" />
                                            </Box>
                                            <Box>
                                                <Text fontWeight="bold" fontSize="lg" color="gray.700">المحتوى مقفول</Text>
                                                <Text color="gray.500">يجب الاشتراك في الكورس لمشاهدة الفيديو</Text>
                                            </Box>
                                            <Button 
                                                colorScheme="blue" 
                                                onClick={() => navigate(`/student/courses/${course._id}/subscribe`)}
                                            >
                                                اشترك الآن
                                            </Button>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box borderRadius="xl" overflow="hidden" bg="black">
                                       <VideoPlayer 
                                            url={lesson.videoUrl} 
                                            provider={lesson.provider}
                                            title={lesson.title}
                                            onStart={() => {
                                                // Video started
                                            }}
                                       /> 
                                    </Box>
                                )}
                            </Box>
                        )}
                        
                        {lesson.description && (
                            <Box>
                                <Heading size="sm" mb={2}>الوصف</Heading>
                                <Text color="gray.600" lineHeight="1.6">{lesson.description}</Text>
                            </Box>
                        )}

                        {/* Attachments */}
                        {lesson.attachments && lesson.attachments.length > 0 && (
                            <Box>
                                <Heading size="sm" mb={3}>الملفات المرفقة</Heading>
                                <Stack spacing={3}>
                                    {lesson.attachments.map((file: any, index: number) => (
                                        <HStack 
                                            key={index} 
                                            p={3} 
                                            bg="gray.50" 
                                            borderRadius="lg" 
                                            justify="space-between"
                                            border="1px solid"
                                            borderColor="gray.200"
                                        >
                                            <HStack spacing={3}>
                                                <Box p={2} bg="blue.50" borderRadius="md" color="blue.500">
                                                    <Icon as={FileText} boxSize={5} />
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="medium" fontSize="sm">{file.name || `ملف مرفق ${index + 1}`}</Text>
                                                    <Text fontSize="xs" color="gray.500">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF'}</Text>
                                                </Box>
                                            </HStack>
                                            <Button 
                                                as={Link} 
                                                href={file.url || file.path} 
                                                isExternal 
                                                size="sm" 
                                                variant="ghost" 
                                                colorScheme="blue"
                                                leftIcon={<Icon as={Download} />}
                                            >
                                                تحميل
                                            </Button>
                                        </HStack>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Linked Exams */}
                        {exams && exams.length > 0 && (
                            <DisplayLessonExams 
                                exams={exams} 
                                lessonId={lesson._id} 
                                isSubscribed={isSubscribed} 
                            />
                        )}
                    </Stack>
                </CardBody>
            </Card>
        </Stack>
    );
}
