import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import AddCourseSectionModal from "@/features/courses/components/AddCourseSectionModal";

export default function CourseSections() {
  const queryClient = useQueryClient();


  const { data, isLoading } = useQuery({
    queryKey: ['courseSections'],
    queryFn: async () => {
      const response = await axiosInstance.get("/courses/sections");
      return response.data?.data?.sections || response.data?.data?.courseSections || response.data?.data || [];
    },
  });

  const sections = data || [];

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['courseSections'] });
  };

  return (
    <Stack spacing={6} p={4}>
      <HStack justifyContent="space-between">
        <Box>
          <Heading size="lg" mb={2}>
            أقسام الكورسات
          </Heading>
          <Text color="gray.600">
            إدارة أقسام الكورسات الخاصة بك
          </Text>
        </Box>
        <AddCourseSectionModal callback={handleRefetch} />
      </HStack>

      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={6}
      >
        {sections.map((section: any) => (
          <Link
            key={section._id}
            to={`/teacher/courses/sections/${section._id}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <CardBody>
                <Stack spacing={4}>
                  <Box
                    bg="blue.50"
                    p={4}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      icon="solar:book-bookmark-bold-duotone"
                      width="48"
                      height="48"
                      color="#3182CE"
                    />
                  </Box>
                  <Box>
                    <Heading size="md" mb={2}>
                      {section.title || section.name || section.nameArabic}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {section.description || "لا يوجد وصف"}
                    </Text>
                  </Box>
                  <HStack spacing={4} fontSize="sm" color="gray.500">
                    <HStack>
                      <Icon icon="solar:book-bold" width="16" height="16" />
                      <Text>{section.coursesCount || 0} كورس</Text>
                    </HStack>
                    <HStack>
                      <Icon icon="solar:users-group-rounded-bold" width="16" height="16" />
                      <Text>{section.studentsCount || 0} طالب</Text>
                    </HStack>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          </Link>
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
                  <Box bg="gray.200" h="100px" borderRadius="lg" />
                  <Box bg="gray.200" h="20px" borderRadius="md" />
                  <Box bg="gray.200" h="40px" borderRadius="md" />
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}

      {!isLoading && sections.length === 0 && (
        <Card>
          <CardBody>
            <Stack spacing={4} align="center" py={12}>
              <Icon
                icon="solar:book-bookmark-bold-duotone"
                width="64"
                height="64"
                color="#CBD5E0"
              />
              <Text color="gray.500">لا توجد أقسام حتى الآن</Text>
              <Button colorScheme="blue">إضافة قسم جديد</Button>
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
