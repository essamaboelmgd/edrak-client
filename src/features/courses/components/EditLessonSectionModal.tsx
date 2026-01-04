import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  Box,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";

interface EditLessonSectionModalProps {
  section: any;
  callback: () => void;
  trigger: React.ReactElement;
}

interface SectionFormData {
  title: string;
  description: string;
  order: number;
  price: number;
}


export default function EditLessonSectionModal({ section, callback, trigger }: EditLessonSectionModalProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { courseId } = useParams();
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
      price: 0,
    },
  });

  useEffect(() => {
    if (isOpen && section) {
      reset({
        title: section.title || section.name || section.nameArabic || "",
        description: section.description || "",
        order: section.order || 0,
        price: section.price || 0,
      });
    } else if (isOpen) {
      reset({
        title: "",
        description: "",
        order: 0,
        price: 0,
      });
    }
  }, [isOpen, section, reset]);

  const onSubmit = async (values: SectionFormData) => {
    try {
      const payload: any = {
        title: values.title,
        description: values.description,
        order: values.order,
        price: values.price,
      };

      if (section?._id) {
        await axiosInstance.put(`/courses/lesson-sections/${section._id}`, payload);
        toast({
          status: "success",
          description: "تم تحديث القسم بنجاح",
        });
      } else {
        if (courseId) payload.course = courseId;
        await axiosInstance.post("/courses/lesson-sections", payload);
        toast({
          status: "success",
          description: "تم إضافة القسم بنجاح",
        });
      }
      reset();
      onClose();
      callback();
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ",
      });
    }
  };

  return (
    <>
      <Box onClick={onOpen} as="span">
        {trigger}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{section?._id ? "تعديل القسم" : "إضافة قسم"}</ModalHeader>
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
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>السعر</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register("price", { valueAsNumber: true, min: 0 })}
                  />
                  <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  {section?._id ? "حفظ" : "إضافة"}
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

