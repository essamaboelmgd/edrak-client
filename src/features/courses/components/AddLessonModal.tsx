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
  Switch,
  HStack,
  NumberInput,
  NumberInputField,
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
  price: number;
  discount: number;
  isFree: boolean;
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
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LessonFormData>({
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      lessonSection: "",
      videoProvider: "youtube",
      price: 0,
      discount: 0,
      isFree: false,
    },
  });

  useEffect(() => {
    if (isOpen && courseId) {
      fetchSections();
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedAttachments([]);
      setIsFree(false);
      setPrice(0);
      setDiscount(0);
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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      if (pdfFiles.length !== files.length) {
        toast({
          status: "warning",
          description: "تم تجاهل الملفات غير PDF",
        });
      }
      if (pdfFiles.length > 0) {
        setSelectedAttachments(prev => [...prev, ...pdfFiles]);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setSelectedAttachments(prev => prev.filter((_, i) => i !== index));
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
      if (courseId) formData.append("course", courseId);
      formData.append("price", price.toString());
      formData.append("discount", discount.toString());
      formData.append("isFree", isFree.toString());
      if (selectedImage) {
        formData.append("poster", selectedImage);
      }
      // Append attachment files
      selectedAttachments.forEach((file) => {
        formData.append("attachments", file);
      });
      
      const response = await axiosInstance.post(`/courses/${courseId}/lessons`, formData);
      toast({
        status: "success",
        description: response.data?.message || "تم إضافة الدرس بنجاح",
      });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedAttachments([]);
      setIsFree(false);
      setPrice(0);
      setDiscount(0);
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
                    <FormLabel>السعر</FormLabel>
                    <HStack spacing={4}>
                      <Box flex={1}>
                        <NumberInput
                          value={price}
                          onChange={(_, value) => {
                            setPrice(isNaN(value) ? 0 : value);
                            setValue('price', isNaN(value) ? 0 : value);
                          }}
                          min={0}
                        >
                          <NumberInputField placeholder="السعر بالجنيه" />
                        </NumberInput>
                      </Box>
                      <Box flex={1}>
                        <NumberInput
                          value={discount}
                          onChange={(_, value) => {
                            setDiscount(isNaN(value) ? 0 : Math.min(100, Math.max(0, value)));
                            setValue('discount', isNaN(value) ? 0 : Math.min(100, Math.max(0, value)));
                          }}
                          min={0}
                          max={100}
                        >
                          <NumberInputField placeholder="الخصم %" />
                        </NumberInput>
                      </Box>
                    </HStack>
                    {price > 0 && discount > 0 && (
                      <Text fontSize="sm" color="green.600" mt={2}>
                        السعر النهائي: {(price - (price * discount / 100)).toFixed(2)} ج.م
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <FormLabel mb={0}>درس مجاني</FormLabel>
                      <Switch
                        isChecked={isFree}
                        onChange={(e) => {
                          setIsFree(e.target.checked);
                          setValue('isFree', e.target.checked);
                          if (e.target.checked) {
                            setPrice(0);
                            setDiscount(0);
                            setValue('price', 0);
                            setValue('discount', 0);
                          }
                        }}
                        colorScheme="green"
                      />
                    </HStack>
                    {isFree && (
                      <Text fontSize="sm" color="blue.600" mt={1}>
                        عند تفعيل الدرس المجاني، سيتم تعيين السعر إلى 0
                      </Text>
                    )}
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

                  <FormControl>
                    <FormLabel>مرفقات PDF (اختياري)</FormLabel>
                    <Input
                      ref={attachmentInputRef}
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={handleAttachmentChange}
                      display="none"
                    />
                    <Stack spacing={2}>
                      <Button
                        size="sm"
                        onClick={() => attachmentInputRef.current?.click()}
                        type="button"
                        leftIcon={<Icon icon="solar:document-add-bold-duotone" width="16" height="16" />}
                      >
                        إضافة ملف PDF
                      </Button>
                      {selectedAttachments.length > 0 && (
                        <Stack spacing={2}>
                          {selectedAttachments.map((file, index) => (
                            <HStack
                              key={index}
                              p={2}
                              bg="gray.50"
                              borderRadius="md"
                              justify="space-between"
                            >
                              <HStack spacing={2}>
                                <Icon icon="solar:document-bold-duotone" width="20" height="20" color="red.500" />
                                <Text fontSize="sm" noOfLines={1} maxW="200px">
                                  {file.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </Text>
                              </HStack>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeAttachment(index)}
                                type="button"
                              >
                                إزالة
                              </Button>
                            </HStack>
                          ))}
                        </Stack>
                      )}
                    </Stack>
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
