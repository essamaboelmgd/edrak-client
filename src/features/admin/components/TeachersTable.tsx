import { Icon } from '@iconify-icon/react';
import { ITeacherAdmin } from '../services/teachersService';
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
  Avatar,
} from '@chakra-ui/react';

interface TeachersTableProps {
  teachers: ITeacherAdmin[];
  onViewDetails?: (teacher: ITeacherAdmin) => void;
  onEdit?: (teacher: ITeacherAdmin) => void;
  loading?: boolean;
}

export default function TeachersTable({ teachers, onViewDetails, onEdit, loading }: TeachersTableProps) {
  const getStatusBadge = (teacher: ITeacherAdmin) => {
    const isInTrial = teacher.trial?.isInTrial || teacher.platformStatus === 'trial';
    const hasActiveSubscription = teacher.subscription?.isActive && !isInTrial;
    const isSuspended = teacher.platformStatus === 'suspended';
    const isExpired = teacher.platformStatus === 'expired';

    if (isSuspended) {
      return (
        <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
          معطل
        </Badge>
      );
    }
    if (isExpired) {
      return (
        <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">
          منتهي
        </Badge>
      );
    }
    if (isInTrial) {
      return (
        <Badge colorScheme="yellow" fontSize="xs" px={2} py={1} borderRadius="full">
          تجريبي
        </Badge>
      );
    }
    if (hasActiveSubscription) {
      return (
        <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
          نشط
        </Badge>
      );
    }
    return (
      <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">
        غير نشط
      </Badge>
    );
  };

  const getPlanName = (teacher: ITeacherAdmin) => {
    if (teacher.trial?.isInTrial || teacher.platformStatus === 'trial') {
      return 'تجريبي';
    }
    if (teacher.subscription?.plan) {
      return teacher.subscription.plan.nameArabic || teacher.subscription.plan.name;
    }
    return 'بدون خطة';
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

  if (teachers.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack py={12} spacing={4}>
            <Icon
              icon="solar:users-group-two-rounded-bold-duotone"
              width="64"
              height="64"
              style={{ color: 'var(--chakra-colors-gray-300)' }}
            />
            <Text fontSize="lg" color="gray.500" fontWeight="medium">
              لا يوجد معلمين
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
                <Th>المدرس</Th>
                <Th>الحالة</Th>
                <Th>الخطة</Th>
                <Th>الطلاب</Th>
                <Th>الكورسات</Th>
                <Th>الإيرادات</Th>
                <Th>الإجراءات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teachers.map((teacher) => (
                <Tr key={teacher._id}>
                  <Td>
                    <HStack
                      color="blue"
                      textDecoration="underline"
                      _hover={{ textDecoration: 'none' }}
                      cursor="pointer"
                      onClick={() => onViewDetails?.(teacher)}
                    >
                      <Avatar
                        name={teacher.fullName}
                        width={25}
                        height={25}
                        bg={teacher.isActive ? 'purple.500' : 'gray.400'}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="small" fontWeight="medium">
                          {teacher.fullName}
                        </Text>
                        {teacher.platformName && (
                          <Text fontSize="xs" color="gray.500">
                            {teacher.platformName}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>{getStatusBadge(teacher)}</Td>
                  <Td>
                    <Text fontSize="small" fontWeight="medium">
                      {getPlanName(teacher)}
                    </Text>
                    {teacher.subscription?.endDate && (
                      <Text fontSize="xs" color="gray.500">
                        حتى {new Date(teacher.subscription.endDate).toLocaleDateString('ar-EG')}
                      </Text>
                    )}
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
                        {teacher.stats?.totalStudents || 0}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        icon="solar:book-bold-duotone"
                        width="16"
                        height="16"
                        style={{ color: 'var(--chakra-colors-gray-500)' }}
                      />
                      <Text fontSize="small" fontWeight="medium">
                        {teacher.stats?.activeCourses || 0}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        icon="solar:dollar-minimalistic-bold-duotone"
                        width="16"
                        height="16"
                        style={{ color: 'var(--chakra-colors-green-500)' }}
                      />
                      <Text fontSize="small" fontWeight="bold" color="green.600">
                        {teacher.stats?.totalRevenue?.toLocaleString() || 0} ج.م
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1} justify="center">
                      <Icon
                        icon="solar:eye-bold-duotone"
                        width="18"
                        height="18"
                        style={{ color: 'var(--chakra-colors-blue-500)', cursor: 'pointer' }}
                        onClick={() => onViewDetails?.(teacher)}
                      />
                      <Icon
                        icon="solar:pen-bold-duotone"
                        width="18"
                        height="18"
                        style={{ color: 'var(--chakra-colors-gray-500)', cursor: 'pointer' }}
                        onClick={() => onEdit?.(teacher)}
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
