import { useState } from 'react';
import { BookOpen, Users, Coins, Edit, Trash2, Eye } from 'lucide-react';
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
    Image,
} from '@chakra-ui/react';
import { ICourseAdmin } from '../services/coursesService';
import { getImageUrl } from '@/lib/axios';

interface CourseDetailsModalProps {
    course: ICourseAdmin | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (course: ICourseAdmin) => void;
    onDelete?: (courseId: string) => void;
}

export default function CourseDetailsModal({
    course,
    isOpen,
    onClose,
    onEdit,
    onDelete,
}: CourseDetailsModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!course) return null;

    const getStatusBadge = () => {
        if (course.status === 'active' || course.status === 'published') {
            return <Badge colorScheme="green">نشط</Badge>;
        }
        if (course.status === 'draft') {
            return <Badge colorScheme="gray">مسودة</Badge>;
        }
        return <Badge colorScheme="red">معطل</Badge>;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
            <ModalOverlay />
            <ModalContent dir="rtl" maxH="90vh" m={0}>
                <ModalHeader
                    bgGradient="linear(to-r, red.600, orange.600)"
                    color="white"
                    borderTopRadius="md"
                    position="relative"
                >
                    <HStack justify="space-between" align="center">
                        <HStack spacing={3}>
                            <BookOpen size={24} />
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xl" fontWeight="bold">
                                    {course.title}
                                </Text>
                                <Text fontSize="sm" opacity={0.9}>
                                    تفاصيل الكورس
                                </Text>
                            </VStack>
                        </HStack>
                        {getStatusBadge()}
                    </HStack>
                    <ModalCloseButton color="white" />
                </ModalHeader>

                <ModalBody overflowY="auto" p={6}>
                    <VStack spacing={6} align="stretch">
                        {/* Course Image */}
                        {(course.poster || course.thumbnail) && (
                            <Box>
                                <Image
                                    src={getImageUrl(course.poster || course.thumbnail!)}
                                    alt={course.title}
                                    borderRadius="lg"
                                    maxH="300px"
                                    objectFit="cover"
                                    w="100%"
                                />
                            </Box>
                        )}

                        {/* Basic Info */}
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    المدرس
                                </Text>
                                <Text fontWeight="bold" fontSize="md">
                                    {course.teacher.fullName}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    {course.teacher.email}
                                </Text>
                            </Box>

                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    المرحلة الدراسية
                                </Text>
                                <Text fontWeight="bold" fontSize="md">
                                    {course.educationalLevel.name || course.educationalLevel.shortName}
                                </Text>
                            </Box>

                            {course.courseSection && (
                                <Box p={4} bg="gray.50" borderRadius="lg">
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        القسم
                                    </Text>
                                    <Text fontWeight="bold" fontSize="md">
                                        {course.courseSection.title || course.courseSection.name || course.courseSection.nameArabic}
                                    </Text>
                                </Box>
                            )}

                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    النوع
                                </Text>
                                <Text fontWeight="bold" fontSize="md">
                                    {course.type || 'عادي'}
                                </Text>
                            </Box>
                        </Grid>

                        {/* Description */}
                        {course.description && (
                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    الوصف
                                </Text>
                                <Text>{course.description}</Text>
                            </Box>
                        )}

                        {/* Stats */}
                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                            <Box p={4} bg="blue.50" borderRadius="lg" textAlign="center">
                                <Users size={24} className="mx-auto mb-2 text-blue-600" />
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                    {course.stats.totalStudents}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    طالب
                                </Text>
                            </Box>

                            <Box p={4} bg="purple.50" borderRadius="lg" textAlign="center">
                                <BookOpen size={24} className="mx-auto mb-2 text-purple-600" />
                                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                    {course.stats.totalLessons}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    درس
                                </Text>
                            </Box>

                            <Box
                                p={4}
                                bgGradient="linear(to-br, green.50, emerald.50)"
                                borderRadius="lg"
                                textAlign="center"
                                border="1px solid"
                                borderColor="green.200"
                            >
                                <Coins size={24} className="mx-auto mb-2 text-green-600" />
                                {course.isFree ? (
                                    <>
                                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                            مجاني
                                        </Text>
                                        <Text fontSize="sm" color="blue.500">
                                            كورس مجاني
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text fontSize="2xl" fontWeight="bold" color="green.700">
                                            {course.finalPrice.toLocaleString()}
                                        </Text>
                                        <Text fontSize="sm" fontWeight="semibold" color="green.600">
                                            ج.م
                                        </Text>
                                    </>
                                )}
                            </Box>
                        </Grid>

                        {/* Pricing Info */}
                        {!course.isFree && (
                            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                <Box
                                    p={4}
                                    bg="gray.50"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                >
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        السعر الأصلي
                                    </Text>
                                    <HStack spacing={1} align="baseline">
                                        <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                            {course.price.toLocaleString()}
                                        </Text>
                                        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                                            ج.م
                                        </Text>
                                    </HStack>
                                </Box>

                                {course.discount > 0 && (
                                    <Box
                                        p={4}
                                        bgGradient="linear(to-br, red.50, pink.50)"
                                        borderRadius="lg"
                                        border="1px solid"
                                        borderColor="red.200"
                                    >
                                        <Text fontSize="sm" color="gray.600" mb={1}>
                                            الخصم
                                        </Text>
                                        <HStack spacing={1} align="baseline">
                                            <Text fontWeight="bold" fontSize="lg" color="red.600">
                                                {course.discount.toLocaleString()}
                                            </Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="red.500">
                                                ج.م
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}

                                <Box
                                    p={4}
                                    bgGradient="linear(to-br, green.50, emerald.50)"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="green.200"
                                >
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        السعر النهائي
                                    </Text>
                                    <HStack spacing={1} align="baseline">
                                        <Text fontWeight="bold" fontSize="lg" color="green.700">
                                            {course.finalPrice.toLocaleString()}
                                        </Text>
                                        <Text fontSize="sm" fontWeight="semibold" color="green.600">
                                            ج.م
                                        </Text>
                                    </HStack>
                                </Box>
                            </Grid>
                        )}

                        {/* Dates */}
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    تاريخ الإنشاء
                                </Text>
                                <Text fontWeight="bold" fontSize="md">
                                    {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                                </Text>
                            </Box>

                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    آخر تحديث
                                </Text>
                                <Text fontWeight="bold" fontSize="md">
                                    {new Date(course.updatedAt).toLocaleDateString('ar-EG')}
                                </Text>
                            </Box>
                        </Grid>
                    </VStack>
                </ModalBody>

                <ModalFooter borderTop="1px" borderColor="gray.200" gap={2}>
                    {!showDeleteConfirm ? (
                        <>
                            <Button
                                leftIcon={<Eye size={18} />}
                                variant="outline"
                                onClick={onClose}
                            >
                                إغلاق
                            </Button>
                            <Button
                                leftIcon={<Edit size={18} />}
                                colorScheme="blue"
                                onClick={() => onEdit?.(course)}
                            >
                                تعديل
                            </Button>
                            <Button
                                leftIcon={<Trash2 size={18} />}
                                colorScheme="red"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                حذف
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={() => {
                                    onDelete?.(course._id);
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                تأكيد الحذف
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

