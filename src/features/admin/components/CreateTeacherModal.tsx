import { useState } from 'react';
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
} from '@chakra-ui/react';
import { teachersService } from '../services/teachersService';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTeacherModal({ isOpen, onClose, onSuccess }: CreateTeacherModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    gender: 'male',
    governorate: '',
    specialization: '',
    yearsOfExperience: '',
    platformName: '',
    subdomain: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await teachersService.createTeacher({
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
      });
      toast({
        status: 'success',
        description: 'تم إنشاء المدرس بنجاح',
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
        specialization: '',
        yearsOfExperience: '',
        platformName: '',
        subdomain: '',
      });
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء المدرس',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent dir="rtl" m={0}>
        <ModalHeader bgGradient="linear(to-r, red.600, orange.600)" color="white" borderTopRadius="md">
          إضافة مدرس جديد
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
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>التخصص</FormLabel>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>سنوات الخبرة</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>اسم المنصة</FormLabel>
                  <Input
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>اسم النطاق الفرعي</FormLabel>
                  <Input
                    pattern="[a-z0-9-]+"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    أحرف إنجليزية وأرقام وشرطة فقط
                  </Text>
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
                إنشاء
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
