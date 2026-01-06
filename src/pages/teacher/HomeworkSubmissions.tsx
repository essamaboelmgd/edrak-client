import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardBody,
    Heading,
    HStack,
    Text,
    Stack,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useToast,
    Badge,
    VStack,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Skeleton,
    IconButton
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import homeworkService from '@/features/teacher/services/homeworkService';
import { API_ROOT_URL } from '@/lib/axios';

interface ISubmission {
    _id: string;
    student: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    submittedAt: string;
    status: 'pending' | 'submitted' | 'graded' | 'accepted' | 'rejected' | 'late';
    score?: number;
    pdfFile?: string;
    pdfSubmissionUrl?: string; // Backend field
    feedback?: string;
    notes?: string;
    homework: {
        _id: string;
        title: string;
        totalPoints: number;
    };
}

export default function HomeworkSubmissions() {
    const { homeworkId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [submissions, setSubmissions] = useState<ISubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ISubmission | null>(null);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    
    // Grade Form State
    const [gradeData, setGradeData] = useState({
        score: '',
        status: 'graded',
        feedback: '',
        notes: ''
    });

    const fetchSubmissions = async () => {
        if (!homeworkId) return;
        try {
            setLoading(true);
            const response = await homeworkService.getHomeworkSubmissions(homeworkId);
            setSubmissions(response.data.submissions as unknown as ISubmission[]);
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في جلب التسليمات',
                status: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [homeworkId]);

    const handleOpenGrade = (submission: ISubmission) => {
        setSelectedSubmission(submission);
        setGradeData({
            score: submission.score?.toString() || '',
            status: (submission.status === 'pending' || submission.status === 'submitted') ? 'graded' : submission.status,
            feedback: submission.feedback || '',
            notes: submission.notes || ''
        });
        setIsGradeModalOpen(true);
    };

    const handleGradeSubmit = async () => {
        if (!selectedSubmission || !homeworkId) return;

        // Max score validation
        const maxScore = selectedSubmission.homework.totalPoints;
        const enteredScore = gradeData.score ? Number(gradeData.score) : 0;
        
        if (maxScore > 0 && enteredScore > maxScore) {
             toast({
                title: 'خطأ',
                description: `الدرجة لا يمكن أن تتجاوز الدرجة النهائية (${maxScore})`,
                status: 'error'
            });
            return;
        }

        try {
            await homeworkService.gradeSubmission(selectedSubmission._id, {
                score: gradeData.score ? Number(gradeData.score) : undefined,
                status: gradeData.status as any,
                feedback: gradeData.feedback,
                adminNotes: gradeData.notes // Map notes to adminNotes
            });

            toast({
                title: 'تم بنجاح',
                description: 'تم تحديث حالة التسليم والدرجة',
                status: 'success'
            });

            setIsGradeModalOpen(false);
            fetchSubmissions();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'حدث خطأ أثناء التصحيح',
                status: 'error'
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge colorScheme="blue">قيد المراجعة</Badge>;
            case 'submitted': return <Badge colorScheme="blue">تم التسليم</Badge>;
            case 'graded': 
            case 'accepted': return <Badge colorScheme="green">تم القبول</Badge>;
            case 'rejected': return <Badge colorScheme="red">مرفوض</Badge>;
            case 'late': return <Badge colorScheme="orange">متأخر</Badge>;
            default: return <Badge colorScheme="gray">{status}</Badge>;
        }
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={6} dir="rtl">
            {/* Header */}
            <Box
                bgGradient="linear(135deg, slate.800 0%, slate.900 100%)"
                bg="#1A202C"
                position="relative"
                overflow="hidden"
                borderRadius="2xl"
                p={8}
                color="white"
                boxShadow="xl"
            >
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                        <HStack>
                            <IconButton 
                                aria-label="Back" 
                                icon={<Icon icon="solar:arrow-right-bold" />} 
                                variant="ghost" 
                                color="white" 
                                onClick={() => navigate('/teacher/homeworks')}
                            />
                            <Heading size="lg">إدارة تسليمات الواجب</Heading>
                        </HStack>
                        <Text opacity={0.8}>عرض وتصحيح واجبات الطلاب</Text>
                    </VStack>
                </Flex>
            </Box>

            {/* Submissions Table */}
             <Card
                borderRadius="2xl"
                border="1px"
                borderColor="gray.200"
                bg="white"
                boxShadow="xl"
            >
                <CardBody>
                    <TableContainer>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>الطالب</Th>
                                    <Th>تاريخ التسليم</Th>
                                    <Th>الحالة</Th>
                                    <Th>الدرجة</Th>
                                    <Th>الملف</Th>
                                    <Th>الإجراءات</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Tr key={i}>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                        </Tr>
                                    ))
                                ) : submissions.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={6} textAlign="center" py={10}>
                                            <Text color="gray.500">لا توجد تسليمات حتى الآن</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    submissions.map((sub) => (
                                        <Tr key={sub._id}>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold">{sub.student.firstName} {sub.student.lastName}</Text>
                                                    <Text fontSize="xs" color="gray.500">{sub.student.email}</Text>
                                                </VStack>
                                            </Td>
                                            <Td>{new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</Td>
                                            <Td>{getStatusBadge(sub.status)}</Td>
                                            <Td>
                                                {sub.score !== undefined ? (
                                                    <Badge colorScheme="green" fontSize="md">{sub.score}</Badge>
                                                ) : (
                                                    <Text color="gray.400">-</Text>
                                                )}
                                            </Td>
                                            <Td>
                                                {(sub.pdfFile || sub.pdfSubmissionUrl) ? (
                                                    <Button
                                                        size="sm"
                                                        leftIcon={<Icon icon="solar:file-text-bold-duotone" />}
                                                        colorScheme="blue"
                                                        variant="outline"
                                                        onClick={() => window.open(`${API_ROOT_URL}${sub.pdfFile || sub.pdfSubmissionUrl}`, '_blank')}
                                                    >
                                                        عرض الملف
                                                    </Button>
                                                ) : (
                                                    <Text color="red.500" fontSize="sm">لا يوجد ملف</Text>
                                                )}
                                            </Td>
                                            <Td>
                                                <Button
                                                    size="sm"
                                                    colorScheme="purple"
                                                    onClick={() => handleOpenGrade(sub)}
                                                    leftIcon={<Icon icon="solar:pen-bold-duotone" />}
                                                >
                                                    تصحيح
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </CardBody>
            </Card>

            {/* Grading Modal */}
            <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="xl">
                    <ModalHeader>تصحيح الواجب: {selectedSubmission?.student.firstName} {selectedSubmission?.student.lastName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>الحالة</FormLabel>
                                <Select 
                                    value={gradeData.status} 
                                    onChange={(e) => setGradeData({ ...gradeData, status: e.target.value })}
                                >
                                    <option value="graded">قبول (Accepted)</option>
                                    <option value="rejected">رفض (Rejected)</option>
                                </Select>
                            </FormControl>

                            {gradeData.status !== 'rejected' && (
                                <FormControl>
                                    <FormLabel>الدرجة</FormLabel>
                                    <Input 
                                        type="number" 
                                        value={gradeData.score} 
                                        onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                        placeholder="أدخل الدرجة"
                                    />
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel>ملاحظات للطالب (تظهر للطالب)</FormLabel>
                                <Textarea 
                                    value={gradeData.feedback} 
                                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    placeholder="اكتب ملاحظاتك هنا..."
                                    rows={4}
                                />
                            </FormControl>
                            
                             <FormControl>
                                <FormLabel>ملاحظات إدارية (مخفية)</FormLabel>
                                <Textarea 
                                    value={gradeData.notes} 
                                    onChange={(e) => setGradeData({ ...gradeData, notes: e.target.value })}
                                    placeholder="ملاحظات للإدارة فقط..."
                                    rows={2}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button onClick={() => setIsGradeModalOpen(false)} variant="ghost">إلغاء</Button>
                        <Button colorScheme="purple" onClick={handleGradeSubmit}>حفظ النتيجة</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Stack>
    );
}
