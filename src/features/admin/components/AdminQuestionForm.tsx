import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    ICreateQuestionBankRequest,
    IUpdateQuestionBankRequest,
    IQuestionBankResponse,
    QuestionType,
    Difficulty,
    IAnswer,
} from '@/types/question-bank.types';
import { coursesService } from '@/features/admin/services/coursesService';
import courseService from '@/features/courses/courseService';

interface AdminQuestionFormProps {
    question?: IQuestionBankResponse;
    teachers: any[];
    onSave: (data: ICreateQuestionBankRequest | IUpdateQuestionBankRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

interface QuestionFormData {
    teacher?: string;
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

export default function AdminQuestionForm({ question, teachers, onSave, onCancel, isLoading = false }: AdminQuestionFormProps) {
    const [tagInput, setTagInput] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>(question?.teacher?._id || '');
    const [selectedCourseId, setSelectedCourseId] = useState<string>(question?.course?._id || '');

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<QuestionFormData>({
        defaultValues: {
            teacher: question?.teacher?._id || '',
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
    const watchedTeacher = watch('teacher');

    // Fetch courses for selected teacher
    const { data: coursesData, isLoading: coursesLoading } = useQuery({
        queryKey: ['adminCourses', selectedTeacherId],
        queryFn: () => coursesService.getAllCourses({ 
            page: 1, 
            limit: 1000, 
            teacher: selectedTeacherId,
        }),
        enabled: !!selectedTeacherId && !isGeneral,
    });

    // Fetch lessons for selected course
    const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
        queryKey: ['courseLessons', selectedCourseId],
        queryFn: () => courseService.getCourseLessons(selectedCourseId),
        enabled: !!selectedCourseId && !isGeneral,
    });

    const courses = coursesData?.data?.courses || [];
    const lessons = lessonsData?.data?.lessons || [];

    // Initialize teacher and course selection when editing
    useEffect(() => {
        if (question?.teacher?._id) {
            setSelectedTeacherId(question.teacher._id);
            setValue('teacher', question.teacher._id);
        }
        if (question?.course?._id) {
            setSelectedCourseId(question.course._id);
        }
    }, [question, setValue]);

    // Reset answers when question type changes
    useEffect(() => {
        if (questionType === 'true_false') {
            setValue('answers', [
                { text: 'صحيح', isCorrect: false, order: 1 },
                { text: 'خطأ', isCorrect: false, order: 2 },
            ]);
        } else if (questionType === 'written') {
            setValue('answers', []);
        } else if (questionType === 'mcq' && answers.length === 0) {
            setValue('answers', [{ text: '', isCorrect: false, order: 1 }]);
        }
    }, [questionType, setValue, answers.length]);

    // Reset course when teacher changes
    useEffect(() => {
        if (watchedTeacher && watchedTeacher !== selectedTeacherId) {
            setSelectedTeacherId(watchedTeacher);
            setSelectedCourseId('');
            setValue('course', undefined);
            setValue('lesson', undefined);
        }
    }, [watchedTeacher, selectedTeacherId, setValue]);

    const addAnswer = () => {
        append({ text: '', isCorrect: false, order: answers.length + 1 });
    };

    const removeAnswer = (index: number) => {
        remove(index);
        const updatedAnswers = answers.filter((_, i) => i !== index).map((a, i) => ({ ...a, order: i + 1 }));
        setValue('answers', updatedAnswers);
    };

    const handleAnswerChange = (index: number, field: keyof IAnswer, value: any) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };

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

    const onSubmit = async (data: QuestionFormData) => {
        // Validate teacher for new questions
        if (!question && !data.teacher) {
            alert('يجب اختيار المدرس');
            return;
        }

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
        } else if (data.questionType === 'written') {
            if (!data.correctAnswer) {
                alert('يجب إدخال الإجابة الصحيحة');
                return;
            }
        }

        // Clean up data
        const dataToSave: any = { ...data };

        // Add teacher field for admin (backend expects it)
        if (dataToSave.teacher) {
            // Keep teacher field for admin
        } else if (question?.teacher?._id) {
            // For updates, keep existing teacher if not changed
            dataToSave.teacher = question.teacher._id;
        }

        // Remove course and lesson if general
        if (dataToSave.isGeneral) {
            delete dataToSave.course;
            delete dataToSave.lesson;
        } else {
            const hasCourse = selectedCourseId || dataToSave.course;
            const hasLesson = dataToSave.lesson;

            if (!hasCourse && !hasLesson) {
                alert('يجب اختيار كورس أو درس');
                return;
            }

            if (hasLesson && !hasCourse) {
                dataToSave.course = selectedCourseId;
            } else if (hasCourse) {
                dataToSave.course = selectedCourseId || dataToSave.course;
            }

            if (!dataToSave.course || dataToSave.course === '') {
                delete dataToSave.course;
            }
            if (!dataToSave.lesson || dataToSave.lesson === '') {
                delete dataToSave.lesson;
            }
        }

        if (data.questionType !== 'written' && dataToSave.correctAnswer === '') {
            delete dataToSave.correctAnswer;
        }

        if (dataToSave.tags && dataToSave.tags.length === 0) {
            delete dataToSave.tags;
        }

        await onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
            {/* Teacher Selection - Only for admin creating new questions */}
            {!question && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        المدرس *
                    </label>
                    <select
                        {...register('teacher', { required: 'المدرس مطلوب' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="">-- اختر المدرس --</option>
                        {teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                                {teacher.fullName}
                            </option>
                        ))}
                    </select>
                    {errors.teacher && (
                        <p className="text-sm text-red-500 mt-1">{errors.teacher.message}</p>
                    )}
                </div>
            )}

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

            {/* Question Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع السؤال *</label>
                <select
                    {...register('questionType', { required: 'نوع السؤال مطلوب' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صحيح/خطأ</option>
                    <option value="written">سؤال كتابي</option>
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

            {/* Correct Answer for Written */}
            {questionType === 'written' && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة *</label>
                    <textarea
                        {...register('correctAnswer', { required: 'الإجابة الصحيحة مطلوبة' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="أدخل الإجابة الصحيحة..."
                    />
                    {errors.correctAnswer && (
                        <p className="text-sm text-red-500 mt-1">{errors.correctAnswer.message}</p>
                    )}
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

            {/* Course/Lesson Selection - Only show if not general and teacher is selected */}
            {!isGeneral && watchedTeacher && (
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
                        {courses.length === 0 && !coursesLoading && watchedTeacher && (
                            <p className="text-sm text-gray-500 mt-2">لا توجد كورسات متاحة لهذا المدرس</p>
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
                                    {lessons.map((lesson: any) => (
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
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    <span>{isLoading ? 'جاري الحفظ...' : question ? 'تحديث' : 'حفظ'}</span>
                </button>
            </div>
        </form>
    );
}

