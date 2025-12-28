import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useToast, HStack, VStack, Input, InputGroup, InputLeftElement, Select, Button, Text } from '@chakra-ui/react';
import { studentsService, IStudentAdmin } from '@/features/admin/services/studentsService';
import { teachersService } from '@/features/admin/services/teachersService';
import StudentsTable from '@/features/admin/components/StudentsTable';
import StudentDetailsModal from '@/features/admin/components/StudentDetailsModal';
import CreateStudentModal from '@/features/admin/components/CreateStudentModal';
import EditStudentModal from '@/features/admin/components/EditStudentModal';

export default function AdminStudents() {
    const toast = useToast();
    const [students, setStudents] = useState<IStudentAdmin[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState<IStudentAdmin | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [teacherFilter, setTeacherFilter] = useState<string>('all');

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

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getAllStudents({
                page,
                limit: 20,
                search: searchTerm || undefined,
                teacher: teacherFilter !== 'all' ? teacherFilter : undefined,
            });

            if (response.success && response.data) {
                setStudents(response.data.students);
                setTotalPages(response.data.pagination.totalPages);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast({
                status: 'error',
                description: 'حدث خطأ أثناء جلب البيانات',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchStudents();
            } else {
                setPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, teacherFilter]);

    const handleViewDetails = (student: IStudentAdmin) => {
        setSelectedStudent(student);
        setShowDetailsModal(true);
        setShowEditModal(false); // Ensure edit modal is closed
    };

    const handleEdit = async (student: IStudentAdmin) => {
        try {
            // Fetch full student details to ensure all fields are available
            const response = await studentsService.getStudentById(student._id);
            if (response.success && response.data?.student) {
                setSelectedStudent(response.data.student);
                setShowEditModal(true);
                setShowDetailsModal(false); // Ensure details modal is closed
            } else {
                // Fallback to the student from list if fetch fails
                setSelectedStudent(student);
                setShowEditModal(true);
                setShowDetailsModal(false);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            // Fallback to the student from list if fetch fails
            setSelectedStudent(student);
            setShowEditModal(true);
            setShowDetailsModal(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        try {
            await studentsService.deleteStudent(studentId);
            toast({
                status: 'success',
                description: 'تم حذف الطالب بنجاح',
            });
            fetchStudents();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الطالب',
            });
        }
    };

    const handleBlock = async (studentId: string) => {
        try {
            await studentsService.blockUser(studentId);
            toast({
                status: 'success',
                description: 'تم حظر الطالب بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حظر الطالب',
            });
        }
    };

    const handleUnblock = async (studentId: string) => {
        try {
            await studentsService.unblockUser(studentId);
            toast({
                status: 'success',
                description: 'تم إلغاء حظر الطالب بنجاح',
            });
            fetchStudents();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إلغاء حظر الطالب',
            });
        }
    };

    return (
        <VStack spacing={6} align="stretch" dir="rtl">
            {/* Header */}
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        إدارة الطلاب
                    </Text>
                    <Text color="gray.500">
                        عرض وإدارة جميع الطلاب في النظام ({total} طالب)
                    </Text>
                </VStack>
                <Button
                    leftIcon={<Plus size={18} />}
                    bgGradient="linear(to-r, red.600, orange.600)"
                    color="white"
                    _hover={{ bgGradient: 'linear(to-r, red.700, orange.700)' }}
                    shadow="lg"
                    onClick={() => setShowCreateModal(true)}
                >
                    طالب جديد
                </Button>
            </HStack>

            {/* Search and Filters */}
            <HStack spacing={4} flexWrap="wrap">
                <InputGroup flex="1" minW="200px">
                    <InputLeftElement pointerEvents="none">
                        <Search size={20} color="#9CA3AF" />
                    </InputLeftElement>
                    <Input
                        placeholder="ابحث عن طالب بالاسم أو البريد الإلكتروني..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                <Select
                    w="200px"
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                >
                    <option value="all">جميع المدرسين</option>
                    {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                            {teacher.fullName}
                        </option>
                    ))}
                </Select>
            </HStack>

            {/* Content */}
            <StudentsTable
                students={students}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                loading={loading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <HStack justify="center" spacing={2}>
                    <Button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        variant="outline"
                        size="sm"
                    >
                        السابق
                    </Button>
                    <Text px={4} py={2} color="gray.700">
                        صفحة {page} من {totalPages}
                    </Text>
                    <Button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        variant="outline"
                        size="sm"
                    >
                        التالي
                    </Button>
                </HStack>
            )}

            {/* Modals */}
            <StudentDetailsModal
                student={selectedStudent}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedStudent(null);
                }}
                onEdit={(student) => {
                    setShowDetailsModal(false);
                    handleEdit(student);
                }}
                onDelete={handleDelete}
                onBlock={(studentId) => {
                    handleBlock(studentId);
                    setShowDetailsModal(false);
                }}
                onUnblock={(studentId) => {
                    handleUnblock(studentId);
                    setShowDetailsModal(false);
                }}
            />

            <CreateStudentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchStudents}
            />

            <EditStudentModal
                student={selectedStudent}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                }}
                onSuccess={fetchStudents}
            />
        </VStack>
    );
}

