import { Box, Button, Container, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <Container maxW="container.md" centerContent py={20}>
            <Box textAlign="center" py={10} px={6} bg="white" p={10} borderRadius="xl" boxShadow="xl">
                <VStack spacing={6}>
                    <Icon as={XCircle} w={20} h={20} color="red.500" />
                    <Heading as="h2" size="xl" mt={6} mb={2} color="red.600">
                        فشلت عملية الدفع
                    </Heading>
                    <Text color="gray.500">
                        للاسف لم تكتمل عملية الدفع. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع بديلة.
                    </Text>
                    <Button
                        colorScheme="red"
                        variant="solid"
                        onClick={() => navigate('/student/cart')}
                    >
                        العودة للسلة
                    </Button>
                     <Button
                        variant="ghost"
                        onClick={() => navigate('/student')}
                    >
                        العودة للرئيسية
                    </Button>
                </VStack>
            </Box>
        </Container>
    );
};

export default PaymentFailed;
