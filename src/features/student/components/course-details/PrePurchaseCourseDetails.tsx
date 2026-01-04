import { 
    Box, 
    Container, 
    Grid, 
    GridItem, 
    HStack, 
    VStack, 
    Heading, 
    Text, 
    Badge, 
    Wrap, 
    WrapItem, 
    Button, 
    Image, 
    Stack,
    Card,
    CardBody
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useState, useMemo } from 'react';
import { getImageUrl } from '@/lib/axios';

interface PrePurchaseCourseDetailsProps {
    course: any;
    sections: any[];
    lessons: any[];
    homeworks: any[];
    exams: any[];
    onSubscribe: () => void;
}

const currency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const LocalVideoPlayer = ({ url }: { url: string }) => {
    // Simple embed logic or direct video
    // Assuming URL might be YouTube or direct.
    // Ideally use react-player, but for now simple iframe if embed logic known or video tag
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    
    if (isYoutube) {
        let embedUrl = url;
        if (url.includes('watch?v=')) embedUrl = url.replace('watch?v=', 'embed/');
        else if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
        
        return (
            <iframe 
                width="100%" 
                height="100%" 
                src={embedUrl} 
                title="Video Player"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            />
        );
    }

    return (
        <video controls width="100%" height="100%" style={{ objectFit: 'cover' }}>
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};

export default function PrePurchaseCourseDetails({ 
    course, 
    sections, 
    lessons, 
    homeworks, 
    exams,
    onSubscribe 
}: PrePurchaseCourseDetailsProps) {
    // Flatten lessons from sections if "lessons" prop is empty, or use lessons prop
    // The "sections" prop comes from "months" in new API structure, which contains "items" (lessons, etc.)
    
    const [activeLessonId, setActiveLessonId] = useState<string | null>(() => {
        // Find first lesson
         if (lessons && lessons.length > 0) return lessons[0]._id;
         if (sections && sections.length > 0) {
             for (const sec of sections) {
                 if (sec.items && sec.items.length > 0) {
                     const firstLesson = sec.items.find((i: any) => i.type === 'lesson' || !i.type); // Default to lesson if no type
                     if (firstLesson) return firstLesson._id;
                 }
             }
         }
         return null;
    });

    // Determine active lesson object
    const activeLesson = useMemo(() => {
        if (!activeLessonId) return null;
        let found = lessons.find((l: any) => l._id === activeLessonId);
        if (found) return found;
        
        for (const sec of sections) {
            if (sec.items) {
                found = sec.items.find((i: any) => i._id === activeLessonId);
                if (found) return found;
            }
        }
        return null;
    }, [activeLessonId, lessons, sections]);

    return (
        <Box bgGradient="linear(to-b, gray.50, blue.50)" minH="100vh">
            <Stack spacing={0}>
                {/* Modern Hero Section */}
                <Box
                    bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                    py={{ base: 10, md: 16 }}
                    px={4}
                    position="relative"
                    overflow="hidden"
                >
                    {/* Decorative Elements */}
                    <Box position="absolute" top="-10%" right="-5%" opacity={0.15} animation="float 6s ease-in-out infinite">
                         <Icon icon="solar:book-2-bold-duotone" width="300" />
                    </Box>
                    <Box position="absolute" bottom="-10%" left="-5%" opacity={0.15} animation="float 8s ease-in-out infinite" style={{ animationDelay: '2s' }}>
                        <Icon icon="solar:diploma-bold-duotone" width="250" />
                    </Box>

                     <Container maxW="7xl" position="relative" zIndex={1}>
                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 10, lg: 16 }} alignItems="center">
                             {/* Text Content */}
                            <GridItem order={{ base: 2, lg: 1 }}>
                                <VStack spacing={8} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "right" }}>
                                    {/* Badges */}
                                    <HStack spacing={3} flexWrap="wrap" justify={{ base: "center", lg: "start" }}>
                                        <Badge
                                            bg="whiteAlpha.300"
                                            color="white"
                                            borderRadius="full"
                                            px={5} py={2}
                                            fontSize="sm" fontWeight="bold"
                                            backdropFilter="blur(10px)"
                                            border="2px solid" borderColor="whiteAlpha.400"
                                            display="flex" alignItems="center" gap={2}
                                        >
                                            <Icon icon="solar:square-academic-cap-bold-duotone" width="20" />
                                            <Text>{course.educationalLevel?.name || course.educationalLevel?.title}</Text>
                                        </Badge>
                                        
                                        {/* Type Badge if needed */}
                                    </HStack>

                                    {/* Title */}
                                    <Heading
                                        size={{ base: "xl", md: "2xl" }}
                                        fontWeight="900"
                                        lineHeight="1.2"
                                        color="white"
                                    >
                                        {course.title}
                                    </Heading>

                                    {/* Description */}
                                    <Text
                                        fontSize={{ base: "md", md: "lg" }}
                                        color="whiteAlpha.900"
                                        lineHeight="1.8"
                                        maxW={{ base: "100%", lg: "95%" }}
                                        fontWeight="500"
                                    >
                                        {course.description}
                                    </Text>

                                    {/* Stats */}
                                    <Wrap spacing={6} justify={{ base: "center", lg: "start" }} pt={2}>
                                        <WrapItem>
                                            <StatsBadge icon="solar:notebook-bold-duotone" text={`${lessons.length} درس`} />
                                        </WrapItem>
                                        <WrapItem>
                                            <StatsBadge icon="solar:document-text-bold-duotone" text={`${homeworks.length} واجب`} />
                                        </WrapItem>
                                        <WrapItem>
                                            <StatsBadge icon="solar:file-check-bold-duotone" text={`${exams.length} امتحان`} />
                                        </WrapItem>
                                    </Wrap>
                                    
                                    {/* CTA & Price */}
                                    <HStack spacing={4} pt={4} align="center" flexWrap="wrap" justify={{ base: "center", lg: "start" }}>
                                        <Button
                                            bgGradient="linear(to-r, green.400, teal.500)"
                                            color="white"
                                            size="lg"
                                            px={10}
                                            borderRadius="full"
                                            fontWeight="bold"
                                            h="56px"
                                            _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                                            leftIcon={<Icon icon="solar:cart-large-minimalistic-bold-duotone" width="24" />}
                                            onClick={onSubscribe}
                                        >
                                            اشترك الآن
                                        </Button>

                                        {/* Price Display */}
                                        <VStack
                                            spacing={0}
                                            align={{ base: "center", lg: "start" }}
                                            bg="whiteAlpha.200"
                                            px={6} py={2}
                                            borderRadius="2xl"
                                            backdropFilter="blur(10px)"
                                            border="2px solid" borderColor="whiteAlpha.300"
                                        >
                                            <Text color="whiteAlpha.800" fontSize="xs" fontWeight="bold">السعر</Text>
                                            <Text fontSize="2xl" fontWeight="900" color="white">
                                                {currency(course.price)}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </GridItem>

                            {/* Image */}
                            <GridItem order={{ base: 1, lg: 2 }} display="flex" justifyContent="center">
                                <Box
                                    position="relative"
                                    w="100%" maxW="550px"
                                    borderRadius="3xl"
                                    overflow="hidden"
                                    boxShadow="2xl"
                                    border="4px solid" borderColor="whiteAlpha.300"
                                    transform={{ lg: "rotate(-3deg)" }}
                                    transition="all 0.4s"
                                    _hover={{ transform: { lg: "rotate(0deg) scale(1.05)" } }}
                                >
                                    <Image
                                        src={getImageUrl(course.poster) || '/placeholder.png'}
                                        alt={course.title}
                                        width="100%"
                                        height="auto"
                                        objectFit="cover"
                                        aspectRatio={16 / 9}
                                    />
                                    {/* Play Overlay */}
                                    <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" bg="blackAlpha.400">
                                         <Box bg="white" color="purple.600" rounded="full" p={4} boxShadow="xl">
                                             <Icon icon="solar:play-bold" width="32" />
                                         </Box>
                                    </Box>
                                </Box>
                            </GridItem>
                        </Grid>
                     </Container>
                </Box>

                {/* Content Preview Section */}
                <Box bg="transparent" py={10}>
                    <Container maxW="7xl" px={{ base: 4, md: 6 }}>
                        <Card borderRadius="3xl" border="none" shadow="0 20px 60px rgba(0,0,0,0.12)" bg="white" overflow="hidden">
                            <CardBody p={{ base: 6, md: 8 }}>
                                <Grid templateColumns={{ base: "1fr", lg: "2fr 3fr" }} gap={{ base: 8, md: 10 }} alignItems="start">
                                    
                                    {/* Right: Lessons List (First in DOM) */}
                                    <GridItem>
                                        <Stack spacing={5}>
                                            <HStack justify="space-between" align="center" mb={1}>
                                                <Heading size="lg" color="#1e40af" fontWeight="900">
                                                    دروس الكورس
                                                </Heading>
                                            </HStack>
                                            <Stack 
                                                spacing={5} 
                                                maxH="600px" 
                                                overflowY="auto" 
                                                pr={2}
                                                css={{
                                                    '&::-webkit-scrollbar': { width: '6px' },
                                                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                                                    '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '10px' },
                                                    '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
                                                }}
                                            >
                                                {sections.map((section, idx) => (
                                                    <Box key={section._id || idx}>
                                                        <HStack mb={4} spacing={4} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                             <HStack spacing={3}>
                                                                <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="800">
                                                                    {section.title || section.name}
                                                                </Badge>
                                                                <Text fontSize="xs" color="gray.500" fontWeight="600">
                                                                    {section.items?.length || section.lessons?.length || 0} درس
                                                                </Text>
                                                             </HStack>
                                                        </HStack>
                                                        
                                                        <Stack spacing={3}>
                                                            {(section.items || section.lessons || []).map((item: any) => {
                                                                const isActive = item._id === activeLessonId;
                                                                const isVideo = item.type === 'lesson' || item.video_url || item.videoUrl;
                                                                
                                                                return (
                                                                    <Box 
                                                                        key={item._id}
                                                                        p={4}
                                                                        borderRadius="xl"
                                                                        bg={isActive ? "blue.50" : "white"}
                                                                        border="1px solid"
                                                                        borderColor={isActive ? "blue.400" : "gray.100"}
                                                                        cursor="pointer"
                                                                        _hover={{ 
                                                                            bg: isActive ? "blue.50" : "gray.50",
                                                                            borderColor: "blue.300", 
                                                                            transform: "translateX(-4px)" 
                                                                        }}
                                                                        transition="all 0.2s"
                                                                        onClick={() => setActiveLessonId(item._id)}
                                                                    >
                                                                        <HStack align="flex-start" spacing={3}>
                                                                            <Box color={isActive ? "blue.600" : "gray.400"} mt={1}>
                                                                                <Icon 
                                                                                    icon={isVideo ? "solar:play-circle-bold-duotone" : "solar:document-text-bold-duotone"}
                                                                                    width="24"
                                                                                />
                                                                            </Box>
                                                                            <Stack spacing={2} flex={1}>
                                                                                <HStack justify="space-between" align="flex-start">
                                                                                    <Text 
                                                                                        fontSize="sm" 
                                                                                        fontWeight={isActive ? "800" : "600"} 
                                                                                        color={isActive ? "blue.800" : "gray.700"}
                                                                                        noOfLines={2}
                                                                                        lineHeight="1.5"
                                                                                    >
                                                                                        {item.title}
                                                                                    </Text>
                                                                                    {item.isFree ? (
                                                                                         <Badge colorScheme="green" variant="subtle" fontSize="0.6rem" px={1.5} borderRadius="md">مجاني</Badge>
                                                                                    ) : (
                                                                                         <Icon icon="solar:lock-keyhole-minimalistic-bold-duotone" color="#cbd5e0" width="16" />
                                                                                    )}
                                                                                </HStack>
                                                                                
                                                                                <HStack pt={1} spacing={2} justify="flex-end">
                                                                                     {!item.isFree && (
                                                                                         <Button 
                                                                                            size="xs" 
                                                                                            colorScheme="teal" 
                                                                                            variant="solid" 
                                                                                            borderRadius="full" 
                                                                                            px={3} 
                                                                                            fontSize="0.7rem"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onSubscribe();
                                                                                            }}
                                                                                         >
                                                                                            اشترك
                                                                                         </Button>
                                                                                     )}
                                                                                </HStack>
                                                                            </Stack>
                                                                        </HStack>
                                                                    </Box>
                                                                )
                                                            })}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </GridItem>

                                    {/* Left: Video Player */}
                                    <GridItem>
                                        <Stack spacing={6} position="sticky" top="20px">
                                            <Stack spacing={2}>
                                                <Heading size="lg" color="#1e40af" fontWeight="900">
                                                    معاينة محتوى الكورس
                                                </Heading>
                                                <Text fontSize="md" color="gray.600" lineHeight="1.6">
                                                    استكشف محتوى الكورس. الدروس المقفلة تتطلب اشتراكاً لمشاهدتها.
                                                </Text>
                                            </Stack>

                                            <Box
                                                borderRadius="2xl"
                                                overflow="hidden"
                                                bg="black"
                                                boxShadow="xl"
                                                minH="300px"
                                                position="relative"
                                                h="320px"
                                            >
                                                {activeLesson ? (
                                                     activeLesson.isFree || ((activeLesson.video_url || activeLesson.videoUrl) && activeLesson.isFreeRequest) ? (
                                                        <LocalVideoPlayer url={activeLesson.video_url || activeLesson.videoUrl} /> 
                                                     ) : (
                                                        <Box
                                                            position="relative"
                                                            h="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgGradient="linear(to-br, gray.900, gray.800)"
                                                        >
                                                            <VStack spacing={5} color="white" px={8} textAlign="center">
                                                                 <Box bg="whiteAlpha.200" borderRadius="full" p={5} backdropFilter="blur(10px)">
                                                                    <Icon icon="solar:lock-keyhole-minimalistic-bold-duotone" width="48" />
                                                                 </Box>
                                                                 <Stack spacing={1}>
                                                                     <Text fontWeight="800" fontSize="xl">هذا الدرس مقفل</Text>
                                                                     <Text fontSize="md" color="whiteAlpha.800">اشترك في الكورس لمشاهدة الفيديو</Text>
                                                                 </Stack>
                                                                 <Button 
                                                                    colorScheme="teal" 
                                                                    size="md" 
                                                                    borderRadius="full" 
                                                                    px={6} 
                                                                    onClick={onSubscribe}
                                                                >
                                                                    اشترك في الكورس
                                                                </Button>
                                                            </VStack>
                                                        </Box>
                                                     )
                                                ) : (
                                                    <Box
                                                        h="100%"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        bg="gray.100"
                                                    >
                                                        <VStack spacing={3} color="gray.500">
                                                            <Icon icon="solar:videocamera-record-bold-duotone" width="56" style={{ opacity: 0.5 }} />
                                                            <Text fontSize="lg" fontWeight="600">اختر درساً للمعاينة</Text>
                                                        </VStack>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Stack>
                                    </GridItem>
                                </Grid>
                            </CardBody>
                        </Card>
                    </Container>
                </Box>
            </Stack>
        </Box>
    );
}

const StatsBadge = ({ icon, text }: { icon: string, text: string }) => (
    <HStack
        spacing={2}
        bg="whiteAlpha.200"
        px={4} py={2.5}
        borderRadius="full"
        backdropFilter="blur(10px)"
        border="1px solid" borderColor="whiteAlpha.300"
    >
        <Box color="white">
            <Icon icon={icon} width="22" />
        </Box>
        <Text color="white" fontWeight="bold" fontSize="sm">{text}</Text>
    </HStack>
);
