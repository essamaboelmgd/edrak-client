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
    RadioGroup,
    Radio,
    Stack,
    VStack,
    Text,
    useToast,
    HStack,
    Badge,
    Box,
} from '@chakra-ui/react';
import { studentsService } from '../services/studentsService';
import { Wallet, Plus, Minus } from 'lucide-react';

interface WalletManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    currentBalance: number;
    onSuccess: () => void;
}

export default function WalletManagementModal({
    isOpen,
    onClose,
    studentId,
    studentName,
    currentBalance,
    onSuccess,
}: WalletManagementModalProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            toast({
                status: 'error',
                description: 'يرجى إدخال مبلغ صحيح',
            });
            return;
        }

        if (type === 'withdraw' && Number(amount) > currentBalance) {
            toast({
                status: 'error',
                description: 'رصيد المحفظة غير كافي',
            });
            return;
        }

        try {
            setLoading(true);
            await studentsService.manageWallet(studentId, Number(amount), type);
            toast({
                status: 'success',
                description: type === 'deposit' ? 'تم إضافة المبلغ بنجاح' : 'تم سحب المبلغ بنجاح',
            });
            setAmount('');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إدارة المحفظة',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent dir="rtl">
                <ModalHeader>
                    <HStack spacing={3}>
                        <Wallet size={24} color="#6366f1" />
                        <Text>إدارة محفظة {studentName}</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {/* Current Balance */}
                        <Box
                            p={4}
                            borderRadius="xl"
                            bgGradient="linear(to-r, green.50, emerald.50)"
                            border="1px solid"
                            borderColor="green.200"
                        >
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    الرصيد الحالي
                                </Text>
                                <Badge
                                    px={4}
                                    py={2}
                                    borderRadius="lg"
                                    fontSize="lg"
                                    fontWeight="bold"
                                    colorScheme="green"
                                >
                                    {currentBalance.toLocaleString()} ج.م
                                </Badge>
                            </HStack>
                        </Box>

                        {/* Transaction Type */}
                        <FormControl>
                            <FormLabel fontWeight="semibold">نوع العملية</FormLabel>
                            <RadioGroup value={type} onChange={(val) => setType(val as 'deposit' | 'withdraw')}>
                                <Stack direction="row" spacing={6}>
                                    <Radio value="deposit" colorScheme="green">
                                        <HStack spacing={2}>
                                            <Plus size={16} />
                                            <Text>إيداع</Text>
                                        </HStack>
                                    </Radio>
                                    <Radio value="withdraw" colorScheme="red">
                                        <HStack spacing={2}>
                                            <Minus size={16} />
                                            <Text>سحب</Text>
                                        </HStack>
                                    </Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {/* Amount */}
                        <FormControl>
                            <FormLabel fontWeight="semibold">المبلغ (ج.م)</FormLabel>
                            <Input
                                type="number"
                                placeholder="أدخل المبلغ"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={0.01}
                                step={0.01}
                                size="lg"
                            />
                        </FormControl>

                        {/* Preview */}
                        {amount && Number(amount) > 0 && (
                            <Box
                                p={3}
                                borderRadius="md"
                                bg={type === 'deposit' ? 'green.50' : 'red.50'}
                                border="1px solid"
                                borderColor={type === 'deposit' ? 'green.200' : 'red.200'}
                            >
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    الرصيد بعد العملية:
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color={type === 'deposit' ? 'green.700' : 'red.700'}>
                                    {type === 'deposit'
                                        ? (currentBalance + Number(amount)).toLocaleString()
                                        : (currentBalance - Number(amount)).toLocaleString()}{' '}
                                    ج.م
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={3}>
                        <Button variant="ghost" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button
                            colorScheme={type === 'deposit' ? 'green' : 'red'}
                            onClick={handleSubmit}
                            isLoading={loading}
                            leftIcon={type === 'deposit' ? <Plus size={18} /> : <Minus size={18} />}
                        >
                            {type === 'deposit' ? 'إيداع' : 'سحب'}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

