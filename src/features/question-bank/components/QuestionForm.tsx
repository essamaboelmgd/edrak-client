import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
    ICreateQuestionBankRequest,
    IUpdateQuestionBankRequest,
    IQuestionBankResponse,
    QuestionType,
    Difficulty,
    IAnswer,
} from '@/types/question-bank.types';
import courseService from '@/features/courses/courseService';

interface QuestionFormProps {
    question?: IQuestionBankResponse;
    onSave: (data: ICreateQuestionBankRequest | IUpdateQuestionBankRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function QuestionForm({ question, onSave, onCancel, isLoading = false }: QuestionFormProps) {
    const [formData, setFormData] = useState<ICreateQuestionBankRequest>({
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
    });

    const [tagInput, setTagInput] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>(question?.course?._id || '');

    // Fetch courses
    const { data: coursesData, isLoading: coursesLoading } = useQuery({
        queryKey: ['teacherCourses', { status: 'active' }],
        queryFn: () => courseService.getMyCourses({ page: 1, limit: 100, status: 'active' }),
    });

    // Fetch lessons for selected course
    const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
        queryKey: ['courseLessons', selectedCourseId],
        queryFn: () => courseService.getCourseLessons(selectedCourseId),
        enabled: !!selectedCourseId && !formData.isGeneral,
    });

    const courses = coursesData?.data?.courses || [];
    const lessons = lessonsData?.data?.lessons || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate based on question type
        if (formData.questionType === 'mcq' || formData.questionType === 'true_false') {
            if (formData.answers.length < 2) {
                alert('يجب إضافة على الأقل إجابتين');
                return;
            }
            const hasCorrect = formData.answers.some(a => a.isCorrect);
            if (!hasCorrect) {
                alert('يجب تحديد إجابة صحيحة واحدة على الأقل');
                return;
            }
        } else if (formData.questionType === 'written') {
            if (!formData.correctAnswer) {
                alert('يجب إدخال الإجابة الصحيحة');
                return;
            }
        }

        // Clean up data: remove empty strings and undefined values
        const dataToSave: any = { ...formData };

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
                // Use selectedCourseId if available, otherwise use formData.course
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

        // Remove empty correctAnswer if not written question
        if (formData.questionType !== 'written' && dataToSave.correctAnswer === '') {
            delete dataToSave.correctAnswer;
        }

        // Clean up empty arrays
        if (dataToSave.tags && dataToSave.tags.length === 0) {
            delete dataToSave.tags;
        }

        await onSave(dataToSave);
    };

    const addAnswer = () => {
        setFormData({
            ...formData,
            answers: [...formData.answers, { text: '', isCorrect: false, order: formData.answers.length + 1 }],
        });
    };

    const removeAnswer = (index: number) => {
        const newAnswers = formData.answers.filter((_, i) => i !== index).map((a, i) => ({ ...a, order: i + 1 }));
        setFormData({ ...formData, answers: newAnswers });
    };

    const updateAnswer = (index: number, field: keyof IAnswer, value: any) => {
        const newAnswers = [...formData.answers];
        newAnswers[index] = { ...newAnswers[index], [field]: value };

        // For true/false, ensure only one correct answer
        if (formData.questionType === 'true_false' && field === 'isCorrect' && value) {
            newAnswers.forEach((a, i) => {
                if (i !== index) a.isCorrect = false;
            });
        }

        setFormData({ ...formData, answers: newAnswers });
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...(formData.tags || []), tagInput.trim()],
            });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags?.filter(t => t !== tag) || [],
        });
    };

    // Initialize course selection when editing
    useEffect(() => {
        if (question?.course?._id) {
            setSelectedCourseId(question.course._id);
        }
    }, [question]);

    // Reset answers when question type changes
    useEffect(() => {
        if (formData.questionType === 'true_false') {
            setFormData({
                ...formData,
                answers: [
                    { text: 'صحيح', isCorrect: false, order: 1 },
                    { text: 'خطأ', isCorrect: false, order: 2 },
                ],
            });
        } else if (formData.questionType === 'written') {
            setFormData({
                ...formData,
                answers: [],
            });
        } else if (formData.questionType === 'mcq' && formData.answers.length === 0) {
            setFormData({
                ...formData,
                answers: [{ text: '', isCorrect: false, order: 1 }],
            });
        }
    }, [formData.questionType]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            {/* Question Text */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نص السؤال *</label>
                <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    required
                    placeholder="أدخل نص السؤال..."
                />
            </div>

            {/* Question Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع السؤال *</label>
                <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value as QuestionType })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                >
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صحيح/خطأ</option>
                    <option value="written">سؤال كتابي</option>
                </select>
            </div>

            {/* Answers for MCQ and True/False */}
            {(formData.questionType === 'mcq' || formData.questionType === 'true_false') && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابات *</label>
                    <div className="space-y-3">
                        {formData.answers.map((answer, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={answer.text}
                                    onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder={`الإجابة ${index + 1}`}
                                    required
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={answer.isCorrect}
                                        onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">صحيح</span>
                                </label>
                                {formData.questionType === 'mcq' && formData.answers.length > 2 && (
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
                        {formData.questionType === 'mcq' && (
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
            {formData.questionType === 'written' && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة *</label>
                    <textarea
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        required
                        placeholder="أدخل الإجابة الصحيحة..."
                    />
                </div>
            )}

            {/* Explanation */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">شرح الإجابة</label>
                <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="شرح الإجابة (اختياري)..."
                />
            </div>

            {/* Difficulty */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">مستوى الصعوبة *</label>
                <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
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
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الوقت المقدر (ثانية)</label>
                    <input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 60 })}
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
                {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
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
                    <input
                        type="checkbox"
                        checked={formData.isGeneral}
                        onChange={(e) => {
                            const isGeneral = e.target.checked;
                            setFormData({
                                ...formData,
                                isGeneral,
                                course: isGeneral ? undefined : formData.course,
                                lesson: isGeneral ? undefined : formData.lesson,
                            });
                            if (isGeneral) {
                                setSelectedCourseId('');
                            }
                        }}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">سؤال عام (غير مرتبط بكورس محدد)</span>
                </label>
            </div>

            {/* Course/Lesson Selection - Only show if not general */}
            {!formData.isGeneral && (
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
                                    setFormData({
                                        ...formData,
                                        course: courseId || undefined,
                                        lesson: undefined, // Reset lesson when course changes
                                    });
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
                                    value={formData.lesson || ''}
                                    onChange={(e) => {
                                        const lessonId = e.target.value;
                                        setFormData({
                                            ...formData,
                                            lesson: lessonId || undefined,
                                            course: selectedCourseId || undefined, // Ensure course is set when lesson is selected
                                        });
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

