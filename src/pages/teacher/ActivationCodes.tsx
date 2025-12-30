import { useState, useEffect, useCallback } from 'react';
import { Search, Key, Plus } from 'lucide-react';
import { useToast } from '@chakra-ui/react';
import {
    activationCodesService,
    IActivationCode,
    ActivationTargetType,
} from '@/features/admin/services/activationCodesService';
import CreateActivationCodesModal from '@/features/admin/components/CreateActivationCodesModal';

export default function TeacherActivationCodes() {
    const toast = useToast();
    const [codes, setCodes] = useState<IActivationCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchCodes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await activationCodesService.getActivationCodes({
                page,
                limit: 20,
                targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as ActivationTargetType) : undefined,
                isUsed: statusFilter === 'used' ? true : statusFilter === 'unused' ? false : undefined,
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
    }, [page, targetTypeFilter, statusFilter, searchTerm, toast]);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">أكواد التفعيل الخاصة بي</h1>
                    <p className="text-gray-500 mt-1">
                        عرض وإنشاء أكواد التفعيل لدوراتك ({total} كود)
                    </p>
                </div>
                <div className="flex gap-3">
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
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">السعر</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ الإنشاء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : codes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Key size={48} className="text-gray-300" />
                                            <span>لا توجد أكواد تفعيل حتى الآن</span>
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
                                            {new Date(code.createdAt).toLocaleDateString('ar-EG')}
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

