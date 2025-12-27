import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  Spacer,
  Stack,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Wrap,
  WrapItem,
  Badge,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import examService from '@/features/exams/examService';
import courseService from '@/features/courses/courseService';
import userService from '@/features/user/userService';
import { IExamResponse } from '@/types/exam.types';
import CreateExam from '@/features/exams/components/CreateExam';

export default function AdminExams() {
  const [searchParams, setSearchParams] = useSearchParams({ page: '1' });
  const toast = useToast();
  
  const [exams, setExams] = useState<IExamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchExams = async () => {
    try {
      setIsFetching(true);
      const query: any = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 10,
      };

      if (searchParams.get('teacher')) query.teacher = searchParams.get('teacher');
      if (searchParams.get('examType')) query.examType = searchParams.get('examType');
      if (searchParams.get('status')) query.status = searchParams.get('status');
      if (searchParams.get('search')) query.search = searchParams.get('search');

      const response = await examService.getExams(query);
      setExams(response.data.exams);
      setTotal(response.data.total);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في جلب الامتحانات',
        status: 'error',
      });
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await userService.getAllTeachers({ limit: 100 });
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchExams();
    fetchTeachers();
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;

    try {
      await examService.deleteExam(id);
      toast({
        title: 'نجح',
        description: 'تم حذف الامتحان بنجاح',
        status: 'success',
      });
      fetchExams();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في حذف الامتحان',
        status: 'error',
      });
    }
  };

  const handleTogglePublish = async (exam: IExamResponse) => {
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
      fetchExams();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث حالة الامتحان',
        status: 'error',
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => {
      if (value) {
        prev.set('search', value);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  return (
    <Box p={6} dir="rtl">
      <Stack spacing={6}>
        <Wrap>
          <WrapItem>
            <Select
              bg="white"
              value={searchParams.get('teacher') || ''}
              onChange={(e) => {
                setSearchParams(prev => {
                  if (e.target.value) {
                    prev.set('teacher', e.target.value);
                  } else {
                    prev.delete('teacher');
                  }
                  prev.set('page', '1');
                  return prev;
                });
              }}
              placeholder="المدرسين"
            >
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                </option>
              ))}
            </Select>
          </WrapItem>
          <WrapItem>
            <Select
              bg="white"
              value={searchParams.get('examType') || ''}
              onChange={(e) => {
                setSearchParams(prev => {
                  if (e.target.value) {
                    prev.set('examType', e.target.value);
                  } else {
                    prev.delete('examType');
                  }
                  prev.set('page', '1');
                  return prev;
                });
              }}
              placeholder="نوع الامتحان"
            >
              <option value="general">عام</option>
              <option value="course">كورس</option>
              <option value="lesson">درس</option>
            </Select>
          </WrapItem>
          <WrapItem>
            <Select
              bg="white"
              value={searchParams.get('status') || ''}
              onChange={(e) => {
                setSearchParams(prev => {
                  if (e.target.value) {
                    prev.set('status', e.target.value);
                  } else {
                    prev.delete('status');
                  }
                  prev.set('page', '1');
                  return prev;
                });
              }}
              placeholder="الحالة"
            >
              <option value="draft">مسودة</option>
              <option value="published">منشور</option>
              <option value="archived">مؤرشف</option>
            </Select>
          </WrapItem>
        </Wrap>

        <Card>
          <CardBody>
            <Stack spacing={4}>
              <HStack justify="space-between" flexWrap="wrap">
                <Stack>
                  <Heading fontSize="xl">الامتحانات</Heading>
                  <Text fontSize="sm" color="gray.500">
                    النتائج {page} / {totalPages} من {total}
                  </Text>
                </Stack>
                <Spacer />
                <HStack>
                  <InputGroup size="sm" w={{ base: '100%', sm: '200px' }}>
                    <InputLeftElement pointerEvents="none">
                      <Icon icon="lucide:search" width="15" height="15" />
                    </InputLeftElement>
                    <Input
                      placeholder="بحث..."
                      bg="white"
                      defaultValue={searchParams.get('search') || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                  </InputGroup>
                  <CreateExam
                    onSuccess={fetchExams}
                    trigger={
                      <Button colorScheme="blue" size="sm">
                        + امتحان جديد
                      </Button>
                    }
                  />
                </HStack>
              </HStack>

              <TableContainer bg="white" rounded={10}>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>العنوان</Th>
                      <Th>المدرس</Th>
                      <Th>الكورس</Th>
                      <Th>الدرس</Th>
                      <Th>منشور؟</Th>
                      <Th>درجة الامتحان</Th>
                      <Th>عدد الأسئلة</Th>
                      <Th>مدة الامتحان</Th>
                      <Th>المحاولات</Th>
                      <Th>تاريخ الإنشاء</Th>
                      <Th>الإجراءات</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading || isFetching ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <Tr key={idx}>
                          {Array.from({ length: 12 }).map((_, i) => (
                            <Td key={i}>
                              <Skeleton h={4} rounded={3} />
                            </Td>
                          ))}
                        </Tr>
                      ))
                    ) : exams.length === 0 ? (
                      <Tr>
                        <Td colSpan={12} textAlign="center">
                          لا توجد بيانات للعرض
                        </Td>
                      </Tr>
                    ) : (
                      exams.map((exam, idx) => (
                        <Tr key={exam._id}>
                          <Td>{(page - 1) * 10 + idx + 1}</Td>
                          <Td>
                            <Link to={`/admin/exams/${exam._id}`}>
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                color="blue.500"
                                textDecoration="underline"
                                minW={200}
                                maxW={200}
                                noOfLines={1}
                              >
                                {exam.title}
                              </Text>
                            </Link>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                              {exam.teacher.firstName} {exam.teacher.lastName}
                            </Text>
                          </Td>
                          <Td>
                            {exam.course ? (
                              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                {exam.course.title}
                              </Text>
                            ) : (
                              <Badge>غير متوفر</Badge>
                            )}
                          </Td>
                          <Td>
                            {exam.lesson ? (
                              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                {exam.lesson.title}
                              </Text>
                            ) : (
                              <Badge>غير متوفر</Badge>
                            )}
                          </Td>
                          <Td>
                            <Switch
                              isChecked={exam.status === 'published'}
                              onChange={() => handleTogglePublish(exam)}
                              colorScheme="green"
                            />
                          </Td>
                          <Td>{exam.totalPoints || 0}</Td>
                          <Td>{exam.questionCount || 0}</Td>
                          <Td>
                            {exam.settings.duration ? (
                              `${exam.settings.duration} دقيقة`
                            ) : (
                              <Badge>غير مفعل</Badge>
                            )}
                          </Td>
                          <Td>{exam.stats.totalAttempts || 0}</Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(exam.createdAt).toLocaleDateString('ar-EG')}
                            </Text>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<Icon icon="lucide:more-vertical" width="16" height="16" />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem as={Link} to={`/admin/exams/${exam._id}`}>
                                  عرض
                                </MenuItem>
                                <MenuItem as={Link} to={`/admin/exams/${exam._id}/edit`}>
                                  تعديل
                                </MenuItem>
                                <MenuItem
                                  color="red.500"
                                  onClick={() => handleDelete(exam._id)}
                                >
                                  حذف
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>

              <HStack justify="flex-end" px={4}>
                <Button
                  size="sm"
                  isDisabled={isFetching || loading || page >= totalPages}
                  isLoading={loading || isFetching}
                  onClick={() => {
                    setSearchParams(prev => {
                      prev.set('page', (page + 1).toString());
                      return prev;
                    });
                  }}
                >
                  التالية
                </Button>
                <Button
                  size="sm"
                  isDisabled={isFetching || loading || page === 1}
                  isLoading={loading || isFetching}
                  onClick={() => {
                    setSearchParams(prev => {
                      prev.set('page', (page - 1).toString());
                      return prev;
                    });
                  }}
                >
                  السابقة
                </Button>
              </HStack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}

