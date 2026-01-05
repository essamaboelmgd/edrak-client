import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  HStack,
  VStack,
  Box,
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Image,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useForm, Controller } from 'react-hook-form';
import examService from '@/features/exams/examService';
import { axiosInstance } from '@/lib/axios';

interface UpdateQuestionProps {
  question: any;
  examId: string;
  onSuccess: () => void;
}

interface QuestionFormData {
  question: string;
  questionType: 'mcq' | 'true_false';
  answers: Array<{ text: string; isCorrect: boolean; order: number }>;
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation: string;
  imageUrl: string;
}

export default function UpdateQuestion({ question, examId, onSuccess }: UpdateQuestionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue, reset } = useForm<QuestionFormData>({
    defaultValues: {
      question: question?.question || '',
      questionType: question?.questionType || 'mcq',
      answers: question?.answers || [
        { text: '', isCorrect: false, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
        { text: '', isCorrect: false, order: 4 },
      ],
      correctAnswer: question?.correctAnswer || '',
      difficulty: question?.difficulty || 'medium',
      points: question?.points || 1,
      explanation: question?.explanation || '',
      imageUrl: question?.imageUrl || '',
    },
  });

  const questionType = watch('questionType');
  const answers = watch('answers');
  const difficulty = watch('difficulty');

  useEffect(() => {
    if (question) {
      reset({
        question: question?.question || '',
        questionType: question?.questionType || 'mcq',
        answers: question?.answers || [
          { text: '', isCorrect: false, order: 1 },
          { text: '', isCorrect: false, order: 2 },
          { text: '', isCorrect: false, order: 3 },
          { text: '', isCorrect: false, order: 4 },
        ],
        correctAnswer: question?.correctAnswer || '',
        difficulty: question?.difficulty || 'medium',
        points: question?.points || 1,
        explanation: question?.explanation || '',
        imageUrl: question?.imageUrl || '',
      });
      if (question?.imageUrl) {
        setImagePreview(question.imageUrl);
      }
    }
  }, [question, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: 'خطأ',
          description: 'الرجاء اختيار ملف صورة',
          status: 'error',
        });
      }
    }
  };

  const onSubmit = async (values: QuestionFormData) => {
    try {
      setLoading(true);

      let imageUrl = values.imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await axiosInstance.post('/uploads/question-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        imageUrl = uploadResponse.data.url || uploadResponse.data.data?.url || '';
      }

      const questionData = {
        question: values.question,
        questionType: values.questionType,
        answers: values.questionType === 'mcq' ? values.answers : [
          { text: 'صحيح', isCorrect: true, order: 1 },
          { text: 'خطأ', isCorrect: false, order: 2 },
        ],
        correctAnswer: values.correctAnswer || (values.questionType === 'true_false' ? 'صحيح' : ''),
        difficulty: values.difficulty,
        points: values.points,
        explanation: values.explanation || undefined,
        imageUrl: imageUrl || undefined,
      };

      await examService.updateQuestion(question._id, questionData);

      toast({
        title: 'نجح',
        description: 'تم تحديث السؤال بنجاح',
        status: 'success',
      });
      onClose();
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث السؤال',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        colorScheme="blue"
        fontWeight="medium"
        gap={2}
        borderRadius="lg"
        onClick={onOpen}
        leftIcon={<Icon icon="solar:pen-bold-duotone" width="16" height="16" />}
      >
        تعديل
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden">
          <ModalHeader
            bg="blue.50"
            borderBottom="1px"
            borderColor="gray.200"
            p={5}
          >
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                borderRadius="lg"
                bg="blue.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon
                  icon="solar:pen-bold-duotone"
                  width="24"
                  height="24"
                  style={{ color: 'var(--chakra-colors-blue-600)' }}
                />
              </Box>
              <Box fontSize="xl" fontWeight="bold" color="gray.800">
                تعديل السؤال
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody p={6} maxH="80vh" overflowY="auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={5} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                    العنوان
                  </FormLabel>
                  <Textarea
                    placeholder="أدخل عنوان السؤال..."
                    {...register('question', { required: 'العنوان مطلوب' })}
                    maxLength={255}
                    size="md"
                    borderRadius="lg"
                    border="1px"
                    borderColor="gray.300"
                    rows={2}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                    صورة السؤال (اختياري)
                  </FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none"
                    id="update-question-image-input"
                  />
                  <HStack spacing={2}>
                    <Button
                      as="label"
                      htmlFor="update-question-image-input"
                      size="sm"
                      leftIcon={<Icon icon="solar:gallery-bold-duotone" width="16" height="16" />}
                      cursor="pointer"
                    >
                      {imagePreview ? 'تغيير الصورة' : 'اختر صورة'}
                    </Button>
                    {imagePreview && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setValue('imageUrl', '');
                        }}
                      >
                        إزالة
                      </Button>
                    )}
                  </HStack>
                  {imagePreview && (
                    <Box mt={2}>
                      <Image src={imagePreview} alt="Preview" maxH="200px" borderRadius="md" />
                    </Box>
                  )}
                </FormControl>

                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                      نوع السؤال
                    </FormLabel>
                    <Controller
                      name="questionType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            if (val === 'true_false') {
                              setValue('answers', [
                                { text: 'صحيح', isCorrect: true, order: 1 },
                                { text: 'خطأ', isCorrect: false, order: 2 },
                              ]);
                            }
                          }}
                        >
                          <Stack direction="row">
                            <Radio value="mcq">اختيار من متعدد</Radio>
                            <Radio value="true_false">صحيح/خطأ</Radio>
                          </Stack>
                        </RadioGroup>
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                      درجة السؤال
                    </FormLabel>
                    <Controller
                      name="points"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(_, val) => field.onChange(val)}
                          min={1}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                      الصعوبة
                    </FormLabel>
                    <Controller
                      name="difficulty"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <Stack direction="row">
                            <Radio value="easy">سهل</Radio>
                            <Radio value="medium">متوسط</Radio>
                            <Radio value="hard">صعب</Radio>
                          </Stack>
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </HStack>

                <Divider />

                {questionType === 'mcq' && (
                  <Stack spacing={3}>
                    <HStack spacing={2}>
                      <Icon icon="solar:list-check-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                      <Box fontWeight="bold" fontSize="sm" color="gray.700">
                        الإجابات
                      </Box>
                    </HStack>

                    {answers.map((answer, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <Box
                          key={idx}
                          p={4}
                          border="2px"
                          borderColor={answer.isCorrect ? 'green.400' : 'gray.200'}
                          bg={answer.isCorrect ? 'green.50' : 'white'}
                          borderRadius="lg"
                        >
                          <HStack spacing={3}>
                            <Box
                              w={8}
                              h={8}
                              borderRadius="md"
                              bg={answer.isCorrect ? 'green.500' : 'gray.200'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <Box fontSize="sm" fontWeight="bold" color={answer.isCorrect ? 'white' : 'gray.600'}>
                                {letter}
                              </Box>
                            </Box>
                            <Radio
                              isChecked={answer.isCorrect}
                              onChange={(e) => {
                                const newAnswers = answers.map((a, i) => ({
                                  ...a,
                                  isCorrect: i === idx ? e.target.checked : false,
                                }));
                                setValue('answers', newAnswers);
                              }}
                              colorScheme="green"
                              size="lg"
                            />
                            <Input
                              type="text"
                              placeholder={`أدخل الإجابة ${letter}...`}
                              value={answer.text}
                              onChange={(e) => {
                                const newAnswers = [...answers];
                                newAnswers[idx].text = e.target.value;
                                setValue('answers', newAnswers);
                              }}
                              required
                              maxLength={255}
                              size="md"
                              borderRadius="lg"
                              border="1px"
                              borderColor="gray.300"
                              flex={1}
                            />
                          </HStack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                    الشرح (اختياري)
                  </FormLabel>
                  <Textarea
                    placeholder="شرح السؤال..."
                    {...register('explanation')}
                    size="md"
                    borderRadius="lg"
                    border="1px"
                    borderColor="gray.300"
                    rows={2}
                  />
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose} size="md" borderRadius="lg" mr={3}>
              إلغاء
            </Button>
            <Button
              colorScheme="blue"
              size="md"
              borderRadius="lg"
              onClick={handleSubmit(onSubmit)}
              isLoading={loading}
              leftIcon={<Icon icon="solar:check-circle-bold-duotone" width="18" height="18" />}
            >
              حفظ التعديلات
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
