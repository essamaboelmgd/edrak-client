import { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Stack,
    Select,
    Switch,
    HStack,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    List,
    ListItem,
    Avatar,
    Badge,
    Center,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import homeworkService from '@/features/teacher/services/homeworkService';
import courseService from '@/features/teacher/services/courseService';
import { ICreateHomeworkRequest } from '@/types/homework.types';
import { teachersService, ITeacherAdmin } from '@/features/admin/services/teachersService';

interface CreateHomeworkProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isAdmin?: boolean; // If true, show teacher selection
    initialLessonId?: string; // Pre-select lesson if provided
}

interface HomeworkFormValues {
    title: string;
    description: string;
    homeworkType: 'lesson' | 'course' | 'general';
    lesson?: string;
    course?: string;
    solutionVideoUrl: string;
    settings: {
        dueDate?: string;
        allowLateSubmission: boolean;
        showSolutionAfterDue: boolean;
        showSolutionAlways: boolean;
        allowMultipleAttempts: boolean;
        maxAttempts: number;
        requiredBeforeNextLesson: boolean;
    };
    teacher?: string; // For admin
    totalPoints?: number;
}

interface SelectCourseProps {
    selectedCourse?: string;
    onSelectCourse: (courseId: string) => void;
}

function SelectCourse({ selectedCourse, onSelectCourse }: SelectCourseProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await courseService.getMyCourses({ limit: 100 });
                setCourses(response.data.courses || []);
            } catch (error) {
                console.error('Failed to fetch courses', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Stack>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <Icon icon="solar:magnifer-linear" width="18" height="18" />
                </InputLeftElement>
                <Input
                    placeholder="ابحث عن كورس"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    bg="white"
                />
            </InputGroup>
            <List maxH="200px" overflowY="auto">
                {loading ? (
                    <Center py={4}>
                        <Text fontSize="sm">جاري التحميل...</Text>
                    </Center>
                ) : filteredCourses.length === 0 ? (
                    <Center py={4}>
                        <Text fontSize="sm">لا توجد كورسات</Text>
                    </Center>
                ) : (
                    filteredCourses.map((course) => (
                        <ListItem
                            key={course._id}
                            p={2}
                            border="1px"
                            borderColor={selectedCourse === course._id ? 'teal.400' : 'gray.100'}
                            rounded={3}
                            cursor="pointer"
                            mb={2}
                            onClick={() => onSelectCourse(course._id)}
                        >
                            <HStack spacing={2} alignItems="center">
                                <Text fontSize="small" fontWeight="medium" noOfLines={1} flex={1}>
                                    {course.title}
                                </Text>
                            </HStack>
                        </ListItem>
                    ))
                )}
            </List>
        </Stack>
    );
}

interface SelectLessonProps {
    courseId?: string;
    selectedLesson?: string;
    onSelectLesson: (lessonId: string) => void;
}

