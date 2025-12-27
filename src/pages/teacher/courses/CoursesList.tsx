import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import courseService from "@/features/courses/courseService";

export default function CoursesList() {
  const { sectionId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['courses', sectionId],
    queryFn: () => courseService.getMyCourses({ limit: 100 }),
  });

  const courses = data?.courses || [];

  return (
    <Stack spacing={6}>
        <HStack justifyContent="space-between">
          <Box>
            <Heading size="lg" mb={2}>
              الكورسات
            </Heading>
            <Text color="gray.600">
              إدارة الكورسات الخاصة بك
            </Text>
          </Box>
          <Button
            colorScheme="blue"
            rightIcon={<Icon icon="solar:add-circle-bold" width="20" height="20" />}
          >
            إضافة كورس جديد
          </Button>
        </HStack>

        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {courses.map((course: any) => (
            <Card
              key={course._id}
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stack spacing={4}>
                  <Box position="relative">
                    <Image
                      src={course.thumbnail || "https://via.placeholder.com/400x200"}
                      alt={course.title}
                      borderRadius="lg"
                      objectFit="cover"
                      h="150px"
                      w="full"
                    />
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme={course.status === 'published' ? 'green' : 'gray'}
                    >
                      {course.status === 'published' ? 'منشور' : 'مسودة'}
                    </Badge>
                  </Box>
                  <Box>
                    <Heading size="md" mb={2} noOfLines={1}>
                      {course.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {course.description || "لا يوجد وصف"}
                    </Text>
                  </Box>
                  <HStack spacing={4} fontSize="sm" color="gray.500">
                    <HStack>
                      <Icon icon="solar:video-library-bold" width="16" height="16" />
                      <Text>{course.lessonsCount || 0} درس</Text>
                    </HStack>
                    <HStack>
                      <Icon icon="solar:users-group-rounded-bold" width="16" height="16" />
                      <Text>{course.studentsCount || 0} طالب</Text>
                    </HStack>
                  </HStack>
                  <HStack>
                    <Link to={`/teacher/courses/${course._id}/builder`} style={{ flex: 1 }}>
                      <Button size="sm" colorScheme="blue" w="full">
                        إدارة الكورس
                      </Button>
                    </Link>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon icon="solar:menu-dots-bold" width="20" height="20" />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem icon={<Icon icon="solar:pen-bold" width="16" height="16" />}>
                          تعديل
                        </MenuItem>
                        <MenuItem icon={<Icon icon="solar:eye-bold" width="16" height="16" />}>
                          معاينة
                        </MenuItem>
                        <MenuItem
                          icon={<Icon icon="solar:trash-bin-trash-bold" width="16" height="16" />}
                          color="red.500"
                        >
                          حذف
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {isLoading && (
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Stack spacing={4}>
                    <Box bg="gray.200" h="150px" borderRadius="lg" />
                    <Box bg="gray.200" h="20px" borderRadius="md" />
                    <Box bg="gray.200" h="40px" borderRadius="md" />
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}

        {!isLoading && courses.length === 0 && (
          <Card>
            <CardBody>
              <Stack spacing={4} align="center" py={12}>
                <Icon
                  icon="solar:book-bookmark-bold-duotone"
                  width="64"
                  height="64"
                  color="#CBD5E0"
                />
                <Text color="gray.500">لا توجد كورسات حتى الآن</Text>
                <Button colorScheme="blue">إضافة كورس جديد</Button>
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>
  );
}
