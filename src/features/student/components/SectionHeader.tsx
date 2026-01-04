import { Box, HStack, Text, VStack, Badge, Center } from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";

interface SectionHeaderProps {
    title: string;
    icon: string;
    count?: number;
    description?: string;
    colorScheme?: string;
}

const colorSchemeConfig = {
    green: {
        bg: "green.50",
        borderColor: "green.100",
        badgeBg: "green.500",
        iconBg: "linear(135deg, green.400, green.600)"
    },
    blue: {
        bg: "blue.50",
        borderColor: "blue.100",
        badgeBg: "blue.500",
        iconBg: "linear(135deg, blue.400, blue.600)"
    },
    purple: {
        bg: "purple.50",
        borderColor: "purple.100",
        badgeBg: "purple.500",
        iconBg: "linear(135deg, purple.400, purple.600)"
    },
    orange: {
        bg: "orange.50",
        borderColor: "orange.100",
        badgeBg: "orange.500",
        iconBg: "linear(135deg, orange.400, orange.600)"
    }
};

export default function SectionHeader({
    title,
    icon,
    count,
    description,
    colorScheme = "blue",
}: SectionHeaderProps) {
    const config = colorSchemeConfig[colorScheme as keyof typeof colorSchemeConfig] || colorSchemeConfig.blue;

    return (
        <Box
            mb={6}
            p={5}
            bg={config.bg}
            borderRadius="2xl"
            border="2px"
            borderColor={config.borderColor}
        >
            <HStack spacing={4}>
                <Center
                    w={14}
                    h={14}
                    bgGradient={config.iconBg}
                    borderRadius="xl"
                    fontSize="2xl"
                    color="white"
                    flexShrink={0}
                    boxShadow="lg"
                >
                    <Icon icon={icon} width={28} height={28} />
                </Center>
                <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={3} align="center">
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                            {title}
                        </Text>
                        {count !== undefined && (
                            <Badge
                                bg={config.badgeBg}
                                color="white"
                                fontSize="md"
                                px={4}
                                py={1.5}
                                borderRadius="full"
                                fontWeight="bold"
                                boxShadow="md"
                            >
                                {count}
                            </Badge>
                        )}
                    </HStack>
                    {description && (
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {description}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
}
