import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Stack,
  Text,
  Heading,
  Switch,


  useToast,

} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { Link } from "react-router-dom";
import { axiosInstance, getImageUrl } from "@/lib/axios";
import courseService from "@/features/teacher/services/courseService";

import EditCourseModal from "./EditCourseModal";

interface CourseCardProps {
  course: any;
  callback: () => void;
}

export default function CourseCard({ course, callback }: CourseCardProps) {
  const toast = useToast();

  const handleToggleStatus = async () => {
    const newStatus = course.status === 'active' ? 'draft' : 'active';
    try {
        await courseService.updateCourse(course._id, { status: newStatus });
        toast({
            title: 'تم تحديث الحالة',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        callback();
    } catch (error: any) {
        toast({
            title: 'خطأ في التحديث',
            description: error.response?.data?.message || 'حدث خطأ ما',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الكورس؟")) return;

    try {
      await axiosInstance.delete(`/courses/${course._id}`);
      toast({
        status: "success",
        description: "تم الحذف بنجاح",
      });
      callback();
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ أثناء الحذف",
      });
    }
  };

  return (
    <Card
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
              src={course.poster ? getImageUrl(course.poster) : (course.thumbnail ? getImageUrl(course.thumbnail) : "https://via.placeholder.com/400x200")}
              alt={course.title}
              borderRadius="lg"
              objectFit="cover"
              h="150px"
              w="full"
              fallbackSrc="https://via.placeholder.com/400x200"
            />
            <Box position="absolute" top={2} right={2} display="flex" alignItems="center" gap={2} bg="whiteAlpha.900" p={1} borderRadius="md" shadow="sm">
                <Switch 
                    size="sm" 
                    colorScheme="green" 
                    isChecked={course.status === 'active'}
                    onChange={handleToggleStatus}
                />
                <Badge
                  colorScheme={course.status === 'active' ? 'green' : 'orange'}
                  variant="subtle"
                  fontSize="xs"
                >
                  {course.status === 'active' ? 'نشط' : 'مسودة'}
                </Badge>
            </Box>
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
                <EditCourseModal
                  course={course}
                  callback={callback}
                  trigger={
                    <MenuItem icon={<Icon icon="solar:pen-bold" width="16" height="16" />}>
                      تعديل
                    </MenuItem>
                  }
                />
                <MenuItem icon={<Icon icon="solar:eye-bold" width="16" height="16" />}>
                  معاينة
                </MenuItem>
                <MenuItem
                  icon={<Icon icon="solar:trash-bin-trash-bold" width="16" height="16" />}
                  color="red.500"
                  onClick={handleDelete}
                >
                  حذف
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

