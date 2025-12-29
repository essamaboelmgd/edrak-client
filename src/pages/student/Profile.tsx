import { Box, Container, Heading, Text, VStack, Avatar, Card, CardBody, SimpleGrid, Divider, Flex, Icon, Button, Badge } from '@chakra-ui/react';
import { useStudentProfile } from '@/features/student/hooks/useStudentCourses';
import { IStudentProfile } from '@/features/student/types';
import { User, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

const ProfileItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <Flex align="center" gap={4} p={3} borderRadius="lg" _hover={{ bg: 'gray.50' }}>
        <Flex align="center" justify="center" boxSize="40px" bg="blue.50" borderRadius="full" color="blue.500">
            <Icon as={icon} size={20} />
        </Flex>
        <Box>
            <Text fontSize="xs" color="gray.500">{label}</Text>
            <Text fontWeight="medium">{value}</Text>
        </Box>
    </Flex>
);

const StudentProfile = () => {
    const { data: profile, isLoading } = useStudentProfile();

    if (isLoading) return <Box p={8}>جاري التحميل...</Box>;

    const student = profile as IStudentProfile;

    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={8} align="stretch">
                 <Box>
                    <Heading size="lg" mb={2}>الملف الشخصي</Heading>
                    <Text color="gray.600">إدارة معلوماتك الشخصية</Text>
                </Box>

                <SimpleGrid columns={[1, 1, 3]} spacing={8}>
                    {/* Sidebar / Avatar Card */}
                    <Box gridColumn={['span 1', 'span 1', 'span 1']}>
                        <Card borderRadius="2xl" textAlign="center" py={6}>
                            <CardBody>
                                <Avatar size="2xl" name={`${student?.firstName} ${student?.lastName}`} mb={4} src="https://bit.ly/broken-link" />
                                <Heading size="md" mb={1}>{student?.firstName} {student?.lastName}</Heading>
                                <Text color="gray.500" fontSize="sm">{student?.email}</Text>
                                <Badge mt={4} colorScheme="blue" px={3} py={1} borderRadius="full">
                                    {student?.educationalLevel?.name || 'طالب'}
                                </Badge>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Details Card */}
                    <Box gridColumn={['span 1', 'span 1', 'span 2']}>
                        <Card borderRadius="2xl">
                            <CardBody>
                                <Heading size="md" mb={6}>البيانات الأساسية</Heading>
                                <SimpleGrid columns={[1, 2]} spacing={4}>
                                    <ProfileItem icon={User} label="الاسم الأول" value={student?.firstName} />
                                    <ProfileItem icon={User} label="اسم العائلة" value={student?.lastName} />
                                    <ProfileItem icon={Mail} label="البريد الإلكتروني" value={student?.email} />
                                    <ProfileItem icon={Phone} label="رقم الهاتف" value={student?.mobileNumber} />
                                    <ProfileItem icon={MapPin} label="المحافظة" value={student?.governorate} />
                                    <ProfileItem icon={GraduationCap} label="المرحلة الدراسية" value={student?.educationalLevel?.name} />
                                </SimpleGrid>
                                
                                <Divider my={6} />
                                
                                <Flex justify="flex-end">
                                    <Button colorScheme="blue" variant="outline">تعديل البيانات</Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </Box>
                </SimpleGrid>
            </VStack>
        </Container>
    );
};

export default StudentProfile;
