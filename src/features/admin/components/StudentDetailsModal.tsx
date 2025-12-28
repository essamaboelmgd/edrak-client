import { useState } from 'react';
import { Users, Mail, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Button,
  Grid,
} from '@chakra-ui/react';
import { IStudentAdmin } from '../services/studentsService';

interface StudentDetailsModalProps {
  student: IStudentAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (student: IStudentAdmin) => void;
  onDelete?: (studentId: string) => void;
  onBlock?: (studentId: string) => void;
  onUnblock?: (studentId: string) => void;
}

export default function StudentDetailsModal({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
}: StudentDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent dir="rtl" maxH="90vh" m={0}>
        <ModalHeader
          bgGradient="linear(to-r, blue.600, purple.600)"
          color="white"
          borderTopRadius="md"
          position="relative"
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {student.fullName}
              </Text>
              <Text color="blue.100" fontSize="sm">
                {student.email}
              </Text>
            </VStack>
            <Badge
              px={4}
              py={2}
              borderRadius="xl"
              borderWidth={2}
              colorScheme={student.isActive ? 'green' : 'red'}
              display="flex"
              alignItems="center"
              gap={2}
            >
              {student.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <Text fontWeight="semibold">{student.isActive ? 'نشط' : 'غير نشط'}</Text>
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
        <ModalBody overflowY="auto" p={6}>
          <VStack spacing={6} align="stretch">
            {/* Personal Information */}
            <Box bg="gray.50" borderRadius="xl" p={6}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                المعلومات الشخصية
              </Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <HStack spacing={3}>
                  <Mail size={20} color="#9CA3AF" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">
                      البريد الإلكتروني
                    </Text>
                    <Text fontWeight="medium" color="gray.800">
                      {student.email}
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={3}>
                  <Phone size={20} color="#9CA3AF" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">
                      رقم الموبايل
                    </Text>
                    <Text fontWeight="medium" color="gray.800">
                      {student.mobileNumber}
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={3}>
                  <MapPin size={20} color="#9CA3AF" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">
                      المحافظة
                    </Text>
                    <Text fontWeight="medium" color="gray.800">
                      {student.governorate}
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.500">
                    النوع
                  </Text>
                  <Text fontWeight="medium" color="gray.800">
                    {student.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </Text>
                </VStack>
              </Grid>
            </Box>

            {/* Educational Level */}
            {student.educationalLevel && (
              <Box bg="gray.50" borderRadius="xl" p={6}>
                <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                  المستوى التعليمي
                </Text>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="semibold" color="gray.800">
                    {student.educationalLevel.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {student.educationalLevel.shortName}
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Assigned Teachers */}
            <Box bg="gray.50" borderRadius="xl" p={6}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                المدرسين المخصصين
              </Text>
              {student.assignedTeachers && student.assignedTeachers.length > 0 ? (
                <VStack align="stretch" spacing={2}>
                  {student.assignedTeachers.map((teacher) => (
                    <HStack key={teacher._id} p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <Users size={20} color="#6366F1" />
                      <Text fontWeight="medium" color="gray.800">
                        {teacher.fullName}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500">لا يوجد مدرسين مخصصين</Text>
              )}
            </Box>

            {/* Parent Info */}
            {student.parentInfo && (
              <Box bg="gray.50" borderRadius="xl" p={6}>
                <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                  معلومات ولي الأمر
                </Text>
                <VStack align="stretch" spacing={3}>
                  {student.parentInfo.parentName && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.500">
                        الاسم
                      </Text>
                      <Text fontWeight="medium" color="gray.800">
                        {student.parentInfo.parentName}
                      </Text>
                    </VStack>
                  )}
                  {student.parentInfo.parentMobile && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.500">
                        رقم الموبايل
                      </Text>
                      <Text fontWeight="medium" color="gray.800">
                        {student.parentInfo.parentMobile}
                      </Text>
                    </VStack>
                  )}
                  {student.parentInfo.parentWhatsapp && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.500">
                        رقم الواتساب
                      </Text>
                      <Text fontWeight="medium" color="gray.800">
                        {student.parentInfo.parentWhatsapp}
                      </Text>
                    </VStack>
                  )}
                </VStack>
              </Box>
            )}

            {/* Account Status */}
            <Box bg="gray.50" borderRadius="xl" p={6}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                حالة الحساب
              </Text>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text color="gray.600">الحساب نشط</Text>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    colorScheme={student.isActive ? 'green' : 'red'}
                  >
                    {student.isActive ? 'نعم' : 'لا'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">البريد الإلكتروني مفعّل</Text>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    colorScheme={student.isEmailVerified ? 'green' : 'gray'}
                  >
                    {student.isEmailVerified ? 'نعم' : 'لا'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">رقم الموبايل مفعّل</Text>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    colorScheme={student.isMobileVerified ? 'green' : 'gray'}
                  >
                    {student.isMobileVerified ? 'نعم' : 'لا'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">تاريخ الإنشاء</Text>
                  <Text fontWeight="medium" color="gray.800">
                    {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="gray.50">
          <HStack spacing={3} w="full" justify="space-between">
            <HStack spacing={2}>
              {student.isActive ? (
                <Button colorScheme="red" onClick={() => onBlock?.(student._id)}>
                  حظر
                </Button>
              ) : (
                <Button colorScheme="green" onClick={() => onUnblock?.(student._id)}>
                  إلغاء الحظر
                </Button>
              )}
              <Button colorScheme="blue" onClick={() => onEdit?.(student)}>
                تعديل
              </Button>
            </HStack>
            {showDeleteConfirm ? (
              <HStack spacing={2}>
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                  إلغاء
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    onDelete?.(student._id);
                    setShowDeleteConfirm(false);
                  }}
                >
                  تأكيد الحذف
                </Button>
              </HStack>
            ) : (
              <Button colorScheme="red" variant="outline" onClick={() => setShowDeleteConfirm(true)}>
                حذف
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

