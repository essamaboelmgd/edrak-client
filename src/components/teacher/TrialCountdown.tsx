import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    HStack,
    Text,
    VStack,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    ModalHeader,
    Progress,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ITeacherResponse } from '@/types/auth.types';
import { Link as RouterLink } from 'react-router-dom';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const calculateTimeLeft = (endDate: string | Date): TimeLeft | null => {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const difference = end.getTime() - new Date().getTime();

    if (difference <= 0) {
        return null;
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
};

const formatTimeUnit = (value: number): string => {
    return value.toString().padStart(2, '0');
};

export default function TrialCountdown() {
    const { user, role } = useAuth();
    // Check if user is a teacher in trial first
    const teacher = user as ITeacherResponse;
    const isInTrial = teacher?.teacherProfile?.trial?.isInTrial;
    const trialEndDate = teacher?.teacherProfile?.trial?.trialEndDate;
    // trialDaysLeft might be on teacherProfile directly or in trial object
    const trialDaysLeft = (teacher?.teacherProfile as any)?.trialDaysLeft ?? teacher?.teacherProfile?.trial?.trialDaysLeft ?? 0;

    // Check if modal was previously dismissed
    const dismissed = typeof window !== 'undefined' ? localStorage.getItem('trial_countdown_dismissed') : null;

    // Modal should be open by default if teacher is in trial and hasn't dismissed it
    const shouldBeOpenInitially = role === UserRole.TEACHER &&
        isInTrial &&
        trialEndDate &&
        !dismissed;

    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: shouldBeOpenInitially });
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isMinimized, setIsMinimized] = useState(!!dismissed);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only show for teachers in trial
        if (role !== UserRole.TEACHER || !isInTrial || !trialEndDate) {
            return;
        }

        // Initialize on first mount - open modal if not dismissed
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            if (!dismissed) {
                // Open the modal automatically when user logs in and is in trial
                onOpen();
            } else {
                // Show minimized version if previously dismissed
                setIsMinimized(true);
            }
        }

        // Calculate initial time
        const updateTime = () => {
            const calculated = calculateTimeLeft(trialEndDate);
            setTimeLeft(calculated);

            // If trial has ended, hide the countdown
            if (!calculated) {
                setIsMinimized(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        };

        updateTime();

        // Update every second
        intervalRef.current = setInterval(updateTime, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [role, isInTrial, trialEndDate, dismissed, onOpen]);

    const handleDismiss = () => {
        localStorage.setItem('trial_countdown_dismissed', 'true');
        setIsMinimized(true);
        onClose();
    };

    const handleOpenFromMinimized = () => {
        onOpen();
    };

    if (role !== UserRole.TEACHER || !isInTrial || !trialEndDate || !timeLeft) {
        return null;
    }

    // Calculate percentage remaining (assuming 7 days trial)
    const totalDays = 7;
    const daysRemaining = timeLeft.days;
    const percentageRemaining = Math.max(0, (daysRemaining / totalDays) * 100);

    // Minimized version (fixed bottom left)
    if (isMinimized) {
        return (
            <>
                <Box
                    position="fixed"
                    bottom={4}
                    right={4}
                    zIndex={1000}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="xl"
                    border="2px solid"
                    borderColor="orange.300"
                    p={3}
                    minW="200px"
                    _hover={{
                        boxShadow: '2xl',
                        transform: 'translateY(-2px)',
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={handleOpenFromMinimized}
                >
                    <HStack spacing={3} alignItems="center">
                        <Box
                            bg="orange.100"
                            borderRadius="full"
                            p={2}
                        >
                            <Icon icon="solar:clock-circle-linear" width="20" height="20" />
                        </Box>
                        <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" fontWeight="bold" color="orange.600">
                                تجربة مجانية
                            </Text>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                {timeLeft.days} يوم {formatTimeUnit(timeLeft.hours)}:{formatTimeUnit(timeLeft.minutes)}
                            </Text>
                        </VStack>
                        <Icon icon="solar:maximize-square-2-linear" width="16" height="16" color="gray.500" />
                    </HStack>
                </Box>
                {/* Modal when clicking minimized version */}
                <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
                    <ModalOverlay />
                    <ModalContent dir="rtl">
                        <ModalHeader>الوقت المتبقي في التجربة المجانية</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {renderFullCountdown()}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </>
        );
    }

    // Full modal version
    return (
        <Modal isOpen={isOpen} onClose={handleDismiss} size="md" isCentered closeOnOverlayClick={false}>
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent dir="rtl" borderRadius="xl" overflow="hidden">
                <Box
                    bgGradient="linear(to-br, orange.400, orange.600)"
                    p={6}
                    color="white"
                >
                    <HStack justify="space-between" mb={4}>
                        <HStack spacing={3}>
                            <Box
                                bg="whiteAlpha.300"
                                borderRadius="full"
                                p={3}
                            >
                                <Icon icon="solar:clock-circle-bold" width="32" height="32" />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontSize="lg" fontWeight="bold">
                                    تجربة مجانية نشطة
                                </Text>
                                <Text fontSize="sm" opacity={0.9}>
                                    استمتع بجميع الميزات مجاناً
                                </Text>
                            </VStack>
                        </HStack>
                        <IconButton
                            aria-label="تصغير"
                            icon={<Icon icon="solar:minimize-square-2-linear" width="20" height="20" />}
                            variant="ghost"
                            color="white"
                            onClick={handleDismiss}
                            _hover={{ bg: 'whiteAlpha.200' }}
                        />
                    </HStack>

                    <Box bg="whiteAlpha.200" borderRadius="lg" p={4} mb={4}>
                        <Text fontSize="xs" mb={2} opacity={0.9}>
                            الوقت المتبقي
                        </Text>
                        <HStack spacing={2} justify="center">
                            <VStack spacing={1}>
                                <Box
                                    bg="white"
                                    color="orange.600"
                                    borderRadius="lg"
                                    px={4}
                                    py={2}
                                    minW="60px"
                                >
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {formatTimeUnit(timeLeft.days)}
                                    </Text>
                                </Box>
                                <Text fontSize="xs" opacity={0.9}>
                                    يوم
                                </Text>
                            </VStack>
                            <Text fontSize="2xl" fontWeight="bold" opacity={0.8}>
                                :
                            </Text>
                            <VStack spacing={1}>
                                <Box
                                    bg="white"
                                    color="orange.600"
                                    borderRadius="lg"
                                    px={4}
                                    py={2}
                                    minW="60px"
                                >
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {formatTimeUnit(timeLeft.hours)}
                                    </Text>
                                </Box>
                                <Text fontSize="xs" opacity={0.9}>
                                    ساعة
                                </Text>
                            </VStack>
                            <Text fontSize="2xl" fontWeight="bold" opacity={0.8}>
                                :
                            </Text>
                            <VStack spacing={1}>
                                <Box
                                    bg="white"
                                    color="orange.600"
                                    borderRadius="lg"
                                    px={4}
                                    py={2}
                                    minW="60px"
                                >
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {formatTimeUnit(timeLeft.minutes)}
                                    </Text>
                                </Box>
                                <Text fontSize="xs" opacity={0.9}>
                                    دقيقة
                                </Text>
                            </VStack>
                            <Text fontSize="2xl" fontWeight="bold" opacity={0.8}>
                                :
                            </Text>
                            <VStack spacing={1}>
                                <Box
                                    bg="white"
                                    color="orange.600"
                                    borderRadius="lg"
                                    px={4}
                                    py={2}
                                    minW="60px"
                                >
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {formatTimeUnit(timeLeft.seconds)}
                                    </Text>
                                </Box>
                                <Text fontSize="xs" opacity={0.9}>
                                    ثانية
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>

                    <Progress
                        value={percentageRemaining}
                        colorScheme="whiteAlpha"
                        bg="whiteAlpha.300"
                        borderRadius="full"
                        size="sm"
                    />
                    <Text fontSize="xs" mt={2} textAlign="center" opacity={0.9}>
                        {trialDaysLeft} أيام متبقية من أصل 7 أيام
                    </Text>
                </Box>

                <Box p={6} bg="white">
                    <VStack spacing={4} align="stretch">
                        <HStack spacing={2} color="gray.600">
                            <Icon icon="solar:check-circle-bold" width="20" height="20" color="green.500" />
                            <Text fontSize="sm">
                                وصول كامل لجميع الميزات المتقدمة
                            </Text>
                        </HStack>
                        <HStack spacing={2} color="gray.600">
                            <Icon icon="solar:check-circle-bold" width="20" height="20" color="green.500" />
                            <Text fontSize="sm">
                                إنشاء دورات غير محدودة
                            </Text>
                        </HStack>
                        <HStack spacing={2} color="gray.600">
                            <Icon icon="solar:check-circle-bold" width="20" height="20" color="green.500" />
                            <Text fontSize="sm">
                                إدارة الطلاب والاشتراكات
                            </Text>
                        </HStack>

                        <Button
                            colorScheme="orange"
                            size="lg"
                            mt={4}
                            onClick={handleDismiss}
                            rightIcon={<Icon icon="solar:arrow-right-linear" width="20" height="20" />}
                        >
                            متابعة العمل
                        </Button>

                        <Box
                            as={RouterLink}
                            to="/teacher/platform-subscriptions"
                            fontSize="sm"
                            textAlign="center"
                            color="orange.500"
                            fontWeight="medium"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            أو اشترك الآن للاستمرار بعد انتهاء التجربة
                        </Box>
                    </VStack>
                </Box>
            </ModalContent>
        </Modal>
    );

    function renderFullCountdown() {
        if (!timeLeft) return null;

        return (
            <VStack spacing={4}>
                <Box bg="orange.50" borderRadius="lg" p={6} w="full">
                    <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                        الوقت المتبقي في التجربة المجانية
                    </Text>
                    <HStack spacing={2} justify="center">
                        <VStack spacing={1}>
                            <Box
                                bg="orange.500"
                                color="white"
                                borderRadius="lg"
                                px={4}
                                py={3}
                                minW="70px"
                            >
                                <Text fontSize="3xl" fontWeight="bold">
                                    {formatTimeUnit(timeLeft.days)}
                                </Text>
                            </Box>
                            <Text fontSize="xs" color="gray.600">
                                يوم
                            </Text>
                        </VStack>
                        <Text fontSize="3xl" fontWeight="bold" color="gray.400">
                            :
                        </Text>
                        <VStack spacing={1}>
                            <Box
                                bg="orange.500"
                                color="white"
                                borderRadius="lg"
                                px={4}
                                py={3}
                                minW="70px"
                            >
                                <Text fontSize="3xl" fontWeight="bold">
                                    {formatTimeUnit(timeLeft.hours)}
                                </Text>
                            </Box>
                            <Text fontSize="xs" color="gray.600">
                                ساعة
                            </Text>
                        </VStack>
                        <Text fontSize="3xl" fontWeight="bold" color="gray.400">
                            :
                        </Text>
                        <VStack spacing={1}>
                            <Box
                                bg="orange.500"
                                color="white"
                                borderRadius="lg"
                                px={4}
                                py={3}
                                minW="70px"
                            >
                                <Text fontSize="3xl" fontWeight="bold">
                                    {formatTimeUnit(timeLeft.minutes)}
                                </Text>
                            </Box>
                            <Text fontSize="xs" color="gray.600">
                                دقيقة
                            </Text>
                        </VStack>
                    </HStack>
                    <Progress
                        value={percentageRemaining}
                        colorScheme="orange"
                        bg="orange.100"
                        borderRadius="full"
                        size="md"
                        mt={4}
                    />
                    <Text fontSize="xs" mt={2} textAlign="center" color="gray.600">
                        {trialDaysLeft} أيام متبقية
                    </Text>
                </Box>

                <Button
                    colorScheme="orange"
                    w="full"
                    size="lg"
                    as={RouterLink}
                    to="/teacher/platform-subscriptions"
                >
                    اشترك الآن
                </Button>
            </VStack>
        );
    }
}

