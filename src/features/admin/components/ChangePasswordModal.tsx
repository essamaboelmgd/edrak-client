import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    HStack,
    useToast,
    InputGroup,
    InputRightElement,
    IconButton,
    Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { studentsService } from '../services/studentsService';

interface ChangePasswordModalProps {
    studentId: string;
    studentName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChangePasswordModal({
    studentId,
    studentName,
    isOpen,
    onClose,
    onSuccess,
}: ChangePasswordModalProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!password || password.length < 6) {
            toast({
                status: 'error',
                description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                status: 'error',
                description: 'كلمات المرور غير متطابقة',
            });
            return;
        }

        try {
            setLoading(true);
            await studentsService.changeStudentPassword(studentId, password);
            toast({
                status: 'success',
                description: 'تم تغيير كلمة المرور بنجاح',
            });
            setPassword('');
            setConfirmPassword('');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent dir="rtl" m={0}>
                <ModalHeader bgGradient="linear(to-r, orange.600, red.600)" color="white" borderTopRadius="md">
                    تغيير كلمة مرور الطالب
                </ModalHeader>
                <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
                <form onSubmit={handleSubmit}>
                    <ModalBody p={6}>
                        <VStack spacing={4}>
                            <Text fontSize="sm" color="gray.600" w="full">
                                تغيير كلمة مرور الطالب: <strong>{studentName}</strong>
                            </Text>
                            <FormControl isRequired>
                                <FormLabel>كلمة المرور الجديدة</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور الجديدة"
                                        minLength={6}
                                    />
                                    <InputRightElement width="4.5rem">
                                        <IconButton
                                            aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                                            icon={<Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} width="20" height="20" />}
                                            h="1.75rem"
                                            size="sm"
                                            onClick={() => setShowPassword(!showPassword)}
                                            variant="ghost"
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>تأكيد كلمة المرور</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="أعد إدخال كلمة المرور"
                                        minLength={6}
                                    />
                                    <InputRightElement width="4.5rem">
                                        <IconButton
                                            aria-label={showConfirmPassword ? 'إخفاء' : 'إظهار'}
                                            icon={<Icon icon={showConfirmPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} width="20" height="20" />}
                                            h="1.75rem"
                                            size="sm"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            variant="ghost"
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Text fontSize="xs" color="gray.500" w="full">
                                ⚠️ تحذير: سيتم تغيير كلمة مرور الطالب فوراً. تأكد من إبلاغ الطالب بكلمة المرور الجديدة.
                            </Text>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor="gray.200">
                        <HStack spacing={3}>
                            <Button variant="ghost" onClick={onClose}>
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                bgGradient="linear(to-r, orange.600, red.600)"
                                color="white"
                                _hover={{ bgGradient: 'linear(to-r, orange.700, red.700)' }}
                                isLoading={loading}
                            >
                                تغيير كلمة المرور
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

