import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useStudentHomework } from '@/features/student/hooks/useStudentHomework';
import { HomeworkList } from '@/features/student/components/HomeworkList';

const StudentHomework = () => {
    const { data: homeworkData, isLoading } = useStudentHomework();

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>الواجبات</Heading>
                    <Text color="gray.600">تابع واجباتك المدرسية وقم بتسليمها في الموعد المحدد</Text>
                </Box>

                <HomeworkList homeworkList={homeworkData?.homework || []} isLoading={isLoading} />
            </VStack>
        </Container>
    );
};

export default StudentHomework;
