import { SimpleGrid, Box, Text } from '@chakra-ui/react';
import { IStudentCourse } from '@/features/student/types';
import { CourseCard } from './CourseCard';

interface CourseListProps {
    courses: IStudentCourse[];
    isLoading?: boolean;
}

export const CourseList = ({ courses, isLoading }: CourseListProps) => {
    if (isLoading) {
        return (
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                {[1, 2, 3].map((i) => (
                    <Box key={i} h="400px" bg="gray.100" borderRadius="lg" />
                ))}
            </SimpleGrid>
        );
    }

    if (!courses?.length) {
        return (
            <Box textAlign="center" py={10}>
                <Text fontSize="lg" color="gray.500">لا توجد كورسات متاحة حاليا</Text>
            </Box>
        );
    }

    return (
        <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
            {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
            ))}
        </SimpleGrid>
    );
};
