import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
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
  useDisclosure,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { KeyboardEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SimpleCreateExam from "@/features/exams/components/SimpleCreateExam";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import examService from "@/features/exams/examService";
import courseService from "@/features/courses/courseService";
import ConfirmationAlert from "@/components/ui/ConfirmationAlert";

export default function NewExams() {
  const [params, setParams] = useSearchParams({
    page: "1",
  });
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['exams', params.toString()],
    queryFn: () => examService.getAllExams({
      page: Number(params.get("page")) || 1,
      limit: 10,
      course: params.get("course") || undefined,
      search: params.get("search") || undefined,
    }),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['myCourses'],
    queryFn: () => courseService.getMyCourses({ limit: 100 }),
  });

  const deleteExamMutation = useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: () => {
      toast({
        title: 'تم الحذف بنجاح',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في حذف الامتحان',
        status: 'error',
      });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      return isPublished ? examService.unpublishExam(id) : examService.publishExam(id);
    },
    onSuccess: () => {
      toast({
        title: 'تم التحديث بنجاح',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث الامتحان',
        status: 'error',
      });
    },
  });

  const exams = data?.data?.exams || [];
  const total = data?.data?.total || 0;
  const currentPage = data?.data?.page || 1;
  const totalPages = data?.data?.totalPages || 0;

  return (
    <Stack spacing={6} flex={1}>
        <Wrap>
          <WrapItem>
            <Select
              value={params.get("course") || ""}
              onChange={(event) => {
                setParams((param) => {
                  if (event.target.value) {
                    param.set("course", event.target.value);
                  } else {
                    param.delete("course");
                  }
                  param.set("page", "1");
                  return param;
                });
              }}
              bg="white"
              placeholder="الكورسات"
            >
              {coursesData?.courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </WrapItem>
        </Wrap>

        <Card>
          <CardBody as={Stack} px={0} spacing={4}>
            <Stack
              direction="row"
              alignItems="end"
              px={4}
              w="100%"
              flexWrap="wrap"
            >
              <Stack>
                <Heading as="h2" fontSize="xl">
                  الامتحانات
                </Heading>
                <Text fontSize="smaller" fontWeight="medium">
                  النتائج {currentPage} / {totalPages} من {total}
                </Text>
              </Stack>
              <Spacer />
              <InputGroup w={{ base: "100%", sm: "max-content" }} size="sm">
                <InputRightElement pointerEvents="none">
                  <Icon icon="lucide:search" width="15" height="15" />
                </InputRightElement>
                <Input
                  type="search"
                  placeholder="اكتب النص هنا"
                  defaultValue={params.get("search") || ""}
                  bg="white"
                  w={200}
                  maxWidth="100%"
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      setParams((param) => {
                        param.set("page", "1");
                        param.set("search", (event.target as any)?.value);
                        return param;
                      });
                    }
                  }}
                />
              </InputGroup>
              <SimpleCreateExam
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['exams'] });
                }}
              />
            </Stack>

            <TableContainer bg="white" rounded={10}>
              <Table colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>العنوان</Th>
                    <Th>الكورس</Th>
                    <Th>الدرس</Th>
                    <Th>منشور؟</Th>
                    <Th>درجة الامتحان</Th>
                    <Th>عدد الاسئلة</Th>
                    <Th>مدة الامتحان</Th>
                    <Th>تاريخ الانشاء</Th>
                    <Th>اخر تحديث</Th>
                    <Th>الاجراءات</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exams.map((item: any) => (
                    <Tr key={item._id}>
                      <Td>{item._id.substring(0, 8)}</Td>
                      <Td>
                        <Link to={`/teacher/exams/${item._id}`}>
                          <Text
                            fontSize="small"
                            fontWeight="medium"
                            color="blue"
                            textDecoration="underline"
                            minW={200}
                            maxW={200}
                            noOfLines={1}
                          >
                            {item.title}
                          </Text>
                        </Link>
                      </Td>
                      <Td>
                        {item.course ? (
                          <Stack direction="row" alignItems="center">
                            <Avatar
                              name={item.course?.title}
                              width={25}
                              height={25}
                            />
                            <Text
                              fontSize="small"
                              fontWeight="medium"
                              minW={200}
                              maxW={200}
                              noOfLines={1}
                            >
                              {item.course?.title}
                            </Text>
                          </Stack>
                        ) : (
                          <Badge>غير متوفر</Badge>
                        )}
                      </Td>
                      <Td>
                        {item.lesson ? (
                          <Stack direction="row" alignItems="center">
                            <Avatar
                              name={item.lesson?.title}
                              width={25}
                              height={25}
                            />
                            <Text
                              fontSize="small"
                              fontWeight="medium"
                              minW={200}
                              maxW={200}
                              noOfLines={1}
                            >
                              {item.lesson?.title}
                            </Text>
                          </Stack>
                        ) : (
                          <Badge>غير متوفر</Badge>
                        )}
                      </Td>
                      <Td>
                        <Switch
                          isChecked={item.status === 'published'}
                          isDisabled={togglePublishMutation.isPending}
                          onChange={() => togglePublishMutation.mutate({
                            id: item._id,
                            isPublished: item.status === 'published'
                          })}
                        />
                      </Td>
                      <Td>{item.totalPoints || 0}</Td>
                      <Td>{item.questionCount || 0}</Td>
                      <Td>
                        {item.settings?.duration ? (
                          `${item.settings.duration} دقيقة`
                        ) : (
                          <Badge>غير مفعل</Badge>
                        )}
                      </Td>
                      <Td>
                        <Text>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
                      </Td>
                      <Td>
                        <Text>{new Date(item.updatedAt).toLocaleDateString('ar-EG')}</Text>
                      </Td>
                      <Td>
                        <Stack direction="row">
                          <ConfirmationAlert
                            title="تأكيد الحذف"
                            confirmTitle="حذف"
                            cancelTitle="إلغاء"
                            onConfirm={() => deleteExamMutation.mutate(item._id)}
                            trigger={
                              <Button
                                alignItems="center"
                                size="sm"
                                h={8}
                                colorScheme="red"
                                rounded={6}
                                gap={1.5}
                                isDisabled={deleteExamMutation.isPending}
                              >
                                <Text fontSize="smaller">حذف</Text>
                              </Button>
                            }
                          >
                            <Text>هل أنت متأكد أنك تريد حذف هذا الامتحان؟ هذا الإجراء لا يمكن التراجع عنه.</Text>
                          </ConfirmationAlert>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {isLoading &&
                    Array.from({ length: 6 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 11 }).map((_, index) => (
                          <Td key={index}>
                            <Skeleton h={4} rounded={3} />
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  {!isLoading && exams.length === 0 && (
                    <Tr>
                      <Td colSpan={11} textAlign="center">
                        لا توجد بيانات للعرض
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            <HStack ms="auto" px={4}>
              <Button
                size="sm"
                fontWeight="medium"
                isDisabled={isFetching || isLoading || currentPage >= totalPages || totalPages === 0}
                isLoading={isLoading || isFetching}
                onClick={() => {
                  setParams((param) => {
                    param.set("page", (currentPage + 1).toString());
                    return param;
                  });
                }}
              >
                التالية
              </Button>
              <Button
                size="sm"
                fontWeight="medium"
                isDisabled={isFetching || isLoading || currentPage === 1}
                isLoading={isLoading || isFetching}
                onClick={() => {
                  setParams((param) => {
                    param.set("page", (currentPage - 1).toString());
                    return param;
                  });
                }}
              >
                السابقة
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </Stack>
  );
}

