import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { axiosInstance, getImageUrl } from "@/lib/axios";
import { Icon } from "@iconify-icon/react";
import EditLessonSectionModal from "./EditLessonSectionModal";

interface Section {
  _id: string;
  title: string;
  description?: string;
  course: string;
  order?: number;
}

interface CourseSectionsManagerProps {
  onMoved?: () => void;
}

interface SectionFormData {
  title: string;
  description: string;
  order: number;
}

export default function CourseSectionsManager({ onMoved }: CourseSectionsManagerProps) {
  const { courseId } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Section | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SectionFormData>({
    defaultValues: {
      title: "",
      description: "",
      order: 0,
    },
  });

  useEffect(() => {
    if (courseId) {
      fetchSections();
    }
  }, [courseId]);

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title || "",
        description: editing.description || "",
        order: editing.order || 0,
      });
    } else {
      reset({
        title: "",
        description: "",
        order: 0,
      });
    }
  }, [editing, reset]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/courses/${courseId}/lesson-sections`);
      const data = response.data?.data?.sections || response.data?.data || [];
      setSections(data);
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "فشل في جلب الأقسام",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SectionFormData) => {
    try {
      const payload = {
        ...values,
        course: courseId,
      };

      if (editing) {
        await axiosInstance.put(`/courses/lesson-sections/${editing._id}`, payload);
        toast({
          status: "success",
          description: "تم تحديث القسم بنجاح",
        });
      } else {
        await axiosInstance.post("/courses/lesson-sections", payload);
        toast({
          status: "success",
          description: "تم إضافة القسم بنجاح",
        });
      }

      onClose();
      setEditing(null);
      reset();
      fetchSections();
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;

    try {
      await axiosInstance.delete(`/courses/lesson-sections/${id}`);
      toast({
        status: "success",
        description: "تم الحذف بنجاح",
      });
      fetchSections();
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ أثناء الحذف",
      });
    }
  };

  return (
    <Card p={4}>
      <Stack spacing={4}>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold" fontSize="lg">
            أقسام الكورسات
          </Text>
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => {
              setEditing(null);
              onOpen();
            }}
          >
            إضافة قسم
          </Button>
        </HStack>

        {loading ? (
          <Text>جاري التحميل...</Text>
        ) : (
          <Stack
            spacing={3}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
              gap: "12px",
            }}
          >
            {sections.map((s: Section) => (
              <Card
                key={s._id}
                _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.15s ease"
                minH="14rem"
                display="flex"
                h="100%"
                flexDirection="column"
                justifyContent="space-between"
              >
                <CardHeader pb={0} flexShrink={0}>
                  <Stack spacing={3}>
                    {s.image && (
                      <Image
                        src={getImageUrl(s.image)}
                        alt={s.name}
                        rounded={6}
                        height={40}
                        width="100%"
                        objectFit="cover"
                      />
                    )}
                    <HStack alignItems="center" spacing={3} mb={4}>
                      <Text fontWeight="semibold">{s.title}</Text>
                      <Badge ml="auto" colorScheme="purple">
                        قسم
                      </Badge>
                    </HStack>
                    {s.description && (
                      <Text color="gray.600" fontSize="sm" noOfLines={2}>
                        {s.description}
                      </Text>
                    )}
                  </Stack>
                </CardHeader>
                <CardBody pt={3} mt="auto" pb={4}>
                  <HStack w="100%">
                    <EditLessonSectionModal
                      section={s}
                      callback={fetchSections}
                      trigger={
                        <Button size="sm">
                          تعديل
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(s._id)}
                    >
                      حذف
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </Stack>
        )}

        {!loading && sections.length === 0 && (
          <Text textAlign="center" color="gray.500" py={8}>
            لا توجد أقسام حتى الآن
          </Text>
        )}
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "تعديل القسم" : "إضافة قسم"}</ModalHeader>
          <ModalCloseButton left="auto" right={2} />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>
                    العنوان
                    <Text color="red" display="inline"> *</Text>
                  </FormLabel>
                  <Input
                    {...register("title", { required: "العنوان مطلوب" })}
                  />
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>الوصف</FormLabel>
                  <Input
                    {...register("description")}
                  />
                </FormControl>
                <FormControl isInvalid={!!errors.order}>
                  <FormLabel>الترتيب</FormLabel>
                  <Input
                    type="number"
                    {...register("order", { valueAsNumber: true, min: 0 })}
                  />
                  <FormErrorMessage>{errors.order?.message}</FormErrorMessage>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  {editing ? "حفظ" : "إضافة"}
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}
