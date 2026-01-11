import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Box,
    Text,
    Stack,
    HStack,
    Icon,
    Badge,
    Collapse,
    Button
} from "@chakra-ui/react";
import { IStudentCourseSection, IStudentLesson, IStudentExam, IStudentHomework } from "@/features/student/types";
import { 
    Folder, 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    Video, 
    Paperclip,
    PenTool,
    MonitorPlay,
    CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CourseSectionListProps {
    sections: IStudentCourseSection[];
    lessons: IStudentLesson[]; // Fallback list
    exams: IStudentExam[]; // Added
    homeworks: IStudentHomework[]; // Added
    selectedContent: any;
    onLessonClick: (lesson: any, disabled: boolean, view?: any) => void;
}

export default function CourseSectionList({
    sections,
    lessons,
    exams,
    homeworks,
    selectedContent,
    onLessonClick
}: CourseSectionListProps) {
    const navigate = useNavigate();
    // Track expanded lessons locally
    const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

    const toggleLesson = (lessonId: string) => {
        setExpandedLessons(prev => ({
            ...prev,
            [lessonId]: !prev[lessonId]
        }));
    };



    // Video Item
    const renderVideoItem = () => (
        <Box
            borderLeft="3px solid"
            borderLeftColor="red.300"
            borderRadius="md"
            p={3}
            bg="white"
            boxShadow="xs"
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            onClick={() => onLessonClick(selectedContent, false, { section: "video" })}
        >
            <HStack align="flex-start" spacing={3}>
                <Box bg="red.50" color="red.500" p={1.5} borderRadius="full">
                    <Icon as={MonitorPlay} boxSize={4} />
                </Box>
                <Stack spacing={0.5} flex={1}>
                    <HStack spacing={2}>
                        <Text fontWeight="semibold" fontSize="sm">الفيديو الرئيسي</Text>
                        <Badge colorScheme="red" fontSize="xs">فيديو</Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" noOfLines={1}>
                       شرح الدرس
                    </Text>
                </Stack>
            </HStack>
        </Box>
    );

    // Exam Item
    const renderExamItem = (exam: IStudentExam) => {
        const studentAttempt = (exam as any).studentAttempt || (exam as any).myAttempts?.[0];
        const isCompleted = (exam.isAttempted) || (studentAttempt && ['submitted', 'graded', 'completed'].includes(studentAttempt.status));
        const score = studentAttempt?.score || 0;
        const total = exam.totalMarks || 0;

        return (
         <Box
            key={exam._id}
            borderLeft="3px solid"
            borderLeftColor={isCompleted ? "green.300" : "orange.300"}
            borderRadius="md"
            p={3}
            bg={isCompleted ? "green.50" : "white"}
            boxShadow="xs"
            cursor="pointer"
             _hover={{ bg: isCompleted ? "green.100" : "gray.50" }}
            onClick={() => navigate(isCompleted ? `/student/exams/${exam._id}/results` : `/student/exams/${exam._id}/start`)}
        >
            <HStack align="flex-start" spacing={3}>
                <Box bg={isCompleted ? "green.200" : "orange.50"} color={isCompleted ? "green.700" : "orange.500"} p={1.5} borderRadius="full">
                    <Icon as={isCompleted ? CheckCircle : PenTool} boxSize={4} />
                </Box>
                <Stack spacing={0.5} flex={1}>
                    <HStack spacing={2} justify="space-between" width="100%">
                        <HStack>
                            <Text fontWeight="semibold" fontSize="sm">{exam.title}</Text>
                            <Badge colorScheme={isCompleted ? "green" : "orange"} fontSize="xs">
                                {isCompleted ? "تم الحل" : "امتحان"}
                            </Badge>
                        </HStack>
                        {isCompleted && (
                            <Badge colorScheme="green" variant="solid" fontSize="xs">
                                {score} / {total}
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                       {exam.duration} دقيقة
                    </Text>
                </Stack>
            </HStack>
        </Box>
        );
    };

    // Homework Item
    const renderHomeworkItem = (hw: IStudentHomework) => (
         <Box
            key={hw._id}
            borderLeft="3px solid"
            borderLeftColor="purple.300"
            borderRadius="md"
            p={3}
            bg="white"
            boxShadow="xs"
            cursor="pointer"
             _hover={{ bg: "gray.50" }}
            onClick={() => onLessonClick(null, false, { section: "homework", targetId: hw._id })}
        >
            <HStack align="flex-start" spacing={3}>
                <Box bg="purple.50" color="purple.500" p={1.5} borderRadius="full">
                    <Icon as={FileText} boxSize={4} />
                </Box>
                <Stack spacing={0.5} flex={1}>
                    <HStack spacing={2}>
                        <Text fontWeight="semibold" fontSize="sm">{hw.title}</Text>
                        <Badge colorScheme="purple" fontSize="xs">واجب</Badge>
                    </HStack>
                </Stack>
            </HStack>
        </Box>
    );

    // Attachment Item
    const renderAttachmentItem = (att: any, index: number) => (
         <Box
            key={index}
            borderLeft="3px solid"
            borderLeftColor="blue.300"
            borderRadius="md"
            p={3}
            bg="white"
            boxShadow="xs"
             _hover={{ bg: "gray.50" }}
        >
            <HStack align="flex-start" spacing={3}>
                <Box bg="blue.50" color="blue.500" p={1.5} borderRadius="full">
                    <Icon as={Paperclip} boxSize={4} />
                </Box>
                <Stack spacing={0.5} flex={1}>
                    <HStack spacing={2}>
                        <Text fontWeight="semibold" fontSize="sm">{att.name || "مرفق"}</Text>
                        <Badge colorScheme="blue" fontSize="xs">مرفق</Badge>
                    </HStack>
                    <Button 
                        as="a" 
                        href={att.url} 
                        target="_blank" 
                        size="xs" 
                        variant="link" 
                        colorScheme="blue"
                        justifyContent="flex-start"
                    >
                        تحميل
                    </Button>
                </Stack>
            </HStack>
        </Box>
    );

    const renderContentCard = (item: any) => {
        // Handle Exam
        if (item.type === 'exam') {
            return renderExamItem(item);
        }

        // Handle Homework
        if (item.type === 'homework') {
            return renderHomeworkItem(item);
        }

        // Handle Lesson (default)
        const lesson = item as IStudentLesson;
        const isExpanded = expandedLessons[lesson._id];
        
        // Check if selected is this lesson
        const isSelected = selectedContent?._id === lesson._id || 
                           (selectedContent?.lesson === lesson._id) || 
                           (typeof selectedContent?.lesson === 'object' && selectedContent?.lesson?._id === lesson._id);

        return (
            <Box key={lesson._id}>
                <Box
                    cursor="pointer"
                    onClick={() => toggleLesson(lesson._id)}
                    bg={isSelected ? "#e6f0e7" : "white"}
                    border="1px solid"
                    borderColor={isSelected ? "#56805b" : "gray.200"}
                    borderRadius="md"
                    p={3}
                    transition="all 0.2s"
                    _hover={{ borderColor: "#56805b" }}
                >
                    <HStack justify="space-between">
                         <HStack spacing={3}>
                            <Box
                                bg={isSelected ? "#56805b" : "#e6f0e7"}
                                color={isSelected ? "white" : "#56805b"}
                                p={1.5}
                                borderRadius="full"
                            >
                                <Icon as={Video} boxSize={4} /> 
                            </Box>
                            <Text fontSize="sm" fontWeight={isSelected ? "bold" : "medium"} color="#20365d">
                                {lesson.title}
                            </Text>
                         </HStack>
                         <Icon as={isExpanded ? ChevronUp : ChevronDown} color="gray.400" />
                    </HStack>
                </Box>
                <Collapse in={isExpanded} animateOpacity>
                     <Stack spacing={2} pl={2} mt={2} borderLeft="2px solid" borderLeftColor="gray.100">
                        {/* Only render video if URL exists */}
                        {lesson.videoUrl && renderVideoItem()} 
                        
                        {/* Render attachments */}
                        {lesson.attachments?.map((att, i) => renderAttachmentItem(att, i))}
                        
                        {/* 
                           We do NOT render nested exams/homeworks here because they are expected 
                           to be in the main list as siblings (mixed content).
                        */}
                    </Stack>
                </Collapse>
            </Box>
        );
    };

    return (
        <Stack spacing={4}>
            {sections.length > 0 ? (
                <Accordion defaultIndex={[0]} allowMultiple>
                    {sections.map((section) => (
                        <AccordionItem 
                            key={section._id} 
                            border="1px solid" 
                            borderColor="gray.100" 
                            borderRadius="xl" 
                            mb={4}
                            overflow="hidden"
                            bg="white"
                            boxShadow="sm"
                        >
                            {({ isExpanded }) => (
                                <>
                                    <h2>
                                        <AccordionButton 
                                             bgGradient={isExpanded ? "linear(to-r, #e6f0e7, #f8fbf8)" : "white"}
                                             px={4}
                                             py={3}
                                             _hover={{ bg: "gray.50" }}
                                        >
                                            <HStack align="center" spacing={3} width="100%">
                                                <Box bg="green.100" color="#56805b" p={2} borderRadius="full">
                                                    <Icon as={Folder} boxSize={5} />
                                                </Box>
                                                <Stack spacing={0.5} flex={1} textAlign="right">
                                                    <HStack justify="space-between" align="center">
                                                        <Text fontSize="sm" color="#20365d" fontWeight="bold">
                                                            {section.title || section.name || "غير مصنف"}
                                                        </Text>
                                                        <Badge colorScheme="green" borderRadius="full" px={2}>
                                                            {(section.items?.length || section.lessons?.length || 0)} درس
                                                        </Badge>
                                                    </HStack>
                                                </Stack>
                                                <AccordionIcon as={ChevronDown} />
                                            </HStack>
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4} px={3} bg="white">
                                        <Stack spacing={2}>
                                            {(section.items || section.lessons || []).map((item) => 
                                                renderContentCard(item)
                                            )}
                                        </Stack>
                                    </AccordionPanel>
                                </>
                            )}
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <Stack spacing={2}>
                     {lessons.map(lesson => renderContentCard(lesson))}
                </Stack>
            )}
        </Stack>
    );
}

// Temporary Helper for AccordionIcon replacement if needed, 
// but AccessorIcon is not exported by Lucide. 
// Chakra's AccordionIcon works fine but we want custom.
const AccordionIcon = (props: any) => (
    <Icon as={ChevronDown} transition="transform 0.2s" transform={props.isExpanded ? "rotate(180deg)" : undefined} {...props} />
); // Wait, Chakra AccordionButton children usually handles built-in AccordionIcon. 
// I'll stick to manual icon as rendered in code: <AccordionIcon as={ChevronDown} ... /> won't work directly if not Chakra's.
// I replaced it with manual Icon logic in my code above? No, I left `AccordionIcon` at the end.
// Actually Chakra's `AccordionIcon` is standard. I'll just use it.

