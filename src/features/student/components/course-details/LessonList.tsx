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



    return (
        <Accordion allowMultiple defaultIndex={[0]} bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm" border="1px" borderColor="gray.200">
            {sections.map((section) => {
                // Determine items source: Unified 'items' or legacy 'lessons'
                // Filter to show ONLY lessons in the sidebar (Legacy Parity)
                const allItems: any[] = (section.items && section.items.length > 0) ? section.items : (section.lessons || []);
                const items = allItems.filter((i: any) => i.type === 'lesson' || !i.type);
                
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
                                            mb={2}
                                            cursor={isLocked ? "not-allowed" : "pointer"}
                                        >
                                            <Box
                                                as="button"
                                                w="100%"
                                                textAlign="start"
                                                onClick={() => !isLocked && onContentClick(item)}
                                                p={3}
                                                rounded="md" // rounded={5}
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

                                                    {/* Right side: Duration or Progress */}
                                                    <Stack align="end" spacing={0}>
                                                         {item.isFree && !isSubscribed && (
                                                            <Badge colorScheme="green" fontSize="xs" px={1.5} mb={1}>مجاني</Badge>
                                                        )}
                                                         {isExam && item.isMandatory && (
                                                            <Badge colorScheme="red" fontSize="xs" px={1.5} mb={1}>إلزامي</Badge>
                                                        )}
                                                        <HStack fontSize="xs" color="gray.500">
                                                            {item.type === 'lesson' && (
                                                                <Text>{item.duration || 0} دقيقة</Text>
                                                            )}
                                                             {item.type === 'exam' && (
                                                                <Text>{item.questionsCount || 0} سؤال</Text>
                                                            )}
                                                        </HStack>
                                                    </Stack>
                                                </HStack>

                                                {/* Lock Overlay */}
                                                {isLocked && (
                                                    <Center position="absolute" inset={0} bg="whiteAlpha.600" rounded="md">
                                                       <Badge colorScheme="orange" py={1} px={2} rounded="md" display="flex" alignItems="center" gap={1}>
                                                            <Icon as={Lock} boxSize={3} />
                                                            يجب الاشتراك
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
