import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    Grid,
    GridItem,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    Text,
    Badge,
    Image,
    Select,
    FormControl,
    SimpleGrid,
    VStack,
    Flex,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { axiosInstance, getImageUrl } from "@/lib/axios";
import courseService from "@/features/teacher/services/courseService";
import AddCourseModal from "@/features/courses/components/AddCourseModal";
import AddCourseSectionModal from "@/features/courses/components/AddCourseSectionModal";
import LoadingCourseCard from "@/features/courses/components/LoadingCourseCard";
import CourseCard from "@/features/courses/components/CourseCard";

interface EducationalLevel {
    _id: string;
    name?: string;
    nameArabic?: string;
    title?: string;
}

export default function Courses() {
    const [params, setParams] = useSearchParams({ page: "1" });
    const queryClient = useQueryClient();
    const [educationalLevels, setEducationalLevels] = useState<EducationalLevel[]>([]);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['courses-with-sections', params.toString()],
        queryFn: () => courseService.getCoursesWithSections({
            page: Number(params.get("page")) || 1,
            limit: 20,
            status: params.get("status") || undefined,
            educationalLevel: params.get("educationalLevel") || undefined,
        }),
    });

    const courses = data?.data?.courses || [];
    const sections = data?.data?.sections || [];
    const total = data?.data?.total || 0;
    const currentPage = data?.data?.page || 1;
    const totalPages = data?.data?.totalPages || 0;

    // Calculate stats
    const stats = useMemo(() => {
        const active = courses.filter((c: any) => c.status === 'active').length;
        const draft = courses.filter((c: any) => c.status === 'draft').length;
        const inactive = courses.filter((c: any) => c.status === 'inactive').length;
        const free = courses.filter((c: any) => c.price === 0 || !c.price).length;
        const paid = courses.filter((c: any) => c.price && c.price > 0).length;
        return { total, active, draft, inactive, free, paid };
    }, [courses, total]);

    useEffect(() => {
        const fetchEducationalLevels = async () => {
            try {
                const response = await axiosInstance.get("/educational-levels");
                const educationalLevelsData = response.data?.data?.educationalLevels;
                let levels: EducationalLevel[] = [];

                if (educationalLevelsData) {
                    if (educationalLevelsData.primary) {
                        levels = [...levels, ...educationalLevelsData.primary];
                    }
                    if (educationalLevelsData.preparatory) {
                        levels = [...levels, ...educationalLevelsData.preparatory];
                    }
                    if (educationalLevelsData.secondary) {
                        levels = [...levels, ...educationalLevelsData.secondary];
                    }
                } else {
                    levels = response.data?.data?.educationalLevels ||
                        response.data?.data ||
                        response.data?.educationalLevels ||
                        response.data || [];
                    levels = Array.isArray(levels) ? levels : [];
                }

                setEducationalLevels(levels);
            } catch (error) {
                console.error("Failed to fetch educational levels:", error);
                setEducationalLevels([]);
            }
        };
        fetchEducationalLevels();
    }, []);

    const handleRefetch = () => {
        queryClient.invalidateQueries({ queryKey: ['courses-with-sections'] });
        queryClient.invalidateQueries({ queryKey: ['courses'] });
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Modern Hero Header */}
            <Box
                bgGradient="linear(135deg, green.600 0%, teal.500 50%, cyan.400 100%)"
                position="relative"
                overflow="hidden"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                color="white"
                boxShadow="xl"
            >
                {/* Decorative Blobs */}
                <Box
                    position="absolute"
                    top="-50%"
                    right="-10%"
                    width="400px"
                    height="400px"
                    bgGradient="radial(circle, whiteAlpha.200, transparent)"
                    borderRadius="full"
                    filter="blur(60px)"
                />

                <Flex
                    position="relative"
                    zIndex={1}
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'start', md: 'center' }}
                    justify="space-between"
                    gap={4}
                >
                    <VStack align="start" spacing={2}>
                        <HStack>
                            <Icon icon="solar:book-bold-duotone" width={24} height={24} />
                            <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                                إدارة المنصة
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                            الكورسات
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة {total} كورس على المنصة
                        </Text>
                    </VStack>
                    <HStack spacing={3}>
                        <AddCourseSectionModal callback={handleRefetch} />
                        <Button
                            bg="white"
                            color="green.600"
                            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                            onClick={handleRefetch}
                            leftIcon={<Icon icon="solar:book-plus-bold-duotone" width="20" height="20" />}
                            size={{ base: 'md', md: 'lg' }}
                            borderRadius="xl"
                            shadow="md"
                            transition="all 0.3s"
                        >
                            إضافة كورس جديد
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} spacing={{ base: 4, md: 6 }}>
                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    إجمالي الكورسات
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مسجل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, green.400, green.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:book-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    نشط
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {stats.active}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس نشط
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, green.400, green.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:check-circle-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    مسودة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                    {stats.draft}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مسودة
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, orange.400, orange.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:document-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    غير نشط
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.600">
                                    {stats.inactive}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس غير نشط
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, gray.400, gray.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:close-circle-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    مجاني
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {stats.free}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مجاني
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, blue.400, blue.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:gift-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                >
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    مدفوع
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {stats.paid}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مدفوع
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:wallet-money-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Search Filters */}
            <Card
                borderRadius="2xl"
                border="1px"
                borderColor="gray.200"
                bg="white"
                boxShadow="xl"
            >
                <CardBody>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        gap={4}
                        align={{ base: 'stretch', md: 'center' }}
                        wrap="wrap"
                    >
                        <InputGroup flex={1} minW={{ base: '100%', md: '300px' }}>
                            <InputLeftElement pointerEvents="none">
                                <Icon icon="solar:magnifer-bold-duotone" width="18" height="18" />
                            </InputLeftElement>
                            <Input
                                type="search"
                                placeholder="اكتب عنوان \ وصف الكورس هنا .."
                                defaultValue={params.get("search") as string}
                                bg="white"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        setParams((param) => {
                                            param.set("page", "1");
                                            param.set("search", (event.target as any)?.value);
                                            return param;
                                        });
                                    }
                                }}
                            />
                        </InputGroup>

                        <FormControl minWidth={{ base: '100%', md: '200px' }}>
                            <Select
                                placeholder="جميع المراحل الدراسية"
                                bg="white"
                                value={params.get("educationalLevel") || ""}
                                onChange={(e) => {
                                    setParams((param) => {
                                        param.set("page", "1");
                                        if (e.target.value) {
                                            param.set("educationalLevel", e.target.value);
                                        } else {
                                            param.delete("educationalLevel");
                                        }
                                        return param;
                                    });
                                }}
                            >
                                {educationalLevels.map((level) => (
                                    <option key={level._id} value={level._id}>
                                        {level.name || level.nameArabic || level.title || level._id}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <HStack spacing={3}>
                            <AddCourseSectionModal callback={handleRefetch} />
                            <AddCourseModal callback={handleRefetch} />
                        </HStack>
                    </Flex>
                </CardBody>
            </Card>

            {/* Sections Display */}
            {sections.length > 0 && (
                <Card p={4}>
                    <Stack spacing={4}>
                        <Heading as="h3" fontSize="lg">
                            الأقسام ({sections.length})
                        </Heading>
                        <Grid templateColumns="repeat(auto-fill, minmax(17rem, 1fr))" gap={3}>
                            {sections.map((section: any) => (
                                <GridItem key={section._id}>
                                    <Card
                                        _hover={{
                                            transform: "translateY(-4px)",
                                            boxShadow: "lg",
                                        }}
                                        transition="all 0.2s"
                                    >
                                        <CardBody>
                                            <Stack spacing={4}>
                                                <Box position="relative">
                                                    <Image
                                                        src={section.poster ? getImageUrl(section.poster) : "https://via.placeholder.com/400x200"}
                                                        alt={section.title}
                                                        borderRadius="lg"
                                                        objectFit="cover"
                                                        h="150px"
                                                        w="full"
                                                        fallbackSrc="https://via.placeholder.com/400x200"
                                                    />
                                                    <Badge
                                                        position="absolute"
                                                        top={2}
                                                        right={2}
                                                        colorScheme={section.status === 'active' ? 'green' : 'gray'}
                                                    >
                                                        {section.status === 'active' ? 'نشط' : 'غير نشط'}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <Heading size="md" mb={2} noOfLines={1}>
                                                        {section.title}
                                                    </Heading>
                                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                        {section.description || "لا يوجد وصف"}
                                                    </Text>
                                                </Box>
                                                <Stack spacing={2} fontSize="sm" color="gray.500">
                                                    <HStack>
                                                        <Icon icon="solar:book-bold" width="16" height="16" />
                                                        <Text>{section.stats?.totalCourses || 0} كورس</Text>
                                                    </HStack>
                                                    {section.educationalLevel && (
                                                        <HStack>
                                                            <Icon icon="solar:graduation-bold" width="16" height="16" />
                                                            <Text>{section.educationalLevel.name || section.educationalLevel.shortName || "غير محدد"}</Text>
                                                        </HStack>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            ))}
                        </Grid>
                    </Stack>
                </Card>
            )}

            {/* Courses Grid */}
            <Grid templateColumns="repeat(auto-fill, minmax(17rem, 1fr))" gap={3}>
                {!isLoading && (
                    <>
                        {courses.map((course: any) => (
                            <GridItem key={course._id}>
                                <CourseCard course={course} callback={handleRefetch} />
                            </GridItem>
                        ))}

                        {!!courses.length && (
                            <Card
                                gridColumnStart="1"
                                gridColumnEnd="-1"
                                mt={4}
                                borderRadius="2xl"
                                border="1px"
                                borderColor="gray.200"
                                bg="white"
                                boxShadow="xl"
                            >
                                <CardBody>
                                    <HStack justify="flex-end" spacing={3}>
                                        <Button
                                            size="sm"
                                            fontWeight="medium"
                                            borderRadius="xl"
                                            h={8}
                                            isDisabled={
                                                isFetching ||
                                                isLoading ||
                                                currentPage >= totalPages ||
                                                  totalPages === 0
                                            }
                                            isLoading={isLoading || isFetching}
                                            onClick={() => {
                                                setParams((param) => {
                                                    param.set("page", (currentPage + 1).toString());
                                                    return param;
                                                });
                                            }}
                                        >
                                            التالية
                                        </Button>
                                        <Button
                                            size="sm"
                                            fontWeight="medium"
                                            borderRadius="xl"
                                            h={8}
                                            isDisabled={isFetching || isLoading || currentPage === 1}
                                            isLoading={isLoading || isFetching}
                                            onClick={() => {
                                                setParams((param) => {
                                                    param.set("page", (currentPage - 1).toString());
                                                    return param;
                                                });
                                            }}
                                        >
                                            السابقة
                                        </Button>
                                    </HStack>
                                </CardBody>
                            </Card>
                        )}
                    </>
                )}
                {isLoading &&
                    Array.from({ length: 4 })
                        .fill(0)
                        .map((_e, index) => (
                            <GridItem key={index}>
                                <LoadingCourseCard />
                            </GridItem>
                        ))}
            </Grid>

            {!isLoading && !courses.length && (
                <Card
                    borderRadius="2xl"
                    border="1px"
                    borderColor="gray.200"
                    bg="white"
                    boxShadow="xl"
                >
                    <CardBody>
                        <Center py={12}>
                            <VStack spacing={4}>
                                <Box>
                                    <Icon icon="solar:inbox-archive-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                                </Box>
                                <VStack spacing={2}>
                                    <Heading as="h2" fontSize="xl" fontWeight="bold" textAlign="center">
                                        لا توجد بيانات للعرض
                                    </Heading>
                                    <Text textAlign="center" color="gray.500" fontSize="sm">
                                        ليس هناك نتائج لعرضها، يمكنك إضافة كورس جديد بالضغط على زر إضافة كورس جديد في
                                        الأعلى
                                    </Text>
                                </VStack>
                            </VStack>
                        </Center>
                    </CardBody>
                </Card>
            )}
        </Stack>
    );
}

