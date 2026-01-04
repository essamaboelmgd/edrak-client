import { 
    Box, 
    Card, 
    CardBody, 
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
    Center,
    Button,
    Link
} from "@chakra-ui/react";
import { Lock, PlayCircle, FileText, CheckCircle } from "lucide-react";
import { IStudentHomework } from "../../types";

interface HomeworkCardProps {
    hw: IStudentHomework;
    isLocked: boolean;
    onOpenSubmit: (hw: IStudentHomework) => void;
}

export default function HomeworkCard({ hw, isLocked, onOpenSubmit }: HomeworkCardProps) {
    const submission = hw.submission;
    const submissions = hw.submissions || [];
    
    // Determine Status Colors and Text
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'accepted': return { color: 'green', text: 'مقبول' };
            case 'rejected': return { color: 'red', text: 'مرفوض' };
            case 'late': return { color: 'orange', text: 'متأخر' };
            case 'graded': return { color: 'yellow', text: 'تم التقييم' }; // Display score usually
            case 'submitted': 
            case 'pending': return { color: 'blue', text: 'قيد الانتظار' };
            default: return { color: 'gray', text: status };
        }
    };

    const statusInfo = submission ? getStatusInfo(submission.status) : null;

    // Derived Score Logic
    const derivedScore = submission?.score; // Simplification, backend handles calc
    
    // Show Solution Logic
    const showSolution = hw.allowShowSolutionAlways || (submission && (submission.status === 'accepted' || submission.status === 'graded'));

    return (
        <Card variant="outline" position="relative" mb={4} transition="all 0.2s" _hover={{ shadow: 'md' }}>
            {isLocked && (
                <Center position="absolute" inset={0} bg="rgba(0,0,0,0.02)" zIndex={1} backdropFilter="blur(1px)">
                    <Badge py={1} px={2} rounded="md" colorScheme="orange" display="flex" alignItems="center" gap={1}>
                        <Lock size={12} />
                        <Text as="span">الدرس مقفول</Text>
                    </Badge>
                </Center>
            )}
            
            <CardBody opacity={isLocked ? 0.7 : 1} pointerEvents={isLocked ? 'none' : 'auto'}>
                <Accordion allowMultiple>
                    <AccordionItem border="none">
                        <h3>
                            <AccordionButton _expanded={{ bg: "gray.50" }} borderRadius="md">
                                <HStack justify="space-between" w="100%">
                                    <HStack>
                                        <Box p={2} bg="orange.50" color="orange.500" borderRadius="lg">
                                            <FileText size={20} />
                                        </Box>
                                        <Heading size="sm" fontSize="md">{hw.title}</Heading>
                                    </HStack>
                                    
                                    <HStack spacing={2}>
                                        {submission && (
                                            <Badge colorScheme={statusInfo?.color}>
                                                {statusInfo?.text}
                                            </Badge>
                                        )}
                                        {derivedScore !== undefined && derivedScore !== null && (
                                            <Badge colorScheme={derivedScore >= (hw.totalMarks / 2) ? 'green' : 'red'}>
                                                {derivedScore} / {hw.totalMarks}
                                            </Badge>
                                        )}
                                        <AccordionIcon />
                                    </HStack>
                                </HStack>
                            </AccordionButton>
                        </h3>
                        <AccordionPanel pb={4}>
                            <Stack spacing={4}>
                                <Text fontSize="sm" color="gray.600">{hw.description}</Text>

                                {/* Solution Section */}
                                {showSolution ? (
                                    <Stack spacing={3} pt={3} bg="green.50" p={3} rounded="md" border="1px solid" borderColor="green.200">
                                        <Text fontSize="sm" fontWeight="medium" color="green.700">
                                            ✅ الحل متاح لهذا الواجب
                                        </Text>

                                        <HStack spacing={3} flexWrap="wrap">
                                            {/* We don't have solution fields in Type yet, checking backend... backend has 'solution_file' etc? 
                                                Actually IStudentHomework interface might need update.
                                                Assuming backend structure: `homework_solution_video`, `solution_file`.
                                                I'll cast `hw` to `any` for now or update Type later.
                                            */}
                                            {(hw as any).homeworkSolutionVideo && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="outline"
                                                    leftIcon={<PlayCircle size={16} />}
                                                    as={Link}
                                                    href={(hw as any).homeworkSolutionVideo}
                                                    isExternal
                                                >
                                                    مشاهدة فيديو الحل
                                                </Button>
                                            )}
                                            {(hw as any).solutionFile && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="purple"
                                                    variant="solid"
                                                    leftIcon={<FileText size={16} />}
                                                    as={Link}
                                                    href={(hw as any).solutionFile}
                                                    isExternal
                                                >
                                                    ملف الحل
                                                </Button>
                                            )}
                                        </HStack>
                                    </Stack>
                                ) : (
                                    submission && submission.status === 'rejected' && (
                                        <Stack spacing={3} pt={3} bg="red.50" p={3} rounded="md" border="1px solid" borderColor="red.200">
                                            <Text fontSize="sm" fontWeight="medium" color="red.700">
                                                ❌ تم رفض الواجب
                                            </Text>
                                        </Stack>
                                    )
                                )}
                                
                                {/* Submission History */}
                                {submissions.length > 0 && (
                                     <Box mt={2}>
                                         <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>سجل التسليمات</Text>
                                         <Stack spacing={2}>
                                             {submissions.map((s: any, idx: number) => (
                                                 <HStack key={idx} justify="space-between" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                                                     <HStack>
                                                        <Badge>{idx + 1}</Badge>
                                                        <Text fontSize="xs" color="gray.600">{new Date(s.createdAt).toLocaleDateString('ar-EG')}</Text>
                                                     </HStack>
                                                     <Badge colorScheme={getStatusInfo(s.status).color}>{getStatusInfo(s.status).text}</Badge>
                                                 </HStack>
                                             ))}
                                         </Stack>
                                     </Box>
                                )}

                                {/* Action Buttons */}
                                <HStack spacing={3} mt={2}>
                                    {(hw as any).pdfUrl && (
                                        <Button
                                            variant="outline"
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => window.open((hw as any).pdfUrl, '_blank')}
                                            leftIcon={<FileText size={16} />}
                                        >
                                            ملف الواجب (PDF)
                                        </Button>
                                    )}
                                    <Button
                                        colorScheme="teal"
                                        size="sm"
                                        onClick={() => onOpenSubmit(hw)}
                                        isDisabled={isLocked || (submission && submission.status !== 'rejected')}
                                        leftIcon={<CheckCircle size={16} />}
                                    >
                                        {isLocked ? 'مقفل' : (submission ? (submission.status === 'rejected' ? 'إعادة التسليم' : 'تم التسليم') : 'تسليم الواجب')}
                                    </Button>
                                </HStack>

                            </Stack>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </CardBody>
        </Card>
    );
}
