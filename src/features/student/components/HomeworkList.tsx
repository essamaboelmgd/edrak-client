import { useRef, useState } from 'react';
import { Box, Button, Card, CardBody, Flex, Heading, Text, VStack, Badge, Icon, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import { FileText, Upload, Clock, Download } from 'lucide-react';
import { IStudentHomework } from '../types';
import { useSubmitHomework } from '../hooks/useStudentHomework';

interface HomeworkListProps {
    homeworkList: IStudentHomework[];
    isLoading: boolean;
}

export const HomeworkList = ({ homeworkList, isLoading }: HomeworkListProps) => {
    const { mutate: submitHomework, isPending } = useSubmitHomework();
    const toast = useToast();

    const [selectedHomework, setSelectedHomework] = useState<IStudentHomework | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Let's reimplement modal logic simply
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onOpen = (hw: IStudentHomework) => {
        setSelectedHomework(hw);
        setFile(null);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedHomework(null);
        setFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!selectedHomework || !file) return;

        submitHomework({ homeworkId: selectedHomework._id, file }, {
            onSuccess: () => {
                toast({ title: 'تم رفع الواجب بنجاح', status: 'success' });
                handleClose();
            },
            onError: (error: any) => {
                toast({ title: 'فشل رفع الواجب', description: error.response?.data?.message, status: 'error' });
            }
        });
    };

    if (isLoading) return <Text>جاري التحميل...</Text>;

    if (homeworkList.length === 0) return <Text textAlign="center" color="gray.500" py={10}>لا توجد واجبات مطلوبة حالياً</Text>;

    return (
        <>
            <VStack spacing={4} align="stretch">
                {homeworkList.map((hw) => (
                    <Card key={hw._id} variant="outline" borderRadius="xl" overflow="hidden" _hover={{ borderColor: 'blue.400' }}>
                        <CardBody>
                            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                                <Box flex="1">
                                    <Flex align="center" gap={2} mb={1}>
                                        <Badge colorScheme="purple">{hw.course?.title}</Badge>
                                        {hw.isSubmitted ? (
                                            <Badge colorScheme={hw.submission?.status === 'graded' ? 'green' : 'orange'}>
                                                {hw.submission?.status === 'graded' ? 'تم التصحيح' : 'قيد المراجعة'}
                                            </Badge>
                                        ) : (
                                           <Badge colorScheme="red">لم يتم التسليم</Badge>
                                        )}
                                    </Flex>
                                    <Heading size="md" mb={1}>{hw.title}</Heading>
                                    <Text color="gray.600" fontSize="sm" noOfLines={2}>{hw.description}</Text>
                                    
                                    {hw.dueDate && (
                                        <Flex align="center" gap={1} mt={2} color="red.500" fontSize="xs">
                                            <Clock size={14} />
                                            <Text>آخر موعد: {new Date(hw.dueDate).toLocaleDateString('ar-EG')}</Text>
                                        </Flex>
                                    )}
                                </Box>

                                <VStack align="flex-end" spacing={2}>
                                    {hw.pdfUrl && (
                                        <Button 
                                            as="a" 
                                            href={hw.pdfUrl} 
                                            target="_blank" 
                                            variant="ghost" 
                                            size="sm" 
                                            leftIcon={<Icon as={Download} />}
                                            colorScheme="gray"
                                        >
                                            تحميل ملف الواجب
                                        </Button>
                                    )}

                                    {hw.isSubmitted ? (
                                        <Box textAlign="right">
                                            {hw.submission?.status === 'graded' ? (
                                                <Text fontWeight="bold" color="green.600">
                                                    الدرجة: {hw.submission.score} / {hw.totalMarks}
                                                </Text>
                                            ) : (
                                                <Text fontSize="sm" color="orange.500">تم التسليم {new Date(hw.submission?.submittedAt!).toLocaleDateString()}</Text>
                                            )}
                                        </Box>
                                    ) : (
                                        <Button 
                                            colorScheme="blue" 
                                            size="sm" 
                                            leftIcon={<Icon as={Upload} />} 
                                            onClick={() => onOpen(hw)}
                                        >
                                            رفع الحل
                                        </Button>
                                    )}
                                </VStack>
                            </Flex>
                        </CardBody>
                    </Card>
                ))}
            </VStack>

            {/* Upload Modal */}
            <Modal isOpen={isModalOpen} onClose={handleClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>رفع حل الواجب</ModalHeader>
                    <ModalBody>
                        <Text mb={4}>يرجى رفع ملف PDF يحتوي على إجاباتك.</Text>
                        
                        <Box 
                            border="2px dashed" 
                            borderColor="gray.300" 
                            borderRadius="lg" 
                            p={6} 
                            textAlign="center"
                            cursor="pointer"
                            onClick={() => fileInputRef.current?.click()}
                            bg={file ? 'blue.50' : 'transparent'}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                hidden 
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                            <VStack spacing={2}>
                                <Icon as={file ? FileText : Upload} size={32} color="gray.500" />
                                <Text fontWeight="medium">
                                    {file ? file.name : 'اضغط هنا لاختيار الملف'}
                                </Text>
                                <Text fontSize="xs" color="gray.400">PDF only (Max 5MB)</Text>
                            </VStack>
                        </Box>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button variant="ghost" onClick={handleClose}>إلغاء</Button>
                        <Button colorScheme="blue" onClick={handleSubmit} isLoading={isPending} isDisabled={!file}>
                            تأكيد الرفع
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
