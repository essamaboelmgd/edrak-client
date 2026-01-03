import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon as ChakraIcon,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Spacer,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useEffect, useMemo, useState } from "react";
import { studentService } from "@/features/student/services/studentService";

interface SubscriptionSelectorProps {
  courseId: string;
  coursePrice: number;
  courseFinalPrice: number;
  onChange: (state: {
    type: 'course' | 'section' | 'custom';
    selectedSection: string;
    selectedLessons: string[];
    price: number;
    isValid: boolean;
  }) => void;
}

export default function SubscriptionSelector({
  courseId,
  coursePrice,
  courseFinalPrice,
  onChange,
}: SubscriptionSelectorProps) {
  const [courseContent, setCourseContent] = useState<any>(null);
  const [subscriptionType, setSubscriptionType] = useState<'course' | 'section' | 'custom'>('course');
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Colors
  const activeBorderColor = "blue.500";
  const startColor = "blue.50";
  const hoverBorderColor = "blue.300";

  useEffect(() => {
    if (courseId) {
      setLoadingContent(true);
      studentService.getCourseContent(courseId)
        .then((data) => {
             setCourseContent(data);
             // Ensure legacy structure logic compatibility
        })
        .catch(console.error)
        .finally(() => setLoadingContent(false));
    }
  }, [courseId]);

  const sections = useMemo(() => courseContent?.months || [], [courseContent]);
  const lessons = useMemo(() => courseContent?.lessons || [], [courseContent]);

  const lessonsBySection = useMemo(() => {
    if (!sections.length || !lessons.length) return {};
    const grouped: Record<string, any[]> = {};
    sections.forEach((sec: any) => grouped[sec._id] = []);
    lessons.forEach((les: any) => {
        if (les.lessonSection && grouped[les.lessonSection]) {
            grouped[les.lessonSection].push(les);
        }
    });
    return grouped;
  }, [sections, lessons]);

  const computedPrice = useMemo(() => {
      if (subscriptionType === 'course') {
          return courseFinalPrice || coursePrice || 0;
      }
      if (subscriptionType === 'section') {
          const section = sections.find((s: any) => s._id === selectedSection);
          return section?.finalPrice || section?.price || 0;
      }
      if (subscriptionType === 'custom') {
          return lessons
            .filter((l: any) => selectedLessons.includes(l._id))
            .reduce((sum: number, l: any) => sum + (l.finalPrice || l.price || 0), 0);
      }
      return 0;
  }, [subscriptionType, selectedSection, selectedLessons, coursePrice, courseFinalPrice, sections, lessons]);

  useEffect(() => {
      const isValid = 
          (subscriptionType === 'course') ||
          (subscriptionType === 'section' && !!selectedSection) ||
          (subscriptionType === 'custom' && selectedLessons.length > 0);

      onChange({
          type: subscriptionType,
          selectedSection,
          selectedLessons,
          price: computedPrice,
          isValid
      });
  }, [subscriptionType, selectedSection, selectedLessons, computedPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const OptionCard = ({ type, title, icon, price, description }: any) => {
      const isActive = subscriptionType === type;
      return (
          <Box
              borderWidth="2px"
              borderColor={isActive ? activeBorderColor : "gray.200"}
              bg={isActive ? startColor : "white"}
              rounded="xl"
              p={4}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ borderColor: isActive ? activeBorderColor : hoverBorderColor }}
              onClick={() => setSubscriptionType(type)}
              position="relative"
              overflow="hidden"
          >
              {isActive && (
                  <Box position="absolute" top={0} right={0} bg={activeBorderColor} borderBottomLeftRadius="xl" px={2} py={0.5}>
                      <Icon icon="akar-icons:check" width={16} height={16} style={{ color: 'white' }} />
                  </Box>
              )}
              <VStack align="start" spacing={3}>
                  <HStack spacing={3}>
                      <Box p={2} bg={isActive ? "blue.100" : "gray.100"} rounded="lg" color={isActive ? "blue.600" : "gray.500"}>
                          <Icon icon={icon} width={24} height={24} />
                      </Box>
                      <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="md">{title}</Text>
                          <Text fontSize="xs" color="gray.500">{description}</Text>
                      </VStack>
                  </HStack>
                  {price !== undefined && (
                      <Badge colorScheme={isActive ? "blue" : "gray"} variant="solid" rounded="full" px={2}>
                          {price === 0 ? "مجاني" : `${price} ج.م`}
                      </Badge>
                  )}
              </VStack>
          </Box>
      );
  };

  return (
      <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>اختر نظام الاشتراك</Text>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
              <OptionCard 
                  type="course" 
                  title="الكورس كامل" 
                  description="شامل كل المحتوى" 
                  icon="ph:book-bookmark-fill"
                  price={courseFinalPrice || coursePrice}
              />
              <OptionCard 
                  type="section" 
                  title="قسم محدد" 
                  description="اختر قسم واحد فقط" 
                  icon="ph:bookmarks-simple-fill"
                  price={subscriptionType === 'section' && selectedSection ? computedPrice : undefined}
              />
              <OptionCard 
                  type="custom" 
                  title="دروس مختارة" 
                  description="حدد دروس معينة" 
                  icon="ph:list-checks-fill"
                  price={subscriptionType === 'custom' && selectedLessons.length > 0 ? computedPrice : undefined}
              />
          </SimpleGrid>

          <Box bg="gray.50" rounded="xl" p={4} borderWidth="1px" borderColor="gray.200" display={subscriptionType === 'course' ? 'none' : 'block'}>
              {subscriptionType === 'section' && (
                  <VStack align="stretch" spacing={3}>
                      <Text fontWeight="medium">اختر القسم:</Text>
                      <Select 
                          placeholder="-- اختر القسم --" 
                          bg="white" 
                          value={selectedSection} 
                          onChange={(e) => setSelectedSection(e.target.value)}
                          size="lg"
                      >
                          {sections.map((sec: any) => (
                              <option key={sec._id} value={sec._id}>
                                  {sec.title || sec.name} ({sec.finalPrice || sec.price} ج.م)
                              </option>
                          ))}
                      </Select>
                  </VStack>
              )}

              {subscriptionType === 'custom' && (
                  <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                          <Text fontWeight="medium">اختر الدروس:</Text>
                          <Badge colorScheme="blue">{selectedLessons.length} دروس محددة</Badge>
                      </HStack>
                      
                      <Accordion allowMultiple allowToggle bg="white" rounded="lg" shadow="sm">
                          {sections.map((sec: any) => (
                              <AccordionItem key={sec._id} border="none" mb={1}>
                                  <h2>
                                      <AccordionButton _expanded={{ bg: 'blue.50', color: 'blue.600' }} rounded="lg">
                                          <Box flex="1" textAlign="left" fontWeight="semibold">
                                              {sec.title || sec.name}
                                          </Box>
                                          <AccordionIcon />
                                      </AccordionButton>
                                  </h2>
                                  <AccordionPanel pb={4}>
                                      <VStack align="stretch" spacing={2}>
                                          {lessonsBySection[sec._id]?.map((lesson: any) => (
                                              <Checkbox 
                                                  key={lesson._id} 
                                                  isChecked={selectedLessons.includes(lesson._id)}
                                                  onChange={(e) => {
                                                      if (e.target.checked) {
                                                          setSelectedLessons([...selectedLessons, lesson._id]);
                                                      } else {
                                                          setSelectedLessons(selectedLessons.filter(id => id !== lesson._id));
                                                      }
                                                  }}
                                                  colorScheme="blue"
                                                  p={2}
                                                  rounded="md"
                                                  _hover={{ bg: "gray.50" }}
                                              >
                                                  <HStack w="full">
                                                      <Text fontSize="sm">{lesson.title}</Text>
                                                      <Spacer />
                                                      <Text fontSize="xs" fontWeight="bold" color="gray.500">
                                                          {lesson.finalPrice || lesson.price} ج.م
                                                      </Text>
                                                  </HStack>
                                              </Checkbox>
                                          ))}
                                          {(!lessonsBySection[sec._id] || lessonsBySection[sec._id].length === 0) && (
                                              <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>
                                                  لا توجد دروس في هذا القسم
                                              </Text>
                                          )}
                                      </VStack>
                                  </AccordionPanel>
                              </AccordionItem>
                          ))}
                      </Accordion>
                  </VStack>
              )}
          </Box>
      </Box>
  );
}
