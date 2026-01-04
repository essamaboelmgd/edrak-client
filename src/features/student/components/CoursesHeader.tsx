import {
    Box,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Stack,
    Text,
    VStack,
    Heading,
    Button,
    Badge,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { ChangeEvent, KeyboardEvent } from "react";

// Locally defined constant as it was missing in the new project config
export const courseType = {
    regular: "دورة عادية",
    monthly: "اشتراك شهري",
    final: "مراجعة نهائية",
};

interface CoursesHeaderProps {
    searchValue?: string;
    onSearchChange: (value: string) => void;
    typeValue?: string;
    onTypeChange: (value: string) => void;
    teacherValue?: string;
    onTeacherChange: (value: string) => void;
    levelValue?: string;
    onLevelChange: (value: string) => void;
    teachers?: any[];
    levels?: any[];
    totalCourses?: number;
    enrolledCount?: number;
    availableCount?: number;
    onClearFilters?: () => void;
}

export default function CoursesHeader({
    searchValue = "",
    onSearchChange,
    typeValue = "",
    onTypeChange,
    teacherValue = "",
    onTeacherChange,
    levelValue = "",
    onLevelChange,
    teachers = [],
    levels = [],
    totalCourses = 0,
    enrolledCount = 0,
    availableCount = 0,
    onClearFilters,
}: CoursesHeaderProps) {
    const hasActiveFilters = searchValue || typeValue || teacherValue || levelValue;

    return (
        <Stack spacing={6} mb={8}>
            {/* Hero Header with Gradient */}
            <Box
                bgGradient="linear(135deg, blue.500, purple.500, pink.400)"
                borderRadius="3xl"
                p={{ base: 8, md: 10 }}
                position="relative"
                overflow="hidden"
                boxShadow="2xl"
            >
                {/* Decorative Elements */}
                <Box
                    position="absolute"
                    top="-50%"
                    right="-10%"
                    width="400px"
                    height="400px"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    filter="blur(80px)"
                />
                <Box
                    position="absolute"
                    bottom="-30%"
                    left="-5%"
                    width="300px"
                    height="300px"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    filter="blur(60px)"
                />

                <VStack align="start" spacing={4} position="relative" zIndex={1}>
                    <Heading as="h1" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="white">
                        الكورسات التعليمية
                    </Heading>
                    <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.900" maxW="600px">
                        اختر من بين مجموعة واسعة من الكورسات التعليمية واستمتع بتجربة تعلم متميزة
                    </Text>

                    {/* Stats Cards */}
                    <HStack spacing={4} flexWrap="wrap" mt={4}>
                        <Box
                            bg="whiteAlpha.200"
                            backdropFilter="blur(10px)"
                            borderRadius="xl"
                            px={5}
                            py={3}
                            border="1px"
                            borderColor="whiteAlpha.300"
                        >
                            <HStack spacing={3}>
                                <Box
                                    bg="white"
                                    color="blue.500"
                                    borderRadius="lg"
                                    p={2}
                                >
                                    <Icon
                                        icon="solar:book-bookmark-bold"
                                        width={24}
                                        height={24}
                                    />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="2xl" fontWeight="bold" color="white">
                                        {totalCourses}
                                    </Text>
                                    <Text fontSize="xs" color="whiteAlpha.800">
                                        إجمالي الكورسات
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <Box
                            bg="whiteAlpha.200"
                            backdropFilter="blur(10px)"
                            borderRadius="xl"
                            px={5}
                            py={3}
                            border="1px"
                            borderColor="whiteAlpha.300"
                        >
                            <HStack spacing={3}>
                                <Box
                                    bg="white"
                                    color="green.500"
                                    borderRadius="lg"
                                    p={2}
                                >
                                    <Icon
                                        icon="solar:check-circle-bold"
                                        width={24}
                                        height={24}
                                    />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="2xl" fontWeight="bold" color="white">
                                        {enrolledCount}
                                    </Text>
                                    <Text fontSize="xs" color="whiteAlpha.800">
                                        كورسات مشترك
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <Box
                            bg="whiteAlpha.200"
                            backdropFilter="blur(10px)"
                            borderRadius="xl"
                            px={5}
                            py={3}
                            border="1px"
                            borderColor="whiteAlpha.300"
                        >
                            <HStack spacing={3}>
                                <Box
                                    bg="white"
                                    color="purple.500"
                                    borderRadius="lg"
                                    p={2}
                                >
                                    <Icon
                                        icon="solar:star-bold"
                                        width={24}
                                        height={24}
                                    />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="2xl" fontWeight="bold" color="white">
                                        {availableCount}
                                    </Text>
                                    <Text fontSize="xs" color="whiteAlpha.800">
                                        كورسات متاحة
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </HStack>
                </VStack>
            </Box>

            {/* Filters Section */}
            <Box
                bg="white"
                borderRadius="2xl"
                p={6}
                boxShadow="sm"
                border="1px"
                borderColor="gray.100"
            >
                <VStack align="stretch" spacing={4}>
                    <HStack spacing={2}>
                        <Icon
                            icon="solar:filter-bold-duotone"
                            width={24}
                            height={24}
                            style={{ color: 'var(--chakra-colors-blue-500)' }}
                        />
                        <Text fontSize="lg" fontWeight="bold" color="gray.800">
                            فلتر البحث
                        </Text>
                    </HStack>

                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={3}
                        align={{ base: "stretch", md: "center" }}
                        flexWrap="wrap"
                    >
                        {/* Search */}
                        <InputGroup flex={1} maxW={{ base: "100%", md: "350px" }}>
                            <InputLeftElement pointerEvents="none">
                                <Icon
                                    icon="solar:magnifer-bold-duotone"
                                    width={20}
                                    height={20}
                                    style={{ color: 'var(--chakra-colors-gray-400)' }}
                                />
                            </InputLeftElement>
                            <Input
                                type="search"
                                placeholder="ابحث عن كورس..."
                                value={searchValue}
                                bg="gray.50"
                                borderRadius="xl"
                                border="2px"
                                borderColor="gray.200"
                                _hover={{ borderColor: "gray.300", bg: "white" }}
                                _focus={{
                                    borderColor: "blue.400",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                                    bg: "white"
                                }}
                                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                                    if (event.key === "Enter") {
                                        onSearchChange((event.target as HTMLInputElement).value);
                                    }
                                }}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </InputGroup>

                        {/* Course Type Filter */}
                        <Select
                            value={typeValue}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => onTypeChange(e.target.value)}
                            maxW={{ base: "100%", md: "200px" }}
                            bg="gray.50"
                            borderRadius="xl"
                            border="2px"
                            borderColor="gray.200"
                            _hover={{ borderColor: "gray.300", bg: "white" }}
                            _focus={{ borderColor: "blue.400", bg: "white" }}
                            // icon={<Icon icon="solar:alt-arrow-down-bold" width={16} height={16} />}
                        >
                            <option value="">كل الأنواع</option>
                            {Object.entries(courseType).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </Select>

                        {/* Teacher Filter */}
                        {teachers.length > 0 && (
                            <Select
                                value={teacherValue}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => onTeacherChange(e.target.value)}
                                maxW={{ base: "100%", md: "200px" }}
                                bg="gray.50"
                                borderRadius="xl"
                                border="2px"
                                borderColor="gray.200"
                                _hover={{ borderColor: "gray.300", bg: "white" }}
                                _focus={{ borderColor: "blue.400", bg: "white" }}
                                // icon={<Icon icon="solar:alt-arrow-down-bold" width={16} height={16} />}
                            >
                                <option value="">كل المدرسين</option>
                                {teachers.map((teacher: any) => (
                                    <option key={teacher.id || teacher._id} value={teacher.id || teacher._id}>
                                        {teacher.name || teacher.fullName}
                                    </option>
                                ))}
                            </Select>
                        )}

                        {/* Educational Level Filter */}
                        {levels.length > 0 && (
                            <Select
                                value={levelValue}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => onLevelChange(e.target.value)}
                                maxW={{ base: "100%", md: "200px" }}
                                bg="gray.50"
                                borderRadius="xl"
                                border="2px"
                                borderColor="gray.200"
                                _hover={{ borderColor: "gray.300", bg: "white" }}
                                _focus={{ borderColor: "blue.400", bg: "white" }}
                                // icon={<Icon icon="solar:alt-arrow-down-bold" width={16} height={16} />}
                            >
                                <option value="">كل المستويات</option>
                                {levels.map((level: any) => (
                                    <option key={level.id || level._id} value={level.id || level._id}>
                                        {level.name}
                                    </option>
                                ))}
                            </Select>
                        )}

                        {/* Clear Filters Button */}
                        {hasActiveFilters && onClearFilters && (
                            <Button
                                size="md"
                                variant="ghost"
                                colorScheme="red"
                                onClick={onClearFilters}
                                leftIcon={<Icon icon="solar:close-circle-bold" width={20} height={20} />}
                                borderRadius="xl"
                                _hover={{ bg: "red.50" }}
                            >
                                مسح الفلاتر
                            </Button>
                        )}
                    </Stack>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <HStack spacing={2} flexWrap="wrap" pt={2}>
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                الفلاتر النشطة:
                            </Text>
                            {searchValue && (
                                <Badge
                                    colorScheme="blue"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon icon="solar:magnifer-bold" width={12} height={12} />
                                    {searchValue}
                                </Badge>
                            )}
                            {typeValue && (
                                <Badge
                                    colorScheme="purple"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon icon="solar:book-bold" width={12} height={12} />
                                    {courseType[typeValue as keyof typeof courseType]}
                                </Badge>
                            )}
                            {teacherValue && (
                                <Badge
                                    colorScheme="green"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon icon="solar:user-bold" width={12} height={12} />
                                    {teachers.find((t) => (t.id || t._id) == teacherValue)?.name || teachers.find((t) => (t.id || t._id) == teacherValue)?.fullName}
                                </Badge>
                            )}
                            {levelValue && (
                                <Badge
                                    colorScheme="orange"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon icon="solar:chart-2-bold" width={12} height={12} />
                                    {levels.find((l) => (l.id || l._id) == levelValue)?.name}
                                </Badge>
                            )}
                        </HStack>
                    )}
                </VStack>
            </Box>
        </Stack>
    );
}
