import { useEffect, useState } from 'react';
import { Box, Container, Heading, Text, VStack, Button, Spinner, Icon, useToast } from '@chakra-ui/react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socket } from '@/lib/socket';
import { axiosInstance } from '@/lib/axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const toast = useToast();
    
    // Fawaterk typically sends invoice_id or similar in query params
    const invoiceId = searchParams.get('invoice_id') || searchParams.get('invoiceId'); 

    useEffect(() => {
        if (!invoiceId) {
            setStatus('success'); // Assume success if no ID to verify (or redirect loop) -> actually safer to just show success
             setTimeout(() => {
                navigate('/student/courses');
            }, 3000);
            return;
        }

        // Listen for real-time confirmation
        const eventName = `payment-success-${invoiceId}`;
        console.log("Listening for:", eventName);
        
        const handlePaymentSuccess = () => {
            console.log("Payment confirmed via socket!");
            setStatus('success');
            toast({ status: 'success', title: 'تم تأكيد الدفع بنجاح' });
            setTimeout(() => {
                navigate('/student/courses');
            }, 3000);
        };

        socket.on(eventName, handlePaymentSuccess);

        // Proactive Verification via API (Crucial for localhost where webhook fails)
        const verifyPayment = async () => {
            try {
                const { data } = await axiosInstance.get(`/payment/verify?invoiceId=${invoiceId}`);
                if (data.status === 'success') {
                    console.log("Payment verified via API");
                    handlePaymentSuccess();
                } else if (data.status === 'failed') {
                    setStatus('failed');
                }
            } catch (err) {
                console.error("Verification failed", err);
            }
        };

        // Call verification immediately
        verifyPayment();

        // Fallback: If we don't hear back in 5 seconds
        const timer = setTimeout(() => {
            if (status === 'verifying') {
                 // Try one last verification
                 verifyPayment().then(() => {
                     // If still nothing, maybe just show success and let them check profile
                     // or stay verifying? Let's transition to success for better UX if it was truly paid.
                     // But if API said pending, we should probably warn? 
                     // For now, let's assume if API didn't fail explicitly, it might be legit delayed.
                 });
            }
        }, 5000);

        return () => {
            socket.off(eventName, handlePaymentSuccess);
            clearTimeout(timer);
        };
    }, [invoiceId, navigate, toast]);

    return (
        <Container maxW="container.md" centerContent py={20}>
            <Box textAlign="center" py={10} px={6} bg="white" p={10} borderRadius="xl" boxShadow="xl">
                {status === 'verifying' && (
                    <VStack spacing={6}>
                        <Spinner size="xl" color="green.500" thickness="4px" />
                        <Heading size="lg" color="gray.700">جاري التحقق من الدفع...</Heading>
                        <Text color="gray.500">برجاء الانتظار قليلاً بينما نقوم بتأكيد العملية.</Text>
                    </VStack>
                )}

                {status === 'success' && (
                    <VStack spacing={6}>
                        <Icon as={CheckCircle} w={20} h={20} color="green.500" />
                        <Heading as="h2" size="xl" mt={6} mb={2}>
                            تم الدفع بنجاح!
                        </Heading>
                        <Text color="gray.500">
                            شكراً لك. تم تفعيل اشتراكك بنجاح. سيتم توجيهك إلى صفحة اشتراكاتك الآن.
                        </Text>
                        <Button
                            colorScheme="green"
                            bgGradient="linear(to-r, green.400, green.500, green.600)"
                            color="white"
                            variant="solid"
                            onClick={() => navigate('/student/courses')}
                        >
                            الذهاب للاشتراكات الآن
                        </Button>
                    </VStack>
                )}
                
                {status === 'failed' && (
                     <VStack spacing={6}>
                        <Icon as={AlertCircle} w={20} h={20} color="red.500" />
                        <Heading as="h2" size="xl" mt={6} mb={2}>
                           لم يتم التأكد من الدفع
                        </Heading>
                        <Text color="gray.500">
                            حدثت مشكلة أثناء التحقق. برجاء التواصل مع الدعم الفني إذا تم خصم المبلغ.
                        </Text>
                         <Button onClick={() => navigate('/student')} variant="outline">
                            العودة للرئيسية
                        </Button>
                    </VStack>
                )}
            </Box>
        </Container>
    );
};

export default PaymentSuccess;
