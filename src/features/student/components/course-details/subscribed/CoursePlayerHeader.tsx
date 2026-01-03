import {
    Card,
    CardBody,
    Grid,
    GridItem,
    Heading,
    HStack,
    Image,
    Stack,
    Text,
    Badge,
    Box, 
    Icon
} from "@chakra-ui/react";
import { Video, FileText, BookOpen, Book } from "lucide-react";
import { IStudentCourse } from "@/features/student/types";
import { getImageUrl } from "@/lib/axios";
import DisplayPrice from "../../DisplayPrice";

interface CoursePlayerHeaderProps {
    course: IStudentCourse;
    homeworksCount?: number;
}

export default function CoursePlayerHeader({ course, homeworksCount = 0 }: CoursePlayerHeaderProps) {
    return (
        <Card
            border="none"
            boxShadow="xl"
            overflow="hidden"
            position="relative"
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="2xl"
        >
            {/* Decorative element */}
            <Box
                position="absolute"
                top="-20%"
                right="-10%"
                opacity={0.1}
                pointerEvents="none"
                color="white"
            >
                <Icon as={Book} boxSize="300px" />
            </Box>

            <CardBody p={{ base: 6, md: 8 }} position="relative" zIndex={1}>
                <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={6} alignItems="start">
                    <GridItem>
                        <Box
                            position="relative"
                            borderRadius="2xl"
                            overflow="hidden"
                            boxShadow="2xl"
                            border="3px solid"
                            borderColor="whiteAlpha.300"
                            transition="transform 0.3s"
                            _hover={{ transform: "scale(1.05)" }}
                            maxW="200px"
                        >
                            <Image
                                src={typeof course.poster === 'string' ? getImageUrl(course.poster) : getImageUrl(course.poster?.url)}
                                alt={course.title}
                                width="200px"
                                height="150px"
                                objectFit="cover"
                                fallbackSrc="https://via.placeholder.com/200x150?text=Course"
                            />
                        </Box>
                    </GridItem>
                    <GridItem>
                        <Stack spacing={4}>
                            <Heading size="lg" color="white" fontWeight="bold">
                                {course.title}
                            </Heading>
                            <Text color="whiteAlpha.900" fontWeight="500">
                                {course.description}
                            </Text>
                            <HStack spacing={3} flexWrap="wrap">
                                <Badge
                                    bg="whiteAlpha.300"
                                    color="white"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    fontSize="xs"
                                    fontWeight="bold"
                                    backdropFilter="blur(10px)"
                                    border="1px solid"
                                    borderColor="whiteAlpha.400"
                                >
                                    {course.educationalLevel?.name || "عام"}
                                </Badge>
                                
                                {course.isFree ? (
                                    <Badge
                                        bgGradient="linear(to-r, green.400, teal.500)"
                                        color="white"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="bold"
                                        boxShadow="0 2px 8px rgba(72, 187, 120, 0.3)"
                                    >
                                        مجاني
                                    </Badge>
                                ) : (
                                    <Badge
                                        bg="whiteAlpha.300"
                                        color="white"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="bold"
                                        backdropFilter="blur(10px)"
                                    >
                                        <DisplayPrice price={course.finalPrice} originPrice={course.price} color="white" />
                                    </Badge>
                                )}
                            </HStack>
                            <HStack spacing={5} fontSize="sm" color="whiteAlpha.900" fontWeight="600" flexWrap="wrap">
                                <HStack spacing={1.5}>
                                    <Icon as={Video} boxSize={5} />
                                    <Text>{course.stats?.totalLessons || 0} درس</Text>
                                </HStack>
                                <HStack spacing={1.5}>
                                    <Icon as={FileText} boxSize={5} />
                                    <Text>{course.stats?.totalExams || 0} امتحان</Text>
                                </HStack>
                                {/* Homeworks count logic if available in stats or prop */}
                                <HStack spacing={1.5}>
                                    <Icon as={BookOpen} boxSize={5} />
                                    <Text>{homeworksCount} واجب</Text> 
                                </HStack>
                            </HStack>
                        </Stack>
                    </GridItem>
                </Grid>
            </CardBody>
        </Card>
    );
}
