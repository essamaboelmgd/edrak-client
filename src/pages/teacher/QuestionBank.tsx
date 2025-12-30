import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Stack,
  Text,
  SimpleGrid,
  VStack,
  Flex,
  Center,
  useToast,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import QuestionList from '@/features/question-bank/components/QuestionList';
import QuestionForm from '@/features/question-bank/components/QuestionForm';
import QuestionView from '@/features/question-bank/components/QuestionView';
import questionBankService from '@/features/teacher/services/questionBankService';
import {
  IQuestionBankResponse,
  ICreateQuestionBankRequest,
  IUpdateQuestionBankRequest,
  IGetQuestionBankQuery,
} from '@/types/question-bank.types';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function QuestionBank() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestionBankResponse | null>(null);
  const [filters, setFilters] = useState<IGetQuestionBankQuery>({
    page: 1,
    limit: 20,
    activeOnly: true,
  });

  const queryClient = useQueryClient();

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ['questionBank', filters],
    queryFn: () => questionBankService.getAllQuestions(filters),
  });

  // Fetch statistics (with error handling)
  // NOTE: Backend route `/exams/question-bank/statistics` must be defined BEFORE `/exams/question-bank/:id`
  // Otherwise "statistics" will be treated as an ID parameter
  const { data: stats, error: statsError } = useQuery({
    queryKey: ['questionBankStats'],
    queryFn: () => questionBankService.getQuestionStatistics(),
    retry: false, // Don't retry if it fails
    enabled: true, // Still try to fetch, but handle errors gracefully
  });

  const toast = useToast();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ICreateQuestionBankRequest) => questionBankService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      queryClient.invalidateQueries({ queryKey: ['questionBankStats'] });
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
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      queryClient.invalidateQueries({ queryKey: ['questionBankStats'] });
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
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      queryClient.invalidateQueries({ queryKey: ['questionBankStats'] });
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
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          boxShadow="xl"
        >
          <CardBody>
            <Heading fontSize="2xl" fontWeight="bold" mb={6}>
              {viewMode === 'create' ? 'إنشاء سؤال جديد' : 'تعديل السؤال'}
            </Heading>
            <QuestionForm
              question={viewMode === 'edit' ? selectedQuestion || undefined : undefined}
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

  const total = data?.data?.total || 0;

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
              <Icon icon="solar:question-circle-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              بنك الأسئلة
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإدارة {total} سؤال على المنصة
            </Text>
          </VStack>
          <Button
            bg="white"
            color="orange.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            onClick={handleCreate}
            leftIcon={<Icon icon="solar:question-circle-add-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
          >
            إضافة سؤال جديد
          </Button>
        </Flex>
      </Box>

      {/* Stats Cards */}
      {statistics && !statsError && (
        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={{ base: 4, md: 6 }}>
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
                    سؤال مسجل
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, purple.400, purple.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:question-circle-bold-duotone"
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
                    نشط
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
                    عام
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
                    icon="solar:question-circle-bold-duotone"
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
                    مرتبط
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

      {/* Questions List */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
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
          />
        </CardBody>
      </Card>

      {/* Pagination */}
      {data?.data && data.data.totalPages > 1 && (
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          boxShadow="xl"
        >
          <CardBody>
            <HStack justify="center" spacing={3}>
              <Button
                size="sm"
                fontWeight="medium"
                borderRadius="xl"
                h={8}
                isDisabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                السابق
              </Button>
              <Text fontSize="sm" color="gray.700">
                صفحة {filters.page} من {data.data.totalPages}
              </Text>
              <Button
                size="sm"
                fontWeight="medium"
                borderRadius="xl"
                h={8}
                isDisabled={filters.page === data.data.totalPages}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
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

