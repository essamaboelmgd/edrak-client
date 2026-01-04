import { 
    Box, 
    Text, 
    List, 
    ListItem, 
    HStack, 
    Stack, 
    Center, 
    Icon, 
    Spacer, 
    IconButton, 
    Divider 
} from "@chakra-ui/react";
import { PenTool, Play, CheckCircle } from "lucide-react"; // Using PenTool for exam icon
import { useNavigate } from "react-router-dom";
import { IStudentExam } from "../../types";

interface DisplayLessonExamsProps {
    exams: IStudentExam[];
    lessonId: string;
    isSubscribed: boolean;
}

export default function DisplayLessonExams({ exams, lessonId, isSubscribed }: DisplayLessonExamsProps) {
    const navigate = useNavigate();
    
    // Filter exams for this lesson
    // Note: Use flexible match (string vs object id)
    const lessonExams = exams.filter(e => {
        const examLessonId = typeof e.lesson === 'string' ? e.lesson : e.lesson?._id;
        return examLessonId === lessonId;
    });

    if (!lessonExams || lessonExams.length === 0) return null;

    return (
        <Stack spacing={4} mt={4}>
            <Divider />
            <Text fontWeight="bold" fontSize="lg">الامتحانات</Text>
            <List spacing={3}>
                {lessonExams.map((exam) => (
                    <ListItem key={exam._id}>
                        <Box bg="gray.50" p={4} borderRadius="md" border="1px" borderColor="gray.200">
                            <HStack w="full">
                                <Center flexShrink={0} color="gray.600" boxSize={10} bg="white" borderRadius="full" border="1px" borderColor="gray.100">
                                    <Icon as={PenTool} boxSize={5} />
                                </Center>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" textTransform="capitalize">
                                        {exam.title}
                                    </Text>
                                    <HStack fontSize="xs" color="gray.500" spacing={2} mt={1}>
                                        <Text>{exam.totalMarks} درجة</Text>
                                        <Text>•</Text>
                                        <Text>{exam.duration} دقيقة</Text>
                                    </HStack>
                                </Box>
                                <Spacer />
                                
                                {exam.isAttempted ? (
                                    <IconButton
                                        aria-label="View Results"
                                        icon={<Icon as={CheckCircle} />}
                                        size="sm"
                                        colorScheme="green"
                                        variant="ghost"
                                        isRound
                                        onClick={() => navigate(`/student/exams/${exam._id}/results`)}
                                    />
                                ) : (
                                    <IconButton
                                        aria-label="Start Exam"
                                        icon={<Icon as={Play} fill="currentColor" />}
                                        size="sm"
                                        colorScheme="yellow"
                                        isRound
                                        isDisabled={!isSubscribed && !exam.isFree}
                                        onClick={() => navigate(`/student/exams/${exam._id}/start`)}
                                    />
                                )}
                            </HStack>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}
