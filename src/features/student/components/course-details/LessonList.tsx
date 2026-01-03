import { Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, List, ListItem, HStack, Stack, Center, Badge, Icon, Flex, Box } from "@chakra-ui/react";
import { PlayCircle, Lock, Clock, FileText, CheckCircle, GraduationCap, PenTool, AlertCircle } from "lucide-react";
import { IStudentCourseSection } from "../../types";

interface LessonListProps {
    sections: IStudentCourseSection[]; 
    selectedContentId?: string;
    onContentClick: (content: any) => void;
    isSubscribed: boolean;
}

export default function LessonList({ sections, selectedContentId, onContentClick, isSubscribed }: LessonListProps) {
    if (!sections || sections.length === 0) {
        return (
            <Center py={12} bg="gray.50" borderRadius="lg">
                <Stack spacing={4} textAlign="center" align="center">
                    <Icon as={FileText} boxSize={12} color="gray.400" />
                    <Text color="gray.500">لا توجد محتويات حالياً</Text>
                </Stack>
            </Center>
        );
    }

    const getItemIcon = (type: string, isLocked: boolean, isCompleted: boolean) => {
        if (isLocked) return Lock;
        if (isCompleted) return CheckCircle;
        switch (type) {
            case 'exam': return GraduationCap;
            case 'homework': return PenTool;
            case 'lesson': default: return PlayCircle;
        }
    };

    const getItemColor = (type: string, isLocked: boolean, isCompleted: boolean, isSelected: boolean) => {
        if (isLocked) return "gray.500";
        if (isCompleted) return "green.500";
        if (isSelected) return "blue.500";
        if (type === 'exam') return "orange.500";
        return "gray.500";
    };

    const getItemBg = (type: string, isLocked: boolean, isCompleted: boolean, isSelected: boolean) => {
        if (isLocked) return "gray.100";
        if (isCompleted) return "green.100";
        if (isSelected) return "blue.100";
        if (type === 'exam') return "orange.100";
        return "gray.100";
    };

    return (
        <Accordion allowMultiple defaultIndex={[0]} bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm" border="1px" borderColor="gray.200">
            {sections.map((section) => {
                // Determine items source: Unified 'items' or legacy 'lessons'
                const items: any[] = (section.items && section.items.length > 0) ? section.items : (section.lessons || []);
                
                return (
                    <AccordionItem key={section._id} border="none" borderBottom="1px" borderColor="gray.100" _last={{ borderBottom: "none" }}>
                        <h2>
                            <AccordionButton _hover={{ bg: "gray.50" }} py={4}>
                                <HStack flex="1" textAlign="left" justify="space-between">
                                    <Text fontWeight="bold" fontSize="md">{section.name || section.title}</Text>
                                    <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                                        {items.length || 0}
                                    </Badge>
                                </HStack>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={0} px={0}>
                            <List spacing={0}>
                                {items.map((item: any) => {
                                    const isSelected = selectedContentId === item._id;
                                    // Locking logic: Backend should provide 'isLocked' in items. 
                                    // For legacy 'lessons', we use isSubscribed && !isFree.
                                    // If item has `isLocked` (from backend refactor), use it.
                                    // Otherwise fallback to basic subscription check.
                                    const explicitLock = item.isLocked; 
                                    const subscriptionLock = !isSubscribed && !item.isFree;
                                    const isLocked = explicitLock !== undefined ? explicitLock : subscriptionLock;

                                    const isCompleted = item.isCompleted || item.isPassed || item.isSubmitted;
                                    const isExam = item.type === 'exam';

                                    return (
                                        <ListItem
                                            key={item._id}
                                            p={4}
                                            cursor={isLocked ? "not-allowed" : "pointer"}
                                            bg={isSelected ? "blue.50" : (isExam ? "orange.50" : "white")} // Highlight exams slightly
                                            _hover={{ bg: isLocked ? "white" : (isSelected ? "blue.50" : "gray.50") }}
                                            onClick={() => !isLocked && onContentClick(item)}
                                            borderLeft={isSelected ? "4px solid" : "4px solid transparent"}
                                            borderColor={isSelected ? "blue.500" : "transparent"}
                                            transition="all 0.2s"
                                            opacity={isLocked ? 0.7 : 1}
                                        >
                                            <HStack spacing={3} align="start">
                                                <Center
                                                    boxSize="24px"
                                                    borderRadius="full"
                                                    bg={getItemBg(item.type || 'lesson', isLocked, isCompleted, isSelected)}
                                                    color={getItemColor(item.type || 'lesson', isLocked, isCompleted, isSelected)}
                                                    flexShrink={0}
                                                >
                                                    <Icon as={getItemIcon(item.type || 'lesson', isLocked, isCompleted)} boxSize={3.5} />
                                                </Center>
                                                
                                                <Stack spacing={1} flex="1">
                                                    <Flex justify="space-between" align="start">
                                                        <Text 
                                                            fontWeight={isSelected ? "bold" : "medium"} 
                                                            fontSize="sm" 
                                                            color={isSelected ? "blue.700" : "gray.700"}
                                                            noOfLines={2}
                                                        >
                                                            {item.title}
                                                        </Text>
                                                        {item.isFree && !isSubscribed && (
                                                            <Badge colorScheme="green" fontSize="xs" px={1.5}>مجاني</Badge>
                                                        )}
                                                         {isExam && item.isMandatory && (
                                                            <Badge colorScheme="red" fontSize="xs" px={1.5}>إلزامي</Badge>
                                                        )}
                                                    </Flex>
                                                    
                                                    <HStack fontSize="xs" color="gray.500">
                                                        {item.type === 'lesson' && (
                                                            <>
                                                                <Icon as={Clock} boxSize={3} />
                                                                <Text>{item.duration || 0} دقيقة</Text>
                                                            </>
                                                        )}
                                                        {item.type === 'exam' && (
                                                            <>
                                                                <Icon as={FileText} boxSize={3} />
                                                                <Text>{item.settings?.duration || 0} دقيقة</Text>
                                                                <Text mx={1}>|</Text>
                                                                <Text>{item.questionsCount || 0} سؤال</Text>
                                                            </>
                                                        )}
                                                    </HStack>
                                                </Stack>
                                            </HStack>
                                        </ListItem>
                                    );
                                })}
                                {!items.length && (
                                    <Text p={4} fontSize="sm" color="gray.400" textAlign="center" fontStyle="italic">
                                        لا توجد محتويات في هذا القسم
                                    </Text>
                                )}
                            </List>
                        </AccordionPanel>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