function SelectLesson({ courseId, selectedLesson, onSelectLesson }: SelectLessonProps) {
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLessons = async () => {
            if (!courseId) {
                setLessons([]);
                return;
            }
            setLoading(true);
            try {
                const response = await courseService.getCourseLessons(courseId);
                setLessons(response.data.lessons || []);
            } catch (error) {
                console.error('Failed to fetch lessons', error);
                setLessons([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [courseId]);

    return (
        <Stack>
            <List maxH="200px" overflowY="auto">
                {loading ? (
                    <Center py={4}>
                        <Text fontSize="sm">جاري التحميل...</Text>
                    </Center>
                ) : lessons.length === 0 ? (
                    <Center py={4}>
                        <Text fontSize="sm">
                            {courseId ? 'لا توجد دروس لهذا الكورس' : 'يرجى اختيار كورس أولاً'}
                        </Text>
                    </Center>
                ) : (
                    lessons.map((lesson) => (
                        <ListItem
                            key={lesson._id}
                            p={2}
                            border="1px"
                            borderColor={selectedLesson === lesson._id ? 'teal.400' : 'gray.100'}
                            rounded={3}
                            cursor="pointer"
                            mb={2}
                            onClick={() => onSelectLesson(lesson._id)}
                        >
                            <HStack spacing={2} alignItems="center">
                                <Text fontSize="small" fontWeight="medium" noOfLines={1} flex={1}>
                                    {lesson.title}
                                </Text>
                            </HStack>
                        </ListItem>
                    ))
                )}
            </List>
        </Stack>
    );
}

interface SelectTeacherProps {
    selectedTeacher?: string;
    onSelectTeacher: (teacherId: string) => void;
}

function SelectTeacher({ selectedTeacher, onSelectTeacher }: SelectTeacherProps) {
    const [teachers, setTeachers] = useState<ITeacherAdmin[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            try {
                const response = await teachersService.getAllTeachers({ limit: 100, search });
                setTeachers(response.data.teachers || []);
            } catch (error) {
                console.error('Failed to fetch teachers', error);
            } finally {
                setLoading(false);
            }
        };
        if (search.length >= 2 || search.length === 0) {
            fetchTeachers();
        }
    }, [search]);

    const filteredTeachers = teachers.filter(teacher =>
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        teacher.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Stack>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <Icon icon="solar:magnifer-linear" width="18" height="18" />
                </InputLeftElement>
                <Input
                    placeholder="ابحث عن مدرس"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    bg="white"
                />
            </InputGroup>
            <List maxH="200px" overflowY="auto">
                {loading ? (
                    <Center py={4}>
                        <Text fontSize="sm">جاري التحميل...</Text>
                    </Center>
                ) : filteredTeachers.length === 0 ? (
                    <Center py={4}>
                        <Text fontSize="sm">لا توجد نتائج</Text>
                    </Center>
                ) : (
                    filteredTeachers.map((teacher) => (
                        <ListItem
                            key={teacher._id}
                            p={2}
                            border="1px"
                            borderColor={selectedTeacher === teacher._id ? 'teal.400' : 'gray.100'}
                            rounded={3}
                            cursor="pointer"
                            mb={2}
                            onClick={() => onSelectTeacher(teacher._id)}
                        >
                            <HStack spacing={2} alignItems="center">
                                <Avatar
                                    name={`${teacher.firstName} ${teacher.lastName}`}
                                    size="sm"
                                />
                                <Text fontSize="small" fontWeight="medium" noOfLines={1} flex={1}>
                                    {teacher.firstName} {teacher.middleName} {teacher.lastName}
                                </Text>
                                <Badge fontSize="xs">{teacher.email}</Badge>
                            </HStack>
                        </ListItem>
                    ))
                )}
            </List>
        </Stack>
    );
}

export default function CreateHomework({ isOpen, onClose, onSuccess, isAdmin = false, initialLessonId }: CreateHomeworkProps) {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<HomeworkFormValues>({
        title: '',
        description: '',
        homeworkType: 'lesson',
        lesson: initialLessonId,
        course: undefined,
        solutionVideoUrl: '',
        settings: {
            dueDate: undefined,
            allowLateSubmission: true,
            showSolutionAfterDue: true,
            showSolutionAlways: false,
            allowMultipleAttempts: true,
            maxAttempts: 0,
            requiredBeforeNextLesson: false,
        },
        teacher: undefined,
        totalPoints: undefined,
    });
    const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
    const [solutionPdfFile, setSolutionPdfFile] = useState<File | undefined>(undefined);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormValues({
                title: '',
                description: '',
                homeworkType: 'lesson',
                lesson: initialLessonId,
                course: undefined,
                solutionVideoUrl: '',
                settings: {
                    dueDate: undefined,
                    allowLateSubmission: true,
                    showSolutionAfterDue: true,
                    showSolutionAlways: false,
                    allowMultipleAttempts: true,
                    maxAttempts: 0,
                    requiredBeforeNextLesson: false,
                },
                teacher: undefined,
                totalPoints: undefined,
            });
            setPdfFile(undefined);
            setSolutionPdfFile(undefined);
        } else if (initialLessonId) {
            // Set lesson when modal opens with initialLessonId
            setFormValues(prev => ({
                ...prev,
                lesson: initialLessonId,
                homeworkType: 'lesson',
            }));
        }
    }, [isOpen, initialLessonId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            // Validation
            if (!formValues.title || formValues.title.trim() === '') {
                toast({
                    title: 'خطأ',
                    description: 'عنوان الواجب مطلوب',
                    status: 'error',
                });
                setIsSubmitting(false);
                return;
            }

            if (formValues.homeworkType === 'lesson' && !formValues.lesson) {
                toast({
                    title: 'خطأ',
                    description: 'يرجى اختيار الدرس',
                    status: 'error',
                });
                setIsSubmitting(false);
                return;
            }

            if (formValues.homeworkType === 'course' && !formValues.course) {
                toast({
                    title: 'خطأ',
                    description: 'يرجى اختيار الكورس',
                    status: 'error',
                });
                setIsSubmitting(false);
                return;
            }

            if (isAdmin && !formValues.teacher) {
                toast({
                    title: 'خطأ',
                    description: 'يرجى اختيار المدرس',
                    status: 'error',
                });
                setIsSubmitting(false);
                return;
            }

            // Validate solution video URL if provided
            if (formValues.solutionVideoUrl && formValues.solutionVideoUrl.trim() !== '') {
                try {
                    new URL(formValues.solutionVideoUrl);
                } catch {
                    toast({
                        title: 'خطأ',
                        description: 'رابط فيديو الحل غير صحيح',
                        status: 'error',
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            const homeworkData: ICreateHomeworkRequest = {
                title: formValues.title.trim(),
                description: formValues.description?.trim() || undefined,
                homeworkType: formValues.homeworkType,
                contentType: 'pdf', // Default to PDF for now
                lesson: formValues.lesson,
                course: formValues.course,
                solutionVideoUrl: formValues.solutionVideoUrl?.trim() || undefined,
                settings: {
                    dueDate: formValues.settings.dueDate ? new Date(formValues.settings.dueDate).toISOString() : undefined,
                    allowLateSubmission: formValues.settings.allowLateSubmission,
                    showSolutionAfterDue: formValues.settings.showSolutionAfterDue,
                    showSolutionAlways: formValues.settings.showSolutionAlways,
                    allowMultipleAttempts: formValues.settings.allowMultipleAttempts,
                    maxAttempts: formValues.settings.maxAttempts,
                    requiredBeforeNextLesson: formValues.settings.requiredBeforeNextLesson,
                },
                teacher: isAdmin ? formValues.teacher : undefined,
                totalPoints: formValues.totalPoints,
            };

            await homeworkService.createHomework(homeworkData, {
                pdfFile,
                solutionPdfFile,
            });

            toast({
                title: 'نجح',
                description: 'تم إنشاء الواجب بنجاح',
                status: 'success',
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في إنشاء الواجب',
                status: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay />
            <form onSubmit={handleSubmit}>
                <ModalContent dir="rtl">
                    <ModalHeader>إضافة واجب جديد</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            {isAdmin && (
                                <FormControl>
                                    <FormLabel>
                                        المدرس
                                        <Text color="red" display="inline">*</Text>
                                    </FormLabel>
                                    <SelectTeacher
                                        selectedTeacher={formValues.teacher}
                                        onSelectTeacher={(teacherId) =>
                                            setFormValues({ ...formValues, teacher: teacherId })
                                        }
                                    />
                                </FormControl>
                            )}

                            <FormControl isRequired>
                                <FormLabel>عنوان الواجب</FormLabel>
                                <Input
                                    name="title"
                                    value={formValues.title}
                                    onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                                    placeholder="أدخل عنوان الواجب"
                                    bg="white"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>نوع الواجب</FormLabel>
                                <Select
                                    value={formValues.homeworkType}
                                    onChange={(e) =>
                                        setFormValues({
                                            ...formValues,
                                            homeworkType: e.target.value as 'lesson' | 'course' | 'general',
                                            lesson: undefined,
                                            course: undefined,
                                        })
                                    }
                                    bg="white"
                                >
                                    <option value="lesson">واجب للدرس</option>
                                    <option value="course">واجب للكورس</option>
                                    <option value="general">واجب عام</option>
                                </Select>
                            </FormControl>

                            {formValues.homeworkType === 'lesson' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>الكورس</FormLabel>
                                        <SelectCourse
                                            selectedCourse={formValues.course}
                                            onSelectCourse={(courseId) =>
                                                setFormValues({ ...formValues, course: courseId, lesson: undefined })
                                            }
                                        />
                                    </FormControl>
                                    {formValues.course && (
                                        <FormControl isRequired>
                                            <FormLabel>الدرس</FormLabel>
                                            <SelectLesson
                                                courseId={formValues.course}
                                                selectedLesson={formValues.lesson}
                                                onSelectLesson={(lessonId) =>
                                                    setFormValues({ ...formValues, lesson: lessonId })
                                                }
                                            />
                                        </FormControl>
                                    )}
                                </>
                            )}

                            {formValues.homeworkType === 'course' && (
                                <FormControl isRequired>
                                    <FormLabel>الكورس</FormLabel>
                                    <SelectCourse
                                        selectedCourse={formValues.course}
                                        onSelectCourse={(courseId) => setFormValues({ ...formValues, course: courseId })}
                                    />
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel>تاريخ التسليم</FormLabel>
                                <Input
                                    type="datetime-local"
                                    value={formValues.settings.dueDate || ''}
                                    onChange={(e) =>
                                        setFormValues({
                                            ...formValues,
                                            settings: { ...formValues.settings, dueDate: e.target.value },
                                        })
                                    }
                                    bg="white"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>وصف الواجب</FormLabel>
                                <Textarea
                                    value={formValues.description}
                                    onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                    placeholder="اكتب وصف الواجب هنا..."
                                    rows={4}
                                    bg="white"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>رابط فيديو حل الواجب</FormLabel>
                                <Input
                                    type="url"
                                    value={formValues.solutionVideoUrl}
                                    onChange={(e) => setFormValues({ ...formValues, solutionVideoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=example"
                                    bg="white"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    إضافة رابط فيديو يوتيوب لحل الواجب (اختياري)
                                </Text>
                            </FormControl>

                            <FormControl>
                                <HStack>
                                    <Switch
                                        isChecked={formValues.settings.allowLateSubmission}
                                        onChange={(e) =>
                                            setFormValues({
                                                ...formValues,
                                                settings: { ...formValues.settings, allowLateSubmission: e.target.checked },
                                            })
                                        }
                                    />
                                    <FormLabel m={0}>السماح بالتسليم المتأخر</FormLabel>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <HStack>
                                    <Switch
                                        isChecked={formValues.settings.showSolutionAlways}
                                        onChange={(e) =>
                                            setFormValues({
                                                ...formValues,
                                                settings: { ...formValues.settings, showSolutionAlways: e.target.checked },
                                            })
                                        }
                                    />
                                    <FormLabel m={0}>عرض الحل دائماً</FormLabel>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <HStack>
                                    <Switch
                                        isChecked={formValues.settings.showSolutionAfterDue}
                                        onChange={(e) =>
                                            setFormValues({
                                                ...formValues,
                                                settings: { ...formValues.settings, showSolutionAfterDue: e.target.checked },
                                            })
                                        }
                                    />
                                    <FormLabel m={0}>عرض الحل بعد موعد التسليم</FormLabel>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <HStack>
                                    <Switch
                                        isChecked={formValues.settings.allowMultipleAttempts}
                                        onChange={(e) =>
                                            setFormValues({
                                                ...formValues,
                                                settings: { ...formValues.settings, allowMultipleAttempts: e.target.checked },
                                            })
                                        }
                                    />
                                    <FormLabel m={0}>السماح بمحاولات متعددة</FormLabel>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <HStack>
                                    <Switch
                                        isChecked={formValues.settings.requiredBeforeNextLesson}
                                        onChange={(e) =>
                                            setFormValues({
                                                ...formValues,
                                                settings: { ...formValues.settings, requiredBeforeNextLesson: e.target.checked },
                                            })
                                        }
                                    />
                                    <FormLabel m={0}>مطلوب لفتح الدرس التالي</FormLabel>
                                </HStack>
                            </FormControl>

                            {formValues.settings.allowMultipleAttempts && (
                                <FormControl>
                                    <FormLabel>الحد الأقصى للمحاولات</FormLabel>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formValues.settings.maxAttempts}
                                        onChange={(e) =>
                                            setFormValues({
                                                ...formValues,
                                                settings: {
                                                    ...formValues.settings,
                                                    maxAttempts: parseInt(e.target.value) || 0,
                                                },
                                            })
                                        }
                                        bg="white"
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        اتركه 0 للسماح بعدد غير محدود
                                    </Text>
                                </FormControl>
                            )}

                            <FormControl isRequired>
                                <FormLabel>ملف الواجب (PDF)</FormLabel>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.type !== 'application/pdf') {
                                                toast({
                                                    title: 'خطأ',
                                                    description: 'يجب أن يكون الملف PDF',
                                                    status: 'error',
                                                });
                                                e.target.value = '';
                                                return;
                                            }
                                            setPdfFile(file);
                                        }
                                    }}
                                    p={1}
                                    bg="white"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    يجب أن يكون الملف بصيغة PDF
                                </Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel>الدرجة النهائية للواجب</FormLabel>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formValues.totalPoints || ''}
                                    onChange={(e) => setFormValues({ ...formValues, totalPoints: parseInt(e.target.value) || 0 })}
                                    placeholder="أدخل الدرجة النهائية (مثال: 100)"
                                    bg="white"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    للواجبات التي تعتمد على الملفات، يرجى تحديد الدرجة النهائية يدوياً.
                                    للواجبات المعتمدة على بنك الأسئلة، سيتم حساب الدرجة تلقائياً.
                                </Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel>ملف الحل (PDF) - اختياري</FormLabel>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.type !== 'application/pdf') {
                                                toast({
                                                    title: 'خطأ',
                                                    description: 'يجب أن يكون الملف PDF',
                                                    status: 'error',
                                                });
                                                e.target.value = '';
                                                return;
                                            }
                                            setSolutionPdfFile(file);
                                        }
                                    }}
                                    p={1}
                                    bg="white"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    يجب أن يكون الملف بصيغة PDF
                                </Text>
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button
                            colorScheme="teal"
                            type="submit"
                            isLoading={isSubmitting}
                            leftIcon={<Icon icon="lucide:save" width="16" height="16" />}
                        >
                            حفظ
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </form>
        </Modal>
    );
}

