import { motion } from 'framer-motion';
import { Users, Mail, Phone, MapPin, MoreVertical, Edit, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { IStudentAdmin } from '../services/studentsService';
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
  IconButton,
  Tooltip,
} from '@chakra-ui/react';

interface StudentsTableProps {
  students: IStudentAdmin[];
  onViewDetails?: (student: IStudentAdmin) => void;
  onEdit?: (student: IStudentAdmin) => void;
  loading?: boolean;
}

export default function StudentsTable({ students, onViewDetails, onEdit, loading }: StudentsTableProps) {
  if (loading) {
    return (
      <TableContainer bg="white" borderRadius="2xl" shadow="lg" border="1px solid" borderColor="gray.100" p={12}>
        <Text textAlign="center" color="gray.500">جاري التحميل...</Text>
      </TableContainer>
    );
  }

  if (students.length === 0) {
    return (
      <TableContainer bg="white" borderRadius="2xl" shadow="lg" border="1px solid" borderColor="gray.100" p={12}>
        <Text textAlign="center" color="gray.500">لا يوجد طلاب</Text>
      </TableContainer>
    );
  }

  return (
    <TableContainer bg="white" borderRadius="2xl" shadow="lg" border="1px solid" borderColor="gray.100" overflowX="auto">
      <Table variant="simple">
        <Thead bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
          <Tr>
            <Th textAlign="right" color="gray.700" fontWeight="semibold" fontSize="sm">الطالب</Th>
            <Th textAlign="right" color="gray.700" fontWeight="semibold" fontSize="sm">البريد الإلكتروني</Th>
            <Th textAlign="right" color="gray.700" fontWeight="semibold" fontSize="sm">رقم الموبايل</Th>
            <Th textAlign="right" color="gray.700" fontWeight="semibold" fontSize="sm">المستوى التعليمي</Th>
            <Th textAlign="right" color="gray.700" fontWeight="semibold" fontSize="sm">المدرسين</Th>
            <Th textAlign="right" color="gray.700" fontWeight="semibold" fontSize="sm">الحالة</Th>
            <Th textAlign="center" color="gray.700" fontWeight="semibold" fontSize="sm">الإجراءات</Th>
          </Tr>
        </Thead>
        <Tbody>
          {students.map((student, idx) => (
            <motion.tr
              key={student._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              _hover={{ bg: 'gray.50' }}
            >
              <Td>
                <HStack spacing={3}>
                  <VStack
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bgGradient="linear(to-br, blue.500, purple.500)"
                    align="center"
                    justify="center"
                  >
                    <Users className="text-white" size={20} />
                  </VStack>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color="gray.800">{student.fullName}</Text>
                    <Text fontSize="sm" color="gray.500">{student.governorate}</Text>
                  </VStack>
                </HStack>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Mail size={16} color="#9CA3AF" />
                  <Text fontSize="sm" color="gray.700">{student.email}</Text>
                </HStack>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Phone size={16} color="#9CA3AF" />
                  <Text fontSize="sm" color="gray.700">{student.mobileNumber}</Text>
                </HStack>
              </Td>
              <Td>
                {student.educationalLevel ? (
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="lg">
                    {student.educationalLevel.name}
                  </Badge>
                ) : (
                  <Text fontSize="sm" color="gray.400">غير محدد</Text>
                )}
              </Td>
              <Td>
                {student.assignedTeachers && student.assignedTeachers.length > 0 ? (
                  <VStack align="start" spacing={1}>
                    {student.assignedTeachers.slice(0, 2).map((teacher) => (
                      <Text key={teacher._id} fontSize="sm" color="gray.700">
                        {teacher.fullName}
                      </Text>
                    ))}
                    {student.assignedTeachers.length > 2 && (
                      <Text fontSize="xs" color="gray.500">
                        +{student.assignedTeachers.length - 2} آخرين
                      </Text>
                    )}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="gray.400">لا يوجد</Text>
                )}
              </Td>
              <Td>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  colorScheme={student.isActive ? 'green' : 'red'}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  w="fit-content"
                >
                  {student.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {student.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2} justify="center">
                  <Tooltip label="عرض التفاصيل">
                    <IconButton
                      aria-label="عرض التفاصيل"
                      icon={<Eye size={18} />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => onViewDetails?.(student)}
                    />
                  </Tooltip>
                  <Tooltip label="تعديل">
                    <IconButton
                      aria-label="تعديل"
                      icon={<Edit size={18} />}
                      size="sm"
                      colorScheme="gray"
                      variant="ghost"
                      onClick={() => onEdit?.(student)}
                    />
                  </Tooltip>
                  <IconButton
                    aria-label="المزيد"
                    icon={<MoreVertical size={18} />}
                    size="sm"
                    colorScheme="gray"
                    variant="ghost"
                  />
                </HStack>
              </Td>
            </motion.tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

