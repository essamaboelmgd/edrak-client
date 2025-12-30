import { Box, Heading, Text, HStack, VStack } from '@chakra-ui/react';
import { BookOpen, CheckCircle, Star } from 'lucide-react';

interface CoursesHeroProps {
    totalCourses: number;
    enrolledCount: number;
    availableCount: number;
}

export const CoursesHero = ({ totalCourses, enrolledCount, availableCount }: CoursesHeroProps) => {
    return (
        <Box
            bgGradient="linear(135deg, blue.600, purple.600, pink.500)"
            borderRadius="3xl"
            p={{ base: 6, md: 10 }}
            position="relative"
            overflow="hidden"
            boxShadow="2xl"
            mb={8}
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

                <HStack spacing={4} flexWrap="wrap" mt={4}>
                    <StatCard 
                        icon={BookOpen} 
                        color="blue.500" 
                        value={totalCourses} 
                        label="إجمالي الكورسات" 
                    />
                    <StatCard 
                        icon={CheckCircle} 
                        color="green.500" 
                        value={enrolledCount} 
                        label="كورسات مشترك" 
                    />
                    <StatCard 
                        icon={Star} 
                        color="purple.500" 
                        value={availableCount} 
                        label="كورسات متاحة" 
                    />
                </HStack>
            </VStack>
        </Box>
    );
};

const StatCard = ({ icon: IconComponent, color, value, label }: { icon: any, color: string, value: number, label: string }) => (
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
                color={color}
                borderRadius="lg"
                p={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <IconComponent size={20} />
            </Box>
            <VStack align="start" spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                    {value}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.800">
                    {label}
                </Text>
            </VStack>
        </HStack>
    </Box>
);
