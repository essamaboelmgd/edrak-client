import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Image,
  Progress,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IStudentCourse } from "../types";
import { getImageUrl } from "@/lib/axios";

interface CourseCardProps {
  c: IStudentCourse;
}

export default function CourseCard({ c }: CourseCardProps) {
  const isEnrolled = c.isSubscribed;
  
  const detailLink = `/student/courses/${c._id}`;

  return (
    <Card
      direction="column"
      overflow="hidden"
      variant="outline"
      borderColor="gray.200"
      _hover={{ transform: "translateY(-4px)", shadow: "lg", borderColor: "blue.200" }}
      transition="all 0.3s ease"
      bg="white"
      borderRadius="2xl"
      h="100%"
      role="group"
    >
      <Box position="relative" overflow="hidden">
        <Image
          objectFit="cover"
          w="100%"
          h="180px"
          src={getImageUrl(c.poster as string)}
          alt={c.title}
          fallbackSrc="https://via.placeholder.com/400x200"
          transition="transform 0.4s ease"
          _groupHover={{ transform: "scale(1.05)" }}
        />
        {isEnrolled && (
            <Badge
                colorScheme="green"
                position="absolute"
                top={3}
                right={3}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                boxShadow="md"
            >
                مشترك
            </Badge>
        )}
      </Box>

      <Stack spacing={4} p={5} flex={1}>
        <Stack spacing={2}>
            <Link to={detailLink}>
                <Heading 
                    size="md" 
                    noOfLines={2} 
                    lineHeight="1.4"
                    _hover={{ color: "blue.600" }}
                    transition="color 0.2s"
                >
                    {c.title}
                </Heading>
            </Link>
            
            {/* Teacher Info */}
             {c.teacher && (
            <HStack spacing={3} pt={1}>
              <Avatar
                size="sm"
                name={c.teacher.fullName}
                src={c.teacher.image ? getImageUrl(c.teacher.image) : undefined}
                border="2px solid white"
                boxShadow="sm"
              />
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                {c.teacher.fullName}
              </Text>
            </HStack>
          )}
        </Stack>

        <Spacer />
        
        {/* Price / Progress */}
        <Box pt={2} borderTop="1px dashed" borderColor="gray.100">
            {isEnrolled ? (
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">التقدم في الدورة</Text>
                        <Text fontSize="xs" fontWeight="bold" color="green.600">{c.progress || 0}%</Text>
                    </HStack>
                    <Progress value={c.progress || 0} size="xs" colorScheme="green" borderRadius="full" />
                </Box>
            ) : (
                <HStack justify="space-between" align="center">
                     {c.discount && c.discount > 0 ? (
                        <HStack spacing={2}>
                            <Text color="green.600" fontSize="lg" fontWeight="bold">{c.finalPrice} ج.م</Text>
                            <Text color="gray.400" fontSize="sm" textDecoration="line-through">{c.price} ج.م</Text>
                        </HStack>
                    ) : (
                        <Text color="green.600" fontSize="lg" fontWeight="bold">
                            {c.price > 0 ? `${c.price} ج.م` : "مجاني"}
                        </Text>
                    )}
                </HStack>
            )}
        </Box>

        <Button
            as={Link}
            to={detailLink}
            variant={isEnrolled ? "outline" : "solid"}
            colorScheme={isEnrolled ? "green" : "blue"}
            size="md"
            w="full"
            borderRadius="xl"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md"
            }}
        >
            {isEnrolled ? "دخول الكورس" : "اشترك الآن"}
        </Button>
      </Stack>
    </Card>
  );
}
