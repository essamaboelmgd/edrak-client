import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Download, Key } from 'lucide-react';
import { useToast } from '@chakra-ui/react';
import {
    activationCodesService,
    IActivationCode,
    ActivationTargetType,
} from '@/features/admin/services/activationCodesService';
import { coursesService } from '@/features/admin/services/coursesService';
import { teachersService } from '@/features/admin/services/teachersService';
import { courseService } from '@/features/courses/courseService';
import CreateActivationCodesModal from '@/features/admin/components/CreateActivationCodesModal';

export default function AdminActivationCodes() {
    const toast = useToast();
    const [codes, setCodes] = useState<IActivationCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [teachers, setTeachers] = useState<any[]>([]);

    const fetchCodes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await activationCodesService.getActivationCodes({
                page,
                limit: 20,
                targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as ActivationTargetType) : undefined,
                isUsed: statusFilter === 'used' ? true : statusFilter === 'unused' ? false : undefined,
                teacherId: teacherFilter !== 'all' ? teacherFilter : undefined,
                code: searchTerm || undefined,
            });

            if (response.success && response.data) {
                setCodes(response.data.codes);
                setTotalPages(response.data.totalPages);
                setTotal(response.data.total);
            }
        } catch (error: any) {
            console.error('Error fetching activation codes:', error);
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الأكواد',
            });
        } finally {
            setLoading(false);
        }
    }, [page, targetTypeFilter, statusFilter, teacherFilter, searchTerm, toast]);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    // Fetch teachers for filter
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await teachersService.getAllTeachers({ limit: 1000 });
                if (response.success && response.data) {
                    setTeachers(response.data.teachers);
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    const handleDelete = async (codeId: string, isUsed: boolean) => {
        if (isUsed) {
            toast({
                status: 'warning',
                description: 'لا يمكن حذف كود تم استخدامه بالفعل',
            });
            return;
        }

        if (!window.confirm('هل أنت متأكد من حذف هذا الكود؟')) {
            return;
        }

        try {
            await activationCodesService.deleteActivationCode(codeId);
            toast({
                status: 'success',
                description: 'تم حذف الكود بنجاح',
            });
            fetchCodes();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الكود',
            });
        }
    };

    const handleExport = () => {
        const header = ['#', 'الكود', 'النوع', 'الهدف', 'المدرس', 'السعر', 'الحالة', 'تم الاستخدام بواسطة', 'تاريخ الإنشاء'];
        const rows = codes.map((code, idx) => [
            idx + 1,
            code.code,
            getTargetTypeLabel(code.targetType),
            getTargetLabel(code),
            typeof code.teacher === 'object' ? `${code.teacher.firstName} ${code.teacher.lastName}` : '-',
            code.price.toLocaleString(),
            code.isUsed ? 'مستخدم' : 'متاح',
            code.usedBy ? `${code.usedBy.firstName} ${code.usedBy.lastName}` : '-',
            new Date(code.createdAt).toLocaleDateString('ar-EG'),
        ]);
        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activation_codes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTargetTypeLabel = (type: ActivationTargetType): string => {
        const labels: Record<ActivationTargetType, string> = {
            course: 'كورس',
            lesson: 'درس',
            courseSection: 'قسم كورسات',
            lessonSection: 'قسم دروس',
        };
        return labels[type] || type;
    };

    const getTargetLabel = (code: IActivationCode): string => {
        if (code.course) return code.course.title;
        if (code.lesson) return code.lesson.title;
        if (code.courseSection) return code.courseSection.name;
        if (code.lessonSection) return code.lessonSection.name;
        return '-';
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">أكواد التفعيل</h1>
                    <p className="text-gray-500 mt-1">
                        عرض وإدارة جميع أكواد التفعيل ({total} كود)
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        <span>تصدير</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Plus size={18} />
                        <span>إنشاء أكواد جديدة</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث بالكود..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={targetTypeFilter}
                    onChange={(e) => {
                        setTargetTypeFilter(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="all">كل الأنواع</option>
                    <option value="course">كورس</option>
                    <option value="lesson">درس</option>
                    <option value="courseSection">قسم كورسات</option>
                    <option value="lessonSection">قسم دروس</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="all">الكل</option>
                    <option value="used">مستخدم</option>
                    <option value="unused">غير مستخدم</option>
                </select>
                <select
                    value={teacherFilter}
                    onChange={(e) => {
                        setTeacherFilter(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="all">كل المدرسين</option>
                    {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                            {teacher.fullName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الكود</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">النوع</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الهدف</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المدرس</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">السعر</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تم الإنشاء بواسطة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تم الاستخدام بواسطة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ الإنشاء</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : codes.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Key size={48} className="text-gray-300" />
                                            <span>لا توجد أكواد تفعيل</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                codes.map((code) => (
                                    <tr key={code._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-900">{code.code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                                {getTargetTypeLabel(code.targetType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {getTargetLabel(code)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {typeof code.teacher === 'object'
                                                ? `${code.teacher.firstName} ${code.teacher.lastName}`
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {code.price.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                                    code.isUsed
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}
                                            >
                                                {code.isUsed ? 'مستخدم' : 'متاح'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {typeof code.createdBy === 'object'
                                                ? `${code.createdBy.firstName} ${code.createdBy.lastName}`
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {code.usedBy ? `${code.usedBy.firstName} ${code.usedBy.lastName}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(code.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(code._id, code.isUsed)}
                                                disabled={code.isUsed}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    code.isUsed
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-red-600 hover:bg-red-50'
                                                }`}
                                                title={code.isUsed ? 'لا يمكن حذف كود مستخدم' : 'حذف'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        السابق
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                        صفحة {page} من {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Create Modal */}
            <CreateActivationCodesModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchCodes}
            />
        </div>
    );
}

