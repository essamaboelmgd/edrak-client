import { Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, List, ListItem, HStack, Stack, Center, Badge, Icon, Flex } from "@chakra-ui/react";
import { PlayCircle, Lock, Clock, FileText, CheckCircle } from "lucide-react";
import { IStudentCourseSection, IStudentLesson } from "../../types";

interface LessonListProps {
    sections: IStudentCourseSection[]; // Assuming we map backend response to this structured format
    selectedLessonId?: string;
    onLessonClick: (lesson: IStudentLesson) => void;
    isSubscribed: boolean;
}

export default function LessonList({ sections, selectedLessonId, onLessonClick, isSubscribed }: LessonListProps) {
    if (!sections || sections.length === 0) {
        return (
            <Center py={12} bg="gray.50" borderRadius="lg">
                <Stack spacing={4} textAlign="center" align="center">
                    <Icon as={FileText} boxSize={12} color="gray.400" />
                    <Text color="gray.500">لا توجد دروس حالياً</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Accordion allowMultiple defaultIndex={[0]} bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm" border="1px" borderColor="gray.200">
            {sections.map((section) => (
                <AccordionItem key={section._id} border="none" borderBottom="1px" borderColor="gray.100" _last={{ borderBottom: "none" }}>
                    <h2>
                        <AccordionButton _hover={{ bg: "gray.50" }} py={4}>
                            <HStack flex="1" textAlign="left" justify="space-between">
                                <Text fontWeight="bold" fontSize="md">{section.name || section.title}</Text>
                                <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                                    {section.lessons?.length || 0}
                                </Badge>
                            </HStack>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={0} px={0}>
                        <List spacing={0}>
                            {section.lessons?.map((lesson) => {
                                const isSelected = selectedLessonId === lesson._id;
                                const isLocked = !isSubscribed && !lesson.isFree;
                                const isCompleted = false; // TODO: Add progress check

                                return (
                                    <ListItem
                                        key={lesson._id}
                                        p={4}
                                        cursor={isLocked ? "not-allowed" : "pointer"}
                                        bg={isSelected ? "blue.50" : "white"}
                                        _hover={{ bg: isLocked ? "white" : (isSelected ? "blue.50" : "gray.50") }}
                                        onClick={() => !isLocked && onLessonClick(lesson)}
                                        borderLeft={isSelected ? "4px solid" : "4px solid transparent"}
                                        borderColor={isSelected ? "blue.500" : "transparent"}
                                        transition="all 0.2s"
                                        opacity={isLocked ? 0.7 : 1}
                                    >
                                        <HStack spacing={3} align="start">
                                            <Center
                                                boxSize="24px"
                                                borderRadius="full"
                                                bg={isLocked ? "gray.100" : (isCompleted ? "green.100" : (isSelected ? "blue.100" : "gray.100"))}
                                                color={isLocked ? "gray.500" : (isCompleted ? "green.500" : (isSelected ? "blue.500" : "gray.500"))}
                                                flexShrink={0}
                                            >
                                                {isLocked ? <Icon as={Lock} boxSize={3.5} /> : 
                                                 isCompleted ? <Icon as={CheckCircle} boxSize={3.5} /> : 
                                                 <Icon as={PlayCircle} boxSize={3.5} />}
                                            </Center>
                                            
                                            <Stack spacing={1} flex="1">
                                                <Flex justify="space-between" align="start">
                                                    <Text 
                                                        fontWeight={isSelected ? "bold" : "medium"} 
                                                        fontSize="sm" 
                                                        color={isSelected ? "blue.700" : "gray.700"}
                                                        noOfLines={2}
                                                    >
                                                        {lesson.title}
                                                    </Text>
                                                    {lesson.isFree && (
                                                        <Badge colorScheme="green" fontSize="xs" px={1.5}>مجاني</Badge>
                                                    )}
                                                </Flex>
                                                
                                                <HStack fontSize="xs" color="gray.500">
                                                    <Icon as={Clock} boxSize={3} />
                                                    <Text>{lesson.duration || 0} دقيقة</Text>
                                                </HStack>
                                            </Stack>
                                        </HStack>
                                    </ListItem>
                                );
                            })}
                            {!section.lessons?.length && (
                                <Text p={4} fontSize="sm" color="gray.400" textAlign="center" fontStyle="italic">
                                    لا توجد دروس في هذا القسم
                                </Text>
                            )}
                        </List>
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
