import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  Text,
  RadioGroup,
  Radio,
  Stack,
  Box,
  Divider,
  HStack,
  Badge,
  Alert,
  AlertIcon,

} from '@chakra-ui/react';
import { useState } from 'react';
import { IStudentCourse } from '../types';

interface SubscriptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: {
    type: 'course' | 'lesson' | 'courseSection' | 'lessonSection' | 'multiple_lessons';
    title: string;
    price: number;
    finalPrice: number;
    id: string; // ID of the item (courseId, lessonId, etc.)
    lessonIds?: string[]; // For multiple_lessons
  };
  course?: IStudentCourse; // Context
  onConfirm: (paymentMethod: string) => Promise<void>;
  isLoading: boolean;
}

export const SubscriptionDrawer = ({
  isOpen,
  onClose,
  selectedItems,
  course,
  onConfirm,
  isLoading
}: SubscriptionDrawerProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('center_payment');
  
  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  const isFree = selectedItems.finalPrice === 0;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">مراجعة الطلب</DrawerHeader>

        <DrawerBody>
          <VStack spacing={6} align="stretch" py={4}>
            {/* Order Summary */}
            <Box>
              <Text fontWeight="bold" mb={3} fontSize="lg">ملخص الطلب</Text>
              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">{selectedItems.title}</Text>
                  <Badge colorScheme="blue">
                    {selectedItems.type === 'course' ? 'كورس كامل' : 
                     selectedItems.type === 'lesson' ? 'درس واحد' :
                     selectedItems.type === 'multiple_lessons' ? 'مجموعة دروس' : 'قسم'}
                  </Badge>
                </HStack>
                
                {course && <Text fontSize="sm" color="gray.600" mb={3}>{course.title}</Text>}
                
                <Divider my={3} />
                
                <HStack justify="space-between">
                  <Text>السعر الأصلي</Text>
                  <Text textDecoration={selectedItems.price > selectedItems.finalPrice ? "line-through" : "none"}>
                    {selectedItems.price} ج.م
                  </Text>
                </HStack>
                
                {selectedItems.price > selectedItems.finalPrice && (
                   <HStack justify="space-between" color="green.600">
                    <Text>خصم</Text>
                    <Text>-{selectedItems.price - selectedItems.finalPrice} ج.م</Text>
                  </HStack>
                )}
                
                <Divider my={3} />
                
                <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text>الإجمالي</Text>
                  <Text color={isFree ? "green.500" : "brand.500"}>
                    {isFree ? "مجاني" : `${selectedItems.finalPrice} ج.م`}
                  </Text>
                </HStack>
              </Box>
            </Box>

            {/* Payment Method Selection */}
            {!isFree && (
              <Box>
                <Text fontWeight="bold" mb={3} fontSize="lg">طريقة الدفع</Text>
                <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
                  <Stack direction="column" spacing={3}>
                    <Box borderWidth="1px" borderRadius="md" p={3} _hover={{ bg: 'gray.50' }}>
                      <Radio value="center_payment">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">الدفع في السنتر / فودافون كاش (معتمد)</Text>
                          <Text fontSize="sm" color="gray.600">
                            سيتم تعليق طلبك حتى يتم تأكيد الدفع من قبل المشرف.
                          </Text>
                        </VStack>
                      </Radio>
                    </Box>
                    
                    <Box borderWidth="1px" borderRadius="md" p={3} _hover={{ bg: 'gray.50' }}>
                      <Radio value="wallet">
                         <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">المحفظة الإلكترونية (رصيد الموقع)</Text>
                          <Text fontSize="sm" color="gray.600">
                            خصم فوري من رصيدك الحالي. اشتراك فوري.
                          </Text>
                        </VStack>
                      </Radio>
                    </Box>
                  </Stack>
                </RadioGroup>
              </Box>
            )}

            {/* Approval Warning */}
            {!isFree && paymentMethod === 'center_payment' && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" fontSize="sm">تنبيه هام</Text>
                  <Text fontSize="sm">
                    عند اختيار الدفع في السنتر، لن تتمكن من الوصول للمحتوى فوراً. يجب التواصل مع السنتر أو المشرف لتفعيل اشتراكك بعد الدفع.
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleConfirm} 
            isLoading={isLoading}
            width="full"
          >
            {isFree ? "اشترك الآن (مجاني)" : paymentMethod === 'center_payment' ? "إرسال طلب الاشتراك" : "دفع واشتراك فوري"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
