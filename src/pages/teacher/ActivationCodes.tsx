import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Badge,
  SimpleGrid,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  activationCodesService,
  IActivationCode,
  ActivationTargetType,
} from '@/features/admin/services/activationCodesService';
import CreateActivationCodesModal from '@/features/admin/components/CreateActivationCodesModal';

export default function TeacherActivationCodes() {
  const toast = useToast();
  const [codes, setCodes] = useState<IActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activationCodesService.getActivationCodes({
        page,
        limit: 20,
        targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as ActivationTargetType) : undefined,
        isUsed: statusFilter === 'used' ? true : statusFilter === 'unused' ? false : undefined,
        code: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setCodes(response.data.codes);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      console.error('Error fetching activation codes:', error);
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء جلب الأكواد',
      });
    } finally {
      setLoading(false);
    }
  }, [page, targetTypeFilter, statusFilter, searchTerm, toast]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const getTargetTypeLabel = (type: ActivationTargetType): string => {
    const labels: Record<ActivationTargetType, string> = {
      course: 'كورس',
      lesson: 'درس',
      courseSection: 'قسم كورسات',
      lessonSection: 'قسم دروس',
    };
    return labels[type] || type;
  };

  const getTargetLabel = (code: IActivationCode): string => {
    if (code.course) return code.course.title;
    if (code.lesson) return code.lesson.title;
    if (code.courseSection) return code.courseSection.name;
    if (code.lessonSection) return code.lessonSection.name;
    return '-';
  };

  // Calculate stats
  const stats = {
    total,
    used: codes.filter(c => c.isUsed).length,
    unused: codes.filter(c => !c.isUsed).length,
  };

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, teal.600 0%, cyan.500 50%, blue.400 100%)"
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
              <Icon icon="solar:key-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              أكواد التفعيل
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإنشاء {total} كود تفعيل على المنصة
            </Text>
          </VStack>
          <Button
            bg="white"
            color="teal.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            leftIcon={<Icon icon="solar:key-plus-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
            onClick={() => setShowCreateModal(true)}
          >
            إنشاء أكواد جديدة
          </Button>
        </Flex>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={{ base: 4, md: 6 }}>
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
                  إجمالي الأكواد
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {stats.total}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كود مسجل
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, teal.400, teal.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:key-bold-duotone"
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
                  متاح
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {stats.unused}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كود متاح
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
                  مستخدم
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                  {stats.used}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كود مستخدم
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, red.400, red.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:close-circle-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
        <CardBody>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            align={{ base: 'stretch', md: 'center' }}
            wrap="wrap"
          >
            <InputGroup flex={1} minW={{ base: '100%', md: '200px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon icon="solar:magnifer-bold-duotone" width="18" height="18" />
              </InputLeftElement>
              <Input
                placeholder="بحث بالكود..."
                bg="white"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>

            <Select
              bg="white"
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              placeholder="النوع"
              minW={{ base: '100%', md: '200px' }}
            >
              <option value="all">كل الأنواع</option>
              <option value="course">كورس</option>
              <option value="lesson">درس</option>
              <option value="courseSection">قسم كورسات</option>
              <option value="lessonSection">قسم دروس</option>
            </Select>

            <Select
              bg="white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              placeholder="الحالة"
              minW={{ base: '100%', md: '150px' }}
            >
              <option value="all">الكل</option>
              <option value="used">مستخدم</option>
              <option value="unused">غير مستخدم</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Table */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
        <CardBody>
          <Stack spacing={4}>
            <HStack justify="space-between" flexWrap="wrap">
              <Stack>
                <Heading fontSize="xl">أكواد التفعيل</Heading>
                <Text fontSize="sm" color="gray.500">
                  النتائج {page} / {totalPages} من {total}
                </Text>
              </Stack>
            </HStack>

            <TableContainer bg="white" rounded={10}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>الكود</Th>
                    <Th>النوع</Th>
                    <Th>الهدف</Th>
                    <Th>السعر</Th>
                    <Th>الحالة</Th>
                    <Th>تاريخ الإنشاء</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Td key={i}>
                            <Skeleton h={4} rounded={3} />
                          </Td>
                        ))}
                      </Tr>
                    ))
                  ) : codes.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={12}>
                        <VStack spacing={4}>
                          <Box>
                            <Icon icon="solar:key-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                          </Box>
                          <VStack spacing={2}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.600">
                              لا توجد بيانات للعرض
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              ليس هناك نتائج لعرضها
                            </Text>
                          </VStack>
                        </VStack>
                      </Td>
                    </Tr>
                  ) : (
                    codes.map((code) => (
                      <Tr key={code._id}>
                        <Td>
                          <Text fontFamily="mono" fontWeight="bold" fontSize="sm">
                            {code.code}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {getTargetTypeLabel(code.targetType)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {getTargetLabel(code)}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {code.price.toLocaleString()} ج.م
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={code.isUsed ? 'red' : 'green'}
                            px={3}
                            py={1}
                            borderRadius="md"
                          >
                            {code.isUsed ? 'مستخدم' : 'متاح'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(code.createdAt).toLocaleDateString('ar-EG')}
                          </Text>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card
                borderRadius="2xl"
                border="1px"
                borderColor="gray.200"
                bg="white"
                boxShadow="xl"
              >
                <CardBody>
                  <HStack justify="flex-end" spacing={3}>
                    <Button
                      size="sm"
                      fontWeight="medium"
                      borderRadius="xl"
                      h={8}
                      isDisabled={loading || page >= totalPages}
                      isLoading={loading}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      التالية
                    </Button>
                    <Text fontSize="sm">
                      صفحة {page} من {totalPages}
                    </Text>
                    <Button
                      size="sm"
                      fontWeight="medium"
                      borderRadius="xl"
                      h={8}
                      isDisabled={loading || page === 1}
                      isLoading={loading}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      السابقة
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            )}
          </Stack>
        </CardBody>
      </Card>

      {/* Create Modal */}
      <CreateActivationCodesModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCodes}
      />
    </Stack>
  );
}
