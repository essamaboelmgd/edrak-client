import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Stack,
  Divider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import examService from '@/features/teacher/services/examService';
import { IExamResponse, IExamStatisticsResponse } from '@/types/exam.types';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export default function ViewExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();
  
  const [exam, setExam] = useState<IExamResponse | null>(null);
  const [statistics, setStatistics] = useState<IExamStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = role === UserRole.ADMIN ? '/admin' : '/teacher';

  useEffect(() => {
    if (id) {
      fetchExam();
      fetchStatistics();
    }
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await examService.getExamById(id!, true);
      setExam(response.data.exam as IExamResponse);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في جلب الامتحان',
        status: 'error',
      });
      navigate(`${basePath}/exams`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await examService.getExamStatistics(id!);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Failed to fetch statistics', error);
    }
  };

  const handleTogglePublish = async () => {
    if (!exam) return;

    try {
      if (exam.status === 'published') {
        await examService.unpublishExam(exam._id);
        toast({
          title: 'نجح',
          description: 'تم إلغاء نشر الامتحان',
          status: 'success',
        });
      } else {
        await examService.publishExam(exam._id);
        toast({
          title: 'نجح',
          description: 'تم نشر الامتحان بنجاح',
          status: 'success',
        });
      }
      fetchExam();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث حالة الامتحان',
        status: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box p={6} dir="rtl">
        <Stack spacing={4}>
          <Skeleton h={10} />
          <Skeleton h={200} />
        </Stack>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box p={6} dir="rtl">
        <Text>الامتحان غير موجود</Text>
      </Box>
    );
  }

  return (
    <Box p={6} dir="rtl">
      <Stack spacing={6}>
        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap">
          <VStack align="start" spacing={2}>
            <HStack>
              <Heading fontSize="2xl">{exam.title}</Heading>
              <Badge
                colorScheme={
                  exam.status === 'published' ? 'green' :
                  exam.status === 'draft' ? 'gray' : 'orange'
                }
              >
                {exam.status === 'published' ? 'منشور' :
                 exam.status === 'draft' ? 'مسودة' : 'مؤرشف'}
              </Badge>
            </HStack>
            {exam.description && (
              <Text color="gray.600">{exam.description}</Text>
            )}
          </VStack>
          <HStack>
            <Button
              onClick={handleTogglePublish}
              colorScheme={exam.status === 'published' ? 'orange' : 'green'}
              size="sm"
            >
              {exam.status === 'published' ? 'إلغاء النشر' : 'نشر الامتحان'}
            </Button>
            <Button
              as={Link}
              to={`${basePath}/exams/${id}/edit`}
              colorScheme="blue"
              size="sm"
            >
              تعديل
            </Button>
            <Button
              as={Link}
              to={`${basePath}/exams`}
              variant="ghost"
              size="sm"
            >
              رجوع
            </Button>
          </HStack>
        </HStack>

        {/* Statistics */}
        {statistics && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>إجمالي المحاولات</StatLabel>
                  <StatNumber>{statistics.totalAttempts}</StatNumber>
                  <StatHelpText>{statistics.completedAttempts} مكتملة</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>إجمالي الطلاب</StatLabel>
                  <StatNumber>{statistics.totalStudents}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>متوسط الدرجات</StatLabel>
                  <StatNumber>{statistics.averageScore.toFixed(1)}</StatNumber>
                  <StatHelpText>من {exam.totalPoints}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>معدل النجاح</StatLabel>
                  <StatNumber>{statistics.passRate.toFixed(1)}%</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Exam Details */}
        <Card>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">تفاصيل الامتحان</Heading>
              <Divider />
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>نوع الامتحان</Text>
                  <Text fontWeight="medium">
                    {exam.examType === 'general' ? 'عام' :
                     exam.examType === 'course' ? 'كورس' : 'درس'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>نوع المحتوى</Text>
                  <Text fontWeight="medium">
                    {exam.contentType === 'questions' ? 'أسئلة' :
                     exam.contentType === 'pdf' ? 'PDF' : 'مختلط'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>إجمالي النقاط</Text>
                  <Text fontWeight="medium">{exam.totalPoints}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>عدد الأسئلة</Text>
                  <Text fontWeight="medium">{exam.questionCount}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>مدة الامتحان</Text>
                  <Text fontWeight="medium">
                    {exam.settings.duration ? `${exam.settings.duration} دقيقة` : 'غير محدود'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>درجة النجاح</Text>
                  <Text fontWeight="medium">{exam.settings.passingScore}%</Text>
                </Box>
                {exam.course && (
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>الكورس</Text>
                    <Text fontWeight="medium">{exam.course.title}</Text>
                  </Box>
                )}
                {exam.lesson && (
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>الدرس</Text>
                    <Text fontWeight="medium">{exam.lesson.title}</Text>
                  </Box>
                )}
              </SimpleGrid>

              <Divider />

              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>الإعدادات</Text>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                  <HStack>
                    <Icon icon={exam.settings.showResults ? 'lucide:check' : 'lucide:x'} />
                    <Text fontSize="sm">إظهار النتائج</Text>
                  </HStack>
                  <HStack>
                    <Icon icon={exam.settings.showCorrectAnswers ? 'lucide:check' : 'lucide:x'} />
                    <Text fontSize="sm">إظهار الإجابات الصحيحة</Text>
                  </HStack>
                  <HStack>
                    <Icon icon={exam.settings.allowRetake ? 'lucide:check' : 'lucide:x'} />
                    <Text fontSize="sm">السماح بإعادة المحاولة</Text>
                  </HStack>
                  <HStack>
                    <Icon icon={exam.settings.shuffleQuestions ? 'lucide:check' : 'lucide:x'} />
                    <Text fontSize="sm">خلط الأسئلة</Text>
                  </HStack>
                  <HStack>
                    <Icon icon={exam.settings.shuffleAnswers ? 'lucide:check' : 'lucide:x'} />
                    <Text fontSize="sm">خلط الإجابات</Text>
                  </HStack>
                  <HStack>
                    <Icon icon={exam.settings.requireAll ? 'lucide:check' : 'lucide:x'} />
                    <Text fontSize="sm">إلزام الإجابة على الكل</Text>
                  </HStack>
                </SimpleGrid>
              </Box>

              {exam.pdfUrl && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={2}>رابط PDF</Text>
                    <Button
                      as="a"
                      href={exam.pdfUrl}
                      target="_blank"
                      leftIcon={<Icon icon="lucide:external-link" />}
                      size="sm"
                      colorScheme="blue"
                    >
                      فتح PDF
                    </Button>
                  </Box>
                </>
              )}
            </Stack>
          </CardBody>
        </Card>

        {/* Top Performers */}
        {statistics && statistics.topPerformers.length > 0 && (
          <Card>
            <CardBody>
              <Stack spacing={4}>
                <Heading size="md">أفضل الأداء</Heading>
                <Divider />
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>الطالب</Th>
                        <Th>الدرجة</Th>
                        <Th>النسبة</Th>
                        <Th>المحاولة</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {statistics.topPerformers.map((performer, idx) => (
                        <Tr key={idx}>
                          <Td>
                            {performer.student.firstName} {performer.student.lastName}
                          </Td>
                          <Td>{performer.score}</Td>
                          <Td>{performer.percentage.toFixed(1)}%</Td>
                          <Td>{performer.attemptNumber}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

