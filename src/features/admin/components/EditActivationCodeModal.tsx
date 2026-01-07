import { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Switch,
    HStack,
    Text,
} from '@chakra-ui/react';
import { activationCodesService, IActivationCode } from '../services/activationCodesService';

interface EditActivationCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    code: IActivationCode | null;
}

export default function EditActivationCodeModal({
    isOpen,
    onClose,
    onSuccess,
    code,
}: EditActivationCodeModalProps) {
    const toast = useToast();
    const [formData, setFormData] = useState({
        codeString: '',
        price: 0,
        isUsed: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (code && isOpen) {
            setFormData({
                codeString: code.code,
                price: code.price,
                isUsed: code.isUsed,
            });
        }
    }, [code, isOpen]);

    const handleSubmit = async () => {
        if (!code) return;

        if (formData.codeString.length < 5) {
             toast({
                status: 'error',
                description: 'الكود يجب أن يكون 5 أحرف على الأقل',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await activationCodesService.updateActivationCode(code._id, {
                code: formData.codeString,
                price: formData.price,
                isUsed: formData.isUsed,
            });

            if (response.success) {
                toast({
                    status: 'success',
                    description: 'تم تحديث الكود بنجاح',
                });
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'فشل تحديث الكود',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!code) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay />
            <ModalContent dir="rtl">
                <ModalHeader>تعديل كود التفعيل</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>الكود</FormLabel>
                            <Input
                                value={formData.codeString}
                                onChange={(e) => setFormData({ ...formData, codeString: e.target.value })}
                                fontFamily="mono"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>السعر</FormLabel>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                min={0}
                            />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">
                                حالة الاستخدام
                            </FormLabel>
                            <HStack>
                                <Switch
                                    isChecked={formData.isUsed}
                                    onChange={(e) => setFormData({ ...formData, isUsed: e.target.checked })}
                                    colorScheme="red"
                                />
                                <Text fontSize="sm" color={formData.isUsed ? 'red.500' : 'green.500'}>
                                    {formData.isUsed ? 'مستخدم' : 'متاح'}
                                </Text>
                            </HStack>
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel>الهدف</FormLabel>
                            <Input 
                                value={`${code.targetType === 'course' ? 'كورس' : code.targetType === 'lesson' ? 'درس' : code.targetType} - ${
                                    code.course?.title || code.lesson?.title || code.courseSection?.name || code.lessonSection?.name || '-'
                                }`} 
                                isReadOnly 
                                bg="gray.50" 
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>
                        حفظ التعديلات
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
