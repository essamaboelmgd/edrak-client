import { IStudentCourse } from '@/features/student/types';
import { Card, CardBody, Image, Stack, Heading, Text, Badge, Button, Flex, Icon, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';
import { getImageUrl } from '@/lib/axios';

interface CourseCardProps {
    course: IStudentCourse;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    const navigate = useNavigate();

    return (
        <Card maxW='sm' boxShadow="md" borderRadius="lg" overflow="hidden" _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', transition: 'all 0.2s' }}>
            <Box position="relative">
                <Image
                    src={
                        typeof course.poster === 'string' 
                            ? getImageUrl(course.poster) 
                            : (course.poster?.url || 'https://via.placeholder.com/400x200?text=No+Image')
                    }
                    alt={course.title}
                    objectFit="cover"
                    h="200px"
                    w="100%"
                    fallbackSrc="https://via.placeholder.com/400x200?text=Loading"
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
                        <Text>{course.teacher?.fullName}</Text>
                    </Flex>

                    <Box mt={2}>
                        {!course.isSubscribed ? (
                            <Button 
                                w="full"
                                variant='solid' 
                                bgGradient="linear(to-r, blue.500, purple.600)"
                                _hover={{ bgGradient: "linear(to-r, blue.600, purple.700)" }}
                                color="white"
                                onClick={() => navigate(`/student/courses/${course._id}`)}
                                size="md"
                                rightIcon={<Icon as={BookOpen} size={18} />}
                                boxShadow="md"
                            >
                                اشترك الآن
                            </Button>
                        ) : (
                            <Button 
                                w="full"
                                variant='outline' 
                                colorScheme='green'
                                borderWidth="2px"
                                onClick={() => navigate(`/student/courses/${course._id}`)}
                                size="md"
                                rightIcon={<Icon as={BookOpen} size={18} />}
                                _hover={{ bg: 'green.50' }}
                            >
                                دخول الكورس
                            </Button>
                        )}
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    );
};
