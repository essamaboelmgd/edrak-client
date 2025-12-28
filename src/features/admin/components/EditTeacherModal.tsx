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
  useToast,
} from '@chakra-ui/react';
import { teachersService, ITeacherAdmin } from '../services/teachersService';

interface EditTeacherModalProps {
  teacher: ITeacherAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTeacherModal({ teacher, isOpen, onClose, onSuccess }: EditTeacherModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: 'male',
    governorate: '',
    specialization: '',
    yearsOfExperience: '',
    platformName: '',
    platformStatus: 'trial' as 'active' | 'suspended' | 'trial' | 'expired',
    isActive: true,
  });

  useEffect(() => {
    if (isOpen && teacher) {
      // Reset and populate form when modal opens with teacher data
      setFormData({
        firstName: teacher.firstName || '',
        middleName: teacher.middleName || '',
        lastName: teacher.lastName || '',
        email: teacher.email || '',
        mobileNumber: teacher.mobileNumber || '',
        gender: teacher.gender || 'male',
        governorate: teacher.governorate || '',
        specialization: teacher.specialization || '',
        yearsOfExperience: teacher.yearsOfExperience?.toString() || '',
        platformName: teacher.platformName || '',
        platformStatus: (teacher.platformStatus as 'active' | 'suspended' | 'trial' | 'expired') || 'trial',
        isActive: teacher.isActive ?? true,
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        gender: 'male',
        governorate: '',
        specialization: '',
        yearsOfExperience: '',
        platformName: '',
        platformStatus: 'trial',
        isActive: true,
      });
    }
  }, [isOpen, teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    try {
      setLoading(true);
      await teachersService.updateTeacher(teacher._id, {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
      });
      toast({
        status: 'success',
        description: 'تم تحديث بيانات المدرس بنجاح',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات المدرس',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent dir="rtl" m={0}>
        <ModalHeader bgGradient="linear(to-r, red.600, orange.600)" color="white" borderTopRadius="md">
          تعديل بيانات المدرس
        </ModalHeader>
        <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
        <form onSubmit={handleSubmit}>
          <ModalBody p={6}>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>الاسم الأول</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>اسم الأب</FormLabel>
                  <Input
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>اسم العائلة</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>رقم الموبايل</FormLabel>
                  <Input
                    type="tel"
                    pattern="^01[0125][0-9]{8}$"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>النوع</FormLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </Select>
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>المحافظة</FormLabel>
                  <Input
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>التخصص</FormLabel>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>سنوات الخبرة</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>اسم المنصة</FormLabel>
                  <Input
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>حالة المنصة</FormLabel>
                  <Select
                    value={formData.platformStatus}
                    onChange={(e) => setFormData({ ...formData, platformStatus: e.target.value as any })}
                  >
                    <option value="active">نشط</option>
                    <option value="suspended">معطل</option>
                    <option value="trial">تجريبي</option>
                    <option value="expired">منتهي</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>الحساب نشط</FormLabel>
                  <Select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">نعم</option>
                    <option value="false">لا</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                type="submit"
                bgGradient="linear(to-r, red.600, orange.600)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, red.700, orange.700)' }}
                isLoading={loading}
              >
                حفظ التغييرات
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
