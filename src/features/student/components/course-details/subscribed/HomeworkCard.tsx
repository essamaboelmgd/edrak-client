import { 
    Box, 
    Button, 
    Text, 
    HStack, 
    Badge, 
    AccordionItem, 
    AccordionButton, 
    AccordionPanel, 
    AccordionIcon, 
    Stack,
    Heading
} from "@chakra-ui/react";
import { Icon as IconifyIcon } from "@iconify-icon/react";
import { IStudentHomework } from "@/features/student/types";
import { API_ROOT_URL } from "@/lib/axios";

interface HomeworkCardProps {
    homework: IStudentHomework;
    onOpenSubmit: (homework: IStudentHomework) => void;
}

export default function HomeworkCard({ homework, onOpenSubmit }: HomeworkCardProps) {

    const submission = homework.submission;
    
    // Status Logic
    const getStatusBadge = () => {
        if (!submission) {
            return <Badge colorScheme="gray">لم يتم التسليم</Badge>;
        }
        switch (submission.status) {
            case 'pending': return <Badge colorScheme="blue">قيد المراجعة</Badge>;
            case 'submitted': return <Badge colorScheme="blue">تم التسليم</Badge>;
            case 'graded': 
            case 'accepted': return <Badge colorScheme="green">تم القبول ({submission.score || 0})</Badge>;
            case 'rejected': return <Badge colorScheme="red">مرفوض</Badge>;
            case 'late': return <Badge colorScheme="orange">متأخر</Badge>;
            default: return <Badge colorScheme="gray">{submission.status}</Badge>;
        }
    };

    const isGraded = submission?.status === 'graded' || submission?.status === 'accepted';
    const isRejected = submission?.status === 'rejected';

    return (
        <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="lg" mb={4} boxShadow="sm" bg="white" _hover={{ boxShadow: "md" }}>
            <h2>
                <AccordionButton _expanded={{ bg: "gray.50" }} borderRadius="lg" p={4}>
                    <Box flex="1" textAlign="right">
                        <HStack spacing={3} wrap="wrap">
                            <Box bg="purple.100" p={2} borderRadius="full" color="purple.600">
                                <IconifyIcon icon="solar:file-text-bold-duotone" width="20" height="20" />
                            </Box>
                            <Text fontWeight="semibold" fontSize="md">{homework.title}</Text>
                            {getStatusBadge()}
                        </HStack>
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
            </h2>
            <AccordionPanel pb={4} pt={2}>
                <Stack spacing={4}>
                     {/* Description */}
                    <Text color="gray.600" fontSize="sm">{homework.description}</Text>

                     {/* Actions */}
                    <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                        
                        {/* Download Homework PDF */}
                        {(homework.pdfFile || homework.pdfUrl) && (
                            <>
                                <Button 
                                    size="sm" 
                                    leftIcon={<IconifyIcon icon="solar:eye-bold-duotone" />}
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() => window.open(`${API_ROOT_URL}${homework.pdfFile || homework.pdfUrl}`, '_blank')}
                                >
                                    عرض الملف
                                </Button>
                                <Button 
                                    size="sm" 
                                    leftIcon={<IconifyIcon icon="solar:download-minimalistic-bold-duotone" />}
                                    variant="solid"
                                    colorScheme="blue"
                                    as="a"
                                    href={`${API_ROOT_URL}${homework.pdfFile || homework.pdfUrl}`}
                                    download
                                    target="_blank"
                                >
                                    تحميل الملف
                                </Button>
                            </>
                        )}

                        {/* Submit Button - Only if no submission yet */}
                        {!submission && (
                            <Button
                                size="sm"
                                colorScheme="purple"
                                leftIcon={<IconifyIcon icon="solar:upload-minimalistic-bold-duotone" />}
                                onClick={() => onOpenSubmit(homework)}
                            >
                                تسليم الحل
                            </Button>
                        )}
                        
                        {/* View Solution (File or Video) - Only if allowed or graded */}
                        {(homework.allowShowSolutionAlways || isGraded) && (
                            <>
                                {(homework.solutionFile || homework.solutionPdfUrl) && (
                                     <Button 
                                        size="sm" 
                                        leftIcon={<IconifyIcon icon="solar:file-check-bold-duotone" />}
                                        variant="solid" 
                                        colorScheme="green"
                                        onClick={() => window.open(`${API_ROOT_URL}${homework.solutionFile || homework.solutionPdfUrl}`, '_blank')}
                                    >
                                        تحميل الحل النموذجي
                                    </Button>
                                )}
                                {homework.homeworkSolutionVideo && (
                                     <Button 
                                        size="sm" 
                                        leftIcon={<IconifyIcon icon="solar:play-bold-duotone" />}
                                        variant="outline" 
                                        colorScheme="red"
                                        onClick={() => window.open(homework.homeworkSolutionVideo, '_blank')}
                                    >
                                        فيديو الحل
                                    </Button>
                                )}
                            </>
                        )}

                        {/* View My Submission */}
                        {submission && (submission.pdfFile || submission.pdfSubmissionUrl) && (
                             <Button 
                                size="sm" 
                                leftIcon={<IconifyIcon icon="solar:eye-bold-duotone" />}
                                variant="ghost" 
                                colorScheme="gray"
                                onClick={() => window.open(`${API_ROOT_URL}${submission.pdfFile || submission.pdfSubmissionUrl}`, '_blank')}
                            >
                                عرض إجابتي
                            </Button>
                        )}

                    </Stack>

                    {/* Status & Feedback Section */}
                    {submission && (
                        <Box 
                            bg={isRejected ? "red.50" : isGraded ? "green.50" : "blue.50"} 
                            p={4} 
                            borderRadius="lg" 
                            border="1px dashed" 
                            borderColor={isRejected ? "red.300" : isGraded ? "green.300" : "blue.300"}
                        >
                            <HStack justify="space-between" align="start" wrap="wrap" gap={4}>
                                <Box flex="1">
                                    <Heading size="sm" color={isRejected ? "red.700" : isGraded ? "green.700" : "blue.700"} mb={2} display="flex" alignItems="center" gap={2}>
                                        <IconifyIcon icon={isRejected ? "solar:close-circle-bold" : isGraded ? "solar:check-circle-bold" : "solar:clock-circle-bold"} />
                                        {isRejected ? "تم رفض الحل" : isGraded ? "تم قبول الحل" : "قيد المراجعة"}
                                    </Heading>
                                    
                                    {(submission.feedback || submission.notes) && (
                                        <Text fontSize="sm" color="gray.700" mt={2} bg="white" p={2} borderRadius="md" border="1px solid" borderColor="gray.100">
                                            <Text as="span" fontWeight="bold" display="block" mb={1} color={isRejected ? "red.600" : "gray.600"}>ملاحظات المصحح:</Text> 
                                            {submission.feedback || submission.notes}
                                        </Text>
                                    )}

                                    {isGraded && (
                                        <HStack mt={3} spacing={4}>
                                            <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="md">
                                                الدرجة: {submission.score} / {homework.totalMarks}
                                            </Badge>
                                        </HStack>
                                    )}
                                </Box>

                                {isRejected && (
                                     <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="solid"
                                        leftIcon={<IconifyIcon icon="solar:refresh-circle-bold" />}
                                        onClick={() => onOpenSubmit(homework)}
                                    >
                                        إعادة التسليم
                                    </Button>
                                )}
                            </HStack>
                        </Box>
                    )}
                </Stack>
            </AccordionPanel>
        </AccordionItem>
    );
}
