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
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { axiosInstance, getImageUrl } from "@/lib/axios";
import { useToast } from "@chakra-ui/react";
import EditLessonModal from "./EditLessonModal";
import coursesService from "../coursesService";

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
              colorScheme={lesson.status === 'active' ? 'green' : 'gray'}
            >
              {lesson.status === 'active' ? 'منشور' : 'مسودة'}
            </Badge>
          </Box>
          <Box>
            <Heading size="md" mb={2} noOfLines={1}>
              {lesson.title}
            </Heading>
            {lesson.price > 0 && (
                <Text fontSize="sm" fontWeight="bold" color="green.600" mb={1}>
                    {lesson.price} ج.م
                </Text>
            )}
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
          <HStack justify="space-between">
            <HStack>
                <EditLessonModal
                lesson={lesson}
                callback={callback}
                trigger={
                    <Button size="sm" colorScheme="blue">
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
            
            <FormControl display='flex' alignItems='center' width="auto">
                <Switch 
                    id={`status-${lesson._id}`} 
                    isChecked={lesson.status === 'active'}
                    onChange={async (e) => {
                         try {
                            const newStatus = e.target.checked ? 'active' : 'draft';
                            await coursesService.updateLesson(lesson._id, { status: newStatus });
                            toast({ status: 'success', description: `تم تحويل الدرس إلى ${newStatus === 'active' ? 'منشور' : 'مسودة'}` });
                            callback();
                         } catch (err: any) {
                             toast({ status: 'error', description: err.response?.data?.message || 'برجاء المحاولة مرة أخرى' });
                         }
                    }}
                    colorScheme="green"
                />
                <FormLabel htmlFor={`status-${lesson._id}`} mb='0' mr={2} fontSize="xs" color="gray.500">
                    {lesson.status === 'active' ? 'تفعيل' : 'تعطيل'}
                </FormLabel>
            </FormControl>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

