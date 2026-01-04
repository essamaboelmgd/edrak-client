import { HStack, Text, Badge, TabList, Tab, TabIndicator, Icon, Box } from "@chakra-ui/react";
import { Video, FileText, Calendar, BookOpen, BarChart2, MessageSquare, Lock } from "lucide-react";

interface CourseTabsProps {
    lessonsCount: number;
    examsCount: number;
    homeworksCount: number;
    livesCount: number;
    leaderboardCount?: number;
    postsCount?: number;
    pendingPostsCount?: number;
    isSubscribed?: boolean;
}

export default function CourseTabs({
    lessonsCount,
    examsCount,
    homeworksCount,
    livesCount,
    leaderboardCount = 0,
    postsCount = 0,
    pendingPostsCount = 0,
    isSubscribed = true
}: CourseTabsProps) {
    const tabs = [
        { label: "الدروس", icon: Video, count: lessonsCount, showCount: true, requiresAuth: false },
        { label: "الامتحانات", icon: FileText, count: examsCount, showCount: true, requiresAuth: true },
        { label: "البث المباشر", icon: Calendar, count: livesCount, showCount: true, requiresAuth: true },
        { label: "الواجبات", icon: BookOpen, count: homeworksCount, showCount: true, requiresAuth: true },
        { label: "المنشورات", icon: MessageSquare, count: postsCount, showCount: true, requiresAuth: true },
        { label: "المنشورات المعلقة", icon: MessageSquare, count: pendingPostsCount, showCount: true, color: "red", requiresAuth: true },
        { label: "الاوائل", icon: BarChart2, count: leaderboardCount, showCount: true, requiresAuth: true },
    ];

    return (
        <Box position="relative" w="full">
            <Box overflowX="auto" pb="2px">
                <TabList
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    position="relative"
                    display="flex"
                    flexWrap="nowrap"
                    minW="fit-content"
                    px={0}
                >
                    {tabs.map((tab, index) => {
                        const isDisabled = tab.requiresAuth && !isSubscribed;
                        return (
                            <Tab
                                key={index}
                                px={4}
                                py={3}
                                color="gray.600"
                                _hover={{ color: "blue.800", bg: "gray.50" }}
                                _selected={{ color: "blue.600", bg: "blue.50", fontWeight: "bold" }}
                                borderRadius="md"
                                transition="all 0.2s"
                                isDisabled={isDisabled}
                                cursor={isDisabled ? "not-allowed" : "pointer"}
                                whiteSpace="nowrap"
                            >
                                <HStack spacing={2}>
                                    {isDisabled ? <Icon as={Lock} boxSize={4} /> : <Icon as={tab.icon} boxSize={4} />}
                                    <Text fontWeight="inherit">{tab.label}</Text>
                                    {tab.showCount && tab.count > 0 && (
                                        <Badge 
                                            colorScheme={tab.color || (isDisabled ? "gray" : "blue")} 
                                            variant="subtle" 
                                            borderRadius="full" 
                                            px={2}
                                            fontSize="xs"
                                        >
                                            {tab.count}
                                        </Badge>
                                    )}
                                </HStack>
                            </Tab>
                        );
                    })}
                </TabList>
                <TabIndicator mt="-1.5px" height="2px" bg="blue.600" borderRadius="1px" />
            </Box>
        </Box>
    );
}
