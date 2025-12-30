import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useToast,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Text,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Flex,

} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import QuestionList from '@/features/question-bank/components/QuestionList';
import AdminQuestionForm from '@/features/admin/components/AdminQuestionForm';
import QuestionView from '@/features/question-bank/components/QuestionView';
import questionBankService from '@/features/teacher/services/questionBankService';
import { teachersService } from '@/features/admin/services/teachersService';
import {
  IQuestionBankResponse,
  ICreateQuestionBankRequest,
  IUpdateQuestionBankRequest,
  IGetQuestionBankQuery,
} from '@/types/question-bank.types';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function AdminQuestionBank() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestionBankResponse | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filters, setFilters] = useState<IGetQuestionBankQuery>({
    page: 1,
    limit: 20,
    activeOnly: false, // Admin can see all questions
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFiltersRef = useRef({ searchTerm: '', teacherFilter: 'all' });

  const queryClient = useQueryClient();

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teachersService.getAllTeachers({ limit: 1000 });
        if (response.success && response.data) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminQuestionBank', filters],
    queryFn: () => questionBankService.getAllQuestions(filters),
  });

  // Fetch statistics
  const { data: stats, error: statsError } = useQuery({
    queryKey: ['adminQuestionBankStats', teacherFilter],
    queryFn: () => questionBankService.getQuestionStatistics(teacherFilter !== 'all' ? teacherFilter : undefined),
    retry: false,
    enabled: true,
  });

  // Update filters when search or teacher filter changes
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.teacherFilter !== teacherFilter;

    if (filtersChanged && filters.page !== 1) {
      prevFiltersRef.current = { searchTerm, teacherFilter };
      setFilters({ ...filters, page: 1 });
      return;
    }

    prevFiltersRef.current = { searchTerm, teacherFilter };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const delay = searchTerm ? 500 : 0;

    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        page: filtersChanged && filters.page !== 1 ? 1 : filters.page,
        search: searchTerm || undefined,
        teacher: teacherFilter !== 'all' ? teacherFilter : undefined,
      });
    }, delay);

    searchTimeoutRef.current = timeoutId;

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, teacherFilter, filters]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ICreateQuestionBankRequest) => questionBankService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBank'] });
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBankStats'] });
      setViewMode('list');
      toast({
        status: 'success',
        description: 'تم إنشاء السؤال بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء السؤال',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateQuestionBankRequest }) =>
      questionBankService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBank'] });
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBankStats'] });
      setViewMode('list');
      setSelectedQuestion(null);
      toast({
        status: 'success',
        description: 'تم تحديث السؤال بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء تحديث السؤال',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBank'] });
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBankStats'] });
      toast({
        status: 'success',
        description: 'تم حذف السؤال بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء حذف السؤال',
      });
    },
  });

  const handleCreate = () => {
    setSelectedQuestion(null);
    setViewMode('create');
  };

  const handleEdit = (question: IQuestionBankResponse) => {
    setSelectedQuestion(question);
    setViewMode('edit');
  };

  const handleView = (question: IQuestionBankResponse) => {
    setSelectedQuestion(question);
    setViewMode('view');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = async (data: ICreateQuestionBankRequest | IUpdateQuestionBankRequest) => {
    if (viewMode === 'create') {
      await createMutation.mutateAsync(data as ICreateQuestionBankRequest);
    } else if (viewMode === 'edit' && selectedQuestion) {
      await updateMutation.mutateAsync({ id: selectedQuestion._id, data });
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedQuestion(null);
  };

  const statistics = stats?.data?.statistics;

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={6}>
              {viewMode === 'create' ? 'إنشاء سؤال جديد' : 'تعديل السؤال'}
            </Text>
            <AdminQuestionForm
              question={viewMode === 'edit' ? selectedQuestion || undefined : undefined}
              teachers={teachers}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </CardBody>
        </Card>
      </Stack>
    );
  }

  if (viewMode === 'view' && selectedQuestion) {
    return (
      <QuestionView
        question={selectedQuestion}
        onClose={handleCancel}
        onEdit={() => handleEdit(selectedQuestion)}
      />
    );
  }

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, orange.600 0%, red.500 50%, pink.400 100%)"
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
              <Icon icon="solar:book-bookmark-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              بنك الأسئلة
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              إدارة جميع أسئلة المدرسين ({data?.data?.total || 0} سؤال)
            </Text>
          </VStack>
          <Button
            bg="white"
            color="orange.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            onClick={handleCreate}
            leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
          >
            سؤال جديد
          </Button>
        </Flex>
      </Box>

      {/* Stats Cards */}
      {statistics && !statsError && (
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
                    إجمالي الأسئلة
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                    {statistics.total}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    سؤال متاح
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, purple.400, purple.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:book-bookmark-bold-duotone"
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
                    الأسئلة النشطة
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {statistics.active}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    سؤال نشط
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, green.400, green.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:book-bookmark-bold-duotone"
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
                    الأسئلة العامة
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    {statistics.general}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    سؤال عام
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, blue.400, blue.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:book-bookmark-bold-duotone"
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
                    الأسئلة المرتبطة
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                    {statistics.courseSpecific}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    سؤال مرتبط
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, orange.400, orange.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:chart-2-bold-duotone"
                    width="32"
                    height="32"
                    style={{ color: 'white' }}
                  />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Filters Section */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align={{ base: 'stretch', md: 'center' }}>
            <InputGroup flex="1" minW="200px">
              <InputLeftElement pointerEvents="none">
                <Icon icon="solar:magnifer-bold-duotone" width="20" height="20" color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="ابحث عن سؤال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>
            <Select
              w={{ base: '100%', md: '200px' }}
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              bg="white"
            >
              <option value="all">جميع المدرسين</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                </option>
              ))}
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Questions List */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
        <CardBody>
          {error && (
            <Box mb={4} p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="xl" color="red.700">
              حدث خطأ أثناء جلب الأسئلة
            </Box>
          )}
          <QuestionList
            questions={data?.data?.questions || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onCreateNew={handleCreate}
            showTeacher={true}
          />
        </CardBody>
      </Card>

      {/* Pagination */}
      {data?.data && data.data.totalPages > 1 && (
        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
          <CardBody>
            <HStack justify="center" spacing={2}>
              <Button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                isDisabled={filters.page === 1}
                variant="outline"
                size="sm"
                fontWeight="medium"
                h={8}
                rounded={2}
              >
                السابق
              </Button>
              <Text px={4} py={2} color="gray.700" fontSize="sm" fontWeight="medium">
                صفحة {filters.page} من {data.data.totalPages}
              </Text>
              <Button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                isDisabled={filters.page === data.data.totalPages}
                variant="outline"
                size="sm"
                fontWeight="medium"
                h={8}
                rounded={2}
              >
                التالي
              </Button>
            </HStack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}

