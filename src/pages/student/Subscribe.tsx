import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Divider,
  FormControl,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  List,
  ListItem,
  Spacer,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { Form, Formik } from "formik";
import moment from "moment";
import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useCourseDetails } from "@/features/student/hooks/useStudentCourses";
import { studentService } from "@/features/student/services/studentService";
import { useAuth } from "@/contexts/AuthContext";
import DisplayPrice from "@/features/student/components/DisplayPrice";
import { getImageUrl } from "@/lib/axios";
import SubscriptionSelector from "@/features/student/components/SubscriptionSelector";

import { axiosInstance } from "@/lib/axios";
import currency from "@/lib/currency";

export default function Subscribe() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();

  const { data: course, isLoading, isError } = useCourseDetails(courseId || "");
  const initialState = location.state || {};
  
  const [subscriptionType, setSubscriptionType] = useState<'course' | 'section' | 'custom'>(initialState.type || 'course');
  const [selectedSection, setSelectedSection] = useState<string>(initialState.selectedSection || "");
  const [selectedLessons, setSelectedLessons] = useState<string[]>(initialState.selectedLessons || []);
  const [computedPrice, setComputedPrice] = useState<number>(0); // Received from selector
  
  const [disabled, setDisabled] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [isApplied, setIsApplied] = useState(false);
  const [discountDetails, setDiscountDetails] = useState<any>(null);
  const [applyDisabled, setApplyDisabled] = useState(false);

  const rules = [
    "قبل البدء في الاشتراك قم بتحديث البيانات الشخصية اولأ مثل البريد الالكتروني, رقم الموبايل, المحافظة والمدينة والمستوى التعليمي",
    "في حالة اختيارك الدفع بواسطة فودافون كاش يجب ادخال رقم صحيح لاكمال الاشتراك بنجاح",
    "في حالة كنت تريد استخدام الكاش بك تأكد من وجود رصيد كافي في المحفظة اولًا",
    "يمكن الاشتراك من هنا وتحديد الدفع من خلال السنتر واستكمال الامور المالية من خلال الادمن او يمكنك التواصل مع الادارة لانشاء الاشتراك نيابة عنك .",
    "اذا كان لديك كود خصم يمكنك استخدام والتحقق منه اولا قبل الاشتراك للتفعيل اثناء الاشتراك",
  ];

  async function applyCode(code: string, _course_id: string) {
    if (!code) return;
    try {
      setApplyDisabled(true);
      
      // Determine target info for coupon validation
      let targetType = 'course';
      let targetId = _course_id;
      
      if (subscriptionType === 'section') {
         // Some coupons might targeted to specific section?
         // For now, if we use granular, we might need to check if backend supports it.
         // If coupon is 'course' wide, it might not validate against 'courseSection'.
         // Let's try to pass 'course' if it fails?
         // Safer: Pass actual type. If coupon is generic, backend should handle.
         targetType = 'lessonSection'; // API expects 'lessonSection' for 'months'
         targetId = selectedSection;
      } else if (subscriptionType === 'custom') {
         // Multiple lessons. Validate against Course but verify price?
         // Or pass 'course' and rely on discount amount capping?
         targetType = 'course'; 
      }
      
      const { data } = await axiosInstance.post('/coupons/validate', {
          code,
          targetType,
          targetId,
          price: computedPrice
      });

      if (data.success) {
          setIsApplied(true);
          setDiscountDetails(data.data);
          toast({ status: "success", description: "تم تفعيل الكوبون بنجاح" });
      }
      
    } catch (error: any) {
      setIsApplied(false);
      setDiscountDetails(null);
      toast({ status: "error", description: error.response?.data?.message || "كوبون غير صالح" });
    } finally {
      setApplyDisabled(false);
    }
  }

  const handleSubscribe = async (values: any) => {
      try {
          // Validation
          if (subscriptionType === 'section' && !selectedSection) {
              toast({ status: "warning", description: "يرجى اختيار القسم المطلوب" });
              return;
          }
          if (subscriptionType === 'custom' && selectedLessons.length === 0) {
              toast({ status: "warning", description: "يرجى اختيار درس واحد على الأقل" });
              return;
          }

          setDisabled(true);
          
          let paymentMethod = 'wallet';
          if (values.type === 'in-center') paymentMethod = 'center_payment';
          else if (values.type === 'paymob') paymentMethod = 'online';
          
          const couponToUse = isApplied ? discountCode : undefined;

          if (subscriptionType === 'course') {
               await studentService.subscribeToCourse(courseId!, paymentMethod, couponToUse);
          } else if (subscriptionType === 'section') {
               await studentService.subscribeToLessonSection(selectedSection, paymentMethod);
          } else if (subscriptionType === 'custom') {
              if (selectedLessons.length === 1) {
                  await studentService.subscribeToLesson(selectedLessons[0], paymentMethod);
              } else {
                  await studentService.subscribeToMultipleLessons(courseId!, selectedLessons, paymentMethod);
              }
          }
          
          toast({ status: "success", description: "تم الاشتراك بنجاح" });
          navigate("/student/courses");
          
      } catch (error: any) {
          toast({ status: "error", description: error.response?.data?.message || "فشل الاشتراك" });
      } finally {
          setDisabled(false);
      }
  };

  if (isLoading) return <Center h="50vh"><Text>جار التحميل...</Text></Center>;
  if (isError || !course) return <Center h="50vh"><Text>خطأ في تحميل الكورس</Text></Center>;

  return (
    <Container p={4} maxW={992} mt={8}>
      <Card rounded={10} bg="white" boxShadow="sm">
        <CardBody p={4}>
          <Formik
            initialValues={{
              type: "in-center",
              mobile: (user as any)?.mobile || "",
            }}
            onSubmit={handleSubscribe}
          >
            {({ values, handleChange }) => (
              <Form>
                <Stack flexDir={{ base: "column", xl: "row" }} spacing={6}>
                  {/* Payment Info Left Sidebar */}
                  <Stack spacing={4} bg="gray.50" rounded={8} w={{ base: "100%", xl: 400 }} flexShrink={0} pb={4}>
                    <Box bg="teal.500" roundedTop={8} px={4} pt={6} pb={14}>
                      <Center bg="teal.600" w={65} h={65} rounded={999} color="white" mx="auto">
                        <Icon icon="game-icons:take-my-money" width={36} height={36} />
                      </Center>
                      <Stack mt={4}>
                        <Text textAlign="center" color="white" fontWeight="semibold" fontSize="large">
                          اكتر من طريقة دفع  
                        </Text>
                        <Text textAlign="center" color="white" fontSize="medium">
                          تقدر تدفع من خلال فودافون كاش او انك تحجز الكورس وتدفع الاشتراك في السنتر وغير كده كمان تقدر تدفع من خلال الكاش بك !
                        </Text>
                      </Stack>
                    </Box>

                    {/* Course Mini Card */}
                    <Box boxShadow="lg" mx="auto" p={1.5} pe={4} w={340} rounded={9999} mt={-12} bg="white">
                      <HStack>
                        <Image
                          src={getImageUrl(typeof course.poster === 'string' ? course.poster : course.poster?.url)}
                          fallbackSrc="/placeholder.png"
                          w={45} height={45} rounded={999} border="1px" borderColor="gray.200" flexShrink={0}
                        />
                        <Box>
                          <Text noOfLines={1} color="GrayText" fontSize="small">
                            {course.title}
                          </Text>
                          <Box fontWeight="bold" fontSize={14}>
                            <DisplayPrice
                              price={isApplied && discountDetails ? discountDetails.finalPrice : computedPrice}
                              originPrice={subscriptionType === 'course' ? course.price : computedPrice}
                            />
                          </Box>
                        </Box>
                        <Spacer />
                        <Text as={Link} to="/student/courses" color="blue.500" textDecoration="underline" flexShrink={0} fontSize="small" fontWeight="medium">
                          تصفح الكورسات
                        </Text>
                      </HStack>
                    </Box>

                    <List px={4} spacing={2}>
                      {rules.map((item, index) => (
                        <ListItem key={index}>
                          <HStack>
                            <Box color="teal" flexShrink={0}>
                                <Icon icon="akar-icons:check-box-fill" width={24} height={24} />
                            </Box>
                            <Text fontSize={14} color="GrayText">{item}</Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider />
                    
                    {/* Lessons Avatars */}
                     <HStack px={4}>
                        <AvatarGroup max={2} size="sm">
                             {/* Placeholder for lesson avatars since explicit list isn't always in summary */}
                             <Avatar name="L 1" bg="blue.500" />
                             <Avatar name="L 2" bg="blue.500" />
                        </AvatarGroup>
                        <Text fontWeight="medium" color="GrayText" fontSize="smaller">الدروس</Text>
                        <Spacer />
                        <HStack fontWeight="medium" color="GrayText" fontSize="smaller" as={Text}>
                            <span>{moment(course.updatedAt).format("lll")}</span>
                            <Icon icon="solar:clock-square-bold" width={20} height={20} />
                        </HStack>
                     </HStack>

                  </Stack>

                  <Stack flex={1}>
                      <HStack mb={2}>
                          <IconButton as={Link} to={`/student/courses/${courseId}`} aria-label="back" rounded={999} size="sm" icon={<Icon icon="solar:arrow-right-linear" width={20} height={20} />} />
                          <Heading as="h3" fontSize="medium" fontWeight="medium">{course.title}</Heading>
                      </HStack>

                      {/* Subscription Selector Component */}
                      <SubscriptionSelector 
                          courseId={courseId!}
                          coursePrice={course.price}
                          courseFinalPrice={course.finalPrice}
                          onChange={(state) => {
                              setSubscriptionType(state.type);
                              setSelectedSection(state.selectedSection);
                              setSelectedLessons(state.selectedLessons);
                              setComputedPrice(state.price);
                              
                              if (state.type !== subscriptionType) {
                                  setIsApplied(false);
                                  setDiscountDetails(null);
                                  setDiscountCode("");
                              }
                          }}
                      />
                      
                      <Divider mb={4} mt={4} />

                      {/* Payment Methods */}
                      <Box>
                          <input type="radio" id="in-center" name="type" value="in-center" onChange={handleChange} hidden checked={values.type === 'in-center'} />
                          <HStack as="label" htmlFor="in-center" rounded={10} bg={values.type === "in-center" ? "blue.50" : "white"} border="1px" borderColor={values.type === "in-center" ? "blue.500" : "gray.200"} w="100%" p={2} cursor="pointer">
                              <Center w={35} h={35} rounded={999} bg={values.type === "in-center" ? "blue.100" : "gray.100"}>
                                  <Icon icon="fluent:globe-location-20-filled" width={20} height={20} />
                              </Center>
                              <Text fontWeight="medium" fontSize={14}>الدفع من خلال السنتر</Text>
                          </HStack>
                      </Box>

                      <Box>
                          <input type="radio" id="wallet" name="type" value="wallet" onChange={handleChange} hidden checked={values.type === 'wallet'} />
                          <HStack as="label" htmlFor="wallet" rounded={10} bg={values.type === "wallet" ? "blue.50" : "white"} border="1px" borderColor={values.type === "wallet" ? "blue.500" : "gray.200"} w="100%" p={2} cursor="pointer">
                              <Center w={35} h={35} rounded={999} bg={values.type === "wallet" ? "blue.100" : "gray.100"}>
                                  <Icon icon="solar:wallet-money-bold" width={20} height={20} />
                              </Center>
                              <Text fontWeight="medium" fontSize={14}>الدفع من خلال المحفظة</Text>
                              <Spacer />
                              <Badge colorScheme="red" px={2} py={1} rounded={999}>
                                  {currency((user as any)?.wallet || 0)}
                              </Badge>
                          </HStack>
                      </Box>

                      <Box>
                          <input type="radio" id="paymob" name="type" value="paymob" onChange={handleChange} hidden checked={values.type === 'paymob'} />
                          <HStack as="label" htmlFor="paymob" rounded={10} bg={values.type === "paymob" ? "blue.50" : "white"} border="1px" borderColor={values.type === "paymob" ? "blue.500" : "gray.200"} w="100%" p={2} cursor="pointer">
                              <Center w={35} h={35} rounded={999} bg={values.type === "paymob" ? "blue.100" : "gray.100"}>
                                  <Icon icon="mage:mobile-phone" width={20} height={20} />
                              </Center>
                              <Text fontWeight="medium" fontSize={14}>الدفع أونلاين (فودافون كاش / Paymob)</Text>
                          </HStack>
                      </Box>

                      {values.type === 'paymob' && (
                          <FormControl>
                              <InputGroup>
                                  <InputLeftAddon px={3}><Icon icon="mage:mobile-phone" width={24} height={24} /></InputLeftAddon>
                                  <Input type="tel" placeholder="010** *** ***" name="mobile" value={values.mobile} onChange={handleChange} required />
                              </InputGroup>
                          </FormControl>
                      )}

                      <HStack my={2}>
                          <Divider />
                          <Text flexShrink={0} fontSize="small" fontWeight="medium" color="GrayText">معاك خصم؟</Text>
                          <Divider />
                      </HStack>
                      
                      <HStack>
                          <InputGroup>
                            <InputLeftAddon px={3}><Icon icon="iconamoon:discount-light" width={24} height={24} /></InputLeftAddon>
                            <Input placeholder="كود الخصم" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} isDisabled={isApplied} />
                          </InputGroup>
                          <Button onClick={() => applyCode(discountCode, courseId!)} isDisabled={!discountCode || isApplied || applyDisabled} colorScheme={isApplied ? "green" : "teal"} isLoading={applyDisabled}>
                              {isApplied ? "تم التفعيل" : "تحقق"}
                          </Button>
                      </HStack>
                      {discountDetails && (
                          <Box mt={2} p={2} bg="green.50" border="1px" borderColor="green.200" rounded={5}>
                              <HStack justifyContent="space-between">
                                  <Text fontSize="sm" color="green.700">تم تطبيق كوبون خصم!</Text>
                                  <Text fontSize="sm" fontWeight="bold" color="green.700">
                                      - {discountDetails.discountAmount} ج.م
                                  </Text>
                              </HStack>
                              <HStack justifyContent="space-between" mt={1}>
                                  <Text fontSize="sm" color="green.800">السعر النهائي:</Text>
                                  <Text fontSize="md" fontWeight="bold" color="green.800">
                                      {discountDetails.finalPrice} ج.م
                                  </Text>
                              </HStack>
                          </Box>
                      )}

                       <Divider mt={4} />
                       <Button type="submit" size="md" colorScheme="blue" fontWeight="medium" rounded={3} w="full" mt={4} isLoading={disabled}>
                           اشترك الان
                       </Button>

                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </Container>
  );
}
