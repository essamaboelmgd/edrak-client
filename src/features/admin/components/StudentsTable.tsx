import { Icon } from '@iconify-icon/react';
import { IStudentAdmin } from '../services/studentsService';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  VStack,
  Text,
  Checkbox,
  Switch,
  Card,
  CardBody,
  Avatar,
  Button,
  Stack,
} from '@chakra-ui/react';

interface StudentsTableProps {
  students: IStudentAdmin[];
  onViewDetails?: (student: IStudentAdmin) => void;
  onEdit?: (student: IStudentAdmin) => void;
  onManageWallet?: (student: IStudentAdmin) => void;
  onAllowModifications?: (studentId: string) => void;
  onToggleActivation?: (studentId: string) => void;
  selectedStudents?: string[];
  onSelectStudent?: (studentId: string) => void;
  onSelectAll?: () => void;
  loading?: boolean;
}

export default function StudentsTable({
  students,
  onViewDetails,
  onManageWallet,
  onAllowModifications,
  onToggleActivation,
  selectedStudents = [],
  onSelectStudent,
  onSelectAll,
  loading,
}: StudentsTableProps) {
  const allSelected = students.length > 0 && selectedStudents.length === students.length;
  const someSelected = selectedStudents.length > 0 && selectedStudents.length < students.length;

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Text textAlign="center" color="gray.500" py={8}>
            جاري التحميل...
          </Text>
        </CardBody>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack py={12} spacing={4}>
            <Icon
              icon="solar:users-group-two-rounded-bold-duotone"
              width="64"
              height="64"
              style={{ color: 'var(--chakra-colors-gray-300)' }}
            />
            <Text fontSize="lg" color="gray.500" fontWeight="medium">
              لا يوجد طلاب
            </Text>
            <Text fontSize="sm" color="gray.400">
              لا توجد نتائج مطابقة للبحث
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody px={0}>
        <TableContainer bg="white" rounded={10}>
          <Table colorScheme="gray">
            <Thead>
              <Tr>
                {onSelectStudent && (
                  <Th>
                    <Checkbox
                      isChecked={allSelected}
                      isIndeterminate={someSelected}
                      onChange={onSelectAll}
                    />
                  </Th>
                )}
                <Th>#</Th>
                <Th>الاسم</Th>
                <Th>البريد الالكتروني</Th>
                <Th>رقم الموبايل</Th>
                <Th>الرصيد</Th>
                <Th>نقاط الترتيب LeaderBoard</Th>
                <Th>المستوى</Th>
                <Th>السماح بتعديل البيانات</Th>
                <Th>حالة الحساب</Th>
                <Th>تنشيط الحساب</Th>
                <Th>اخر تسجيل دخول</Th>
                <Th>تاريخ الانشاء</Th>
                <Th>الاجراءات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((student) => (
                <Tr key={student._id}>
                  {onSelectStudent && (
                    <Td>
                      <Checkbox
                        isChecked={selectedStudents.includes(student._id)}
                        onChange={() => onSelectStudent(student._id)}
                      />
                    </Td>
                  )}
                  <Td>{student._id.slice(-6)}</Td>
                  <Td>
                    <HStack
                      color="blue"
                      textDecoration="underline"
                      _hover={{ textDecoration: 'none' }}
                      cursor="pointer"
                      onClick={() => onViewDetails?.(student)}
                    >
                      <Avatar
                        name={student.fullName}
                        width={25}
                        height={25}
                        bg={student.isActive ? 'blue.500' : 'gray.400'}
                      />
                      <Text fontSize="small" fontWeight="medium">
                        {student.fullName}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="small" fontWeight="medium" noOfLines={1}>
                      {student.email}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="small" fontWeight="medium" noOfLines={1} textAlign="start">
                      {student.mobileNumber}
                    </Text>
                  </Td>
                  <Td>{student.wallet?.amount || 0} ج.م</Td>
                  <Td>{student.leaderboardRank?.value || 0}xp</Td>
                  <Td>{student.level?.value || 0}xp</Td>
                  <Td>
                    {onAllowModifications && (
                      <Switch
                        isChecked={student.canUpdateInfo || false}
                        onChange={() => onAllowModifications(student._id)}
                      />
                    )}
                  </Td>
                  <Td>
                    {onToggleActivation && (
                      <Switch
                        isChecked={student.isActive}
                        onChange={() => onToggleActivation(student._id)}
                      />
                    )}
                  </Td>
                  <Td>
                    {onToggleActivation && (
                      <Switch
                        isChecked={student.isActive}
                        onChange={() => onToggleActivation(student._id)}
                      />
                    )}
                  </Td>
                  <Td>
                    <Text>{student.lastLogin ? student.lastLogin.substring(0, 10) : '-'}</Text>
                  </Td>
                  <Td>
                    <Text>{student.createdAt ? student.createdAt.substring(0, 10) : '-'}</Text>
                  </Td>
                  <Td>
                    <Stack direction="row">
                      {onManageWallet && (
                        <Button
                          fontWeight="medium"
                          size="sm"
                          h={8}
                          colorScheme="blue"
                          rounded={2}
                          onClick={() => onManageWallet(student)}
                          gap={1.5}
                        >
                          <Text fontSize="smaller">المحفظة</Text>
                        </Button>
                      )}
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
}
