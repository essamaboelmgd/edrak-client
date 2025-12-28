import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Checkbox,
  CheckboxGroup,
  Stack,
} from '@chakra-ui/react';
import { studentsService } from '../services/studentsService';
import { teachersService } from '../services/teachersService';
import { axiosInstance } from '@/lib/axios';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStudentModal({ isOpen, onClose, onSuccess }: CreateStudentModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    gender: 'male',
    governorate: '',
    educationalLevel: '',
    assignedTeachers: [] as string[],
    parentName: '',
    parentMobile: '',
    parentWhatsapp: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      fetchEducationalLevels();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      const response = await teachersService.getAllTeachers({ 
        limit: 1000,
        page: 1,
      });
      if (response.success && response.data) {
        setTeachers(response.data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        status: 'error',
        description: 'حدث خطأ أثناء جلب قائمة المدرسين',
      });
    }
  };

  const fetchEducationalLevels = async () => {
    try {
      const response = await axiosInstance.get('/educational-levels');
      const data = response.data?.data?.educationalLevels;
      let levels: any[] = [];
      if (data) {
        if (data.primary) levels = [...levels, ...data.primary];
        if (data.preparatory) levels = [...levels, ...data.preparatory];
        if (data.secondary) levels = [...levels, ...data.secondary];
      } else {
        levels = response.data?.data || [];
      }
      setEducationalLevels(levels);
    } catch (error) {
      console.error('Error fetching educational levels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await studentsService.createStudent({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        gender: formData.gender,
        governorate: formData.governorate,
        educationalLevel: formData.educationalLevel || undefined,
        assignedTeachers: formData.assignedTeachers.length > 0 ? formData.assignedTeachers : undefined,
        parentInfo: formData.parentName || formData.parentMobile || formData.parentWhatsapp
          ? {
              parentName: formData.parentName || undefined,
              parentMobile: formData.parentMobile || undefined,
              parentWhatsapp: formData.parentWhatsapp || undefined,
            }
          : undefined,
      });
      toast({
        status: 'success',
        description: 'تم إنشاء الطالب بنجاح',
      });
      onSuccess();
      onClose();
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        mobileNumber: '',
        gender: 'male',
        governorate: '',
        educationalLevel: '',
        assignedTeachers: [],
        parentName: '',
        parentMobile: '',
        parentWhatsapp: '',
      });
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء الطالب',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent dir="rtl" m={0} maxH="90vh" overflowY="auto">
        <ModalHeader bgGradient="linear(to-r, blue.600, purple.600)" color="white" borderTopRadius="md">
          إضافة طالب جديد
        </ModalHeader>
        <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
        <form onSubmit={handleSubmit}>
          <ModalBody p={6}>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>الاسم الأول</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>اسم الأب</FormLabel>
                  <Input
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>اسم العائلة</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>كلمة السر</FormLabel>
                  <Input
                    type="password"
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>رقم الموبايل</FormLabel>
                  <Input
                    type="tel"
                    pattern="^01[0125][0-9]{8}$"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>النوع</FormLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>المحافظة</FormLabel>
                  <Input
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>المستوى التعليمي</FormLabel>
                <Select
                  placeholder="-- اختر --"
                  value={formData.educationalLevel}
                  onChange={(e) => setFormData({ ...formData, educationalLevel: e.target.value })}
                >
                  {educationalLevels.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.name || level.nameArabic || level.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>المدرسين المخصصين (اختياري)</FormLabel>
                {teachers.length > 0 ? (
                  <>
                    <CheckboxGroup
                      value={formData.assignedTeachers}
                      onChange={(values) => setFormData({ ...formData, assignedTeachers: values as string[] })}
                    >
                      <Stack spacing={2} maxH="200px" overflowY="auto" p={2} border="1px solid" borderColor="gray.200" borderRadius="md">
                        {teachers.map((teacher) => (
                          <Checkbox key={teacher._id} value={teacher._id}>
                            {teacher.fullName}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      يمكنك اختيار أكثر من مدرس أو عدم اختيار أي مدرس
                    </Text>
                  </>
                ) : (
                  <Text fontSize="sm" color="gray.500">جاري تحميل قائمة المدرسين...</Text>
                )}
              </FormControl>
              <Text fontWeight="semibold" w="full" mt={2}>
                معلومات ولي الأمر (اختياري)
              </Text>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>اسم ولي الأمر</FormLabel>
                  <Input
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>رقم موبايل ولي الأمر</FormLabel>
                  <Input
                    type="tel"
                    pattern="^01[0125][0-9]{8}$"
                    value={formData.parentMobile}
                    onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>رقم واتساب ولي الأمر</FormLabel>
                <Input
                  type="tel"
                  pattern="^01[0125][0-9]{8}$"
                  value={formData.parentWhatsapp}
                  onChange={(e) => setFormData({ ...formData, parentWhatsapp: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                type="submit"
                bgGradient="linear(to-r, blue.600, purple.600)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, blue.700, purple.700)' }}
                isLoading={loading}
              >
                إنشاء
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

