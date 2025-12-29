import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useStudentExams } from '@/features/student/hooks/useStudentExams';
import { ExamList } from '@/features/student/components/ExamList';

const StudentExams = () => {
    const { data: exams, isLoading } = useStudentExams();

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>الاختبارات</Heading>
                    <Text color="gray.600">استعرض جميع الاختبارات المتاحة لك وتتبع تقدمك</Text>
                </Box>

                <ExamList exams={exams?.exams || []} isLoading={isLoading} />
            </VStack>
        </Container>
    );
};

export default StudentExams;
