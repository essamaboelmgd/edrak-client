import {
    Box,
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Badge,
    Heading,
    Flex,
    IconButton,
    Tooltip,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { ILessonAdmin } from '../services/lessonsService';
import { getImageUrl } from '@/lib/axios';

interface LessonAttachmentsTabProps {
    lesson: ILessonAdmin;
}

export default function LessonAttachmentsTab({ lesson }: LessonAttachmentsTabProps) {
    const attachments = lesson.attachments || [];

    const handleDownload = (url: string, title: string) => {
        const link = document.createElement('a');
        link.href = getImageUrl(url);
        link.download = title;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Stack spacing={4}>
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                <Stack p={5} spacing={4}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'stretch', md: 'center' }}
                        justify="space-between"
                        gap={4}
                    >
                        <Stack>
                            <HStack spacing={3}>
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="lg"
                                    bg="blue.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon
                                        icon="solar:document-bold-duotone"
                                        width="24"
                                        height="24"
                                        style={{ color: 'var(--chakra-colors-blue-600)' }}
                                    />
                                </Box>
                                <Stack spacing={0}>
                                    <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                        المرفقات
                                    </Heading>
                                    <Text fontSize="xs" color="gray.500">
                                        إدارة جميع مرفقات الدرس
                                    </Text>
                                </Stack>
                            </HStack>
                        </Stack>
                    </Flex>

                    {attachments.length > 0 && (
                        <HStack spacing={3} flexWrap="wrap">
                            <HStack
                                spacing={2}
                                bg="blue.50"
                                px={4}
                                py={2.5}
                                borderRadius="lg"
                                border="1px"
                                borderColor="blue.200"
                            >
                                <Icon
                                    icon="solar:document-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-blue-600)' }}
                                />
                                <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                                    {attachments.length} مرفق
                                </Text>
                            </HStack>
                        </HStack>
                    )}
                </Stack>
            </Card>

            {attachments.length === 0 ? (
                <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardBody>
                        <VStack py={12} spacing={4}>
                            <Icon
                                icon="solar:document-bold-duotone"
                                width="64"
                                height="64"
                                style={{ color: 'var(--chakra-colors-gray-300)' }}
                            />
                            <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                لا توجد مرفقات
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>
            ) : (
                <Stack spacing={4}>
                    {attachments.map((attachment, index) => (
                        <Card
                            key={index}
                            borderRadius="xl"
                            border="1px"
                            borderColor="gray.200"
                            boxShadow="sm"
                            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                        >
                            <CardBody>
                                <HStack justify="space-between" spacing={4}>
                                    <HStack spacing={4} flex={1}>
                                        <Box
                                            w={12}
                                            h={12}
                                            borderRadius="lg"
                                            bg="red.100"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon
                                                icon="solar:document-bold-duotone"
                                                width="24"
                                                height="24"
                                                style={{ color: 'var(--chakra-colors-red-500)' }}
                                            />
                                        </Box>
                                        <VStack align="start" spacing={1} flex={1}>
                                            <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                                                {attachment.title}
                                            </Text>
                                            <HStack spacing={2} flexWrap="wrap">
                                                <Badge colorScheme="gray" fontSize="xs">
                                                    {attachment.type || 'PDF'}
                                                </Badge>
                                                {attachment.size && (
                                                    <Text fontSize="xs" color="gray.500">
                                                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                                    </Text>
                                                )}
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                    <HStack spacing={2}>
                                        <Tooltip label="تحميل">
                                            <IconButton
                                                aria-label="تحميل"
                                                icon={<Icon icon="solar:download-bold-duotone" width="18" height="18" />}
                                                size="sm"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => handleDownload(attachment.url, attachment.title)}
                                            />
                                        </Tooltip>
                                        <Tooltip label="فتح في علامة تبويب جديدة">
                                            <IconButton
                                                aria-label="فتح"
                                                icon={<Icon icon="solar:external-link-bold-duotone" width="18" height="18" />}
                                                size="sm"
                                                colorScheme="green"
                                                variant="ghost"
                                                onClick={() => window.open(getImageUrl(attachment.url), '_blank')}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </Stack>
            )}
        </Stack>
    );
}

