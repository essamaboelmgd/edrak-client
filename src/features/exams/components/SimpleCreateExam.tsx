import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Select,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import examService from "@/features/teacher/services/examService";
import courseService from "@/features/teacher/services/courseService";
import { ICreateExamRequest } from "@/types/exam.types";
import { useQuery } from "@tanstack/react-query";

interface SimpleCreateExamProps {
  onSuccess?: () => void;
}

export default function SimpleCreateExam({ onSuccess }: SimpleCreateExamProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [disabled, setDisabled] = useState<boolean>(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<ICreateExamRequest>>({
    title: '',
    description: '',
    examType: 'general',
    contentType: 'questions',
    settings: {
      duration: 0,
      passingScore: 50,
      showResults: false,
      showCorrectAnswers: false,
      allowRetake: false,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleAnswers: false,
      requireAll: true,
    },
  });

  const { data: coursesData } = useQuery({
    queryKey: ['myCourses'],
    queryFn: () => courseService.getMyCourses({ limit: 100 }),
  });

  const { data: lessonsData } = useQuery({
    queryKey: ['courseLessons', formData.course],
    queryFn: () => courseService.getCourseLessons(formData.course!),
    enabled: !!formData.course,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: e.target.checked,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        status: "error",
        description: "العنوان مطلوب",
      });
      return;
    }

    try {
      setDisabled(true);
      const response = await examService.createExam(formData as ICreateExamRequest);
      const examId = response.data.exam._id;

      toast({
        status: "success",
        description: "تم إنشاء الامتحان بنجاح",
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to exam details page
      if (examId) {
        navigate(`/teacher/exams/${examId}`, { replace: true });
      }
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ أثناء إنشاء الامتحان",
      });
    } finally {
      setDisabled(false);
    }
  };

  return (
    <>
      <Button
        alignItems="center"
        size="sm"
        colorScheme="teal"
        rounded={2}
        onClick={onOpen}
        gap={1.5}
        fontWeight="medium"
      >
        <Text>اضافة امتحان جديد</Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>اضافة امتحان جديد</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <Stack>
                  <FormControl>
                    <FormLabel>
                      العنوان
                      <Text color="red" display="inline">
                        *
                      </Text>
                    </FormLabel>
                    <Textarea
                      placeholder="..."
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      maxLength={255}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>الوصف</FormLabel>
                    <Textarea
                      placeholder="..."
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>الكورس</FormLabel>
                    <Select 
                      placeholder="اختر الكورس" 
                      name="course" 
                      value={formData.course} 
                      onChange={handleInputChange}
                    >
                      {coursesData?.data?.courses?.map((course: any) => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                      ))}
                    </Select>
                  </FormControl>

                  {formData.course && (
                    <FormControl>
                      <FormLabel>الدرس (اختياري)</FormLabel>
                      <Select 
                        placeholder="اختر الدرس" 
                        name="lesson" 
                        value={formData.lesson} 
                        onChange={handleInputChange}
                      >
                        {lessonsData?.data?.lessons?.map((lesson: any) => (
                          <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <FormControl>
                    <Stack direction="row" alignItems="center">
                      <Switch
                        name="settings.shuffleQuestions"
                        isChecked={formData.settings?.shuffleQuestions}
                        onChange={handleSwitchChange('settings.shuffleQuestions')}
                      />
                      <FormLabel m={0}>خلط الأسئلة</FormLabel>
                    </Stack>
                  </FormControl>

                  <FormControl>
                    <Stack direction="row" alignItems="center">
                      <Switch
                        name="settings.showCorrectAnswers"
                        isChecked={formData.settings?.showCorrectAnswers}
                        onChange={handleSwitchChange('settings.showCorrectAnswers')}
                      />
                      <FormLabel m={0}>عرض الإجابة الصحيحة</FormLabel>
                    </Stack>
                  </FormControl>

                  <FormControl>
                    <Stack direction="row" alignItems="center">
                      <Switch
                        name="settings.showResults"
                        isChecked={formData.settings?.showResults}
                        onChange={handleSwitchChange('settings.showResults')}
                      />
                      <FormLabel m={0}>عرض نتيجة الامتحان</FormLabel>
                    </Stack>
                  </FormControl>

                  <FormControl>
                    <Stack direction="row" alignItems="center">
                      <Switch
                        name="hasDuration"
                        isChecked={(formData.settings?.duration || 0) > 0}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings!,
                              duration: e.target.checked ? 30 : 0,
                            },
                          }));
                        }}
                      />
                      <FormLabel m={0}>اضافة وقت الامتحان</FormLabel>
                    </Stack>
                  </FormControl>

                  {(formData.settings?.duration || 0) > 0 && (
                    <FormControl>
                      <FormLabel>مدة الامتحان (بالدقائق)</FormLabel>
                      <Input
                        type="number"
                        placeholder="30"
                        required
                        name="duration"
                        value={formData.settings?.duration}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings!,
                              duration: Number(e.target.value),
                            },
                          }));
                        }}
                      />
                    </FormControl>
                  )}
                </Stack>
              </Stack>
              <Center p={6}>
                <Button
                  colorScheme="teal"
                  mr={3}
                  width={250}
                  maxW="100%"
                  m="auto"
                  size="lg"
                  fontSize="small"
                  type="submit"
                  isDisabled={disabled}
                  isLoading={disabled}
                >
                  حفظ
                </Button>
              </Center>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

