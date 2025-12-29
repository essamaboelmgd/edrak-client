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
    InputRightElement,
    Spacer,
    Stack,
    Text,
    Wrap,
    WrapItem,
    Badge,
    Image,
    Select,
    FormControl,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
        <Stack p={4} spacing={6}>
            <Stack direction="row" alignItems="center">
                <Stack>
                    <Heading as="h2" fontSize="xl">
                        الكورسات
                    </Heading>
                    <Text fontSize="small">
                        النتائج {currentPage} / {totalPages} من {total}
                    </Text>
                </Stack>
                <Spacer />
            </Stack>

            {/* Search Filters */}
            <Card bg="gray.50" p={4}>
                <Stack spacing={4}>
                    <Wrap alignItems="center" justifyContent="space-between" width="100%">
                        <WrapItem flex={1} minWidth="200px">
                            <InputGroup>
                                <InputRightElement pointerEvents="none">
                                    <Icon icon="lucide:search" width="18" height="18" />
                                </InputRightElement>
                                <Input
                                    type="search"
                                    placeholder="اكتب عنوان \ وصف الكورس هنا .."
                                    defaultValue={params.get("search") as string}
                                    bg="white"
                                    w="100%"
                                    maxWidth="100%"
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
                        </WrapItem>

                        <WrapItem>
                            <FormControl minWidth="200px">
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
                        </WrapItem>

                        <WrapItem>
                            <AddCourseSectionModal callback={handleRefetch} />
                        </WrapItem>
                        <WrapItem>
                            <AddCourseModal callback={handleRefetch} />
                        </WrapItem>
                    </Wrap>
                </Stack>
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
                            <HStack
                                as={Center}
                                gridColumnStart="1"
                                gridColumnEnd="-1"
                                mt={4}
                            >
                                <Button
                                    size="sm"
                                    fontWeight="medium"
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
                <Center>
                    <Stack spacing={4} my={6}>
                        <Box mx="auto" color="blue">
                            <Icon icon="solar:inbox-archive-bold" width="60" height="60" />
                        </Box>
                        <Stack maxW={600}>
                            <Heading as="h2" fontSize="large" fontWeight="bold" textAlign="center">
                                لا توجد بيانات للعرض
                            </Heading>
                            <Text textAlign="center" color="gray.500">
                                ليس هناك نتائج لعرضها، يمكنك إضافة كورس جديد بالضغط على زر إضافة كورس جديد في
                                الأعلى
                            </Text>
                        </Stack>
                    </Stack>
                </Center>
            )}
        </Stack>
    );
}

