import { Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, List, ListItem, HStack, Stack, Center, Badge, Icon, Box } from "@chakra-ui/react";
import { PlayCircle, Lock, FileText, CheckCircle, GraduationCap, PenTool } from "lucide-react";
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

    // Sequential Locking Calculation
    // We need to determine which items are locked because a previous mandatory item is incomplete.
    let isGlobalSequenceLocked = false;
    // Helper to check if an item should trigger a lock for future items
    const checkIsMandatoryAndIncomplete = (item: any) => {
        // Mandatory condition: Check settings for requireAll (Exam) or equivalent
        const settings = item.settings || {};
        const isMandatory = item.isMandatory || settings.requireAll || settings.requiredBeforeNextLesson;
        const isCompleted = item.isCompleted || item.isPassed || item.isSubmitted;
        return isMandatory && !isCompleted;
    };

    return (
        <Accordion allowMultiple defaultIndex={[0]} bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm" border="1px" borderColor="gray.200">
            {sections.map((section) => {
                // Determine items source
                const allItems: any[] = (section.items && section.items.length > 0) ? section.items : (section.lessons || []);
                // Keep all items for display
                const items = allItems;
                
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
                                {allItems.map((item: any) => {
                                    // 1. Checks current lock state for this item
                                    const sequenceLocked = isGlobalSequenceLocked;
                                    
                                    // 2. Check if this item triggers a lock for FUTURE items
                                    if (checkIsMandatoryAndIncomplete(item)) {
                                        isGlobalSequenceLocked = true;
                                    }

                                    // 3. Render all items
                                    // if (item.type !== 'lesson' && item.type) return null;

                                    // Determine lock status
                                    // User requested to make everything open by default and ONLY lock based on sequence
                                    
                                    // STRICT SEQUENTIAL LOCKING ONLY as per user request
                                    // We ignore explicitLock and subscriptionLock for the 'isLocked' state to ensure
                                    // we only lock subsequent items if a mandatory item is incomplete.
                                    const isLocked = sequenceLocked;

                                    const isSelected = selectedContentId === item._id;
                                    const isCompleted = item.isCompleted || item.isPassed || item.isSubmitted;
                                    const isMandatory = item.isMandatory || item.settings?.requireAll || item.settings?.requiredBeforeNextLesson;

                                    return (
                                        <ListItem
                                            key={item._id}
                                            mb={2}
                                            cursor={isLocked ? "not-allowed" : "pointer"}
                                        >
                                            <Box
                                                as="button"
                                                w="100%"
                                                textAlign="start"
                                                onClick={() => !isLocked && onContentClick(item)}
                                                p={3}
                                                rounded="md"
                                                bg={isSelected ? "blue.50" : "gray.50"}
                                                border={isSelected ? "2px solid" : "1px solid"}
                                                borderColor={isSelected ? "blue.300" : "gray.300"}
                                                _hover={{ bg: isLocked ? "gray.50" : (isSelected ? "blue.50" : "gray.100") }}
                                                transition="all 0.2s"
                                                position="relative"
                                                opacity={isLocked ? 0.7 : 1}
                                            >
                                                <HStack spacing={3} align="center">
                                                    <Box
                                                       color={isSelected ? "blue.500" : "gray.500"}
                                                    >
                                                        <Icon as={getItemIcon(item.type || 'lesson', isLocked, isCompleted)} boxSize={6} />
                                                    </Box>
                                                    
                                                    <Text 
                                                        fontWeight="medium" 
                                                        fontSize="sm" 
                                                        color="gray.800"
                                                        noOfLines={1}
                                                        flex={1}
                                                    >
                                                        {item.title}
                                                    </Text>

                                                    <Stack align="end" spacing={0}>
                                                         {item.isFree && !isSubscribed && !isLocked && (
                                                            <Badge colorScheme="green" fontSize="xs" px={1.5} mb={1}>مجاني</Badge>
                                                        )}
                                                         {/* Show mandatory badge for any mandatory item */}
                                                         {isMandatory && (
                                                            <Badge colorScheme="red" fontSize="xs" px={1.5} mb={1}>إلزامي</Badge>
                                                        )}
                                                        <HStack fontSize="xs" color="gray.500">
                                                            {item.type === 'lesson' && (
                                                                <Text>{item.duration || 0} دقيقة</Text>
                                                            )}
                                                             {item.type === 'exam' && (
                                                                <Text>{item.questionsCount || item.questions?.length || 0} سؤال</Text>
                                                            )}
                                                             {item.type === 'homework' && (
                                                                <Text>{item.totalPoints || 0} درجة</Text>
                                                            )}
                                                        </HStack>
                                                    </Stack>
                                                </HStack>

                                                {isLocked && (
                                                    <Center position="absolute" inset={0} bg="whiteAlpha.600" rounded="md">
                                                       <Badge colorScheme="orange" py={1} px={2} rounded="md" display="flex" alignItems="center" gap={1}>
                                                            <Icon as={Lock} boxSize={3} />
                                                            أكمل السابق أولاً
                                                       </Badge>
                                                    </Center>
                                                )}
                                            </Box>
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
