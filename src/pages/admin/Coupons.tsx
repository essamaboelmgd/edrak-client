import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit2, Download, Ticket } from 'lucide-react';
import { useToast } from '@chakra-ui/react';
import {
    couponsService,
    ICoupon,
    CouponTargetType,
    DiscountType,
} from '@/features/admin/services/couponsService';
import { teachersService } from '@/features/admin/services/teachersService';
import CreateCouponsModal from '@/features/admin/components/CreateCouponsModal';
import EditCouponModal from '@/features/admin/components/EditCouponModal';

export default function AdminCoupons() {
    const toast = useToast();
    const [coupons, setCoupons] = useState<ICoupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
    const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
    const [teachers, setTeachers] = useState<any[]>([]);

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const response = await couponsService.getCoupons({
                page,
                limit: 20,
                targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as CouponTargetType) : undefined,
                discountType: discountTypeFilter !== 'all' ? (discountTypeFilter as DiscountType) : undefined,
                isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                teacherId: teacherFilter !== 'all' ? teacherFilter : undefined,
                code: searchTerm || undefined,
            });

            if (response.success && response.data) {
                setCoupons(response.data.coupons);
                setTotalPages(response.data.totalPages);
                setTotal(response.data.total);
            }
        } catch (error: any) {
            console.error('Error fetching coupons:', error);
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الكوبونات',
            });
        } finally {
            setLoading(false);
        }
    }, [page, targetTypeFilter, discountTypeFilter, statusFilter, teacherFilter, searchTerm, toast]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

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

    const handleDelete = async (couponId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
            return;
        }

        try {
            await couponsService.deleteCoupon(couponId);
            toast({
                status: 'success',
                description: 'تم حذف الكوبون بنجاح',
            });
            fetchCoupons();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الكوبون',
            });
        }
    };

    const handleToggleActive = async (coupon: ICoupon) => {
        try {
            await couponsService.updateCoupon(coupon._id, {
                isActive: !coupon.isActive,
            });
            toast({
                status: 'success',
                description: `تم ${coupon.isActive ? 'تعطيل' : 'تفعيل'} الكوبون بنجاح`,
            });
            fetchCoupons();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث الكوبون',
            });
        }
    };

    const handleEdit = (coupon: ICoupon) => {
        setSelectedCoupon(coupon);
        setShowEditModal(true);
    };

    const handleExport = () => {
        const header = ['#', 'الكود', 'النوع', 'الهدف', 'المدرس', 'نوع الخصم', 'قيمة الخصم', 'الحد الأقصى', 'الاستخدامات الحالية', 'الحالة', 'تاريخ الانتهاء', 'تاريخ الإنشاء'];
        const rows = coupons.map((coupon, idx) => [
            idx + 1,
            coupon.code,
            getTargetTypeLabel(coupon.targetType),
            getTargetLabel(coupon),
            typeof coupon.teacher === 'object' ? `${coupon.teacher.firstName} ${coupon.teacher.lastName}` : '-',
            coupon.discountType === 'percentage' ? 'نسبة' : 'مبلغ ثابت',
            coupon.discountValue,
            coupon.maxUses || 'غير محدود',
            coupon.currentUses,
            coupon.isActive ? 'نشط' : 'غير نشط',
            coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG') : 'غير محدد',
            new Date(coupon.createdAt).toLocaleDateString('ar-EG'),
        ]);
        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `coupons_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTargetTypeLabel = (type: CouponTargetType): string => {
        const labels: Record<CouponTargetType, string> = {
            course: 'كورس',
            lesson: 'درس',
            courseSection: 'قسم كورسات',
            lessonSection: 'قسم دروس',
        };
        return labels[type] || type;
    };

    const getTargetLabel = (coupon: ICoupon): string => {
        if (coupon.course) return coupon.course.title;
        if (coupon.lesson) return coupon.lesson.title;
        if (coupon.courseSection) return coupon.courseSection.name;
        if (coupon.lessonSection) return coupon.lessonSection.name;
        return '-';
    };

    const getDiscountLabel = (coupon: ICoupon): string => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}%`;
        }
        return `${coupon.discountValue.toLocaleString()} ج.م`;
    };

    const getStatusBadge = (coupon: ICoupon) => {
        if (!coupon.isActive) {
            return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">غير نشط</span>;
        }
        if (coupon.isExpired) {
            return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">منتهي</span>;
        }
        if (coupon.isMaxedOut) {
            return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">وصل للحد الأقصى</span>;
        }
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">نشط</span>;
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">كوبونات الخصم</h1>
                    <p className="text-gray-500 mt-1">
                        عرض وإدارة جميع كوبونات الخصم ({total} كوبون)
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
                        <span>إنشاء كوبونات جديدة</span>
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
                    value={discountTypeFilter}
                    onChange={(e) => {
                        setDiscountTypeFilter(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="all">كل أنواع الخصم</option>
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
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
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
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
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الخصم</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الاستخدامات</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ الانتهاء</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Ticket size={48} className="text-gray-300" />
                                            <span>لا توجد كوبونات خصم</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                                {getTargetTypeLabel(coupon.targetType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {getTargetLabel(coupon)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {typeof coupon.teacher === 'object'
                                                ? `${coupon.teacher.firstName} ${coupon.teacher.lastName}`
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-green-700">
                                                {getDiscountLabel(coupon)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {coupon.currentUses} / {coupon.maxUses || '∞'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(coupon)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {coupon.expiresAt
                                                ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG')
                                                : 'غير محدد'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(coupon)}
                                                    className={`p-2 rounded-lg transition-colors ${coupon.isActive
                                                            ? 'text-orange-600 hover:bg-orange-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={coupon.isActive ? 'تعطيل' : 'تفعيل'}
                                                >
                                                    {coupon.isActive ? 'تعطيل' : 'تفعيل'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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

            {/* Modals */}
            <CreateCouponsModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchCoupons}
            />
            <EditCouponModal
                coupon={selectedCoupon}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedCoupon(null);
                }}
                onSuccess={fetchCoupons}
            />
        </div>
    );
}

