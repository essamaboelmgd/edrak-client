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
    Select,
    Input,
    VStack,
    Text,
    useToast,
    Switch,
    HStack,
    Box,
} from '@chakra-ui/react';
import { couponsService, ICoupon, DiscountType } from '../services/couponsService';

interface EditCouponModalProps {
    coupon: ICoupon | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditCouponModal({
    coupon,
    isOpen,
    onClose,
    onSuccess,
}: EditCouponModalProps) {
    const toast = useToast();
    const [discountType, setDiscountType] = useState<DiscountType>('percentage');
    const [discountValue, setDiscountValue] = useState(0);
    const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
    const [hasMaxUses, setHasMaxUses] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (coupon) {
            setDiscountType(coupon.discountType);
            setDiscountValue(coupon.discountValue);
            setMaxUses(coupon.maxUses);
            setHasMaxUses(!!coupon.maxUses);
            setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '');
            setHasExpiry(!!coupon.expiresAt);
            setIsActive(coupon.isActive);
        }
    }, [coupon]);

    const handleUpdate = async () => {
        if (!coupon) return;

        if (discountType === 'percentage' && discountValue > 100) {
            toast({
                status: 'error',
                description: 'نسبة الخصم يجب ألا تتجاوز 100%',
            });
            return;
        }

        if (discountValue <= 0) {
            toast({
                status: 'error',
                description: 'قيمة الخصم يجب أن تكون أكبر من 0',
            });
            return;
        }

        setIsUpdating(true);
        try {
            await couponsService.updateCoupon(coupon._id, {
                discountType,
                discountValue,
                maxUses: hasMaxUses ? maxUses : undefined,
                expiresAt: hasExpiry && expiresAt ? new Date(expiresAt).toISOString() : undefined,
                isActive,
            });

            toast({
                status: 'success',
                description: 'تم تحديث الكوبون بنجاح',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث الكوبون',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (!coupon) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
            <ModalOverlay />
            <ModalContent dir="rtl">
                <ModalHeader bgGradient="linear(to-r, red.600, orange.600)" color="white" borderTopRadius="md">
                    تعديل كوبون الخصم
                </ModalHeader>
                <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
                <ModalBody p={6}>
                    <VStack spacing={6} align="stretch">
                        <Box p={4} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" color="gray.600" mb={2}>
                                الكود
                            </Text>
                            <Text fontFamily="mono" fontWeight="bold" fontSize="lg">
                                {coupon.code}
                            </Text>
                        </Box>

                        <FormControl isRequired>
                            <FormLabel>نوع الخصم</FormLabel>
                            <Select
                                value={discountType}
                                onChange={(e) => {
                                    setDiscountType(e.target.value as DiscountType);
                                    if (e.target.value === 'percentage' && discountValue > 100) {
                                        setDiscountValue(100);
                                    }
                                }}
                            >
                                <option value="percentage">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت (ج.م)</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>
                                {discountType === 'percentage' ? 'نسبة الخصم (%)' : 'قيمة الخصم (ج.م)'}
                            </FormLabel>
                            <Input
                                type="number"
                                min={0}
                                max={discountType === 'percentage' ? 100 : undefined}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value))}
                                placeholder={discountType === 'percentage' ? '0-100' : '0'}
                            />
                            {discountType === 'percentage' && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    الحد الأقصى: 100%
                                </Text>
                            )}
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <FormLabel mb={0}>الحد الأقصى للاستخدام</FormLabel>
                                <Switch
                                    isChecked={hasMaxUses}
                                    onChange={(e) => {
                                        setHasMaxUses(e.target.checked);
                                        if (!e.target.checked) {
                                            setMaxUses(undefined);
                                        }
                                    }}
                                />
                            </HStack>
                            {hasMaxUses && (
                                <Input
                                    type="number"
                                    min={1}
                                    value={maxUses || ''}
                                    onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="مثال: 100"
                                    mt={2}
                                />
                            )}
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <FormLabel mb={0}>تاريخ انتهاء الصلاحية</FormLabel>
                                <Switch
                                    isChecked={hasExpiry}
                                    onChange={(e) => {
                                        setHasExpiry(e.target.checked);
                                        if (!e.target.checked) {
                                            setExpiresAt('');
                                        }
                                    }}
                                />
                            </HStack>
                            {hasExpiry && (
                                <Input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    mt={2}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            )}
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <FormLabel mb={0}>نشط</FormLabel>
                                <Switch
                                    isChecked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                            </HStack>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter borderTop="1px solid" borderColor="gray.200">
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleUpdate}
                        isLoading={isUpdating}
                        isDisabled={discountValue <= 0}
                    >
                        حفظ التغييرات
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

