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
  IconButton,
} from '@chakra-ui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionsTableProps {
  sections: any[];
  onToggleStatus?: (sectionId: string, currentStatus: string) => void;
  loading?: boolean;
  canReorder?: boolean;
  onReorder?: (newSections: any[]) => void;
}

// Sortable Row Component
const SortableRow = ({ section, children, canReorder }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: canReorder ? 'grab' : 'default',
    position: 'relative' as 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Tr
      ref={setNodeRef}
      style={style}
      bg={isDragging ? 'gray.50' : 'white'}
      _hover={{ bg: 'gray.50' }}
      {...(canReorder ? attributes : {})}
      {...(canReorder ? listeners : {})}
    >
      {canReorder && (
        <Td width="50px" cursor="grab">
          <Icon icon="solar:hamburger-menu-bold" width="20" height="20" style={{ color: '#A0AEC0' }} />
        </Td>
      )}
      {children}
    </Tr>
  );
};

export default function SectionsTable({
  sections,
  onToggleStatus,
  loading,
  canReorder = false,
  onReorder
}: SectionsTableProps) {
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = sections.findIndex((s) => s._id === active.id);
      const newIndex = sections.findIndex((s) => s._id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      onReorder(newSections);
    }
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <TableContainer bg="white" rounded={10}>
            <Table colorScheme="gray">
              <Thead>
                <Tr>
                  {canReorder && <Th width="50px">الترتيب</Th>}
                  <Th>القسم</Th>
                  <Th>رقم الترتيب</Th>
                  <Th>المرحلة</Th>
                  <Th>الحالة</Th>
                  <Th>عدد الكورسات</Th>
                  <Th>الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                <SortableContext
                  items={sections.map(s => s._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section) => (
                    <SortableRow
                      key={section._id}
                      section={section}
                      canReorder={canReorder}
                    >
                      <Td
                        onClick={() => navigate(`/admin/sections/${section._id}`)}
                        cursor="pointer"
                      >
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
                        <Badge colorScheme="blue" variant="outline">
                          {section.order || 0}
                        </Badge>
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
                    </SortableRow>
                  ))}
                </SortableContext>
              </Tbody>
            </Table>
          </TableContainer>
        </DndContext>
      </CardBody>
    </Card>
  );
}

