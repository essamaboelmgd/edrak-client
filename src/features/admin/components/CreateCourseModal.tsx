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
    Textarea,
    useToast,
    Box,
    Image,
    Switch,
    HStack,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { AxiosError } from "axios";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/lib/axios";
import { coursesService } from "../services/coursesService";
import { teachersService } from "../services/teachersService";

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface EducationalLevel {
    _id: string;
    title?: string;
    name?: string;
    nameArabic?: string;
}

interface CourseFormData {
    title: string;
    description: string;
    price: number;
    discount: number;
    isFree: boolean;
    educationalLevel: string;
    courseSection: string;
    teacher: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface CourseSection {
    _id: string;
    title?: string;
    name?: string;
    nameArabic?: string;
}

interface Teacher {
    _id: string;
    fullName: string;
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
    const toast = useToast();
    const [disabled, setDisabled] = useState<boolean>(false);
    const [educationalLevels, setEducationalLevels] = useState<EducationalLevel[]>([]);
    const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFree, setIsFree] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<CourseFormData>({
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            discount: 0,
            isFree: false,
            educationalLevel: "",
            courseSection: "",
            teacher: "",
            startDate: "",
            endDate: "",
            status: "draft",
        },
    });

    const watchedEducationalLevel = watch("educationalLevel");
    const watchedTeacher = watch("teacher");

    useEffect(() => {
        if (isOpen) {
            fetchEducationalLevels();
            fetchTeachers();
            reset();
            setSelectedImage(null);
            setImagePreview(null);
            setIsFree(false);
        }
    }, [isOpen, reset]);

    useEffect(() => {
        if (isOpen && watchedEducationalLevel && watchedTeacher) {
            fetchCourseSections(watchedEducationalLevel, watchedTeacher);
        } else {
            setCourseSections([]);
        }
    }, [isOpen, watchedEducationalLevel, watchedTeacher]);

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

    const fetchEducationalLevels = async () => {
        try {
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
        }
    };

    const fetchCourseSections = async (educationalLevelId?: string, teacherId?: string) => {
        try {
            const params = new URLSearchParams();
            if (educationalLevelId) {
                params.append("educationalLevel", educationalLevelId);
            }
            if (teacherId) {
                params.append("teacher", teacherId);
            }
            const response = await axiosInstance.get(`/courses/sections?${params.toString()}`);
            const sections = response.data?.data?.sections || response.data?.data || [];
            setCourseSections(Array.isArray(sections) ? sections : []);
        } catch (error) {
            console.error("Failed to fetch course sections:", error);
            setCourseSections([]);
        }
    };

    const onSubmit = async (values: CourseFormData) => {
        try {
            setDisabled(true);
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("educationalLevel", values.educationalLevel);
            formData.append("teacher", values.teacher);
            formData.append("price", isFree ? "0" : values.price.toString());
            formData.append("discount", isFree ? "0" : values.discount.toString());
            formData.append("isFree", isFree.toString());
            formData.append("status", values.status);
            if (values.courseSection) formData.append("courseSection", values.courseSection);
            if (values.startDate) formData.append("startDate", values.startDate);
            if (values.endDate) formData.append("endDate", values.endDate);
            if (selectedImage) {
                formData.append("poster", selectedImage);
            }

            const response = await coursesService.createCourse(formData);
            toast({
                status: "success",
                description: response.message || "تم إضافة الكورس بنجاح",
            });
            onClose();
            reset();
            setSelectedImage(null);
            setImagePreview(null);
            onSuccess();
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
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>إضافة كورس جديد</ModalHeader>
                <ModalCloseButton left="auto" right={2} />

                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={6}>
                            <Stack>
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
                                        type="text"
                                        placeholder="..."
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
                                    >
                                        {educationalLevels.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name || item.nameArabic || item.title || item._id}
                                            </option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{errors.educationalLevel?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>القسم (اختياري)</FormLabel>
                                    <Select
                                        placeholder={watchedEducationalLevel && watchedTeacher ? "-- اختر القسم --" : "-- اختر المرحلة الدراسية والمدرس أولاً --"}
                                        {...register("courseSection")}
                                        isDisabled={!watchedEducationalLevel || !watchedTeacher}
                                    >
                                        {courseSections.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.title || section.name || section.nameArabic || section._id}
                                            </option>
                                        ))}
                                    </Select>
                                    {(!watchedEducationalLevel || !watchedTeacher) && (
                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                            يجب اختيار المرحلة الدراسية والمدرس أولاً
                                        </Text>
                                    )}
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
                                    <FormLabel>صورة الكورس (اختياري)</FormLabel>
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
                                    <HStack justify="space-between">
                                        <FormLabel mb={0}>كورس مجاني</FormLabel>
                                        <Switch
                                            isChecked={isFree}
                                            onChange={(e) => {
                                                setIsFree(e.target.checked);
                                                setValue('isFree', e.target.checked);
                                                if (e.target.checked) {
                                                    setValue('price', 0);
                                                    setValue('discount', 0);
                                                }
                                            }}
                                            colorScheme="green"
                                        />
                                    </HStack>
                                    {isFree && (
                                        <Text fontSize="sm" color="blue.600" mt={1}>
                                            عند تفعيل الكورس المجاني، سيتم تعيين السعر إلى 0
                                        </Text>
                                    )}
                                </FormControl>

                                <Stack direction="row">
                                    <FormControl isInvalid={!!errors.price}>
                                        <FormLabel>السعر</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.00"
                                            isDisabled={isFree}
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
                                            isDisabled={isFree}
                                            {...register("discount", { valueAsNumber: true, min: 0, max: 100 })}
                                        />
                                        <FormErrorMessage>{errors.discount?.message}</FormErrorMessage>
                                    </FormControl>
                                </Stack>
                                {!isFree && watch("price") > 0 && watch("discount") > 0 && (
                                    <Text fontSize="sm" color="green.600">
                                        السعر النهائي: {(watch("price") - (watch("price") * watch("discount") / 100)).toFixed(2)} ج.م
                                    </Text>
                                )}

                                <FormControl>
                                    <FormLabel>الحالة</FormLabel>
                                    <Select {...register("status")}>
                                        <option value="draft">مسودة</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">معطل</option>
                                    </Select>
                                </FormControl>

                                <Stack direction="row">
                                    <FormControl isInvalid={!!errors.startDate}>
                                        <FormLabel>تاريخ بدء الخصم</FormLabel>
                                        <Input
                                            type="date"
                                            {...register("startDate")}
                                        />
                                        <FormErrorMessage>{errors.startDate?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.endDate}>
                                        <FormLabel>تاريخ انتهاء الخصم</FormLabel>
                                        <Input
                                            type="date"
                                            {...register("endDate")}
                                        />
                                        <FormErrorMessage>{errors.endDate?.message}</FormErrorMessage>
                                    </FormControl>
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack direction="row" justify="center" mt={6} pb={4}>
                            <Button
                                colorScheme="teal"
                                width={250}
                                maxW="100%"
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
                        </Stack>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

