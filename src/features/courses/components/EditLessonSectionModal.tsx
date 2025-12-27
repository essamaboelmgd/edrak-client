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
  Image,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { axiosInstance, getImageUrl } from "@/lib/axios";

interface EditLessonSectionModalProps {
  section: any;
  callback: () => void;
  trigger: React.ReactElement;
}

interface SectionFormData {
  title: string;
  description: string;
  order: number;
}

export default function EditLessonSectionModal({ section, callback, trigger }: EditLessonSectionModalProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { courseId } = useParams();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen && section) {
      reset({
        title: section.title || section.name || section.nameArabic || "",
        description: section.description || "",
        order: section.order || 0,
      });
      if (section.poster) {
        setImagePreview(getImageUrl(section.poster));
      }
      setSelectedImage(null);
    } else if (isOpen) {
      reset({
        title: "",
        description: "",
        order: 0,
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [isOpen, section, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          status: "error",
          description: "الرجاء اختيار ملف صورة",
        });
      }
    }
  };

  const onSubmit = async (values: SectionFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.description) formData.append("description", values.description);
      formData.append("order", values.order.toString());
      if (courseId) formData.append("course", courseId);
      if (selectedImage) {
        formData.append("poster", selectedImage);
      }

      if (section?._id) {
        await axiosInstance.put(`/courses/lesson-sections/${section._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          status: "success",
          description: "تم تحديث القسم بنجاح",
        });
      } else {
        await axiosInstance.post("/courses/lesson-sections", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          status: "success",
          description: "تم إضافة القسم بنجاح",
        });
      }
      reset();
      setSelectedImage(null);
      setImagePreview(null);
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
                <FormControl>
                  <FormLabel>صورة القسم (اختياري)</FormLabel>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none"
                  />
                  <Stack direction="row" spacing={2} align="center">
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      {selectedImage || imagePreview ? "تغيير الصورة" : "اختر صورة"}
                    </Button>
                    {(selectedImage || imagePreview) && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        type="button"
                      >
                        إزالة
                      </Button>
                    )}
                  </Stack>
                  {imagePreview && (
                    <Box mt={2}>
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        maxH="200px"
                        borderRadius="md"
                      />
                    </Box>
                  )}
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

