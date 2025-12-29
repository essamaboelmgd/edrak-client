import { Box, HStack, Input, InputGroup, InputLeftElement, Select, Stack, Text, VStack, Button, Badge } from '@chakra-ui/react';
import { Search, Filter, X } from 'lucide-react';

interface CoursesFiltersProps {
    searchValue: string;
    onSearchChange: (val: string) => void;
    levelValue: string;
    onLevelChange: (val: string) => void;
    levels: any[];
    onClearFilters: () => void;
}

export const CoursesFilters = ({
    searchValue,
    onSearchChange,
    levelValue,
    onLevelChange,
    levels,
    onClearFilters
}: CoursesFiltersProps) => {
    const hasActiveFilters = searchValue || levelValue;

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            p={6}
            boxShadow="sm"
            border="1px"
            borderColor="gray.100"
            mb={8}
        >
            <VStack align="stretch" spacing={4}>
                <HStack spacing={2}>
                    <Filter size={20} color="var(--chakra-colors-blue-500)" />
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
                    <InputGroup flex={1} maxW={{ base: "100%", md: "350px" }}>
                        <InputLeftElement pointerEvents="none">
                            <Search size={18} color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="ابحث عن كورس..."
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            bg="gray.50"
                            borderRadius="xl"
                        />
                    </InputGroup>

                    <Select
                        value={levelValue}
                        onChange={(e) => onLevelChange(e.target.value)}
                        maxW={{ base: "100%", md: "200px" }}
                        bg="gray.50"
                        borderRadius="xl"
                        placeholder="كل المستويات"
                    >
                        {levels.map((level) => (
                            <option key={level._id} value={level._id}>
                                {level.name}
                            </option>
                        ))}
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            size="md"
                            variant="ghost"
                            colorScheme="red"
                            onClick={onClearFilters}
                            leftIcon={<X size={18} />}
                            borderRadius="xl"
                        >
                            مسح الفلاتر
                        </Button>
                    )}
                </Stack>

                {hasActiveFilters && (
                    <HStack spacing={2} flexWrap="wrap" pt={2}>
                         <Text fontSize="sm" color="gray.600">الفلاتر النشطة:</Text>
                         {searchValue && <Badge colorScheme="blue" borderRadius="full" px={2}>بحث: {searchValue}</Badge>}
                         {levelValue && <Badge colorScheme="orange" borderRadius="full" px={2}>المستوى: {levels.find(l => l._id === levelValue)?.name}</Badge>}
                    </HStack>
                )}
            </VStack>
        </Box>
    );
};
