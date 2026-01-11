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
    Switch,
    HStack,
} from '@chakra-ui/react';
import { couponsService, CouponTargetType, DiscountType, ICoupon } from '../services/couponsService';
import { coursesService } from '../services/coursesService';
import { courseService } from '@/features/courses/courseService';

interface CreateCouponsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCouponsModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateCouponsModalProps) {
    const toast = useToast();
    const [targetType, setTargetType] = useState<CouponTargetType>('course');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [selectedCourseSection, setSelectedCourseSection] = useState('');
    const [selectedLessonSection, setSelectedLessonSection] = useState('');
    const [discountType, setDiscountType] = useState<DiscountType>('percentage');
    const [discountValue, setDiscountValue] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
    const [hasMaxUses, setHasMaxUses] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createdCoupons, setCreatedCoupons] = useState<ICoupon[]>([]);

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

    // Fetch lesson sections when course is selected (for lessonSection target)
    useEffect(() => {
        const fetchLessonSections = async () => {
            if (!selectedCourse || targetType !== 'lessonSection') {
                setLessonSections([]);
                setSelectedLessonSection('');
                return;
            }
            try {
                const response = await courseService.getLessonSections(selectedCourse);
                if (response.success && response.data) {
                    // Start: Fix backend response mapping if needed, assuming data.lessonSections
                    setLessonSections(response.data.lessonSections || []);
                }
            } catch (error) {
                console.error('Error fetching lesson sections:', error);
                setLessonSections([]);
            }
        };
        fetchLessonSections();
    }, [selectedCourse, targetType]);

    const getSelectedPrice = (type: CouponTargetType) => {
        let price = 0;
        let item: any = null;

        switch (type) {
            case 'course':
                item = courses.find(c => c._id === selectedCourse);
                break;
            case 'lesson':
                item = lessons.find(l => l._id === selectedLesson);
                break;
            case 'courseSection':
                item = courseSections.find(cs => cs._id === selectedCourseSection);
                break;
            case 'lessonSection':
                item = lessonSections.find(ls => ls._id === selectedLessonSection);
                break;
        }

        if (item) {
            price = item.price || 0;
        }
        return price;
    };

    const renderPriceBadge = (price: number) => (
        <Badge colorScheme="green" variant="subtle" mt={2}>
            السعر الحالي: {price.toLocaleString()} ج.م
        </Badge>
    );

    const resetForm = () => {
        setTargetType('course');
        setSelectedCourse('');
        setSelectedLesson('');
        setSelectedCourseSection('');
        setSelectedLessonSection('');
        setDiscountType('percentage');
        setDiscountValue(0);
        setQuantity(1);
        setMaxUses(undefined);
        setHasMaxUses(false);
        setExpiresAt('');
        setHasExpiry(false);
        setCreatedCoupons([]);
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
                description: 'عدد الكوبونات يجب أن يكون بين 1 و 1000',
            });
            return;
        }

        if (discountType === 'percentage' && discountValue > 100) {
            toast({
                status: 'error',
                description: 'نسبة الخصم يجب ألا تتجاوز 100%',
            });
            return;
        }

        if (discountValue <= 0) {
            toast({
                status: 'error',
                description: 'قيمة الخصم يجب أن تكون أكبر من 0',
            });
            return;
        }

        setIsCreating(true);
        try {
            const response = await couponsService.createCoupons({
                targetType,
                targetId,
                quantity,
                discountType,
                discountValue,
                maxUses: hasMaxUses ? maxUses : undefined,
                expiresAt: hasExpiry && expiresAt ? new Date(expiresAt).toISOString() : undefined,
            });

            if (response.success && response.data) {
                setCreatedCoupons(response.data.coupons);
                toast({
                    status: 'success',
                    description: `تم إنشاء ${response.data.total} كوبون بنجاح`,
                });
                onSuccess();
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء الكوبونات',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleExport = () => {
        if (createdCoupons.length === 0) return;
        const header = ['#', 'الكود', 'النوع', 'نوع الخصم', 'قيمة الخصم', 'الحد الأقصى', 'تاريخ الانتهاء'];
        const rows = createdCoupons.map((coupon, idx) => [
            idx + 1,
            coupon.code,
            coupon.targetType,
            coupon.discountType === 'percentage' ? 'نسبة' : 'مبلغ ثابت',
            coupon.discountValue,
            coupon.maxUses || 'غير محدود',
            coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG') : 'غير محدد',
        ]);
        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `new_coupons_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="4xl" isCentered>
            <ModalOverlay />
            <ModalContent dir="rtl" maxH="90vh">
                <ModalHeader bgGradient="linear(to-r, red.600, orange.600)" color="white" borderTopRadius="md">
                    إنشاء كوبونات خصم جديدة
                </ModalHeader>
                <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
                <ModalBody overflowY="auto" p={6}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>نوع الهدف</FormLabel>
                            <Select
                                value={targetType}
                                onChange={(e) => {
                                    setTargetType(e.target.value as CouponTargetType);
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
                                {selectedCourse && renderPriceBadge(getSelectedPrice('course'))}
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
                                    {selectedLesson && renderPriceBadge(getSelectedPrice('lesson'))}
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
                                {selectedCourseSection && renderPriceBadge(getSelectedPrice('courseSection'))}
                            </FormControl>
                        )}

                        {targetType === 'lessonSection' && (
                            <>
                                <FormControl isRequired>
                                    <FormLabel>الكورس</FormLabel>
                                    <Select
                                        value={selectedCourse}
                                        onChange={(e) => {
                                            setSelectedCourse(e.target.value);
                                            setSelectedLessonSection('');
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
                                    <FormLabel>قسم الدروس</FormLabel>
                                    <Select
                                        value={selectedLessonSection}
                                        onChange={(e) => setSelectedLessonSection(e.target.value)}
                                        placeholder="اختر قسم الدروس"
                                        isDisabled={!selectedCourse}
                                    >
                                        {lessonSections.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.name || section.title}
                                            </option>
                                        ))}
                                    </Select>
                                    {selectedLessonSection && renderPriceBadge(getSelectedPrice('lessonSection'))}
                                </FormControl>
                            </>
                        )}

                        <FormControl isRequired>
                            <FormLabel>نوع الخصم</FormLabel>
                            <Select
                                value={discountType}
                                onChange={(e) => {
                                    setDiscountType(e.target.value as DiscountType);
                                    setDiscountValue(0);
                                }}
                            >
                                <option value="percentage">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت (ج.م)</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>
                                {discountType === 'percentage' ? 'نسبة الخصم (%)' : 'قيمة الخصم (ج.م)'}
                            </FormLabel>
                            <Input
                                type="number"
                                min={0}
                                max={discountType === 'percentage' ? 100 : undefined}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value))}
                                placeholder={discountType === 'percentage' ? '0-100' : '0'}
                            />
                            {discountType === 'percentage' && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    الحد الأقصى: 100%
                                </Text>
                            )}
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>عدد الكوبونات</FormLabel>
                            <Input
                                type="number"
                                min={1}
                                max={1000}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                placeholder="1"
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                الحد الأقصى: 1000 كوبون
                            </Text>
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <FormLabel mb={0}>الحد الأقصى للاستخدام</FormLabel>
                                <Switch
                                    isChecked={hasMaxUses}
                                    onChange={(e) => {
                                        setHasMaxUses(e.target.checked);
                                        if (!e.target.checked) {
                                            setMaxUses(undefined);
                                        }
                                    }}
                                />
                            </HStack>
                            {hasMaxUses && (
                                <Input
                                    type="number"
                                    min={1}
                                    value={maxUses || ''}
                                    onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="مثال: 100"
                                    mt={2}
                                />
                            )}
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <FormLabel mb={0}>تاريخ انتهاء الصلاحية</FormLabel>
                                <Switch
                                    isChecked={hasExpiry}
                                    onChange={(e) => {
                                        setHasExpiry(e.target.checked);
                                        if (!e.target.checked) {
                                            setExpiresAt('');
                                        }
                                    }}
                                />
                            </HStack>
                            {hasExpiry && (
                                <Input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    mt={2}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            )}
                        </FormControl>

                        {createdCoupons.length > 0 && (
                            <Box mt={4}>
                                <VStack spacing={4} align="stretch">
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Text fontWeight="bold" color="green.600">
                                            تم إنشاء الكوبونات بنجاح:
                                        </Text>
                                        <Button size="sm" onClick={handleExport} colorScheme="blue">
                                            تصدير الكوبونات
                                        </Button>
                                    </Box>
                                    <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
                                        <Table variant="simple" size="sm">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>#</Th>
                                                    <Th>الكود</Th>
                                                    <Th>نوع الخصم</Th>
                                                    <Th>قيمة الخصم</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {createdCoupons.map((coupon, idx) => (
                                                    <Tr key={coupon._id}>
                                                        <Td>{idx + 1}</Td>
                                                        <Td>
                                                            <Badge fontFamily="mono" fontSize="sm">
                                                                {coupon.code}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{coupon.discountType === 'percentage' ? 'نسبة' : 'مبلغ ثابت'}</Td>
                                                        <Td>
                                                            {coupon.discountType === 'percentage'
                                                                ? `${coupon.discountValue}%`
                                                                : `${coupon.discountValue.toLocaleString()} ج.م`}
                                                        </Td>
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
                    {createdCoupons.length === 0 && (
                        <Button
                            colorScheme="red"
                            onClick={handleCreate}
                            isLoading={isCreating}
                            isDisabled={!getTargetId() || quantity < 1 || discountValue <= 0}
                        >
                            إنشاء الكوبونات
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

