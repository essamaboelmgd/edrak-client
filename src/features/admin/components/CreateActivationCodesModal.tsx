import { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Select,
    Input,
    VStack,
    Text,
    useToast,
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
} from '@chakra-ui/react';
import { activationCodesService, ActivationTargetType, IActivationCode } from '../services/activationCodesService';
import { coursesService } from '../services/coursesService';
import { courseService } from '@/features/courses/courseService';

interface CreateActivationCodesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateActivationCodesModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateActivationCodesModalProps) {
    const toast = useToast();
    const [targetType, setTargetType] = useState<ActivationTargetType>('course');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [selectedCourseSection, setSelectedCourseSection] = useState('');
    const [selectedLessonSection, setSelectedLessonSection] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [isCreating, setIsCreating] = useState(false);
    const [createdCodes, setCreatedCodes] = useState<IActivationCode[]>([]);

    // Data states
    const [courses, setCourses] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [courseSections, setCourseSections] = useState<any[]>([]);
    const [lessonSections, setLessonSections] = useState<any[]>([]);

    // Fetch courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await coursesService.getAllCourses({ limit: 1000 });
                if (response.success && response.data) {
                    setCourses(response.data.courses);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    // Fetch course sections
    useEffect(() => {
        const fetchCourseSections = async () => {
            try {
                const response = await coursesService.getCourseSections({ limit: 1000 });
                if (response.success && response.data) {
                    setCourseSections(response.data.sections);
                }
            } catch (error) {
                console.error('Error fetching course sections:', error);
            }
        };
        if (isOpen && (targetType === 'courseSection' || targetType === 'lessonSection')) {
            fetchCourseSections();
        }
    }, [isOpen, targetType]);

    // Fetch lessons when course is selected
    useEffect(() => {
        const fetchLessons = async () => {
            if (!selectedCourse || targetType !== 'lesson') {
                setLessons([]);
                setSelectedLesson('');
                return;
            }
            try {
                const response = await courseService.getCourseLessons(selectedCourse);
                if (response.success && response.data) {
                    setLessons(response.data.lessons);
                }
            } catch (error) {
                console.error('Error fetching lessons:', error);
                setLessons([]);
            }
        };
        fetchLessons();
    }, [selectedCourse, targetType]);

    // Fetch lesson sections when course section is selected
    useEffect(() => {
        const fetchLessonSections = async () => {
            if (!selectedCourseSection || targetType !== 'lessonSection') {
                setLessonSections([]);
                setSelectedLessonSection('');
                return;
            }
            // Note: This endpoint might need to be implemented in backend
            // For now, we'll use a placeholder
            try {
                // Assuming there's an endpoint like /courses/sections/:sectionId/lesson-sections
                // const response = await courseService.getLessonSections(selectedCourseSection);
                setLessonSections([]);
            } catch (error) {
                console.error('Error fetching lesson sections:', error);
                setLessonSections([]);
            }
        };
        if (targetType === 'lessonSection') {
            fetchLessonSections();
        }
    }, [selectedCourseSection, targetType]);

    const resetForm = () => {
        setTargetType('course');
        setSelectedCourse('');
        setSelectedLesson('');
        setSelectedCourseSection('');
        setSelectedLessonSection('');
        setQuantity(1);
        setPrice(0);
        setCreatedCodes([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const getTargetId = (): string => {
        switch (targetType) {
            case 'course':
                return selectedCourse;
            case 'lesson':
                return selectedLesson;
            case 'courseSection':
                return selectedCourseSection;
            case 'lessonSection':
                return selectedLessonSection;
            default:
                return '';
        }
    };

    const handleCreate = async () => {
        const targetId = getTargetId();
        if (!targetId) {
            toast({
                status: 'error',
                description: 'يرجى اختيار الهدف',
            });
            return;
        }

        if (quantity < 1 || quantity > 1000) {
            toast({
                status: 'error',
                description: 'عدد الأكواد يجب أن يكون بين 1 و 1000',
            });
            return;
        }

        setIsCreating(true);
        try {
            const response = await activationCodesService.createActivationCodes({
                targetType,
                targetId,
                quantity,
                price,
            });

            if (response.success && response.data) {
                setCreatedCodes(response.data.codes);
                toast({
                    status: 'success',
                    description: `تم إنشاء ${response.data.total} كود بنجاح`,
                });
                onSuccess();
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء الأكواد',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleExport = () => {
        if (createdCodes.length === 0) return;
        const header = ['#', 'الكود', 'النوع', 'السعر'];
        const rows = createdCodes.map((code, idx) => [
            idx + 1,
            code.code,
            code.targetType,
            code.price,
        ]);
        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `new_activation_codes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="4xl" isCentered>
            <ModalOverlay />
            <ModalContent dir="rtl" maxH="90vh">
                <ModalHeader bgGradient="linear(to-r, red.600, orange.600)" color="white" borderTopRadius="md">
                    إنشاء أكواد تفعيل جديدة
                </ModalHeader>
                <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
                <ModalBody overflowY="auto" p={6}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>نوع الهدف</FormLabel>
                            <Select
                                value={targetType}
                                onChange={(e) => {
                                    setTargetType(e.target.value as ActivationTargetType);
                                    setSelectedCourse('');
                                    setSelectedLesson('');
                                    setSelectedCourseSection('');
                                    setSelectedLessonSection('');
                                }}
                            >
                                <option value="course">كورس</option>
                                <option value="lesson">درس</option>
                                <option value="courseSection">قسم كورسات</option>
                                <option value="lessonSection">قسم دروس</option>
                            </Select>
                        </FormControl>

                        {targetType === 'course' && (
                            <FormControl isRequired>
                                <FormLabel>الكورس</FormLabel>
                                <Select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    placeholder="اختر الكورس"
                                >
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {targetType === 'lesson' && (
                            <>
                                <FormControl isRequired>
                                    <FormLabel>الكورس</FormLabel>
                                    <Select
                                        value={selectedCourse}
                                        onChange={(e) => {
                                            setSelectedCourse(e.target.value);
                                            setSelectedLesson('');
                                        }}
                                        placeholder="اختر الكورس"
                                    >
                                        {courses.map((course) => (
                                            <option key={course._id} value={course._id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>الدرس</FormLabel>
                                    <Select
                                        value={selectedLesson}
                                        onChange={(e) => setSelectedLesson(e.target.value)}
                                        placeholder="اختر الدرس"
                                        isDisabled={!selectedCourse}
                                    >
                                        {lessons.map((lesson) => (
                                            <option key={lesson._id} value={lesson._id}>
                                                {lesson.title}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        {targetType === 'courseSection' && (
                            <FormControl isRequired>
                                <FormLabel>قسم الكورسات</FormLabel>
                                <Select
                                    value={selectedCourseSection}
                                    onChange={(e) => setSelectedCourseSection(e.target.value)}
                                    placeholder="اختر قسم الكورسات"
                                >
                                    {courseSections.map((section) => (
                                        <option key={section._id} value={section._id}>
                                            {section.name || section.title}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {targetType === 'lessonSection' && (
                            <>
                                <FormControl isRequired>
                                    <FormLabel>قسم الكورسات</FormLabel>
                                    <Select
                                        value={selectedCourseSection}
                                        onChange={(e) => {
                                            setSelectedCourseSection(e.target.value);
                                            setSelectedLessonSection('');
                                        }}
                                        placeholder="اختر قسم الكورسات"
                                    >
                                        {courseSections.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.name || section.title}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>قسم الدروس</FormLabel>
                                    <Select
                                        value={selectedLessonSection}
                                        onChange={(e) => setSelectedLessonSection(e.target.value)}
                                        placeholder="اختر قسم الدروس"
                                        isDisabled={!selectedCourseSection}
                                    >
                                        {lessonSections.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.name || section.title}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        <FormControl isRequired>
                            <FormLabel>السعر (ج.م)</FormLabel>
                            <Input
                                type="number"
                                min={0}
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                placeholder="0"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>عدد الأكواد</FormLabel>
                            <Input
                                type="number"
                                min={1}
                                max={1000}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                placeholder="1"
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                الحد الأقصى: 1000 كود
                            </Text>
                        </FormControl>

                        {createdCodes.length > 0 && (
                            <Box mt={4}>
                                <VStack spacing={4} align="stretch">
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Text fontWeight="bold" color="green.600">
                                            تم إنشاء الأكواد بنجاح:
                                        </Text>
                                        <Button size="sm" onClick={handleExport} colorScheme="blue">
                                            تصدير الأكواد
                                        </Button>
                                    </Box>
                                    <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
                                        <Table variant="simple" size="sm">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>#</Th>
                                                    <Th>الكود</Th>
                                                    <Th>النوع</Th>
                                                    <Th>السعر</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {createdCodes.map((code, idx) => (
                                                    <Tr key={code._id}>
                                                        <Td>{idx + 1}</Td>
                                                        <Td>
                                                            <Badge fontFamily="mono" fontSize="sm">
                                                                {code.code}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{code.targetType}</Td>
                                                        <Td>{code.price.toLocaleString()} ج.م</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter borderTop="1px solid" borderColor="gray.200">
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        إغلاق
                    </Button>
                    {createdCodes.length === 0 && (
                        <Button
                            colorScheme="red"
                            onClick={handleCreate}
                            isLoading={isCreating}
                            isDisabled={!getTargetId() || quantity < 1}
                        >
                            إنشاء الأكواد
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

