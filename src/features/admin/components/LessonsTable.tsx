import { Icon } from '@iconify-icon/react';
import { useNavigate } from 'react-router-dom';
import { ILessonAdmin } from '../services/lessonsService';
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';

interface LessonsTableProps {
  lessons: ILessonAdmin[];
  onToggleStatus?: (lessonId: string, currentStatus: string) => void;
  onDelete?: (lessonId: string) => void;
  loading?: boolean;
  basePath?: string;
}

export default function LessonsTable({ lessons, onToggleStatus, onDelete, loading, basePath = '/admin/lessons' }: LessonsTableProps) {
  const navigate = useNavigate();
  const getStatusBadge = (lesson: ILessonAdmin) => {
    if (lesson.status === 'active' || lesson.status === 'published') {
      return (
        <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
          نشط
        </Badge>
      );
    }
    if (lesson.status === 'draft') {
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

  if (lessons.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack py={12} spacing={4}>
            <Icon
              icon="solar:play-circle-line-bold-duotone"
              width="64"
              height="64"
              style={{ color: 'var(--chakra-colors-gray-300)' }}
            />
            <Text fontSize="lg" color="gray.500" fontWeight="medium">
              لا توجد دروس
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
                <Th>الدرس</Th>
                <Th>المدرس</Th>
                <Th>الكورس</Th>
                <Th>المدة</Th>
                <Th>الحالة</Th>
                <Th>السعر</Th>
                <Th>تاريخ الإنشاء</Th>
                <Th>الإجراءات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {lessons.map((lesson) => (
                <Tr 
                  key={lesson._id}
                  _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  onClick={() => navigate(`${basePath}/${lesson._id}`)}
                >
                  <Td>
                    <HStack spacing={3}>
                      {lesson.poster || lesson.thumbnail ? (
                        <Image
                          src={getImageUrl(lesson.poster || lesson.thumbnail!)}
                          alt={lesson.title}
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
                          bgGradient="linear(to-br, teal.500, cyan.500)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon
                            icon="solar:play-circle-bold-duotone"
                            width="24"
                            height="24"
                            style={{ color: 'white' }}
                          />
                        </Box>
                      )}
                      <VStack align="start" spacing={0}>
                        <Text fontSize="small" fontWeight="bold" color="gray.800">
                          {lesson.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {lesson.description || 'لا يوجد وصف'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>
                    {lesson.course?.teacher ? (
                      <VStack align="start" spacing={0}>
                        <Text fontSize="small" fontWeight="medium" color="gray.800">
                          {lesson.course.teacher.fullName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {lesson.course.teacher.email}
                        </Text>
                      </VStack>
                    ) : (
                      <Text fontSize="small" color="gray.500">
                        -
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {lesson.course ? (
                      <Text fontSize="small" color="gray.700" noOfLines={1}>
                        {lesson.course.title}
                      </Text>
                    ) : (
                      <Text fontSize="small" color="gray.500">
                        -
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        icon="solar:clock-circle-bold-duotone"
                        width="16"
                        height="16"
                        style={{ color: 'var(--chakra-colors-gray-500)' }}
                      />
                      <Text fontSize="small" fontWeight="medium">
                        {lesson.duration ? `${lesson.duration} دقيقة` : '-'}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {onToggleStatus && (
                        <Switch
                          size="sm"
                          colorScheme="green"
                          isChecked={lesson.status === 'active'}
                          onChange={() => onToggleStatus(lesson._id, lesson.status)}
                        />
                      )}
                      {getStatusBadge(lesson)}
                    </HStack>
                  </Td>
                  <Td>
                    {lesson.isFree ? (
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
                          {lesson.finalPrice?.toLocaleString() || lesson.price?.toLocaleString() || 0} ج.م
                        </Text>
                      </HStack>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize="small" color="gray.600">
                      {new Date(lesson.createdAt).toLocaleDateString('ar-EG')}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={1} justify="center">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Icon icon="solar:menu-dots-bold-duotone" width="18" height="18" />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<Icon icon="solar:eye-bold-duotone" width="16" height="16" />}>
                            عرض
                          </MenuItem>
                          <MenuItem icon={<Icon icon="solar:pen-bold-duotone" width="16" height="16" />}>
                            تعديل
                          </MenuItem>
                          {onDelete && (
                            <MenuItem
                              icon={<Icon icon="solar:trash-bin-trash-bold-duotone" width="16" height="16" />}
                              color="red.500"
                              onClick={() => onDelete(lesson._id)}
                            >
                              حذف
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
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

