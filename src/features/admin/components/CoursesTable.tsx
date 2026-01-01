import { Icon } from '@iconify-icon/react';
import { ICourseAdmin } from '../services/coursesService';
import { getImageUrl } from '@/lib/axios';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  Image,
  Box,
  Switch,
} from '@chakra-ui/react';

interface CoursesTableProps {
  courses: ICourseAdmin[];
  onViewDetails?: (course: ICourseAdmin) => void;
  onEdit?: (course: ICourseAdmin) => void;
  onToggleStatus?: (courseId: string, currentStatus: string) => void;
  loading?: boolean;
}

export default function CoursesTable({ courses, onViewDetails, onEdit, onToggleStatus, loading }: CoursesTableProps) {
  const getStatusBadge = (course: ICourseAdmin) => {
    if (course.status === 'active' || course.status === 'published') {
      return (
        <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
          نشط
        </Badge>
      );
    }
    if (course.status === 'draft') {
      return (
        <Badge colorScheme="orange" fontSize="xs" px={2} py={1} borderRadius="full">
          مسودة
        </Badge>
      );
    }
    return (
      <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
        معطل
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Text textAlign="center" color="gray.500" py={8}>
            جاري التحميل...
          </Text>
        </CardBody>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack py={12} spacing={4}>
            <Icon
              icon="solar:inbox-line-bold-duotone"
              width="64"
              height="64"
              style={{ color: 'var(--chakra-colors-gray-300)' }}
            />
            <Text fontSize="lg" color="gray.500" fontWeight="medium">
              لا توجد كورسات
            </Text>
            <Text fontSize="sm" color="gray.400">
              لا توجد نتائج مطابقة للبحث
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody px={0}>
        <TableContainer bg="white" rounded={10}>
          <Table colorScheme="gray">
            <Thead>
              <Tr>
                <Th>الكورس</Th>
                <Th>المدرس</Th>
                <Th>المرحلة</Th>
                <Th>الحالة</Th>
                <Th>الطلاب</Th>
                <Th>الدروس</Th>
                <Th>السعر</Th>
                <Th>الإجراءات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map((course) => (
                <Tr key={course._id}>
                  <Td>
                    <HStack
                      spacing={3}
                      color="blue"
                      textDecoration="underline"
                      _hover={{ textDecoration: 'none' }}
                      cursor="pointer"
                      onClick={() => onViewDetails?.(course)}
                    >
                      {course.poster || course.thumbnail ? (
                        <Image
                          src={getImageUrl(course.poster || course.thumbnail!)}
                          alt={course.title}
                          w={12}
                          h={12}
                          borderRadius="xl"
                          objectFit="cover"
                        />
                      ) : (
                        <Box
                          w={12}
                          h={12}
                          borderRadius="xl"
                          bgGradient="linear(to-br, green.500, teal.500)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon
                            icon="solar:book-bold-duotone"
                            width="24"
                            height="24"
                            style={{ color: 'white' }}
                          />
                        </Box>
                      )}
                      <VStack align="start" spacing={0}>
                        <Text fontSize="small" fontWeight="bold" color="gray.800">
                          {course.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {course.description || 'لا يوجد وصف'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="small" fontWeight="medium" color="gray.800">
                        {course.teacher.fullName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {course.teacher.email}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="small" color="gray.700">
                      {course.educationalLevel?.name || course.educationalLevel?.shortName || '-'}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {onToggleStatus && (
                        <Switch
                          size="sm"
                          colorScheme="green"
                          isChecked={course.status === 'active'}
                          onChange={() => onToggleStatus(course._id, course.status)}
                        />
                      )}
                      {getStatusBadge(course)}
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        icon="solar:users-group-rounded-bold-duotone"
                        width="16"
                        height="16"
                        style={{ color: 'var(--chakra-colors-gray-500)' }}
                      />
                      <Text fontSize="small" fontWeight="medium">
                        {course.stats?.totalStudents || 0}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        icon="solar:play-circle-bold-duotone"
                        width="16"
                        height="16"
                        style={{ color: 'var(--chakra-colors-gray-500)' }}
                      />
                      <Text fontSize="small" fontWeight="medium">
                        {course.stats?.totalLessons || 0}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    {course.isFree ? (
                      <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="full">
                        مجاني
                      </Badge>
                    ) : (
                      <HStack spacing={1}>
                        <Icon
                          icon="solar:dollar-minimalistic-bold-duotone"
                          width="16"
                          height="16"
                          style={{ color: 'var(--chakra-colors-green-500)' }}
                        />
                        <Text fontSize="small" fontWeight="bold" color="green.600">
                          {course.finalPrice?.toLocaleString() || course.price?.toLocaleString() || 0} ج.م
                        </Text>
                      </HStack>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={1} justify="center">
                      <Icon
                        icon="solar:eye-bold-duotone"
                        width="18"
                        height="18"
                        style={{ color: 'var(--chakra-colors-blue-500)', cursor: 'pointer' }}
                        onClick={() => onViewDetails?.(course)}
                      />
                      <Icon
                        icon="solar:pen-bold-duotone"
                        width="18"
                        height="18"
                        style={{ color: 'var(--chakra-colors-gray-500)', cursor: 'pointer' }}
                        onClick={() => onEdit?.(course)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
}
