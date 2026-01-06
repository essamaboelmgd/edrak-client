import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
    VStack,
    useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/features/student/services/studentService";
import { IStudentHomework } from "@/features/student/types";
import { Icon as IconifyIcon } from "@iconify-icon/react";

interface SubmitHomeworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    homework: IStudentHomework | null;
}

export default function SubmitHomeworkModal({ isOpen, onClose, homework }: SubmitHomeworkModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const toast = useToast();
    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async (uploadFile: File) => {
            if (!homework) throw new Error("No homework selected");
            return await studentService.submitHomework(homework._id, uploadFile);
        },
        onSuccess: () => {
             toast({
                title: "تم تسليم الواجب بنجاح",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-left"
            });
            queryClient.invalidateQueries({ queryKey: ['student', 'homework-submissions'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'course-content'] }); // Refresh content to update status
            onClose();
            setFile(null);
        },
        onError: (error: any) => {
             toast({
                title: "فشل تسليم الواجب",
                description: error.response?.data?.message || "حدث خطأ أثناء رفع الملف",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-left"
            });
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!file) return;
        submitMutation.mutate(file);
    };

    if (!homework) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent borderRadius="xl">
                <ModalHeader>تسليم الواجب: {homework.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text color="gray.600" fontSize="sm">
                            يرجى رفع ملف الحل بصيغة PDF.
                        </Text>
                        
                        <FormControl>
                            <FormLabel 
                                htmlFor="file-upload" 
                                cursor="pointer" 
                                w="100%"
                            >
                                <VStack 
                                    border="2px dashed" 
                                    borderColor={file ? "green.400" : "gray.300"} 
                                    borderRadius="xl" 
                                    p={6} 
                                    bg={file ? "green.50" : "gray.50"}
                                    transition="all 0.2s"
                                    _hover={{ borderColor: "green.500", bg: "green.50" }}
                                    spacing={3}
                                >
                                    <Box color={file ? "green.500" : "gray.400"}>
                                         <IconifyIcon icon={file ? "solar:file-check-bold-duotone" : "solar:upload-square-bold-duotone"} width="48" height="48" />
                                    </Box>
                                    <Text fontWeight="medium" color={file ? "green.700" : "gray.600"}>
                                        {file ? file.name : "اضغط لرفع الملف أو اسحبه هنا"}
                                    </Text>
                                    {!file && <Text fontSize="xs" color="gray.500">PDF (Max 10MB)</Text>}
                                </VStack>
                            </FormLabel>
                            <Input 
                                id="file-upload" 
                                type="file" 
                                accept=".pdf" 
                                onChange={handleFileChange} 
                                display="none" 
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button 
                        colorScheme="green" 
                        onClick={handleSubmit} 
                        isLoading={submitMutation.isPending}
                        isDisabled={!file}
                        leftIcon={<IconifyIcon icon="solar:upload-minimalistic-bold" />}
                    >
                        رفع الحل
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// Helper Box import was missing, fixing it via logic or import
import { Box } from "@chakra-ui/react";
