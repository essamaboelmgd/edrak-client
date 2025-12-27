import {
  Button,
  Center,
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
  Select,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  Box,
  Image,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { AxiosError } from "axios";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";

interface AddLessonModalProps {
  callback: () => void;
}

interface Section {
  _id: string;
  title?: string;
  name?: string;
  nameArabic?: string;
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  lessonSection: string;
  videoProvider: string;
}

export default function AddLessonModal({ callback }: AddLessonModalProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { courseId } = useParams();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LessonFormData>({
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      lessonSection: "",
      videoProvider: "youtube",
    },
  });

  useEffect(() => {
    if (isOpen && courseId) {
      fetchSections();
      reset();
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [isOpen, courseId, reset]);
  
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

  const fetchSections = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/lesson-sections`);
      const data = response.data?.data?.sections || response.data?.data || [];
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const onSubmit = async (values: LessonFormData) => {
    try {
      setDisabled(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("videoUrl", values.videoUrl || "");
      formData.append("videoProvider", values.videoProvider || "youtube");
      if (values.lessonSection) formData.append("lessonSection", values.lessonSection);
      if (selectedImage) {
        formData.append("poster", selectedImage);
      }
      
      const response = await axiosInstance.post(`/courses/${courseId}/lessons`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        status: "success",
        description: response.data?.message || "تم إضافة الدرس بنجاح",
      });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
      callback();
    } catch (error) {
      let errorMessage: string | null = null;
      if (error instanceof AxiosError) {
        const { result, message } = error.response?.data || {};
        errorMessage = result || message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = "حدث خطأ غير متوقع";
      }

      toast({
        status: "error",
        description: errorMessage,
      });
    } finally {
      setDisabled(false);
    }
  };

  return (
    <>
      <Button
        alignItems="center"
        size="sm"
        h={10}
        colorScheme="teal"
        rounded={6}
        onClick={onOpen}
        gap={1.5}
        px={5}
      >
        <Text>اضافة درس جديد</Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>اضافة درس جديد</ModalHeader>
          <ModalCloseButton left="auto" right={2} />

          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={6}>
                <Stack>
                  <FormControl isInvalid={!!errors.title}>
                    <FormLabel>
                      العنوان
                      <Text color="red" display="inline">
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="..."
                      {...register("title", { required: "العنوان مطلوب" })}
                    />
                    <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                  </FormControl>

                        <FormControl>
                          <FormLabel>قسم الدروس</FormLabel>
                          <Select
                            placeholder="بدون قسم"
                            {...register("lessonSection")}
                          >
                            {sections.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.title || s.name || s.nameArabic}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl isInvalid={!!errors.videoProvider}>
                          <FormLabel>نوع مزود الفيديو</FormLabel>
                          <Select
                            placeholder="-- اختار --"
                            {...register("videoProvider")}
                          >
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                            <option value="bunny">Bunny</option>
                            <option value="other">أخرى</option>
                          </Select>
                          <FormErrorMessage>{errors.videoProvider?.message}</FormErrorMessage>
                        </FormControl>

                  <FormControl isInvalid={!!errors.videoUrl}>
                    <FormLabel>رابط الفيديو</FormLabel>
                    <Input
                      type="url"
                      placeholder="..."
                      {...register("videoUrl")}
                    />
                    <FormErrorMessage>{errors.videoUrl?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.description}>
                    <FormLabel>الوصف</FormLabel>
                    <Textarea
                      placeholder="..."
                      {...register("description", { required: "الوصف مطلوب" })}
                    />
                    <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>صورة الدرس (اختياري)</FormLabel>
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
                        {selectedImage ? "تغيير الصورة" : "اختر صورة"}
                      </Button>
                      {selectedImage && (
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
                </Stack>
              </Stack>
              <Center p={6}>
                <Button
                  colorScheme="teal"
                  mr={3}
                  width={250}
                  maxW="100%"
                  m="auto"
                  size="lg"
                  fontSize="small"
                  type="submit"
                  isDisabled={disabled}
                >
                  {disabled && (
                    <Icon
                      icon="eos-icons:three-dots-loading"
                      width="24"
                      height="24"
                    />
                  )}
                  حفظ
                </Button>
              </Center>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
