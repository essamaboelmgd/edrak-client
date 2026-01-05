import { 
    Box, 
    Button, 
    Card, 
    CardBody, 
    Center, 
    Heading, 
    HStack, 
    Stack, 
    Text, 
    Badge, 
    Accordion, 
    AccordionItem, 
    AccordionButton, 
    AccordionPanel, 
    AccordionIcon, 
    Divider, 
    Progress,
    Icon
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { 
    PenTool, 
    Lock, 
    CheckCircle, 
    Play, 
    Clock
} from "lucide-react";
import { IStudentExam } from "@/features/student/types";
// import VideoPlayer from "@/components/ui/VideoPlayer"; // Assuming we have this or use generic

interface ExamCardProps {
    exam: IStudentExam;
    isLocked?: boolean; 
}

export default function ExamCard({ exam, isLocked = false }: ExamCardProps) {
    // If it is a homework exam, typically filtered out, but check logic
    // legacy: if (exam.is_homework_exam) return null; Note: IStudentExam doesn't explicitly have this, assume filtered by parent.

    const studentAttempt = (exam as any).studentAttempt || (exam as any).myAttempts?.[0] || null; // Access attempt if populated
    const hasUserProgress = (exam.isAttempted) || (studentAttempt && ['submitted', 'graded', 'completed'].includes(studentAttempt.status));
    
    // Fallback for attempt data if strictly relying on props
    const userDegree = studentAttempt?.score ?? 0;
    const totalDegree = exam.totalMarks;
    const userDegreePercent = totalDegree > 0 ? (userDegree / totalDegree) * 100 : 0;

    // Use passed locked status or internal
    const lockedExam = isLocked || (exam as any).isLocked || !(exam.canTakeExam ?? true);

    return (
        <Card 
            position="relative" 
            boxShadow="sm" 
            borderRadius="lg" 
            transition="all 0.2s"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
        >
            {lockedExam && (
                <Center position="absolute" inset={0} bg="rgba(0,0,0,0.05)" zIndex={1} borderRadius="lg">
                    <Badge py={1} px={3} rounded="full" colorScheme="orange" display="flex" alignItems="center" gap={2}>
                        <Icon as={Lock} boxSize={4} />
                        <Text as="span">الدرس مقفول</Text>
                    </Badge>
                </Center>
            )}
            
            <CardBody opacity={lockedExam ? 0.7 : 1} pointerEvents={lockedExam ? 'none' : 'auto'} p={0}>
                <Accordion allowMultiple defaultIndex={hasUserProgress ? [] : [0]}>
                    <AccordionItem border="none">
                        <h3>
                            <AccordionButton 
                                _expanded={{ bg: "blue.50" }} 
                                p={4}
                                _hover={{ bg: "blue.50" }}
                            >
                                <HStack justify="space-between" w="100%" flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "flex-start", md: "center" }} gap={3}>
                                    <HStack spacing={3}>
                                        <Box 
                                            bg="blue.100" 
                                            p={2} 
                                            borderRadius="full"
                                            color="blue.600"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon as={PenTool} boxSize={5} />
                                        </Box>
                                        <Heading size="sm" fontWeight="semibold" color="gray.700" textAlign="right">
                                            {exam.title}
                                        </Heading>
                                    </HStack>
                                    <HStack spacing={3} width={{ base: "100%", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
                                        {hasUserProgress ? (
                                            <Badge colorScheme={userDegreePercent >= 50 ? "green" : "red"} px={3} py={1} borderRadius="full">
                                                {userDegree} / {totalDegree}
                                            </Badge>
                                        ) : (
                                            <Badge colorScheme="yellow" px={3} py={1} borderRadius="full">
                                                غير مكتمل
                                            </Badge>
                                        )}
                                        <AccordionIcon />
                                    </HStack>
                                </HStack>
                            </AccordionButton>
                        </h3>
                        <AccordionPanel pb={6} pt={2} px={6}>
                            <Stack spacing={4}>
                                {exam.description && (
                                    <Box 
                                        fontSize="sm" 
                                        color="gray.600" 
                                        p={3} 
                                        bg="gray.50" 
                                        borderRadius="md"
                                        dangerouslySetInnerHTML={{ __html: exam.description }} 
                                    />
                                )}
                                
                                {hasUserProgress && (
                                    <Stack spacing={2}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">الدرجة القصوى: {totalDegree}</Text>
                                            <Text fontSize="sm" color="gray.600">النسبة: {userDegreePercent.toFixed(1)}%</Text>
                                        </HStack>
                                        <Progress 
                                            value={userDegreePercent} 
                                            size="sm" 
                                            colorScheme={userDegreePercent >= 70 ? "green" : userDegreePercent >= 50 ? "yellow" : "red"} 
                                            borderRadius="full"
                                        />
                                    </Stack>
                                )}
                                
                                <Divider />
                                
                                <HStack spacing={3} flexWrap="wrap" gap={2} w="100%">
                                    {(() => {
                                        if (hasUserProgress) {
                                            return (
                                                <Button 
                                                    colorScheme="teal" 
                                                    size="sm" 
                                                    isDisabled
                                                    leftIcon={<Icon as={CheckCircle} />}
                                                    width={{ base: "100%", md: "auto" }}
                                                >
                                                    تم إنهاء الامتحان
                                                </Button>
                                            );
                                        }
                                        if (lockedExam) {
                                            return (
                                                <Button 
                                                    colorScheme="gray" 
                                                    size="sm" 
                                                    isDisabled
                                                    leftIcon={<Icon as={Lock} />}
                                                    width={{ base: "100%", md: "auto" }}
                                                >
                                                    الدرس مقفول
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button 
                                                as={Link} 
                                                to={`/student/exams/${exam._id}/start`} 
                                                colorScheme="teal" 
                                                size="sm"
                                                leftIcon={<Icon as={Play} fill="currentColor" />}
                                                width={{ base: "100%", md: "auto" }}
                                            >
                                                بدء الامتحان
                                            </Button>
                                        );
                                    })()}
                                    
                                    {(exam.duration || 0) > 0 && (
                                        <Badge colorScheme="blue" px={2} py={1} borderRadius="md" variant="subtle">
                                            <HStack spacing={1}>
                                                <Icon as={Clock} boxSize={3} />
                                                <Text>{exam.duration} دقيقة</Text>
                                            </HStack>
                                        </Badge>
                                    )}
                                </HStack>

                                {/* Solution Video Placeholder (Backend doesn't provide solution_video yet in IStudentExam interface, but we can add UI if needed) */}
                                {/* 
                                {hasUserProgress && (exam as any).solution_video && (
                                    <Box pt={4}>
                                        <Heading size="sm" mb={3} color="green.600" display="flex" alignItems="center" gap={2}>
                                            <Icon as={PlayCircle} />
                                            فيديو حل الامتحان
                                        </Heading>
                                        <Box borderRadius="md" overflow="hidden">
                                            VideoPlayer here
                                        </Box>
                                    </Box>
                                )} 
                                */}
                            </Stack>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </CardBody>
        </Card>
    );
}
