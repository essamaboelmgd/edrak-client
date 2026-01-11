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
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { AxiosError } from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import React from 'react';
import { axiosInstance } from '@/lib/axios';
import { courseService } from '@/features/teacher/services/courseService';
import { ILessonAdmin } from '@/features/admin/services/lessonsService';

interface LessonFormModalProps {
  callback: () => void;
  trigger?: React.ReactElement;
  lessonToEdit?: ILessonAdmin; // If provided, mode is 'edit'
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
  course: string;
  price: number;
  discount: number;
  isFree: boolean;
}

export default function LessonFormModal({ callback, trigger, lessonToEdit }: LessonFormModalProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
  // Use a ref to track if we've initialized the edit form to prevent overwrite by course fetch
  const initializedEditRef = useRef(false);

  // States for controlled inputs that need custom logic (price, discount, isFree)
  // We sync these with react-hook-form via setValue
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [isFree, setIsFree] = useState<boolean>(false);

  const isEditMode = !!lessonToEdit;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LessonFormData>({
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      lessonSection: '',
      videoProvider: 'youtube',
      course: '',
      price: 0,
      discount: 0,
      isFree: false,
    },
  });

  const watchedCourse = watch('course');

  // Open modal if trigger is clicked (handled by parent passing trigger with onClick or internal logic)
  // Logic: if trigger is provided, we wrap it. If not, we render a button.
  // But wait, if lessonToEdit is provided, often it's opened from parent state. 
  // Let's assume standard behavior: internal useDisclosure, but also respect external control if needed?
  // For simplicity, we stick to internal control triggered by props.
  // Actually, for "Edit", the parent usually controls "isOpen" or passes "lessonToEdit" which implies open?
  // Standard pattern: Trigger opens it.
  
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && lessonToEdit && !initializedEditRef.current) {
        // Initialize for Edit
        setValue('title', lessonToEdit.title);
        setValue('description', lessonToEdit.description || '');
        setValue('videoUrl', lessonToEdit.videoUrl || '');
        setValue('videoProvider', lessonToEdit.videoProvider || 'youtube');
        setValue('course', lessonToEdit.course?._id || '');
        
        if (lessonToEdit.lessonSection) {
            // @ts-ignore - lessonSection might be populated
           setValue('lessonSection', typeof lessonToEdit.lessonSection === 'object' ? lessonToEdit.lessonSection._id : lessonToEdit.lessonSection);
        }
    
        setPrice(lessonToEdit.price || 0);
        setValue('price', lessonToEdit.price || 0);
        
        setDiscount(lessonToEdit.discount || 0);
        setValue('discount', lessonToEdit.discount || 0);
        
        setIsFree(lessonToEdit.isFree || false);
        setValue('isFree', lessonToEdit.isFree || false);

        if (lessonToEdit.poster || lessonToEdit.thumbnail) {
             // We don't have the File object, but we show preview from URL
             // We need a helper to get URL
             // Assuming getImageUrl is available globally or we import it? 
             // Importing it would be better. For now let's just use the string if it's full URL or path
             // But imagePreview expects string from FileReader usually. We can pass URL.
        }

        // We need to fetch courses first to populate select, then select the right one.
        // Also fetch sections for that course.
        fetchCourses().then(() => {
            if (lessonToEdit.course?._id) {
                 fetchSectionsForCourse(lessonToEdit.course._id);
            }
        });

        initializedEditRef.current = true;
      } else if (!isEditMode) {
        // Initialize for Create
        resetForCreate();
        fetchCourses();
      }
    } else {
        initializedEditRef.current = false;
    }
  }, [isOpen, isEditMode, lessonToEdit, setValue]);

  const resetForCreate = () => {
    reset();
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedAttachments([]);
    setSections([]);
    setIsFree(false);
    setPrice(0);
    setDiscount(0);
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getMyCourses({ limit: 1000 });
      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast({
        status: 'error',
        description: 'فشل في جلب الكورسات',
      });
    }
  };

  const fetchSectionsForCourse = async (courseId: string) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/lesson-sections`);
      const data = response.data?.data?.sections || response.data?.data || [];
      setSections(data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      setSections([]);
    }
  };

  useEffect(() => {
    if (watchedCourse && isOpen) {
       // Only fetch sections if course changed and we are not in initial edit load (handled manually)
       // Or simply always fetch.
       fetchSectionsForCourse(watchedCourse);
    }
  }, [watchedCourse, isOpen]);


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
          status: 'error',
          description: 'الرجاء اختيار ملف صورة',
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
            status: 'warning',
            description: 'تم تجاهل الملفات غير PDF',
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

  const onSubmit = async (values: LessonFormData) => {
    if (!values.course) {
      toast({
        status: 'error',
        description: 'الرجاء اختيار الكورس',
      });
      return;
    }

    try {
      setDisabled(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('videoUrl', values.videoUrl || '');
      formData.append('videoProvider', values.videoProvider || 'youtube');
      if (values.lessonSection) formData.append('lessonSection', values.lessonSection);
      
      // Course is usually fixed in edit, but if not, we send it.
      formData.append('course', values.course);
      
      formData.append('price', price.toString());
      formData.append('discount', discount.toString());
      formData.append('isFree', isFree.toString());
      
      if (selectedImage) {
        formData.append('poster', selectedImage);
      }
      // Append attachment files
      selectedAttachments.forEach((file) => {
        formData.append('attachments', file);
      });

      let response;
      if (isEditMode && lessonToEdit) {
           // EDIT
             // We need to use update endpoint. Usually PUT /lessons/:id or PATCH
             // The service has updateLesson ? No we might need to use generic axios or add to service
             // The lessonsService has updateLessonStatus, let's check generic update
             // Assuming PUT /lessons/:id works based on admin pattern (though not explicitly in service file viewed)
             // Let's add updateLesson to lessonsService or use axios directly if service missing
           response = await axiosInstance.put(`/lessons/${lessonToEdit._id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
           });
      } else {
           // CREATE
           response = await axiosInstance.post(`/courses/${values.course}/lessons`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
      }

      toast({
        status: 'success',
        description: response.data?.message || (isEditMode ? 'تم تعديل الدرس بنجاح' : 'تم إضافة الدرس بنجاح'),
      });
      
      if (!isEditMode) resetForCreate();
      onClose();
      callback();
    } catch (error) {
      let errorMessage: string | null = null;
      if (error instanceof AxiosError) {
        const { result, message } = error.response?.data || {};
        errorMessage = result || message || 'حدث خطأ أثناء حفظ الدرس';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'حدث خطأ غير متوقع';
      }

      toast({
        status: 'error',
        description: errorMessage,
      });
    } finally {
      setDisabled(false);
    }
  };

  return (
    <>
      {trigger ? (
        <Box onClick={onOpen} cursor="pointer">{trigger}</Box>
      ) : (
        <Button
          leftIcon={<Icon icon="solar:play-circle-bold-duotone" width="20" height="20" />}
          bg="white"
          color="teal.600"
          _hover={{ bg: 'whiteAlpha.900' }}
          onClick={onOpen}
        >
          {isEditMode ? 'تعديل الدرس' : 'إضافة درس جديد'}
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'تعديل الدرس' : 'إضافة درس جديد'}</ModalHeader>
          <ModalCloseButton left="auto" right={2} />

          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={6}>
                <Stack>
                  <FormControl isInvalid={!!errors.course}>
                    <FormLabel>
                      الكورس
                      <Text color="red" display="inline">*</Text>
                    </FormLabel>
                    <Select
                      placeholder="اختر الكورس"
                      {...register('course', { required: 'الكورس مطلوب' })}
                      isDisabled={isEditMode} // Usually better not to change course on edit to avoid complications
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.course?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.title}>
                    <FormLabel>
                      العنوان
                      <Text color="red" display="inline">*</Text>
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="عنوان الدرس"
                      {...register('title', { required: 'العنوان مطلوب' })}
                    />
                    <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>قسم الدروس</FormLabel>
                    <Select
                      placeholder={watchedCourse ? 'بدون قسم' : 'اختر الكورس أولاً'}
                      isDisabled={!watchedCourse}
                      {...register('lessonSection')}
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
                    <Select placeholder="-- اختر --" {...register('videoProvider')}>
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
                      placeholder="رابط الفيديو (اختياري)"
                      {...register('videoUrl')}
                    />
                    <FormErrorMessage>{errors.videoUrl?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.description}>
                    <FormLabel>
                      الوصف
                      <Text color="red" display="inline">*</Text>
                    </FormLabel>
                    <Textarea
                      placeholder="وصف الدرس"
                      {...register('description', { required: 'الوصف مطلوب' })}
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
                    {(Number(price) > 0) && (Number(discount) > 0) && (
                      <Text fontSize="sm" color="green.600" mt={2}>
                        السعر النهائي: {(Number(price) - (Number(price) * Number(discount) / 100)).toFixed(2)} ج.م
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
                  </FormControl>

                  <FormControl>
                    <FormLabel>صورة الدرس {isEditMode ? '(اتركها فارغة للإبقاء على الصورة الحالية)' : '(اختياري)'}</FormLabel>
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
                        {selectedImage ? 'تغيير الصورة' : 'اختر صورة'}
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
                              fileInputRef.current.value = '';
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
                    <FormLabel>مرفقات PDF {isEditMode ? '(تضاف للمرفقات الحالية)' : '(اختياري)'}</FormLabel>
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
                  leftIcon={
                    disabled ? (
                      <Icon icon="eos-icons:three-dots-loading" width="24" height="24" />
                    ) : (
                      <Icon icon="solar:check-circle-bold-duotone" width="20" height="20" />
                    )
                  }
                >
                  {isEditMode ? 'حفظ التعديلات' : 'إنشاء الدرس'}
                </Button>
              </Center>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
