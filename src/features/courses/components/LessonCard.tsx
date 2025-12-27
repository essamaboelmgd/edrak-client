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
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { axiosInstance, getImageUrl } from "@/lib/axios";
import { useToast } from "@chakra-ui/react";
import EditLessonModal from "./EditLessonModal";

interface LessonCardProps {
  lesson: any;
  callback: () => void;
}

export default function LessonCard({ lesson, callback }: LessonCardProps) {
  const toast = useToast();

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

    try {
      await axiosInstance.delete(`/lessons/${lesson._id}`);
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
              src={lesson.poster ? getImageUrl(lesson.poster) : (lesson.thumbnail ? getImageUrl(lesson.thumbnail) : "https://via.placeholder.com/400x200")}
              alt={lesson.title}
              borderRadius="lg"
              objectFit="cover"
              h="150px"
              w="full"
              fallbackSrc="https://via.placeholder.com/400x200"
            />
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme={lesson.status === 'published' ? 'green' : 'gray'}
            >
              {lesson.status === 'published' ? 'منشور' : 'مسودة'}
            </Badge>
          </Box>
          <Box>
            <Heading size="md" mb={2} noOfLines={1}>
              {lesson.title}
            </Heading>
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {lesson.description || "لا يوجد وصف"}
            </Text>
          </Box>
          {lesson.videoUrl && (
            <HStack spacing={2} fontSize="sm" color="gray.500">
              <Icon icon="solar:play-circle-bold" width="16" height="16" />
              <Text>فيديو متوفر</Text>
            </HStack>
          )}
          <HStack>
            <EditLessonModal
              lesson={lesson}
              callback={callback}
              trigger={
                <Button size="sm" colorScheme="blue" flex={1}>
                  تعديل
                </Button>
              }
            />
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<Icon icon="solar:menu-dots-bold" width="20" height="20" />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
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

