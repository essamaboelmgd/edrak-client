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
import { axiosInstance } from "@/lib/axios";

interface AddCourseModalProps {
    callback: () => void;
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
    educationalLevel: string;
    courseSection: string;
    startDate: string;
    endDate: string;
}

interface CourseSection {
    _id: string;
    title?: string;
    name?: string;
    nameArabic?: string;
}

export default function AddCourseModal({ callback }: AddCourseModalProps) {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [disabled, setDisabled] = useState<boolean>(false);
    const [educationalLevels, setEducationalLevels] = useState<EducationalLevel[]>([]);
    const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<CourseFormData>({
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            discount: 0,
            educationalLevel: "",
            courseSection: "",
            startDate: "",
            endDate: "",
        },
    });

    const watchedEducationalLevel = watch("educationalLevel");

    useEffect(() => {
        if (isOpen) {
            fetchEducationalLevels();
            reset();
            setSelectedImage(null);
            setImagePreview(null);
        }
    }, [isOpen, reset]);

    useEffect(() => {
        if (isOpen) {
            fetchCourseSections(watchedEducationalLevel);
        }
    }, [isOpen, watchedEducationalLevel]);

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
            // Handle nested structure: data.educationalLevels.primary, preparatory, secondary
            const educationalLevelsData = response.data?.data?.educationalLevels;
            let levels: EducationalLevel[] = [];

            if (educationalLevelsData) {
                // Flatten the nested structure
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
                // Fallback to flat array if structure is different
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

    const fetchCourseSections = async (educationalLevelId?: string) => {
        try {
            const params = new URLSearchParams();
            if (educationalLevelId) {
                params.append("educationalLevel", educationalLevelId);
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
            formData.append("price", values.price.toString());
            formData.append("discount", values.discount.toString());
            if (values.courseSection) formData.append("courseSection", values.courseSection);
            if (values.startDate) formData.append("startDate", values.startDate);
            if (values.endDate) formData.append("endDate", values.endDate);
            if (selectedImage) {
                formData.append("poster", selectedImage);
            }

            const response = await axiosInstance.post("/courses", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast({
                status: "success",
                description: response.data?.message || "تم إضافة الكورس بنجاح",
            });
            onClose();
            reset();
            setSelectedImage(null);
            setImagePreview(null);
            // Refresh sections list
            if (watchedEducationalLevel) {
                fetchCourseSections(watchedEducationalLevel);
            }
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
                <Text>اضافة كورس جديد</Text>
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>اضافة كورس جديد</ModalHeader>
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
                                            placeholder={watchedEducationalLevel ? "-- اختر القسم --" : "-- اختر المرحلة الدراسية أولاً --"}
                                            {...register("courseSection")}
                                            isDisabled={!watchedEducationalLevel}
                                        >
                                            {courseSections.map((section) => (
                                                <option key={section._id} value={section._id}>
                                                    {section.title || section.name || section.nameArabic || section._id}
                                                </option>
                                            ))}
                                        </Select>
                                        {!watchedEducationalLevel && (
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                يجب اختيار المرحلة الدراسية أولاً
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

                                    <Stack direction="row">
                                        <FormControl isInvalid={!!errors.price}>
                                            <FormLabel>السعر</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.00"
                                                {...register("price", { valueAsNumber: true, min: 0 })}
                                            />
                                            <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!errors.discount}>
                                            <FormLabel>الخصم</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.00"
                                                {...register("discount", { valueAsNumber: true, min: 0 })}
                                            />
                                            <FormErrorMessage>{errors.discount?.message}</FormErrorMessage>
                                        </FormControl>
                                    </Stack>

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
