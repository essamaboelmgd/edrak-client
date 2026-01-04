import { Card, CardBody, Grid, GridItem, Heading, HStack, Image, Stack, Text, Badge, Button, Box } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { ShoppingCart, Video, FileText } from "lucide-react"; // Using lucide-react as substitute for solar icons where appropriate or just standard icons
import { useNavigate } from "react-router-dom";
import { IStudentCourse } from "../../types";
import { getImageUrl } from "@/lib/axios";
import DisplayPrice from "../DisplayPrice";

interface CourseHeaderProps {
    course: IStudentCourse;
    isSubscribed?: boolean;
}

export default function CourseHeader({ course, isSubscribed = false }: CourseHeaderProps) {
    const navigate = useNavigate();

    return (
        <Card w="full" bgGradient="linear(to-br, white, blue.50)" borderWidth="1px" borderColor="blue.100" boxShadow="sm">
            <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={6} alignItems="start">
                    <GridItem>
                        <Box 
                            position="relative" 
                            borderRadius="lg" 
                            overflow="hidden" 
                            boxShadow="md"
                            width={{ base: "100%", md: "250px" }}
                            height={{ base: "200px", md: "160px" }}
                        >
                            <Image
                                src={typeof course.poster === 'string' ? getImageUrl(course.poster) : getImageUrl(course.poster?.url)}
                                alt={course.title}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                                fallbackSrc="https://via.placeholder.com/250x160?text=Course+Image"
                            />
                            {course.isFree && (
                                <Badge 
                                    position="absolute" 
                                    top={2} 
                                    right={2} 
                                    colorScheme="green" 
                                    variant="solid" 
                                    px={2} 
                                    py={1}
                                    borderRadius="md"
                                >
                                    مجاني
                                </Badge>
                            )}
                        </Box>
                    </GridItem>
                    <GridItem w="full">
                        <Stack spacing={4}>
                            <Box>
                                <HStack mb={2}>
                                    <Badge colorScheme="blue" variant="subtle" px={2} borderRadius="full">
                                        {course.educationalLevel?.name || "عام"}
                                    </Badge>
                                    <Badge colorScheme="purple" variant="subtle" px={2} borderRadius="full">
                                        {course.level || "غير محدد"}
                                    </Badge>
                                </HStack>
                                <Heading size="lg" color="gray.800" lineHeight="1.4">{course.title}</Heading>
                            </Box>
                            
                            <Text color="gray.600" fontSize="md" noOfLines={3}>{course.description}</Text>
                            
                            <Stack direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} spacing={4} mt={2}>
                                <HStack spacing={6} fontSize="sm" color="gray.500">
                                    <HStack>
                                        <Icon as={Video} boxSize={4} />
                                        <Text>{course.stats?.totalLessons || 0} درس</Text>
                                    </HStack>
                                    <HStack>
                                        <Icon as={FileText} boxSize={4} />
                                        <Text>{course.stats?.totalExams || 0} امتحان</Text>
                                    </HStack>
                                </HStack>

                                {!isSubscribed && !course.isFree && (
                                    <HStack spacing={4}>
                                         <DisplayPrice price={course.finalPrice} originPrice={course.price} fontSize="xl" />
                                        <Button
                                            colorScheme="blue"
                                            size="md"
                                            onClick={() => navigate(`/student/courses/${course._id}/subscribe`)}
                                            leftIcon={<Icon as={ShoppingCart} />}
                                            px={6}
                                        >
                                            اشترك الآن
                                        </Button>
                                    </HStack>
                                )}
                                {isSubscribed && (
                                    <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="sm">
                                        مشترك
                                    </Badge>
                                )}
                            </Stack>
                        </Stack>
                    </GridItem>
                </Grid>
            </CardBody>
        </Card>
    );
}
