import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,

  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Badge,
  IconButton,
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
  Select,
  Textarea,
  Switch,
  HStack,
  VStack,
  useDisclosure,
  Skeleton,
  Text,
  SimpleGrid,
  Stack,
  Flex,

} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  featuresService,
  Feature,
  CreateFeatureData,
} from '@/features/admin/services/featuresService';

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

export default function AdminFeatures() {
  const toast = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } =
    useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } =
    useDisclosure();
  const [formData, setFormData] = useState<CreateFeatureData>({
    name: '',
    nameArabic: '',
    description: '',
    descriptionArabic: '',
    type: 'optional',
    category: 'other',
    price: 0,
    discount: 0,
    order: 0,
    isActive: true,
    isPopular: false,
    isRecommended: false,
  });

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const response = await featuresService.getAllFeatures(params);
      if (response.success) {
        if ('features' in response.data && typeof response.data.features === 'object' && !Array.isArray(response.data.features)) {
          const grouped = response.data.features as {
            essential: Feature[];
            optional: Feature[];
            total: number;
          };
          setFeatures([...grouped.essential, ...grouped.optional]);
        } else if (Array.isArray(response.data.features)) {
          setFeatures(response.data.features);
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

  useEffect(() => {
    fetchFeatures();
  }, [typeFilter, categoryFilter]);

  const handleCreate = async () => {
    try {
      await featuresService.createFeature(formData);
      toast({
        title: 'نجح',
        description: 'تم إنشاء الميزة بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCreateClose();
      resetForm();
      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء الميزة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (feature: Feature) => {
    setSelectedFeature(feature);
    setFormData({
      name: feature.name,
      nameArabic: feature.nameArabic,
      description: feature.description,
      descriptionArabic: feature.descriptionArabic,
      type: feature.type,
      category: feature.category,
      price: feature.price,
      discount: feature.discount,
      icon: feature.icon,
      order: feature.order,
      isActive: feature.isActive,
      limits: feature.limits,
      requiredFeatures: feature.requiredFeatures?.map((f) => f._id),
      isPopular: feature.isPopular,
      isRecommended: feature.isRecommended,
    });
    onEditOpen();
  };

  const handleUpdate = async () => {
    if (!selectedFeature) return;
    try {
      await featuresService.updateFeature(selectedFeature._id, formData);
      toast({
        title: 'نجح',
        description: 'تم تحديث الميزة بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
      resetForm();
      setSelectedFeature(null);
      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء تحديث الميزة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الميزة؟')) return;
    try {
      await featuresService.deleteFeature(id);
      toast({
        title: 'نجح',
        description: 'تم حذف الميزة بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء حذف الميزة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameArabic: '',
      description: '',
      descriptionArabic: '',
      type: 'optional',
      category: 'other',
      price: 0,
      discount: 0,
      order: 0,
      isActive: true,
      isPopular: false,
      isRecommended: false,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    total: features.length,
    essential: features.filter((f) => f.type === 'essential').length,
    optional: features.filter((f) => f.type === 'optional').length,
    active: features.filter((f) => f.isActive).length,
  };

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, red.600 0%, pink.500 50%, purple.400 100%)"
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        color="white"
        boxShadow="xl"
      >
        {/* Decorative Blobs */}
        <Box
          position="absolute"
          top="-50%"
          right="-10%"
          width="400px"
          height="400px"
          bgGradient="radial(circle, whiteAlpha.200, transparent)"
          borderRadius="full"
          filter="blur(60px)"
        />

        <Flex
          position="relative"
          zIndex={1}
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'start', md: 'center' }}
          justify="space-between"
          gap={4}
        >
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon icon="solar:settings-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              إدارة الميزات
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              إدارة ميزات المنصة وأسعارها ({stats.total} ميزة)
            </Text>
          </VStack>
          <Button
            bg="white"
            color="red.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            onClick={onCreateOpen}
            leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
          >
            إضافة ميزة جديدة
          </Button>
        </Flex>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  إجمالي الميزات
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {stats.total}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ميزة متاحة
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, red.400, red.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:settings-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  الميزات الأساسية
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {stats.essential}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ميزة أساسية
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, green.400, green.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  الميزات الاختيارية
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  {stats.optional}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ميزة اختيارية
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, blue.400, blue.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:star-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          transition="all 0.3s"
          _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  الميزات النشطة
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                  {stats.active}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ميزة نشطة
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, purple.400, purple.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:power-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters Section */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Select
              w={{ base: '100%', md: '200px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              bg="white"
            >
              <option value="all">جميع الأنواع</option>
              <option value="essential">أساسية</option>
              <option value="optional">اختيارية</option>
            </Select>
            <Select
              w={{ base: '100%', md: '200px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              bg="white"
            >
              <option value="all">جميع الفئات</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Table Section */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
        <CardBody>
          <TableContainer>
            <Table colorScheme="gray" rounded={10}>
              <Thead>
                <Tr>
                  <Th>الاسم</Th>
                  <Th>النوع</Th>
                  <Th>الفئة</Th>
                  <Th>السعر</Th>
                  <Th>الخصم</Th>
                  <Th>السعر النهائي</Th>
                  <Th>الحالة</Th>
                  <Th>الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Tr key={idx}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Td key={i}>
                          <Skeleton height="20px" />
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : features.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={8}>
                      <VStack spacing={2}>
                        <Icon icon="solar:settings-bold-duotone" width="48" height="48" color="gray.300" />
                        <Text color="gray.500" fontSize="sm" fontWeight="medium">
                          لا توجد ميزات
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  features.map((feature) => (
                    <Tr key={feature._id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">{feature.nameArabic}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {feature.name}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={feature.type === 'essential' ? 'green' : 'blue'}
                        >
                          {feature.type === 'essential' ? 'أساسية' : 'اختيارية'}
                        </Badge>
                      </Td>
                      <Td fontSize="sm" fontWeight="medium">{categoryLabels[feature.category] || feature.category}</Td>
                      <Td fontSize="sm" fontWeight="medium">{formatCurrency(feature.price)}</Td>
                      <Td fontSize="sm" fontWeight="medium">{feature.discount}%</Td>
                      <Td fontWeight="bold" color="green.500" fontSize="sm">
                        {formatCurrency(feature.finalPrice)}
                      </Td>
                      <Td>
                        <Badge colorScheme={feature.isActive ? 'green' : 'gray'}>
                          {feature.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="تعديل"
                            icon={<Icon icon="solar:pen-bold-duotone" />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEdit(feature)}
                            rounded={2}
                            h={8}
                          />
                          <IconButton
                            aria-label="حذف"
                            icon={<Icon icon="solar:trash-bin-trash-bold-duotone" />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(feature._id)}
                            rounded={2}
                            h={8}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إضافة ميزة جديدة</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>الاسم بالإنجليزية</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الاسم بالعربية</FormLabel>
                <Input
                  value={formData.nameArabic}
                  onChange={(e) =>
                    setFormData({ ...formData, nameArabic: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الوصف بالإنجليزية</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الوصف بالعربية</FormLabel>
                <Textarea
                  value={formData.descriptionArabic}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionArabic: e.target.value })
                  }
                />
              </FormControl>
              <HStack width="100%">
                <FormControl>
                  <FormLabel>النوع</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'essential' | 'optional',
                      })
                    }
                  >
                    <option value="essential">أساسية</option>
                    <option value="optional">اختيارية</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>الفئة</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              <HStack width="100%">
                <FormControl>
                  <FormLabel>السعر</FormLabel>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>الخصم (%)</FormLabel>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: Number(e.target.value) })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>الترتيب</FormLabel>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: Number(e.target.value) })
                    }
                  />
                </FormControl>
              </HStack>
              <HStack width="100%">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} mr={3}>
                    نشط
                  </FormLabel>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} mr={3}>
                    شائع
                  </FormLabel>
                  <Switch
                    isChecked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} mr={3}>
                    موصى به
                  </FormLabel>
                  <Switch
                    isChecked={formData.isRecommended}
                    onChange={(e) =>
                      setFormData({ ...formData, isRecommended: e.target.checked })
                    }
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={handleCreate}>
              إنشاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل الميزة</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>الاسم بالإنجليزية</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الاسم بالعربية</FormLabel>
                <Input
                  value={formData.nameArabic}
                  onChange={(e) =>
                    setFormData({ ...formData, nameArabic: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الوصف بالإنجليزية</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الوصف بالعربية</FormLabel>
                <Textarea
                  value={formData.descriptionArabic}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionArabic: e.target.value })
                  }
                />
              </FormControl>
              <HStack width="100%">
                <FormControl>
                  <FormLabel>النوع</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'essential' | 'optional',
                      })
                    }
                  >
                    <option value="essential">أساسية</option>
                    <option value="optional">اختيارية</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>الفئة</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              <HStack width="100%">
                <FormControl>
                  <FormLabel>السعر</FormLabel>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>الخصم (%)</FormLabel>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: Number(e.target.value) })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>الترتيب</FormLabel>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: Number(e.target.value) })
                    }
                  />
                </FormControl>
              </HStack>
              <HStack width="100%">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} mr={3}>
                    نشط
                  </FormLabel>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} mr={3}>
                    شائع
                  </FormLabel>
                  <Switch
                    isChecked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} mr={3}>
                    موصى به
                  </FormLabel>
                  <Switch
                    isChecked={formData.isRecommended}
                    onChange={(e) =>
                      setFormData({ ...formData, isRecommended: e.target.checked })
                    }
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={handleUpdate}>
              تحديث
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}

