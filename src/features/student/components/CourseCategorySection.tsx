import {
    Box,
    Collapse,
    Grid,
    GridItem,
    HStack,
    Text,
    useDisclosure,
    VStack,
    Badge,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import CourseCard from "./CourseCard";

interface CourseCategorySectionProps {
    category: {
        id: string | null;
        name: string;
        description?: string;
    } | null;
    courses: any[];
    isEnrolled?: boolean;
    defaultOpen?: boolean;
}

export default function CourseCategorySection({
    category,
    courses,
    isEnrolled = false,
    defaultOpen = true,
}: CourseCategorySectionProps) {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: defaultOpen });

    if (!courses || courses.length === 0) return null;

    const categoryName = category?.name || "بدون تصنيف";
    const categoryDescription = category?.description;

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            border="2px"
            borderColor={isOpen ? (isEnrolled ? "green.200" : "blue.200") : "gray.100"}
            overflow="hidden"
            mb={4}
            transition="all 0.3s"
            boxShadow={isOpen ? "lg" : "sm"}
            _hover={{ borderColor: isEnrolled ? "green.300" : "blue.300", shadow: "md" }}
        >
            {/* Category Header */}
            <Box
                bgGradient={isOpen ? (isEnrolled ? "linear(to-r, green.50, green.100)" : "linear(to-r, blue.50, blue.100)") : "white"}
                borderBottom={isOpen ? "2px" : "0"}
                borderColor={isEnrolled ? "green.200" : "blue.200"}
            >
                <HStack
                    p={5}
                    cursor="pointer"
                    onClick={onToggle}
                    transition="all 0.2s"
                    _hover={{ opacity: 0.9 }}
                >
                    <Box
                        bg={isEnrolled ? "green.500" : "blue.500"}
                        color="white"
                        borderRadius="lg"
                        p={2}
                        transition="all 0.3s"
                        transform={isOpen ? "rotate(0deg)" : "rotate(-90deg)"}
                    >
                        <Icon
                            icon="solar:alt-arrow-down-bold"
                            width={20}
                            height={20}
                        />
                    </Box>

                    <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={3} align="center">
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                {categoryName}
                            </Text>
                            <Badge
                                bg={isEnrolled ? "green.500" : "blue.500"}
                                color="white"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="sm"
                                fontWeight="bold"
                            >
                                {courses.length} كورس
                            </Badge>
                        </HStack>
                        {categoryDescription && (
                            <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                {categoryDescription}
                            </Text>
                        )}
                    </VStack>

                    <Badge
                        variant="subtle"
                        colorScheme={isEnrolled ? "green" : "blue"}
                        fontSize="xs"
                        px={3}
                        py={1}
                        borderRadius="full"
                    >
                        {isOpen ? "مفتوح" : "مغلق"}
                    </Badge>
                </HStack>
            </Box>

            {/* Courses Grid */}
            <Collapse in={isOpen} animateOpacity>
                <Box p={6} pt={4}>
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(4, 1fr)",
                        }}
                        gap={5}
                    >
                        {courses.map((course) => (
                            <GridItem key={course.id || course._id}>
                                <CourseCard c={course} />
                            </GridItem>
                        ))}
                    </Grid>
                </Box>
            </Collapse>
        </Box>
    );
}
