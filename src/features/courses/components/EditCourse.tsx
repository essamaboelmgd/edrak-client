import {
    Button,
    Center,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Stack,
    Text,
    Textarea,
    useToast,
    Box,
    Image,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { axiosInstance } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

interface EditCourseProps {
    course: any;
}

interface CourseFormData {
    title: string;
    description: string;
    price: number;
    discount: number;
    educationalLevel: string;
}

export default function EditCourse({ course }: EditCourseProps) {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [disabled, setDisabled] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CourseFormData>({
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            discount: 0,
            educationalLevel: "",
        },
    });

    useEffect(() => {
        if (course) {
            reset({
                title: course?.title || "",
                description: course?.description || "",
                price: course?.price || 0,
                discount: course?.discount || 0,
                educationalLevel: course?.educationalLevel?._id || course?.educationalLevel || "",
            });
            if (course.poster) {
                setImagePreview(course.poster);
            }
        }
    }, [course, reset]);

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

    const onSubmit = async (values: CourseFormData) => {
        try {
            setDisabled(true);
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("price", values.price.toString());
            formData.append("discount", values.discount.toString());
            if (values.educationalLevel) formData.append("educationalLevel", values.educationalLevel);
            if (selectedImage) {
                formData.append("poster", selectedImage);
            }

            const response = await axiosInstance.put(`/courses/${course._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast({
                status: "success",
                description: response.data?.message || "تم تحديث الكورس بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ['course', course._id] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        } catch (error: any) {
            toast({
                status: "error",
                description: error.response?.data?.message || "حدث خطأ أثناء التحديث",
            });
        } finally {
            setDisabled(false);
        }
    };

    return (
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

                    <FormControl isInvalid={!!errors.description}>
                        <FormLabel>الوصف</FormLabel>
                        <Textarea
                            placeholder="..."
                            {...register("description", { required: "الوصف مطلوب" })}
                        />
                        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
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
    );
}
