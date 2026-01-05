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
  Select,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Box,
  Image,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { axiosInstance, getImageUrl } from "@/lib/axios";
import { coursesService } from "../services/coursesService";
import { teachersService } from "../services/teachersService";

interface CreateCourseSectionModalProps {
  callback: () => void;
  editing?: any;
}

interface SectionFormData {
  title: string;
  description: string;
  educationalLevel: string;
  teacher: string;
  order: number;
  status: string;
  price: number;
  discount: number;
}

interface EducationalLevel {
  _id: string;
  title?: string;
  name?: string;
  nameArabic?: string;
}

interface Teacher {
  _id: string;
  fullName: string;
}

export default function CreateCourseSectionModal({ callback, editing }: CreateCourseSectionModalProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [educationalLevels, setEducationalLevels] = useState<EducationalLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<SectionFormData>({
    defaultValues: {
      title: "",
      description: "",
      educationalLevel: "",
      teacher: "",
      order: 1,
      status: "active",
      price: 0,
      discount: 0,
    },
  });

  // Fetch educational levels and teachers
  useEffect(() => {
    if (isOpen) {
      fetchEducationalLevels();
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      const response = await teachersService.getAllTeachers({ limit: 1000 });
      if (response.success && response.data) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
    }
  };

  const fetchEducationalLevels = async () => {
    try {
      setLoadingLevels(true);
      const response = await axiosInstance.get("/educational-levels");
      const educationalLevelsData = response.data?.data?.educationalLevels;
      let levels: EducationalLevel[] = [];

      if (educationalLevelsData) {
        if (educationalLevelsData.primary) {
          levels = [...levels, ...educationalLevelsData.primary];
        }
        if (educationalLevelsData.preparatory) {
          levels = [...levels, ...educationalLevelsData.preparatory];
        }
        if (educationalLevelsData.secondary) {
          levels = [...levels, ...educationalLevelsData.secondary];
        }
      } else {
        levels = response.data?.data?.educationalLevels ||
          response.data?.data ||
          response.data?.educationalLevels ||
          response.data || [];
        levels = Array.isArray(levels) ? levels : [];
      }

      setEducationalLevels(levels);
    } catch (error) {
      console.error("Failed to fetch educational levels:", error);
      setEducationalLevels([]);
    } finally {
      setLoadingLevels(false);
    }
  };

  // Auto-open if editing
  useEffect(() => {
    if (editing && !isOpen) {
      onOpen();
    }
  }, [editing, isOpen, onOpen]);

  // Reset form when editing changes
  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title || editing.name || editing.nameArabic || "",
        description: editing.description || "",
        educationalLevel: editing.educationalLevel?._id || editing.educationalLevel || "",
        teacher: editing.teacher?._id || editing.teacher || "",
        order: editing.order || 1,
        status: editing.status || "active",
        price: editing.price || 0,
        discount: editing.discount || 0,
      });
      if (editing.poster) {
        setImagePreview(getImageUrl(editing.poster));
      }
    } else {
      reset({
        title: "",
        description: "",
        educationalLevel: "",
        teacher: "",
        order: 1,
        status: "active",
        price: 0,
        discount: 0,
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [editing, reset]);

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
      formData.append("educationalLevel", values.educationalLevel);
      formData.append("teacher", values.teacher);
      formData.append("order", values.order.toString());
      formData.append("price", values.price.toString());
      formData.append("discount", values.discount.toString());
      if (values.status) formData.append("status", values.status);
      if (selectedImage) {
        formData.append("poster", selectedImage);
      }

      if (editing) {
        await coursesService.updateCourseSection(editing._id, formData);
        toast({
          status: "success",
          description: "تم تحديث القسم بنجاح",
        });
      } else {
        await coursesService.createCourseSection(formData);
        toast({
          status: "success",
          description: "تم إضافة القسم بنجاح",
        });
      }
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
      setTimeout(() => {
        callback();
      }, 500);
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ",
      });
    }
  };

  return (
    <>
      <Button
        size="sm"
        colorScheme="teal"
        onClick={onOpen}
        rightIcon={<Icon icon="solar:add-circle-bold" width="20" height="20" />}
      >
        {editing ? "تعديل القسم" : "إضافة قسم جديد"}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "تعديل القسم" : "إضافة قسم جديد"}</ModalHeader>
          <ModalCloseButton left="auto" right={2} />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.teacher}>
                  <FormLabel>
                    المدرس
                    <Text color="red" display="inline">
                      *
                    </Text>
                  </FormLabel>
                  <Select
                    placeholder="-- اختر المدرس --"
                    {...register("teacher", { required: "المدرس مطلوب" })}
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.fullName}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.teacher?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>
                    العنوان
                    <Text color="red" display="inline">
                      *
                    </Text>
                  </FormLabel>
                  <Input
                    {...register("title", { required: "العنوان مطلوب" })}
                  />
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.educationalLevel}>
                  <FormLabel>
                    المرحلة الدراسية
                    <Text color="red" display="inline">
                      *
                    </Text>
                  </FormLabel>
                  <Select
                    placeholder="-- اختار --"
                    {...register("educationalLevel", { required: "المرحلة الدراسية مطلوبة" })}
                    isDisabled={loadingLevels}
                  >
                    {educationalLevels.map((level) => (
                      <option key={level._id} value={level._id}>
                        {level.name || level.nameArabic || level.title || level._id}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.educationalLevel?.message}</FormErrorMessage>
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
                <Stack direction="row" spacing={4}>
                  <FormControl isInvalid={!!errors.price}>
                    <FormLabel>السعر</FormLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register("price", { valueAsNumber: true, min: 0 })}
                    />
                    <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.discount}>
                    <FormLabel>الخصم %</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1"
                      max={100}
                      {...register("discount", { valueAsNumber: true, min: 0, max: 100 })}
                    />
                    <FormErrorMessage>{errors.discount?.message}</FormErrorMessage>
                  </FormControl>
                </Stack>
                {watch("price") > 0 && watch("discount") > 0 && (
                  <Text fontSize="sm" color="green.600">
                    السعر النهائي: {(watch("price") - (watch("price") * watch("discount") / 100)).toFixed(2)} ج.م
                  </Text>
                )}
                <FormControl isInvalid={!!errors.order}>
                  <FormLabel>الترتيب</FormLabel>
                  <Input
                    type="number"
                    placeholder="اتركه فارغاً للترتيب التلقائي"
                    {...register("order", { valueAsNumber: true, min: 1 })}
                  />
                  <FormErrorMessage>{errors.order?.message}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>الحالة</FormLabel>
                  <Select {...register("status")}>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </Select>
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
    </>
  );
}

