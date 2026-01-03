import { HStack, Text, Badge, Tabs, TabList, Tab, TabIndicator, Box, SimpleGrid, useBreakpointValue, Icon } from "@chakra-ui/react";
import { Video, FileText, Radio, BookOpen, MessageCircle, BarChart2 } from "lucide-react";

interface CoursePlayerTabsProps {
    activeTab: number;
    setActiveTab: (index: number) => void;
    lessonsCount: number;
    examsCount: number;
    homeworksCount: number;
    livesCount: number;
    leaderboardCount?: number;
    postsCount?: number;
}

export default function CoursePlayerTabs({
    activeTab,
    setActiveTab,
    lessonsCount,
    examsCount,
    homeworksCount,
    livesCount,
    leaderboardCount = 0,
    postsCount = 0
}: CoursePlayerTabsProps) {
    const isMobile = useBreakpointValue({ base: true, md: false });
    
    // Filter out homework exams from the general exams count
    const filteredExamsCount = examsCount;
    
    const tabs = [
        { 
            icon: Video, 
            label: "الدروس", 
            count: lessonsCount, 
            color: "#56805b" 
        },
        { 
            icon: FileText, 
            label: "الامتحانات", 
            count: filteredExamsCount, 
            color: "#dd6b35" 
        },
        { 
            icon: Radio, 
            label: "البث المباشر", 
            count: livesCount, 
            color: "#20365d" 
        },
        { 
            icon: BookOpen, 
            label: "الواجبات", 
            count: homeworksCount, 
            color: "#dd6b35" 
        },
        { 
            icon: MessageCircle, 
            label: "المنشورات", 
            count: postsCount, 
            color: "#56805b" 
        },
        { 
            icon: BarChart2, 
            label: "الاوائل", 
            count: leaderboardCount, 
            color: "#20365d" 
        }
    ];

    return (
        <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" position="relative">
            {isMobile ? (
                <TabList
                    borderBottom="2px solid"
                    borderColor="gray.100"
                    position="relative"
                    p={2}
                >
                    <SimpleGrid columns={2} spacing={2} w="100%">
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                px={3}
                                py={2}
                                color="gray.600"
                                _hover={{ color: "gray.800" }}
                                _selected={{ color: tab.color }}
                                bg="transparent"
                                borderRadius="md"
                                position="relative"
                                whiteSpace="nowrap"
                                minW="max-content"
                                transition="all 0.2s ease"
                                fontWeight={activeTab === index ? "bold" : "medium"}
                                justifyContent="flex-start"
                            >
                                <HStack spacing={2} justify="center">
                                    <Icon as={tab.icon} width="20px" height="20px" />
                                    <Text fontSize="sm">
                                        {tab.label}
                                    </Text>
                                    <Badge 
                                        bg={tab.color}
                                        color="#fefffe"
                                        borderRadius="full"
                                        px={2}
                                        py={0.5}
                                    >
                                        {tab.count}
                                    </Badge>
                                </HStack>
                                {activeTab === index && (
                                    <Box 
                                        position="absolute" 
                                        right="0" 
                                        top="0" 
                                        bottom="0" 
                                        width="3px" 
                                        bg={tab.color}
                                        borderRadius="full"
                                    />
                                )}
                            </Tab>
                        ))}
                    </SimpleGrid>
                </TabList>
            ) : (
                <TabList
                    borderBottom="2px solid"
                    borderColor="gray.100"
                    position="relative"
                    display="flex"
                    flexWrap="nowrap"
                    overflowX="auto"
                    overflowY="hidden"
                    pb={1}
                    sx={{
                        scrollbarWidth: "none",
                        "::-webkit-scrollbar": {
                            display: "none"
                        }
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            px={4}
                            py={3}
                            color="gray.600"
                            _hover={{ color: "gray.800" }}
                            _selected={{ color: tab.color }}
                            bg="transparent"
                            borderRadius="md"
                            position="relative"
                            flex="none"
                            whiteSpace="nowrap"
                            minW="max-content"
                            transition="all 0.2s ease"
                            fontWeight={activeTab === index ? "bold" : "medium"}
                        >
                            <HStack spacing={2} justify="center">
                                <Icon as={tab.icon} width="20px" height="20px" />
                                <Text fontSize="md">
                                    {tab.label}
                                </Text>
                                <Badge 
                                    bg={tab.color}
                                    color="#fefffe"
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                >
                                    {tab.count}
                                </Badge>
                            </HStack>
                            {activeTab === index && (
                                <Box 
                                    position="absolute" 
                                    bottom="-2px" 
                                    left="0" 
                                    right="0" 
                                    height="3px" 
                                    bg={tab.color}
                                    borderRadius="full"
                                />
                            )}
                        </Tab>
                    ))}
                </TabList>
            )}
            <TabIndicator mt="-1.5px" height="2px" bg="transparent" borderRadius="0" />
        </Tabs>
    );
}
