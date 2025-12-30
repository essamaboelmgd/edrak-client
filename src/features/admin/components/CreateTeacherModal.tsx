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
  Box,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { teachersService } from '../services/teachersService';
import { getImageUrl } from '@/lib/axios';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Sharqia',
  'Monufia',
  'Qalyubia',
  'Beheira',
  'Gharbia',
  'Damietta',
  'Kafr El Sheikh',
  'Fayoum',
  'Beni Suef',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
];

const GOVERNORATES_ARABIC: Record<string, string> = {
  Cairo: 'القاهرة',
  Giza: 'الجيزة',
  Alexandria: 'الإسكندرية',
  Dakahlia: 'الدقهلية',
  Sharqia: 'الشرقية',
  Monufia: 'المنوفية',
  Qalyubia: 'القليوبية',
  Beheira: 'البحيرة',
  Gharbia: 'الغربية',
  Damietta: 'دمياط',
  'Kafr El Sheikh': 'كفر الشيخ',
  Fayoum: 'الفيوم',
  'Beni Suef': 'بني سويف',
  Minya: 'المنيا',
  Asyut: 'أسيوط',
  Sohag: 'سوهاج',
  Qena: 'قنا',
  Luxor: 'الأقصر',
  Aswan: 'أسوان',
};

// Function to generate subdomain sequence
const generateSubdomain = async (): Promise<string> => {
  try {
    // Get all teachers to find the highest sequence number
    const response = await teachersService.getAllTeachers({ page: 1, limit: 1000 });
    if (response.success && response.data) {
      const teachers = response.data.teachers;
      // Extract numbers from existing subdomains (assuming format like teacher1, teacher2, etc.)
      const subdomainNumbers = teachers
        .map((t: any) => {
          const match = t.subdomain?.match(/teacher(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((n: number) => n > 0);

      const nextNumber = subdomainNumbers.length > 0 ? Math.max(...subdomainNumbers) + 1 : 1;
      return `teacher${nextNumber}`;
    }
  } catch (error) {
    console.error('Error generating subdomain:', error);
  }
  // Fallback
  return `teacher${Date.now()}`;
};

export default function CreateTeacherModal({ isOpen, onClose, onSuccess }: CreateTeacherModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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

  // Auto-generate subdomain when modal opens
  useEffect(() => {
    if (isOpen && !formData.subdomain) {
      generateSubdomain().then((subdomain) => {
        setFormData((prev) => ({ ...prev, subdomain }));
      });
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Form submitted', formData);

    try {
      setLoading(true);

      // Validate required fields
      if (!formData.firstName.trim()) {
        toast({
          status: 'error',
          description: 'الاسم الأول مطلوب',
        });
        setLoading(false);
        return;
      }

      if (!formData.lastName.trim()) {
        toast({
          status: 'error',
          description: 'اسم العائلة مطلوب',
        });
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        toast({
          status: 'error',
          description: 'البريد الإلكتروني مطلوب',
        });
        setLoading(false);
        return;
      }

      if (!formData.password) {
        toast({
          status: 'error',
          description: 'كلمة السر مطلوبة',
        });
        setLoading(false);
        return;
      }

      if (!formData.mobileNumber.trim()) {
        toast({
          status: 'error',
          description: 'رقم الموبايل مطلوب',
        });
        setLoading(false);
        return;
      }

      if (!formData.governorate) {
        toast({
          status: 'error',
          description: 'المحافظة مطلوبة',
        });
        setLoading(false);
        return;
      }

      if (!formData.platformName.trim()) {
        toast({
          status: 'error',
          description: 'اسم المنصة مطلوب',
        });
        setLoading(false);
        return;
      }

      const submitData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        mobileNumber: formData.mobileNumber.trim(),
        gender: formData.gender,
        governorate: formData.governorate,
        platformName: formData.platformName.trim(),
        subdomain: formData.subdomain.trim() || undefined,
      };

      // Add optional fields
      if (formData.middleName?.trim()) {
        submitData.middleName = formData.middleName.trim();
      }

      if (formData.specialization?.trim()) {
        submitData.specialization = formData.specialization.trim();
      }

      if (formData.yearsOfExperience) {
        submitData.yearsOfExperience = parseInt(formData.yearsOfExperience);
      }

      // Add photo if provided
      if (photoFile) {
        submitData.photo = photoFile;
      }

      console.log('Sending data to API:', submitData);
      const response = await teachersService.createTeacher(submitData);
      console.log('API response:', response);
      toast({
        status: 'success',
        description: 'تم إنشاء المدرس بنجاح',
      });
      onSuccess();
      onClose();
      // Reset form
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
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      toast({
        status: 'error',
        title: 'خطأ في إنشاء المدرس',
        description: error.response?.data?.message || error.message || 'حدث خطأ أثناء إنشاء المدرس',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent dir="rtl" m={4} maxH="90vh">
        <ModalHeader bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderTopRadius="md" position="relative" flexShrink={0}>
          إضافة مدرس جديد
          <ModalCloseButton
            position="absolute"
            right="8px"
            top="8px"
            left="auto"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
        </ModalHeader>
        <form onSubmit={handleSubmit} noValidate>
          <ModalBody p={6} overflowY="auto" maxH="calc(90vh - 140px)">
            <VStack spacing={4}>
              {/* Photo Upload */}
              <FormControl>
                <FormLabel>صورة الملف الشخصي (اختياري)</FormLabel>
                <HStack spacing={4}>
                  <Avatar
                    size="xl"
                    src={photoPreview || undefined}
                    name={formData.firstName || 'مدرس'}
                    bg="purple.500"
                  />
                  <VStack align="start" spacing={2}>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      display="none"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        as="span"
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon icon="solar:gallery-bold-duotone" width="16" height="16" />}
                        cursor="pointer"
                      >
                        اختر صورة
                      </Button>
                    </label>
                    {photoPreview && (
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={handleRemovePhoto}
                        leftIcon={<Icon icon="solar:trash-bin-minimalistic-bold-duotone" width="16" height="16" />}
                      >
                        إزالة الصورة
                      </Button>
                    )}
                  </VStack>
                </HStack>
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>الاسم الأول</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>اسم العائلة</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>كلمة السر</FormLabel>
                  <Input
                    type="password"
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>رقم الموبايل</FormLabel>
                  <Input
                    type="tel"
                    pattern="^01[0125][0-9]{8}$"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </FormControl>
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
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>المحافظة</FormLabel>
                  <Select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    placeholder="اختر المحافظة"
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {GOVERNORATES_ARABIC[gov] || gov}
                      </option>
                    ))}
                  </Select>
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
                <FormControl isRequired>
                  <FormLabel>اسم المنصة</FormLabel>
                  <Input
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>اسم النطاق الفرعي</FormLabel>
                <Input
                  pattern="[a-z0-9-]+"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  سيتم إنشاؤه تلقائياً إذا لم تقم بتحديده
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200" flexShrink={0}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                type="submit"
                bgGradient="linear(to-r, purple.500, blue.500)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, purple.600, blue.600)' }}
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
