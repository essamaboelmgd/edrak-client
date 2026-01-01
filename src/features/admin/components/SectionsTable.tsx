import { Icon } from '@iconify-icon/react';
import { getImageUrl } from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  Image,
  Box,
  Switch,
} from '@chakra-ui/react';

interface SectionsTableProps {
  sections: any[];
  onToggleStatus?: (sectionId: string, currentStatus: string) => void;
  loading?: boolean;
}

export default function SectionsTable({ sections, onToggleStatus, loading }: SectionsTableProps) {
  const navigate = useNavigate();
  const getStatusBadge = (section: any) => {
    if (section.status === 'active' || section.status === 'published') {
      return (
        <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
          نشط
        </Badge>
      );
    }
    if (section.status === 'draft') {
      return (
        <Badge colorScheme="orange" fontSize="xs" px={2} py={1} borderRadius="full">
          مسودة
        </Badge>
      );
    }
    return (
      <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
        معطل
      </Badge>
    );
  };

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

  if (sections.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack py={12} spacing={4}>
            <Icon
              icon="solar:inbox-line-bold-duotone"
              width="64"
              height="64"
              style={{ color: 'var(--chakra-colors-gray-300)' }}
            />
            <Text fontSize="lg" color="gray.500" fontWeight="medium">
              لا توجد أقسام
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
                <Th>القسم</Th>
                <Th>المرحلة</Th>
                <Th>الحالة</Th>
                <Th>عدد الكورسات</Th>
                <Th>الإجراءات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sections.map((section) => (
                <Tr 
                  key={section._id}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => navigate(`/admin/sections/${section._id}`)}
                >
                  <Td>
                    <HStack spacing={3}>
                      {section.poster ? (
                        <Image
                          src={getImageUrl(section.poster)}
                          alt={section.title}
                          w={12}
                          h={12}
                          borderRadius="xl"
                          objectFit="cover"
                        />
                      ) : (
                        <Box
                          w={12}
                          h={12}
                          borderRadius="xl"
                          bgGradient="linear(to-br, green.500, teal.500)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon
                            icon="solar:book-bold-duotone"
                            width="24"
                            height="24"
                            style={{ color: 'white' }}
                          />
                        </Box>
                      )}
                      <VStack align="start" spacing={0}>
                        <Text fontSize="small" fontWeight="bold" color="gray.800">
                          {section.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {section.description || 'لا يوجد وصف'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="small" color="gray.700">
                      {section.educationalLevel?.name || section.educationalLevel?.shortName || '-'}
                    </Text>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <HStack spacing={2}>
                      {onToggleStatus && (
                        <Switch
                          size="sm"
                          colorScheme="green"
                          isChecked={section.status === 'active'}
                          onChange={() => onToggleStatus(section._id, section.status)}
                        />
                      )}
                      {getStatusBadge(section)}
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        icon="solar:book-bold-duotone"
                        width="16"
                        height="16"
                        style={{ color: 'var(--chakra-colors-gray-500)' }}
                      />
                      <Text fontSize="small" fontWeight="medium">
                        {section.stats?.totalCourses || 0}
                      </Text>
                    </HStack>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <HStack spacing={1} justify="center">
                      <Icon
                        icon="solar:eye-bold-duotone"
                        width="18"
                        height="18"
                        style={{ color: 'var(--chakra-colors-blue-500)', cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/sections/${section._id}`)}
                      />
                      <Icon
                        icon="solar:pen-bold-duotone"
                        width="18"
                        height="18"
                        style={{ color: 'var(--chakra-colors-gray-500)', cursor: 'pointer' }}
                      />
                    </HStack>
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

