import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
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

  return (
    <Box p={6} dir="rtl">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading as="h1" size="lg" mb={2}>
              إدارة الميزات
            </Heading>
            <Text color="gray.600">إدارة ميزات المنصة وأسعارها</Text>
          </Box>
          <Button
            leftIcon={<Icon icon="solar:add-circle-bold" />}
            colorScheme="red"
            onClick={onCreateOpen}
          >
            إضافة ميزة جديدة
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            width="200px"
          >
            <option value="all">جميع الأنواع</option>
            <option value="essential">أساسية</option>
            <option value="optional">اختيارية</option>
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            width="200px"
          >
            <option value="all">جميع الفئات</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </HStack>

        {/* Table */}
        <Card>
          <CardBody>
            <TableContainer>
              <Table>
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
                      <Td colSpan={8} textAlign="center">
                        <Text color="gray.500">لا توجد ميزات</Text>
                      </Td>
                    </Tr>
                  ) : (
                    features.map((feature) => (
                      <Tr key={feature._id}>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{feature.nameArabic}</Text>
                            <Text fontSize="sm" color="gray.500">
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
                        <Td>{categoryLabels[feature.category] || feature.category}</Td>
                        <Td>{formatCurrency(feature.price)}</Td>
                        <Td>{feature.discount}%</Td>
                        <Td fontWeight="bold" color="green.500">
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
                              icon={<Icon icon="solar:pen-bold" />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(feature)}
                            />
                            <IconButton
                              aria-label="حذف"
                              icon={<Icon icon="solar:trash-bin-trash-bold" />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(feature._id)}
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
      </VStack>

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
    </Box>
  );
}

