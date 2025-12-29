import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardBody,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Skeleton,
    Spacer,
    Stack,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    Wrap,
    WrapItem,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import homeworkService from '@/features/teacher/services/homeworkService';
import { IHomeworkResponse, IGetHomeworkQuery } from '@/types/homework.types';
import CreateHomework from '@/features/homework/components/CreateHomework';
import { teachersService, ITeacherAdmin } from '@/features/admin/services/teachersService';

export default function AdminHomeworks() {
    const [searchParams, setSearchParams] = useSearchParams({ page: '1' });
    const toast = useToast();

    const [homeworks, setHomeworks] = useState<IHomeworkResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [teachers, setTeachers] = useState<ITeacherAdmin[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchHomeworks = async () => {
        try {
            setIsFetching(true);
            const query: IGetHomeworkQuery = {
                page: parseInt(searchParams.get('page') || '1'),
                limit: 10,
            };

            if (searchParams.get('teacher')) query.teacher = searchParams.get('teacher')!;
            if (searchParams.get('homeworkType')) query.homeworkType = searchParams.get('homeworkType') as any;
            if (searchParams.get('status')) query.status = searchParams.get('status') as any;
            if (searchParams.get('search')) query.search = searchParams.get('search')!;

            const response = await homeworkService.getHomeworks(query);
            setHomeworks(response.data.homework);
            setTotal(response.data.total);
            setPage(response.data.page);
            setTotalPages(response.data.totalPages);
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في جلب الواجبات',
                status: 'error',
            });
        } finally {
            setIsFetching(false);
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await teachersService.getAllTeachers({ limit: 100 });
            setTeachers(response.data.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teachers', error);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchHomeworks();
        fetchTeachers();
    }, [searchParams]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الواجب؟')) return;

        try {
            await homeworkService.deleteHomework(id);
            toast({
                title: 'نجح',
                description: 'تم حذف الواجب بنجاح',
                status: 'success',
            });
            fetchHomeworks();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في حذف الواجب',
                status: 'error',
            });
        }
    };

    const handleTogglePublish = async (homework: IHomeworkResponse) => {
        try {
            if (homework.status === 'published') {
                await homeworkService.unpublishHomework(homework._id);
                toast({
                    title: 'نجح',
                    description: 'تم إلغاء نشر الواجب',
                    status: 'success',
                });
            } else {
                await homeworkService.publishHomework(homework._id);
                toast({
                    title: 'نجح',
                    description: 'تم نشر الواجب بنجاح',
                    status: 'success',
                });
            }
            fetchHomeworks();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في تحديث حالة الواجب',
                status: 'error',
            });
        }
    };

    const handleSearch = (value: string) => {
        setSearchParams((prev) => {
            if (value) {
                prev.set('search', value);
            } else {
                prev.delete('search');
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            draft: { color: 'gray', label: 'مسودة' },
            published: { color: 'green', label: 'منشور' },
            archived: { color: 'orange', label: 'مؤرشف' },
        };
        const statusInfo = statusMap[status] || { color: 'gray', label: status };
        return <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>;
    };

    return (
        <Box p={6} dir="rtl">
            <Stack spacing={6}>
                <Wrap>
                    <WrapItem>
                        <Select
                            bg="white"
                            value={searchParams.get('teacher') || 'all'}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    if (e.target.value && e.target.value !== 'all') {
                                        prev.set('teacher', e.target.value);
                                    } else {
                                        prev.delete('teacher');
                                    }
                                    prev.set('page', '1');
                                    return prev;
                                });
                            }}
                            placeholder="المدرسين"
                        >
                            <option value="all">جميع المدرسين</option>
                            {teachers.map((teacher) => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.firstName} {teacher.middleName} {teacher.lastName}
                                </option>
                            ))}
                        </Select>
                    </WrapItem>
                    <WrapItem>
                        <Select
                            bg="white"
                            value={searchParams.get('homeworkType') || ''}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    if (e.target.value) {
                                        prev.set('homeworkType', e.target.value);
                                    } else {
                                        prev.delete('homeworkType');
                                    }
                                    prev.set('page', '1');
                                    return prev;
                                });
                            }}
                            placeholder="نوع الواجب"
                        >
                            <option value="general">عام</option>
                            <option value="course">كورس</option>
                            <option value="lesson">درس</option>
                        </Select>
                    </WrapItem>
                    <WrapItem>
                        <Select
                            bg="white"
                            value={searchParams.get('status') || ''}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    if (e.target.value) {
                                        prev.set('status', e.target.value);
                                    } else {
                                        prev.delete('status');
                                    }
                                    prev.set('page', '1');
                                    return prev;
                                });
                            }}
                            placeholder="الحالة"
                        >
                            <option value="draft">مسودة</option>
                            <option value="published">منشور</option>
                            <option value="archived">مؤرشف</option>
                        </Select>
                    </WrapItem>
                </Wrap>

                <Card>
                    <CardBody>
                        <Stack spacing={4}>
                            <HStack justify="space-between" flexWrap="wrap">
                                <Stack>
                                    <Heading fontSize="xl">الواجبات</Heading>
                                    <Text fontSize="sm" color="gray.500">
                                        النتائج {page} / {totalPages} من {total}
                                    </Text>
                                </Stack>
                                <Spacer />
                                <HStack>
                                    <InputGroup size="sm" w={{ base: '100%', sm: '200px' }}>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon icon="lucide:search" width="15" height="15" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="بحث..."
                                            bg="white"
                                            defaultValue={searchParams.get('search') || ''}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch((e.target as HTMLInputElement).value);
                                                }
                                            }}
                                        />
                                    </InputGroup>
                                    <Button
                                        colorScheme="blue"
                                        size="sm"
                                        onClick={() => setIsCreateModalOpen(true)}
                                        leftIcon={<Icon icon="lucide:plus" width="16" height="16" />}
                                    >
                                        واجب جديد
                                    </Button>
                                </HStack>
                            </HStack>

                            <TableContainer bg="white" rounded={10}>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>#</Th>
                                            <Th>العنوان</Th>
                                            <Th>المدرس</Th>
                                            <Th>النوع</Th>
                                            <Th>الكورس</Th>
                                            <Th>الدرس</Th>
                                            <Th>الحالة</Th>
                                            <Th>النقاط</Th>
                                            <Th>التسليمات</Th>
                                            <Th>تاريخ التسليم</Th>
                                            <Th>تاريخ الإنشاء</Th>
                                            <Th>الإجراءات</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {loading || isFetching ? (
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <Tr key={idx}>
                                                    {Array.from({ length: 12 }).map((_, i) => (
                                                        <Td key={i}>
                                                            <Skeleton h={4} rounded={3} />
                                                        </Td>
                                                    ))}
                                                </Tr>
                                            ))
                                        ) : homeworks.length === 0 ? (
                                            <Tr>
                                                <Td colSpan={12} textAlign="center">
                                                    لا توجد بيانات للعرض
                                                </Td>
                                            </Tr>
                                        ) : (
                                            homeworks.map((homework, idx) => (
                                                <Tr key={homework._id}>
                                                    <Td>{(page - 1) * 10 + idx + 1}</Td>
                                                    <Td>
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="medium"
                                                            minW={200}
                                                            maxW={200}
                                                            noOfLines={1}
                                                        >
                                                            {homework.title}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                            {homework.teacher.firstName} {homework.teacher.middleName} {homework.teacher.lastName}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge>
                                                            {homework.homeworkType === 'lesson'
                                                                ? 'درس'
                                                                : homework.homeworkType === 'course'
                                                                    ? 'كورس'
                                                                    : 'عام'}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        {homework.course ? (
                                                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                                {homework.course.title}
                                                            </Text>
                                                        ) : (
                                                            <Badge>غير متوفر</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {homework.lesson ? (
                                                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                                {homework.lesson.title}
                                                            </Text>
                                                        ) : (
                                                            <Badge>غير متوفر</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>{getStatusBadge(homework.status)}</Td>
                                                    <Td>{homework.totalPoints || 0}</Td>
                                                    <Td>{homework.stats.totalSubmissions || 0}</Td>
                                                    <Td>
                                                        {homework.settings.dueDate ? (
                                                            <Text fontSize="sm">
                                                                {new Date(homework.settings.dueDate).toLocaleDateString('ar-EG')}
                                                            </Text>
                                                        ) : (
                                                            <Badge>غير محدد</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm">
                                                            {new Date(homework.createdAt).toLocaleDateString('ar-EG')}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Menu>
                                                            <MenuButton
                                                                as={IconButton}
                                                                icon={<Icon icon="lucide:more-vertical" width="16" height="16" />}
                                                                variant="ghost"
                                                                size="sm"
                                                            />
                                                            <MenuList>
                                                                <MenuItem
                                                                    onClick={() => handleTogglePublish(homework)}
                                                                >
                                                                    {homework.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                                                                </MenuItem>
                                                                <MenuItem
                                                                    color="red.500"
                                                                    onClick={() => handleDelete(homework._id)}
                                                                >
                                                                    حذف
                                                                </MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </Td>
                                                </Tr>
                                            ))
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            <HStack justify="flex-end" px={4}>
                                <Button
                                    size="sm"
                                    isDisabled={isFetching || loading || page >= totalPages}
                                    isLoading={loading || isFetching}
                                    onClick={() => {
                                        setSearchParams((prev) => {
                                            prev.set('page', (page + 1).toString());
                                            return prev;
                                        });
                                    }}
                                >
                                    التالية
                                </Button>
                                <Button
                                    size="sm"
                                    isDisabled={isFetching || loading || page === 1}
                                    isLoading={loading || isFetching}
                                    onClick={() => {
                                        setSearchParams((prev) => {
                                            prev.set('page', (page - 1).toString());
                                            return prev;
                                        });
                                    }}
                                >
                                    السابقة
                                </Button>
                            </HStack>
                        </Stack>
                    </CardBody>
                </Card>
            </Stack>

            <CreateHomework
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchHomeworks}
                isAdmin={true}
            />
        </Box>
    );
}

