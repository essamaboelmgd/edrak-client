import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Spacer,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { KeyboardEvent, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getImageUrl } from '@/lib/axios';
import { useStudentExams } from '@/features/student/hooks/useStudentExams';

export default function StudentExams() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams({
    page: '1',
  });
  const { data: examsData, isLoading } = useStudentExams();
  const exams = examsData?.exams || [];

  return (
    <Stack
      spacing={6}
      flex={1}
      p={4}
      dir="rtl"
    >
      <Card>
        <CardBody
          as={Stack}
          px={0}
          spacing={4}
        >
          <Stack
            direction="row"
            alignItems="end"
            px={4}
            w="100%"
            flexWrap="wrap"
          >
            <Stack>
              <Heading
                as="h2"
                fontSize="xl"
              >
                الامتحانات
              </Heading>
              <Text
                fontSize="smaller"
                fontWeight="medium"
              >
                النتائج {exams.length || 0}
              </Text>
            </Stack>
            <Spacer />
            <InputGroup
              w={{ base: "100%", sm: "max-content" }}
              size="sm"
            >
              <InputLeftElement pointerEvents="none">
                <Icon
                  icon="lucide:search"
                  width="15"
                  height="15"
                />
              </InputLeftElement>
              <Input
                type="search"
                placeholder="اكتب النص هنا"
                defaultValue={params.get("search") as string}
                bg="white"
                w={300}
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
          </Stack>
          <TableContainer
            bg="white"
            rounded={10}
          >
            <Table colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>العنوان</Th>
                  <Th>الكورس</Th>
                  <Th>الدرس</Th>
                  <Th>درجة الامتحان</Th>
                  <Th>مدة الامتحان</Th>
                  <Th>تاريخ الانشاء</Th>
                  <Th>اخر تحديث</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(exams
                  ? [...exams].sort((a: any, b: any) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
                  : []
                ).map((item: any) => (
                  <Tr key={item._id || item.id}>
                    <Td>{item._id || item.id}</Td>
                    <Td>
                      <Text
                        fontSize="small"
                        fontWeight="medium"
                        minW={300}
                        maxW={300}
                        noOfLines={1}
                        whiteSpace="wrap"
                        color="blue"
                        cursor="pointer"
                        _hover={{
                          textDecoration: "underline",
                        }}
                        onClick={() => navigate(`/student/exams/${item._id || item.id}`)}
                      >
                        {item.exam?.title || item.title}
                      </Text>
                    </Td>
                    <Td>
                      {item.exam?.course || item.course ? (
                        <Stack
                          direction="row"
                          alignItems="center"
                        >
                          <Avatar
                            name={item.exam?.course?.title || item.course?.title}
                            src={(item.exam?.course?.poster || item.course?.poster) ? getImageUrl(item.exam?.course?.poster || item.course?.poster) : undefined}
                            width={25}
                            height={25}
                          />
                          <Text
                            fontSize="small"
                            fontWeight="medium"
                          >
                            {item.exam?.course?.title || item.course?.title}
                          </Text>
                        </Stack>
                      ) : (
                        <Badge>غير متوفر</Badge>
                      )}
                    </Td>
                    <Td>
                      {item.exam?.lesson || item.lesson ? (
                        <Stack
                          direction="row"
                          alignItems="center"
                        >
                          <Avatar
                            name={item.exam?.lesson?.title || item.lesson?.title}
                            src={(item.exam?.lesson?.poster || item.lesson?.poster) ? getImageUrl(item.exam?.lesson?.poster || item.lesson?.poster) : undefined}
                            width={25}
                            height={25}
                          />
                          <Text
                            fontSize="small"
                            fontWeight="medium"
                          >
                            {item.exam?.lesson?.title || item.lesson?.title}
                          </Text>
                        </Stack>
                      ) : (
                        <Badge>غير متوفر</Badge>
                      )}
                    </Td>
                    <Td>
                      {item.degree || item.score || 0} / {item.exam?.degree || item.totalScore || 0}
                    </Td>
                    <Td>{item.duration ? item.duration || 0 : <Badge>غير مفعل</Badge>}</Td>
                    <Td>
                      <Text>{new Date(item.createdAt || item.created_at).toISOString().substring(0, 10)}</Text>
                    </Td>
                    <Td>
                      <Text>{new Date(item.updatedAt || item.updated_at).toISOString().substring(0, 10)}</Text>
                    </Td>
                  </Tr>
                ))}
                {isLoading &&
                  Array.from({ length: 6 })
                    .fill(0)
                    .map((_e, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 8 })
                          .fill(0)
                          .map((_e, index) => (
                            <Td key={index}>
                              <Skeleton
                                h={4}
                                rounded={3}
                              />
                            </Td>
                          ))}
                      </Tr>
                    ))}
              </Tbody>
            </Table>
          </TableContainer>
          {!isLoading && !exams.length && (
            <Center py={12}>
              <Stack spacing={4} textAlign="center" align="center">
                <Box
                  w="120px"
                  h="120px"
                  bg="orange.50"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon
                    icon="solar:document-text-bold-duotone"
                    width="60"
                    height="60"
                    style={{ color: 'var(--chakra-colors-orange-500)' }}
                  />
                </Box>
                <Heading size="md" color="gray.700">
                  لا توجد امتحانات حالياً
                </Heading>
                <Text color="gray.500" fontSize="sm" maxW="300px">
                  سوف يتم إضافة الامتحانات قريباً 📝
                </Text>
              </Stack>
            </Center>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}
