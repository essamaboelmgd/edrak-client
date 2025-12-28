import { useState, useEffect } from 'react';
import { Search, Plus, Grid, List } from 'lucide-react';
import { useToast } from '@chakra-ui/react';
import { teachersService, ITeacherAdmin } from '@/features/admin/services/teachersService';
import TeachersTable from '@/features/admin/components/TeachersTable';
import TeacherCard from '@/features/admin/components/TeacherCard';
import TeacherDetailsModal from '@/features/admin/components/TeacherDetailsModal';
import CreateTeacherModal from '@/features/admin/components/CreateTeacherModal';
import EditTeacherModal from '@/features/admin/components/EditTeacherModal';

export default function AdminTeachers() {
  const toast = useToast();
  const [teachers, setTeachers] = useState<ITeacherAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedTeacher, setSelectedTeacher] = useState<ITeacherAdmin | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teachersService.getAllTeachers({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response.success && response.data) {
        setTeachers(response.data.teachers);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchTeachers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleViewDetails = (teacher: ITeacherAdmin) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
    setShowEditModal(false); // Ensure edit modal is closed
  };

  const handleEdit = (teacher: ITeacherAdmin) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
    setShowDetailsModal(false); // Ensure details modal is closed
  };

  const handleSuspend = async (teacherId: string) => {
    try {
      await teachersService.suspendTeacher(teacherId);
      toast({
        status: 'success',
        description: 'تم إيقاف المدرس بنجاح',
      });
      fetchTeachers();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء إيقاف المدرس',
      });
    }
  };

  const handleUnsuspend = async (teacherId: string) => {
    try {
      await teachersService.unsuspendTeacher(teacherId);
      toast({
        status: 'success',
        description: 'تم تفعيل المدرس بنجاح',
      });
      fetchTeachers();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء تفعيل المدرس',
      });
    }
  };

  const handleDelete = async (teacherId: string) => {
    try {
      await teachersService.deleteTeacher(teacherId);
      toast({
        status: 'success',
        description: 'تم حذف المدرس بنجاح',
      });
      fetchTeachers();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء حذف المدرس',
      });
    }
  };

  const handleBlock = async (teacherId: string) => {
    try {
      await teachersService.blockUser(teacherId);
      toast({
        status: 'success',
        description: 'تم حظر المدرس بنجاح',
      });
      fetchTeachers();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء حظر المدرس',
      });
    }
  };

  const handleUnblock = async (teacherId: string) => {
    try {
      await teachersService.unblockUser(teacherId);
      toast({
        status: 'success',
        description: 'تم إلغاء حظر المدرس بنجاح',
      });
      fetchTeachers();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء إلغاء حظر المدرس',
      });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">إدارة المدرسين</h1>
          <p className="text-gray-500 mt-1">
            عرض وإدارة جميع المدرسين في النظام ({total} مدرس)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {viewMode === 'table' ? <Grid size={18} /> : <List size={18} />}
            <span>{viewMode === 'table' ? 'عرض شبكي' : 'عرض جدول'}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus size={18} />
            <span>مدرس جديد</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن مدرس بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="trial">تجريبي</option>
          <option value="suspended">معطل</option>
          <option value="expired">منتهي</option>
        </select>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <TeachersTable
          teachers={teachers}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : teachers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">لا يوجد مدرسين</div>
          ) : (
            teachers.map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      )}

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
      <TeacherDetailsModal
        teacher={selectedTeacher}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTeacher(null);
        }}
        onSuspend={handleSuspend}
        onUnsuspend={handleUnsuspend}
        onEdit={(teacher) => {
          setShowDetailsModal(false);
          handleEdit(teacher);
        }}
        onDelete={handleDelete}
        onBlock={(teacherId) => {
          handleBlock(teacherId);
          setShowDetailsModal(false);
        }}
        onUnblock={(teacherId) => {
          handleUnblock(teacherId);
          setShowDetailsModal(false);
        }}
      />

      <CreateTeacherModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTeachers}
      />

      <EditTeacherModal
        teacher={selectedTeacher}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTeacher(null);
        }}
        onSuccess={fetchTeachers}
      />
    </div>
  );
}

