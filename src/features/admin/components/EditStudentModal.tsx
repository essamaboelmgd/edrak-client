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
    Checkbox,
    CheckboxGroup,
    Stack,
    Text,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { studentsService, IStudentAdmin } from '../services/studentsService';
import { teachersService } from '../services/teachersService';
import { axiosInstance } from '@/lib/axios';

interface EditStudentModalProps {
    student: IStudentAdmin | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditStudentModal({ student, isOpen, onClose, onSuccess }: EditStudentModalProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [fetchingStudent, setFetchingStudent] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<IStudentAdmin | null>(null);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        gender: 'male',
        governorate: '',
        educationalLevel: '',
        assignedTeachers: [] as string[],
        isActive: true,
        parentName: '',
        parentMobile: '',
        parentWhatsapp: '',
    });

    // Fetch full student details when modal opens
    useEffect(() => {
        if (isOpen && student?._id) {
            fetchFullStudentDetails();
            fetchTeachers();
            fetchEducationalLevels();
        }
    }, [isOpen, student?._id]);

    // Populate form when student data is available
    useEffect(() => {
        if (currentStudent) {
            setFormData({
                firstName: currentStudent.firstName || '',
                middleName: currentStudent.middleName || '',
                lastName: currentStudent.lastName || '',
                email: currentStudent.email || '',
                mobileNumber: currentStudent.mobileNumber || '',
                gender: currentStudent.gender || 'male',
                governorate: currentStudent.governorate || '',
                educationalLevel: currentStudent.educationalLevel?._id || '',
                assignedTeachers: currentStudent.assignedTeachers?.map((t) => t._id) || [],
                isActive: currentStudent.isActive ?? true,
                parentName: currentStudent.parentInfo?.parentName || '',
                parentMobile: currentStudent.parentInfo?.parentMobile || '',
                parentWhatsapp: currentStudent.parentInfo?.parentWhatsapp || '',
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
                educationalLevel: '',
                assignedTeachers: [],
                isActive: true,
                parentName: '',
                parentMobile: '',
                parentWhatsapp: '',
            });
            setCurrentStudent(null);
        }
    }, [currentStudent, isOpen]);

    const fetchFullStudentDetails = async () => {
        if (!student?._id) return;

        try {
            setFetchingStudent(true);
            const response = await studentsService.getStudentById(student._id);
            if (response.success && response.data?.student) {
                setCurrentStudent(response.data.student);
            } else {
                // Fallback to the student passed as prop
                setCurrentStudent(student);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            toast({
                status: 'warning',
                description: 'تم استخدام البيانات المتاحة. قد تكون بعض الحقول غير مكتملة.',
            });
            // Fallback to the student passed as prop
            setCurrentStudent(student);
        } finally {
            setFetchingStudent(false);
        }
    };

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
        if (!student) return;

        try {
            setLoading(true);
            // Only send fields that have values (not empty strings)
            const updateData: any = {};
            if (formData.firstName && formData.firstName.trim()) {
                updateData.firstName = formData.firstName.trim();
            }
            if (formData.middleName && formData.middleName.trim()) {
                updateData.middleName = formData.middleName.trim();
            }
            if (formData.lastName && formData.lastName.trim()) {
                updateData.lastName = formData.lastName.trim();
            }
            if (formData.email && formData.email.trim()) {
                updateData.email = formData.email.trim();
            }
            if (formData.mobileNumber && formData.mobileNumber.trim()) {
                updateData.mobileNumber = formData.mobileNumber.trim();
            }
            if (formData.gender) {
                updateData.gender = formData.gender;
            }
            if (formData.governorate && formData.governorate.trim()) {
                updateData.governorate = formData.governorate.trim();
            }
            if (formData.educationalLevel) {
                updateData.educationalLevel = formData.educationalLevel;
            }
            if (formData.assignedTeachers) {
                updateData.assignedTeachers = formData.assignedTeachers;
            }
            updateData.isActive = formData.isActive;
            if (formData.parentName || formData.parentMobile || formData.parentWhatsapp) {
                updateData.parentInfo = {
                    parentName: formData.parentName?.trim() || undefined,
                    parentMobile: formData.parentMobile?.trim() || undefined,
                    parentWhatsapp: formData.parentWhatsapp?.trim() || undefined,
                };
            }

            if (!currentStudent) {
                toast({
                    status: 'error',
                    description: 'بيانات الطالب غير متوفرة',
                });
                return;
            }
            await studentsService.updateStudent(currentStudent._id, updateData);
            toast({
                status: 'success',
                description: 'تم تحديث بيانات الطالب بنجاح',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات الطالب',
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
                    تعديل بيانات الطالب
                </ModalHeader>
                <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
                {fetchingStudent ? (
                    <ModalBody p={6}>
                        <Center py={10}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="blue.500" />
                                <Text color="gray.600">جاري تحميل بيانات الطالب...</Text>
                            </VStack>
                        </Center>
                    </ModalBody>
                ) : (
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
                                    <FormLabel>المدرسين المخصصين</FormLabel>
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
                                                يمكنك اختيار أكثر من مدرس أو إزالة جميع المدرسين
                                            </Text>
                                        </>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500">جاري تحميل قائمة المدرسين...</Text>
                                    )}
                                </FormControl>
                                <Text fontWeight="semibold" w="full" mt={2}>
                                    معلومات ولي الأمر
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
                                    isDisabled={!currentStudent || fetchingStudent}
                                >
                                    حفظ التغييرات
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
}

