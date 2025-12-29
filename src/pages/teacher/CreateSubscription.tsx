import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Checkbox,
  Badge,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Skeleton,
} from '@chakra-ui/react';
import { featuresService, Feature } from '@/features/admin/services/featuresService';
import {
  teacherSubscriptionService,
  CreateSubscriptionData,
} from '@/features/teacher/services/teacherSubscriptionService';
import { useNavigate } from 'react-router-dom';

const categoryLabels: Record<string, string> = {
  content_management: 'إدارة المحتوى',
  student_management: 'إدارة الطلاب',
  assessment: 'التقييم',
  communication: 'التواصل',
  analytics: 'التحليلات',
  payment: 'الدفع',
  live_sessions: 'الجلسات المباشرة',
  other: 'أخرى',
};

const planLabels: Record<string, { label: string; multiplier: number }> = {
  monthly: { label: 'شهري', multiplier: 1 },
  quarterly: { label: 'ربع سنوي', multiplier: 3 },
  semi_annual: { label: 'نصف سنوي', multiplier: 6 },
  annual: { label: 'سنوي', multiplier: 12 },
};

export default function CreateSubscription() {
  const toast = useToast();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'semi_annual' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'mobile_wallet' | 'bank_transfer'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await featuresService.getAllFeatures({ activeOnly: true });
      if (response.success) {
        if ('features' in response.data && typeof response.data.features === 'object' && !Array.isArray(response.data.features)) {
          const grouped = response.data.features as {
            essential: Feature[];
            optional: Feature[];
            total: number;
          };
          setFeatures([...grouped.essential, ...grouped.optional]);
          // Auto-select essential features
          const essentialIds = grouped.essential.map((f) => f._id);
          setSelectedFeatures(new Set(essentialIds));
        } else if (Array.isArray(response.data.features)) {
          setFeatures(response.data.features);
          // Auto-select essential features
          const essentialIds = response.data.features
            .filter((f) => f.type === 'essential')
            .map((f) => f._id);
          setSelectedFeatures(new Set(essentialIds));
        }
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء جلب الميزات',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
  };

  const calculateTotal = () => {
    const planMultiplier = planLabels[selectedPlan].multiplier;
    let total = 0;

    selectedFeatures.forEach((featureId) => {
      const feature = features.find((f) => f._id === featureId);
      if (feature) {
        total += feature.finalPrice * planMultiplier;
      }
    });

    return total;
  };

  const handleSubmit = async () => {
    if (selectedFeatures.size === 0) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار ميزة واحدة على الأقل',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const selectedFeaturesData = Array.from(selectedFeatures).map((featureId) => {
        const feature = features.find((f) => f._id === featureId);
        return {
          feature: featureId,
          price: feature ? feature.finalPrice * planLabels[selectedPlan].multiplier : 0,
        };
      });

      const subscriptionData: CreateSubscriptionData = {
        plan: selectedPlan,
        selectedFeatures: selectedFeaturesData,
        paymentMethod,
        notes: paymentMethod === 'cash' ? 'تواصل مع الدعم والدفع' : undefined,
      };

      await teacherSubscriptionService.createSubscription(subscriptionData);
      toast({
        title: 'نجح',
        description:
          paymentMethod === 'cash'
            ? 'تم إنشاء طلب الاشتراك بنجاح. سيتم التواصل معك قريباً'
            : 'تم إنشاء الاشتراك بنجاح',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/teacher/platform-subscriptions');
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء الاشتراك',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
      onConfirmClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const groupedFeatures = features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, Feature[]>
  );

  const total = calculateTotal();

  return (
    <Box p={6} dir="rtl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="lg" mb={2}>
            إنشاء اشتراك جديد
          </Heading>
          <Text color="gray.600">اختر الميزات والخطة المناسبة لك</Text>
        </Box>

        <HStack spacing={6} align="start">
          {/* Features Selection */}
          <Box flex={2}>
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">اختر الميزات</Heading>
                  {loading ? (
                    <VStack spacing={4}>
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <Skeleton key={idx} height="100px" width="100%" />
                      ))}
                    </VStack>
                  ) : (
                    Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                      <Box key={category}>
                        <Text fontWeight="bold" mb={3} fontSize="lg">
                          {categoryLabels[category] || category}
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {categoryFeatures.map((feature) => {
                            const isSelected = selectedFeatures.has(feature._id);
                            const isEssential = feature.type === 'essential';
                            return (
                              <Card
                                key={feature._id}
                                borderWidth={isSelected ? 2 : 1}
                                borderColor={isSelected ? 'red.500' : 'gray.200'}
                                cursor="pointer"
                                onClick={() => !isEssential && toggleFeature(feature._id)}
                                bg={isSelected ? 'red.50' : 'white'}
                                _hover={{ borderColor: 'red.300' }}
                              >
                                <CardBody>
                                  <HStack justify="space-between">
                                    <HStack spacing={4} flex={1}>
                                      {!isEssential && (
                                        <Checkbox
                                          isChecked={isSelected}
                                          onChange={() => toggleFeature(feature._id)}
                                          colorScheme="red"
                                          size="lg"
                                        />
                                      )}
                                      <VStack align="start" spacing={1} flex={1}>
                                        <HStack>
                                          <Text fontWeight="bold">
                                            {feature.nameArabic || feature.name}
                                          </Text>
                                          {isEssential && (
                                            <Badge colorScheme="green">أساسية</Badge>
                                          )}
                                          {feature.isPopular && (
                                            <Badge colorScheme="purple">شائع</Badge>
                                          )}
                                          {feature.isRecommended && (
                                            <Badge colorScheme="blue">موصى به</Badge>
                                          )}
                                        </HStack>
                                        <Text fontSize="sm" color="gray.600">
                                          {feature.descriptionArabic || feature.description}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                    <VStack align="end" spacing={1}>
                                      {feature.discount > 0 && (
                                        <Text
                                          fontSize="sm"
                                          color="gray.400"
                                          textDecoration="line-through"
                                        >
                                          {formatCurrency(feature.price)}
                                        </Text>
                                      )}
                                      <Text fontWeight="bold" color="green.500">
                                        {formatCurrency(feature.finalPrice)}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
                                        /شهر
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </CardBody>
                              </Card>
                            );
                          })}
                        </VStack>
                      </Box>
                    ))
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Plan & Payment Selection */}
          <Box flex={1}>
            <VStack spacing={6} align="stretch">
              {/* Plan Selection */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">اختر الخطة</Heading>
                    <RadioGroup value={selectedPlan} onChange={(val) => setSelectedPlan(val as any)}>
                      <Stack spacing={3}>
                        {Object.entries(planLabels).map(([key, { label, multiplier }]) => {
                          const planTotal = total * (multiplier / planLabels[selectedPlan].multiplier);
                          return (
                            <Radio key={key} value={key} colorScheme="red">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{label}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {formatCurrency(planTotal)} ({multiplier} شهر)
                                </Text>
                              </VStack>
                            </Radio>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  </VStack>
                </CardBody>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">طريقة الدفع</Heading>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(val) => setPaymentMethod(val as any)}
                    >
                      <Stack spacing={3}>
                        <Radio value="cash" colorScheme="red">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">تواصل مع الدعم والدفع</Text>
                            <Text fontSize="sm" color="gray.600">
                              سيتم التواصل معك لتأكيد الدفع
                            </Text>
                          </VStack>
                        </Radio>
                        <Radio value="credit_card" colorScheme="red" isDisabled>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Text fontWeight="bold">الدفع الإلكتروني</Text>
                              <Badge colorScheme="gray">قريباً</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              الدفع بالبطاقة الائتمانية
                            </Text>
                          </VStack>
                        </Radio>
                        <Radio value="mobile_wallet" colorScheme="red" isDisabled>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Text fontWeight="bold">محفظة إلكترونية</Text>
                              <Badge colorScheme="gray">قريباً</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              الدفع عبر المحفظة الإلكترونية
                            </Text>
                          </VStack>
                        </Radio>
                        <Radio value="bank_transfer" colorScheme="red" isDisabled>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Text fontWeight="bold">تحويل بنكي</Text>
                              <Badge colorScheme="gray">قريباً</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              التحويل البنكي المباشر
                            </Text>
                          </VStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </VStack>
                </CardBody>
              </Card>

              {/* Summary */}
              <Card bg="gray.50">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">ملخص الاشتراك</Heading>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text>عدد الميزات المختارة:</Text>
                        <Text fontWeight="bold">{selectedFeatures.size}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>الخطة:</Text>
                        <Text fontWeight="bold">{planLabels[selectedPlan].label}</Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold">
                          الإجمالي:
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="red.500">
                          {formatCurrency(total)}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        للفترة: {planLabels[selectedPlan].multiplier} شهر
                      </Text>
                    </VStack>
                    <Button
                      colorScheme="red"
                      size="lg"
                      width="100%"
                      onClick={onConfirmOpen}
                      isDisabled={selectedFeatures.size === 0 || submitting}
                      isLoading={submitting}
                    >
                      {paymentMethod === 'cash'
                        ? 'إرسال الطلب والتواصل مع الدعم'
                        : 'إتمام الدفع'}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </HStack>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد الاشتراك</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                هل أنت متأكد من إنشاء الاشتراك بالتفاصيل التالية؟
              </Text>
              <Box bg="gray.50" p={4} borderRadius="md">
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>الخطة:</Text>
                    <Text fontWeight="bold">{planLabels[selectedPlan].label}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>عدد الميزات:</Text>
                    <Text fontWeight="bold">{selectedFeatures.size}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>الإجمالي:</Text>
                    <Text fontWeight="bold" color="red.500">
                      {formatCurrency(total)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>طريقة الدفع:</Text>
                    <Text fontWeight="bold">
                      {paymentMethod === 'cash'
                        ? 'تواصل مع الدعم والدفع'
                        : paymentMethod}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose}>
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={handleSubmit} isLoading={submitting}>
              تأكيد
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

