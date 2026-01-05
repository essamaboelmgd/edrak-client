import { useState, lazy, Suspense } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
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
  Badge,
  IconButton
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { livesService } from "@/features/admin/services/livesService";
import AddLive from "./components/AddLive";

// Lazy load AgoraMeetingRoom
const AgoraMeetingRoom = lazy(() => import("@/features/admin/components/AgoraMeetingRoom"));

export default function Lives() {
  const [params, setParams] = useSearchParams({ page: "1" });
  const page = Number(params.get("page")) || 1;
  const search = params.get("search") || "";
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [meetingConfig, setMeetingConfig] = useState<{
    appId: string;
    channel: string;
    token: string;
    uid: number | string;
    liveId: string | number;
  } | null>(null);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['lives', page, search],
    queryFn: () => livesService.getAllLives({ page, limit: 10, search }),
    placeholderData: (previousData) => previousData, 
  });

  const deleteMutation = useMutation({
    mutationFn: livesService.deleteLive,
    onSuccess: () => {
      toast({ status: "success", title: "تم الحذف بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['lives'] });
    },
    onError: (error: any) => {
      toast({ status: "error", title: error?.response?.data?.message || "حدث خطأ" });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStartMeeting = async (live: any) => {
    setIsMeetingLoading(true);
    try {
        const channelName = `live-${live._id}`;
        // Generate Token
        const { data } = await livesService.generateToken({
             channelName,
             role: "publisher",
        });
        
        if (data.result) {
            setMeetingConfig({
                appId: data.result.appId || import.meta.env.VITE_AGORA_APP_ID, 
                channel: channelName,
                token: data.result.token,
                uid: data.result.uid,
                liveId: live._id
            });
        }
    } catch (error: any) {
        toast({
            title: "خطأ في بدء الاجتماع",
            description: error?.response?.data?.message || error?.message || "فشل في توليد التوكن",
            status: "error",
        });
    } finally {
        setIsMeetingLoading(false);
    }
  };

  const livesList = data?.data?.result?.data || [];
  const totalPages = data?.data?.result?.totalPages || 0;

  return (
    <Container maxW="8xl" py={6}>
      <Stack spacing={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Box p={2} bg="blue.500" borderRadius="lg" color="white">
              <Icon icon="solar:videocamera-record-bold" width="24" height="24" />
            </Box>
            <Box>
              <Heading size="md">البث المباشر</Heading>
              <Text fontSize="sm" color="gray.500">إدارة جلسات البث المباشر والاجتماعات الافتراضية</Text>
            </Box>
          </HStack>
          
          <HStack>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <Icon icon="lucide:search" width="18" color="gray" />
              </InputLeftElement>
              <Input 
                placeholder="بحث..." 
                defaultValue={search}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setParams(prev => {
                            prev.set('search', (e.target as HTMLInputElement).value);
                            prev.set('page', '1');
                            return prev;
                        });
                    }
                }}
              />
            </InputGroup>
            <Button 
                leftIcon={<Icon icon="solar:add-circle-bold" />}
                colorScheme="blue"
                onClick={() => setIsAddModalOpen(true)}
            >
                إضافة بث
            </Button>
            <AddLive 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['lives'] })}
            />
          </HStack>
        </Flex>

        <Card boxShadow="sm" borderRadius="xl">
            <CardBody p={0}>
                <TableContainer>
                    <Table>
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>العنوان</Th>
                                <Th>الكورس</Th>
                                <Th>الدرس</Th>
                                <Th>التاريخ</Th>
                                <Th>النوع</Th>
                                <Th>المعلم</Th>
                                <Th>الإجراءات</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {isLoading ? (
                                <Tr><Td colSpan={7}><Skeleton height="20px" my={2}/></Td></Tr>
                            ) : livesList.map((live: any) => (
                                <Tr key={live._id}>
                                    <Td fontWeight="bold">{live.title}</Td>
                                    <Td>{live.course?.title}</Td>
                                    <Td>{live.lesson?.title || "-"}</Td>
                                    <Td>{new Date(live.date).toLocaleString('ar-EG')}</Td>
                                    <Td>
                                        <Badge colorScheme={live.type === 'internal' ? 'green' : 'purple'}>
                                            {live.type === 'internal' ? 'داخلي' : 'خارجي'}
                                        </Badge>
                                    </Td>
                                    <Td>{live.teacher?.firstName} {live.teacher?.lastName}</Td>
                                    <Td>
                                        <HStack>
                                            {live.type === 'internal' && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="green"
                                                    leftIcon={<Icon icon="solar:videocamera-record-bold" />}
                                                    onClick={() => handleStartMeeting(live)}
                                                    isLoading={isMeetingLoading}
                                                >
                                                    بدء
                                                </Button>
                                            )}
                                            <IconButton 
                                                aria-label="Delete"
                                                size="sm" 
                                                colorScheme="red" 
                                                variant="ghost" 
                                                onClick={() => handleDelete(live._id)}
                                                isLoading={deleteMutation.isPending && deleteMutation.variables === live._id}
                                                icon={<Icon icon="solar:trash-bin-trash-bold" />}
                                            />
                                            {/* <EditLive live={live} /> */}
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                            {!isLoading && livesList.length === 0 && (
                                <Tr><Td colSpan={7} textAlign="center">لا توجد بيانات</Td></Tr>
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>
            </CardBody>
        </Card>
        
        <Flex justify="flex-end" gap={2}>
            <Button 
                isDisabled={page <= 1}
                onClick={() => setParams(p => { p.set('page', String(page - 1)); return p; })}
            >
                السابق
            </Button>
            <Button
                isDisabled={page >= (totalPages || 1)}
                onClick={() => setParams(p => { p.set('page', String(page + 1)); return p; })}
            >
                التالي
            </Button>
        </Flex>
      </Stack>

      {/* Meeting Room Modal */}
      <Suspense fallback={null}>
        {meetingConfig && (
            <AgoraMeetingRoom
                isOpen={!!meetingConfig}
                onClose={() => setMeetingConfig(null)}
                appId={meetingConfig.appId}
                channel={meetingConfig.channel}
                token={meetingConfig.token}
                uid={meetingConfig.uid}
                liveId={meetingConfig.liveId}
            />
        )}
      </Suspense>
    </Container>
  );
}
