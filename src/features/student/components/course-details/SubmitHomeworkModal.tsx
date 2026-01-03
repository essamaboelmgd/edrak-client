import { 
    Box, 
    Button, 
    Divider, 
    Input, 
    Modal, 
    ModalBody, 
    ModalCloseButton, 
    ModalContent, 
    ModalFooter, 
    ModalHeader, 
    ModalOverlay, 
    Text, 
    VStack, 
    Heading,
    Icon
} from "@chakra-ui/react";
import { Upload, FileText } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { IStudentHomework } from "../../types";

interface SubmitHomeworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedHomework: IStudentHomework | null;
    isUploading: boolean;
    onFileUpload: (file: File) => void;
}

export default function SubmitHomeworkModal({
    isOpen,
    onClose,
    selectedHomework,
    isUploading,
    onFileUpload
}: SubmitHomeworkModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 30 * 1024 * 1024) {
                 // Toast ideally handled by parent or here if easy. 
                 // Assuming parent handles errors or user sees validation text.
                 alert("حجم الملف يجب أن يكون أقل من 30 ميجابايت"); 
                 return;
            }
            if (file.type !== 'application/pdf') {
                 alert("Please upload PDF files only");
                 return;
            }
            setSelectedFile(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent borderRadius="xl">
                <ModalHeader>تسليم الواجب</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedHomework && (
                        <VStack align="start" spacing={4} w="full">
                            <Box w="full" bg="gray.50" p={3} borderRadius="lg" border="1px solid" borderColor="gray.100">
                                <Heading size="sm" mb={1}>{selectedHomework.title}</Heading>
                                <Text fontSize="xs" color="gray.500">
                                    {selectedHomework.dueDate ? `تاريخ الاستحقاق: ${new Date(selectedHomework.dueDate).toLocaleDateString('ar-EG')}` : 'لا يوجد تاريخ استحقاق'}
                                </Text>
                            </Box>
                            
                            <Box w="full" border="2px dashed" borderColor="blue.300" borderRadius="xl" p={6} textAlign="center" bg="blue.50" _hover={{ bg: "blue.100" }} transition="all 0.2s" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
                                <VStack spacing={2}>
                                    <Icon as={Upload} boxSize={8} color="blue.500" />
                                    <Text fontWeight="medium" color="blue.600">
                                        {selectedFile ? selectedFile.name : 'اضغط لاختيار ملف PDF'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        (الحد الأقصى 30 ميجابايت)
                                    </Text>
                                </VStack>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Box>

                            {(selectedHomework as any).pdfUrl && (
                                <Box w="full">
                                    <Divider mb={2} />
                                    <Text fontSize="sm" mb={2}>مرفقات الواجب:</Text>
                                    <Button size="sm" variant="outline" leftIcon={<Icon as={FileText} />} onClick={() => window.open((selectedHomework as any).pdfUrl, '_blank')}>
                                        تحميل ملف الواجب
                                    </Button>
                                </Box>
                            )}
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={() => { if (selectedFile) onFileUpload(selectedFile); }}
                        isLoading={isUploading}
                        loadingText="جاري الرفع..."
                        isDisabled={!selectedFile || isUploading}
                        leftIcon={<Icon as={Upload} />}
                    >
                         تأكيد التسليم
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
