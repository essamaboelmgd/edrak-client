import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { axiosInstance } from '@/lib/axios';
import {
    ICreateQuestionBankRequest,
    IUpdateQuestionBankRequest,
    IQuestionBankResponse,
    QuestionType,
    Difficulty,
    IAnswer,
} from '@/types/question-bank.types';
import courseService from '@/features/teacher/services/courseService';

interface QuestionFormProps {
    question?: IQuestionBankResponse;
    onSave: (data: ICreateQuestionBankRequest | IUpdateQuestionBankRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

interface QuestionFormData {
    question: string;
    questionType: QuestionType;
    answers: IAnswer[];
    correctAnswer: string;
    explanation: string;
    difficulty: Difficulty;
    course?: string;
    lesson?: string;
    isGeneral: boolean;
    tags: string[];
    points: number;
    estimatedTime: number;
}

export default function QuestionForm({ question, onSave, onCancel, isLoading = false }: QuestionFormProps) {
    const [tagInput, setTagInput] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>(question?.course?._id || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(question?.imageUrl || null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<QuestionFormData>({
        defaultValues: {
            question: question?.question || '',
            questionType: question?.questionType || 'mcq',
            answers: question?.answers || [{ text: '', isCorrect: false, order: 1 }],
            correctAnswer: question?.correctAnswer || '',
            explanation: question?.explanation || '',
            difficulty: question?.difficulty || 'medium',
            course: question?.course?._id,
            lesson: question?.lesson?._id,
            isGeneral: question?.isGeneral ?? true,
            tags: question?.tags || [],
            points: question?.points || 1,
            estimatedTime: question?.estimatedTime || 60,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'answers',
    });

    const questionType = watch('questionType');
    const isGeneral = watch('isGeneral');
    const answers = watch('answers');

    // Fetch courses
    const { data: coursesData, isLoading: coursesLoading } = useQuery({
        queryKey: ['teacherCourses', { status: 'active' }],
        queryFn: () => courseService.getMyCourses({ page: 1, limit: 100, status: 'active' }),
    });

    // Fetch lessons for selected course
    const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
        queryKey: ['courseLessons', selectedCourseId],
        queryFn: () => courseService.getCourseLessons(selectedCourseId),
        enabled: !!selectedCourseId && !isGeneral,
    });

    const courses = coursesData?.data?.courses || [];
    const lessons = lessonsData?.data?.lessons || [];

    // Initialize course selection when editing
    useEffect(() => {
        if (question?.course?._id) {
            setSelectedCourseId(question.course._id);
        }
    }, [question]);

    // Reset answers when question type changes
    useEffect(() => {
        if (questionType === 'true_false') {
            setValue('answers', [
                { text: 'صحيح', isCorrect: false, order: 1 },
                { text: 'خطأ', isCorrect: false, order: 2 },
            ]);
        } else if (questionType === 'mcq' && answers.length === 0) {
            setValue('answers', [{ text: '', isCorrect: false, order: 1 }]);
        }
    }, [questionType, setValue]);

    const addAnswer = () => {
        append({ text: '', isCorrect: false, order: answers.length + 1 });
    };

    const removeAnswer = (index: number) => {
        remove(index);
        // Update order numbers
        const updatedAnswers = answers.filter((_, i) => i !== index).map((a, i) => ({ ...a, order: i + 1 }));
        setValue('answers', updatedAnswers);
    };

    const handleAnswerChange = (index: number, field: keyof IAnswer, value: any) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };

        // For true/false, ensure only one correct answer
        if (questionType === 'true_false' && field === 'isCorrect' && value) {
            updatedAnswers.forEach((a, i) => {
                if (i !== index) a.isCorrect = false;
            });
        }

        setValue('answers', updatedAnswers);
    };

    const addTag = () => {
        const currentTags = watch('tags') || [];
        if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
            setValue('tags', [...currentTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        const currentTags = watch('tags') || [];
        setValue('tags', currentTags.filter(t => t !== tag));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                alert('الرجاء اختيار ملف صورة');
            }
        }
    };

    const onSubmit = async (data: QuestionFormData) => {
        // Validate based on question type
        if (data.questionType === 'mcq' || data.questionType === 'true_false') {
            if (data.answers.length < 2) {
                alert('يجب إضافة على الأقل إجابتين');
                return;
            }
            const hasCorrect = data.answers.some(a => a.isCorrect);
            if (!hasCorrect) {
                alert('يجب تحديد إجابة صحيحة واحدة على الأقل');
                return;
            }
        }



        // Upload image if new file is selected
        let imageUrl = question?.imageUrl || '';
        if (imageFile) {
            try {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadResponse = await axiosInstance.post('/uploads/question-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                imageUrl = uploadResponse.data.url || uploadResponse.data.data?.url || '';
            } catch (error) {
                console.error('Failed to upload image', error);
                alert('فشل رفع الصورة. سيتم حفظ السؤال بدون صورة.');
            }
        }

        // Clean up data: remove empty strings and undefined values
        const dataToSave: any = { ...data };

        // Add imageUrl to data
        if (imageUrl) {
            dataToSave.imageUrl = imageUrl;
        }

        // Remove course and lesson if general
        if (dataToSave.isGeneral) {
            delete dataToSave.course;
            delete dataToSave.lesson;
        } else {
            // Validate: must have at least course or lesson
            const hasCourse = selectedCourseId || dataToSave.course;
            const hasLesson = dataToSave.lesson;

            if (!hasCourse && !hasLesson) {
                alert('يجب اختيار كورس أو درس');
                return;
            }

            // If lesson is selected, ensure course is also set
            if (hasLesson && !hasCourse) {
                dataToSave.course = selectedCourseId;
            } else if (hasCourse) {
                dataToSave.course = selectedCourseId || dataToSave.course;
            }

            // Remove empty strings, null, or undefined - don't send them at all
            if (!dataToSave.course || dataToSave.course === '') {
                delete dataToSave.course;
            }
            if (!dataToSave.lesson || dataToSave.lesson === '') {
                delete dataToSave.lesson;
            }
        }

        // Remove empty correctAnswer
        if (dataToSave.correctAnswer === '') {
            delete dataToSave.correctAnswer;
        }

        // Clean up empty arrays
        if (dataToSave.tags && dataToSave.tags.length === 0) {
            delete dataToSave.tags;
        }

        await onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
            {/* Question Text */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نص السؤال *</label>
                <textarea
                    {...register('question', { required: 'نص السؤال مطلوب' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="أدخل نص السؤال..."
                />
                {errors.question && (
                    <p className="text-sm text-red-500 mt-1">{errors.question.message}</p>
                )}
            </div>

            {/* Question Image */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة السؤال (اختياري)</label>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />
                <div className="flex gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {imagePreview ? 'تغيير الصورة' : 'اختر صورة'}
                    </button>
                    {imagePreview && (
                        <button
                            type="button"
                            onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                if (imageInputRef.current) {
                                    imageInputRef.current.value = '';
                                }
                            }}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            إزالة الصورة
                        </button>
                    )}
                </div>
                {imagePreview && (
                    <div className="mt-2">
                        <img
                            src={imagePreview}
                            alt="Question preview"
                            className="max-h-48 rounded-lg border border-gray-300"
                        />
                    </div>
                )}
            </div>

            {/* Question Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع السؤال *</label>
                <select
                    {...register('questionType', { required: 'نوع السؤال مطلوب' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صحيح/خطأ</option>
                </select>
            </div>

            {/* Answers for MCQ and True/False */}
            {(questionType === 'mcq' || questionType === 'true_false') && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابات *</label>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    {...register(`answers.${index}.text` as const, { required: 'نص الإجابة مطلوب' })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder={`الإجابة ${index + 1}`}
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Controller
                                        name={`answers.${index}.isCorrect`}
                                        control={control}
                                        render={({ field: checkboxField }) => (
                                            <input
                                                type="checkbox"
                                                checked={checkboxField.value}
                                                onChange={(e) => {
                                                    checkboxField.onChange(e.target.checked);
                                                    handleAnswerChange(index, 'isCorrect', e.target.checked);
                                                }}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                        )}
                                    />
                                    <span className="text-sm text-gray-700">صحيح</span>
                                </label>
                                {questionType === 'mcq' && fields.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAnswer(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {questionType === 'mcq' && (
                            <button
                                type="button"
                                onClick={addAnswer}
                                className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                                <Plus size={18} />
                                <span>إضافة إجابة</span>
                            </button>
                        )}
                    </div>
                </div>
            )}


            {/* Explanation */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">شرح الإجابة</label>
                <textarea
                    {...register('explanation')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="شرح الإجابة (اختياري)..."
                />
            </div>

            {/* Difficulty */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">مستوى الصعوبة *</label>
                <select
                    {...register('difficulty', { required: 'مستوى الصعوبة مطلوب' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                </select>
            </div>

            {/* Points and Estimated Time */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">النقاط</label>
                    <input
                        type="number"
                        {...register('points', { valueAsNumber: true, min: 1 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الوقت المقدر (ثانية)</label>
                    <input
                        type="number"
                        {...register('estimatedTime', { valueAsNumber: true, min: 1 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                    />
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوسوم</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="أدخل وسم واضغط Enter"
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        إضافة
                    </button>
                </div>
                {watch('tags') && watch('tags').length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {watch('tags').map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-purple-900"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* General Question Toggle */}
            <div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <Controller
                        name="isGeneral"
                        control={control}
                        render={({ field: checkboxField }) => (
                            <input
                                type="checkbox"
                                checked={checkboxField.value}
                                onChange={(e) => {
                                    checkboxField.onChange(e.target.checked);
                                    if (e.target.checked) {
                                        setSelectedCourseId('');
                                        setValue('course', undefined);
                                        setValue('lesson', undefined);
                                    }
                                }}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                        )}
                    />
                    <span className="text-sm font-semibold text-gray-700">سؤال عام (غير مرتبط بكورس محدد)</span>
                </label>
            </div>

            {/* Course/Lesson Selection - Only show if not general */}
            {!isGeneral && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">ربط السؤال</h3>

                    {/* Course Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">الكورس</label>
                        {coursesLoading ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">جاري تحميل الكورسات...</span>
                            </div>
                        ) : (
                            <select
                                value={selectedCourseId || ''}
                                onChange={(e) => {
                                    const courseId = e.target.value;
                                    setSelectedCourseId(courseId);
                                    setValue('course', courseId || undefined);
                                    setValue('lesson', undefined);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">اختر الكورس (اختياري)</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        )}
                        {courses.length === 0 && !coursesLoading && (
                            <p className="text-sm text-gray-500 mt-2">لا توجد كورسات متاحة</p>
                        )}
                    </div>

                    {/* Lesson Selection - Only show if course is selected */}
                    {selectedCourseId && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">الدرس (اختياري)</label>
                            {lessonsLoading ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">جاري تحميل الدروس...</span>
                                </div>
                            ) : (
                                <select
                                    {...register('lesson')}
                                    onChange={(e) => {
                                        const lessonId = e.target.value;
                                        setValue('lesson', lessonId || undefined);
                                        setValue('course', selectedCourseId || undefined);
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">اختر الدرس (اختياري)</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson._id} value={lesson._id}>
                                            {lesson.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {lessons.length === 0 && !lessonsLoading && (
                                <p className="text-sm text-gray-500 mt-2">لا توجد دروس في هذا الكورس</p>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        💡 يمكنك ربط السؤال بكورس فقط، أو بكورس ودرس معاً. إذا اخترت درس، سيتم ربطه تلقائياً بالكورس.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    <span>{isLoading ? 'جاري الحفظ...' : question ? 'تحديث' : 'حفظ'}</span>
                </button>
            </div>
        </form>
    );
}
