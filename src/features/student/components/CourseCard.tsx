import { IStudentCourse } from '@/features/student/types';
import { Card, CardBody, Image, Stack, Heading, Text, Badge, Button, Flex, Icon, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';

interface CourseCardProps {
    course: IStudentCourse;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    const navigate = useNavigate();

    return (
        <Card maxW='sm' boxShadow="md" borderRadius="lg" overflow="hidden" _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', transition: 'all 0.2s' }}>
            <Box position="relative">
                <Image
                    src={course.poster?.url || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={course.title}
                    objectFit="cover"
                    h="200px"
                    w="100%"
                />
                <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme={course.isSubscribed ? 'green' : 'blue'}
                    variant="solid"
                >
                    {course.isSubscribed ? 'مشترك' : 'جديد'}
                </Badge>
            </Box>
            
            <CardBody>
                <Stack spacing='3'>
                    <Flex justify="space-between" align="center">
                        <Badge colorScheme="purple">{course.subjects?.[0] || 'عام'}</Badge>
                        <Text fontSize="xs" color="gray.500">{course.educationalLevel?.name}</Text>
                    </Flex>
                    
                    <Heading size='md' noOfLines={2}>{course.title}</Heading>
                    
                    <Text noOfLines={2} fontSize="sm" color="gray.600">
                        {course.description}
                    </Text>

                    <Flex align="center" gap={2} fontSize="sm" color="gray.500">
                        <Icon as={User} />
                        <Text>{course.teacher?.firstName} {course.teacher?.lastName}</Text>
                    </Flex>

                    <Button 
                        variant='solid' 
                        colorScheme='blue' 
                        width="full"
                        rightIcon={<Icon as={BookOpen} />}
                        onClick={() => navigate(course.isSubscribed ? `/student/courses/${course._id}` : `/student/courses/${course._id}/enroll`)}
                    >
                        {course.isSubscribed ? 'ابدا التعلم' : 'عرض التفاصيل'}
                    </Button>
                </Stack>
            </CardBody>
        </Card>
    );
};
