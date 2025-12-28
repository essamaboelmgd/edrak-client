import { useState } from 'react';
import { Users, BookOpen, DollarSign, Mail, Phone, MapPin, Crown, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
import { ITeacherAdmin } from '../services/teachersService';

interface TeacherDetailsModalProps {
    teacher: ITeacherAdmin | null;
    isOpen: boolean;
    onClose: () => void;
    onSuspend?: (teacherId: string) => void;
    onUnsuspend?: (teacherId: string) => void;
    onEdit?: (teacher: ITeacherAdmin) => void;
    onDelete?: (teacherId: string) => void;
    onBlock?: (teacherId: string) => void;
    onUnblock?: (teacherId: string) => void;
}

export default function TeacherDetailsModal({
    teacher,
    isOpen,
    onClose,
    onSuspend,
    onUnsuspend,
    onEdit,
    onDelete,
    onBlock,
    onUnblock,
}: TeacherDetailsModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!teacher) return null;

    const isInTrial = teacher.trial?.isInTrial || teacher.platformStatus === 'trial';
    const hasActiveSubscription = teacher.subscription?.isActive && !isInTrial;
    const isSuspended = teacher.platformStatus === 'suspended';
    const isExpired = teacher.platformStatus === 'expired';

    const getStatusInfo = () => {
        if (isSuspended) {
            return {
                label: 'معطل',
                colorScheme: 'red',
                icon: XCircle,
            };
        }
        if (isExpired) {
            return {
                label: 'منتهي',
                colorScheme: 'gray',
                icon: Clock,
            };
        }
        if (isInTrial) {
            return {
                label: `تجريبي (${teacher.trial?.trialDaysLeft || 0} يوم متبقي)`,
                colorScheme: 'yellow',
                icon: Clock,
            };
        }
        if (hasActiveSubscription) {
            return {
                label: 'نشط',
                colorScheme: 'green',
                icon: CheckCircle2,
            };
        }
        return {
            label: 'غير نشط',
            colorScheme: 'gray',
            icon: AlertCircle,
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

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
                        <VStack align="start" spacing={1}>
                            <Text fontSize="2xl" fontWeight="bold">
                                {teacher.fullName}
                            </Text>
                            <Text color="red.100" fontSize="sm">
                                {teacher.platformName}
                            </Text>
                        </VStack>
                        <Badge
                            px={4}
                            py={2}
                            borderRadius="xl"
                            borderWidth={2}
                            colorScheme={statusInfo.colorScheme}
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >
                            <StatusIcon size={18} />
                            <Text fontWeight="semibold">{statusInfo.label}</Text>
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
                                            {teacher.email}
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
                                            {teacher.mobileNumber}
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
                                            {teacher.governorate}
                                        </Text>
                                    </VStack>
                                </HStack>
                                {teacher.specialization && (
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" color="gray.500">
                                            التخصص
                                        </Text>
                                        <Text fontWeight="medium" color="gray.800">
                                            {teacher.specialization}
                                        </Text>
                                    </VStack>
                                )}
                                {teacher.yearsOfExperience && (
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" color="gray.500">
                                            سنوات الخبرة
                                        </Text>
                                        <Text fontWeight="medium" color="gray.800">
                                            {teacher.yearsOfExperience} سنة
                                        </Text>
                                    </VStack>
                                )}
                            </Grid>
                        </Box>

                        {/* Subscription & Plan */}
                        <Box bg="gray.50" borderRadius="xl" p={6}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                                الاشتراك والخطة
                            </Text>
                            {isInTrial ? (
                                <VStack align="start" spacing={3}>
                                    <HStack spacing={2} color="yellow.700">
                                        <Clock size={20} />
                                        <Text fontWeight="semibold">في فترة التجربة</Text>
                                    </HStack>
                                    {teacher.trial?.trialStartDate && (
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="gray.500">
                                                تاريخ البدء
                                            </Text>
                                            <Text fontWeight="medium" color="gray.800">
                                                {new Date(teacher.trial.trialStartDate).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </VStack>
                                    )}
                                    {teacher.trial?.trialEndDate && (
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="gray.500">
                                                تاريخ الانتهاء
                                            </Text>
                                            <Text fontWeight="medium" color="gray.800">
                                                {new Date(teacher.trial.trialEndDate).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </VStack>
                                    )}
                                    {teacher.trial?.trialDaysLeft !== undefined && (
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="gray.500">
                                                الأيام المتبقية
                                            </Text>
                                            <Text fontWeight="medium" color="gray.800">
                                                {teacher.trial.trialDaysLeft} يوم
                                            </Text>
                                        </VStack>
                                    )}
                                </VStack>
                            ) : teacher.subscription?.plan ? (
                                <VStack align="start" spacing={3}>
                                    <HStack spacing={2}>
                                        <Crown size={20} color="#F59E0B" />
                                        <Text fontWeight="semibold" color="gray.800">
                                            {teacher.subscription.plan.nameArabic || teacher.subscription.plan.name}
                                        </Text>
                                    </HStack>
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="gray.500">
                                                السعر
                                            </Text>
                                            <Text fontWeight="medium" color="gray.800">
                                                {teacher.subscription.plan.price.toLocaleString()} ج.م
                                            </Text>
                                        </VStack>
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="gray.500">
                                                المدة
                                            </Text>
                                            <Text fontWeight="medium" color="gray.800">
                                                {teacher.subscription.plan.duration} شهر
                                            </Text>
                                        </VStack>
                                        {teacher.subscription.startDate && (
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" color="gray.500">
                                                    تاريخ البدء
                                                </Text>
                                                <Text fontWeight="medium" color="gray.800">
                                                    {new Date(teacher.subscription.startDate).toLocaleDateString('ar-EG')}
                                                </Text>
                                            </VStack>
                                        )}
                                        {teacher.subscription.endDate && (
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" color="gray.500">
                                                    تاريخ الانتهاء
                                                </Text>
                                                <Text fontWeight="medium" color="gray.800">
                                                    {new Date(teacher.subscription.endDate).toLocaleDateString('ar-EG')}
                                                </Text>
                                            </VStack>
                                        )}
                                    </Grid>
                                    {teacher.subscription.plan.features && teacher.subscription.plan.features.length > 0 && (
                                        <VStack align="start" spacing={2}>
                                            <Text fontSize="sm" color="gray.500">
                                                المميزات
                                            </Text>
                                            <HStack spacing={2} flexWrap="wrap">
                                                {teacher.subscription.plan.features.map((feature, idx) => (
                                                    <Badge key={idx} px={3} py={1} bg="blue.50" color="blue.700" borderRadius="lg">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </HStack>
                                        </VStack>
                                    )}
                                </VStack>
                            ) : (
                                <Text color="gray.500">لا يوجد اشتراك نشط</Text>
                            )}
                        </Box>

                        {/* Statistics */}
                        <Box bg="gray.50" borderRadius="xl" p={6}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
                                الإحصائيات
                            </Text>
                            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                <VStack spacing={2}>
                                    <Users size={24} color="#9CA3AF" />
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                                        {teacher.stats.totalStudents}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        طالب
                                    </Text>
                                </VStack>
                                <VStack spacing={2}>
                                    <BookOpen size={24} color="#9CA3AF" />
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                                        {teacher.stats.activeCourses}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        كورس
                                    </Text>
                                </VStack>
                                <VStack spacing={2}>
                                    <DollarSign size={24} color="#9CA3AF" />
                                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                        {teacher.stats.totalRevenue.toLocaleString()}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        ج.م
                                    </Text>
                                </VStack>
                            </Grid>
                        </Box>

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
                                        colorScheme={teacher.isActive ? 'green' : 'red'}
                                    >
                                        {teacher.isActive ? 'نعم' : 'لا'}
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
                                        colorScheme={teacher.isEmailVerified ? 'green' : 'gray'}
                                    >
                                        {teacher.isEmailVerified ? 'نعم' : 'لا'}
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
                                        colorScheme={teacher.isMobileVerified ? 'green' : 'gray'}
                                    >
                                        {teacher.isMobileVerified ? 'نعم' : 'لا'}
                                    </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text color="gray.600">تاريخ الإنشاء</Text>
                                    <Text fontWeight="medium" color="gray.800">
                                        {new Date(teacher.createdAt).toLocaleDateString('ar-EG')}
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="gray.50">
                    <HStack spacing={3} w="full" justify="space-between">
                        <HStack spacing={2}>
                            {teacher.isActive ? (
                                <Button colorScheme="red" onClick={() => onBlock?.(teacher._id)}>
                                    حظر
                                </Button>
                            ) : (
                                <Button colorScheme="green" onClick={() => onUnblock?.(teacher._id)}>
                                    إلغاء الحظر
                                </Button>
                            )}
                            {isSuspended ? (
                                <Button colorScheme="green" onClick={() => onUnsuspend?.(teacher._id)}>
                                    تفعيل المدرس
                                </Button>
                            ) : (
                                <Button colorScheme="orange" onClick={() => onSuspend?.(teacher._id)}>
                                    إيقاف المدرس
                                </Button>
                            )}
                            <Button colorScheme="blue" onClick={() => onEdit?.(teacher)}>
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
                                        onDelete?.(teacher._id);
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
