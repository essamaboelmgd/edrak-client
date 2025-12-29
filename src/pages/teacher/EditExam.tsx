import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  HStack,
  Heading,
  Text,
  Divider,
} from '@chakra-ui/react';
import examService from '@/features/teacher/services/examService';
import { IUpdateExamRequest, IExamResponse } from '@/types/exam.types';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export default function EditExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();
  
  const [exam, setExam] = useState<IExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<IUpdateExamRequest>>({
    title: '',
    description: '',
    settings: {
      duration: 0,
      passingScore: 50,
      showResults: true,
      showCorrectAnswers: true,
      allowRetake: true,
      maxAttempts: 0,
      shuffleQuestions: false,
      shuffleAnswers: false,
      requireAll: true,
    },
  });

  const basePath = role === UserRole.ADMIN ? '/admin' : '/teacher';

  useEffect(() => {
    if (id) {
      fetchExam();
    }
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await examService.getExamById(id!);
      const examData = response.data.exam as IExamResponse;
      setExam(examData);
      setFormData({
        title: examData.title,
        description: examData.description,
        pdfUrl: examData.pdfUrl,
        status: examData.status,
        isActive: examData.isActive,
        settings: examData.settings,
      });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في جلب الامتحان',
        status: 'error',
      });
      navigate(`${basePath}/exams`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: 'خطأ',
        description: 'العنوان مطلوب',
        status: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      await examService.updateExam(id!, formData);
      toast({
        title: 'نجح',
        description: 'تم تحديث الامتحان بنجاح',
        status: 'success',
      });
      navigate(`${basePath}/exams/${id}`);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث الامتحان',
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={6} dir="rtl">
        <Stack spacing={4}>
          <Box h={10} bg="gray.200" rounded="md" />
          <Box h={200} bg="gray.200" rounded="md" />
        </Stack>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box p={6} dir="rtl">
        <Text>الامتحان غير موجود</Text>
      </Box>
    );
  }

  return (
    <Box p={6} dir="rtl">
      <Stack spacing={6}>
        <HStack justify="space-between">
          <Heading fontSize="2xl">تعديل الامتحان</Heading>
          <Button
            as="a"
            href={`${basePath}/exams`}
            variant="ghost"
            size="sm"
          >
            رجوع
          </Button>
        </HStack>

        <Card>
          <CardBody>
            <Stack spacing={6}>
              <FormControl isRequired>
                <FormLabel>عنوان الامتحان</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان الامتحان"
                />
              </FormControl>

              <FormControl>
                <FormLabel>الوصف</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الامتحان (اختياري)"
                  rows={3}
                />
              </FormControl>

              {exam.contentType === 'pdf' && (
                <FormControl>
                  <FormLabel>رابط PDF</FormLabel>
                  <Input
                    value={formData.pdfUrl || ''}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    placeholder="https://example.com/exam.pdf"
                    type="url"
                  />
                </FormControl>
              )}

              <Divider />

              <Heading size="md">إعدادات الامتحان</Heading>

              <HStack>
                <FormControl>
                  <FormLabel>مدة الامتحان (دقيقة)</FormLabel>
                  <NumberInput
                    value={formData.settings?.duration || 0}
                    onChange={(_, val) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, duration: val }
                    })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>درجة النجاح (%)</FormLabel>
                  <NumberInput
                    value={formData.settings?.passingScore || 50}
                    onChange={(_, val) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, passingScore: val }
                    })}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>الحد الأقصى للمحاولات</FormLabel>
                  <NumberInput
                    value={formData.settings?.maxAttempts || 0}
                    onChange={(_, val) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, maxAttempts: val }
                    })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>0 = غير محدود</Text>
                </FormControl>
              </HStack>

              <Stack>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0}>إظهار النتائج</FormLabel>
                  <Switch
                    isChecked={formData.settings?.showResults}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, showResults: e.target.checked }
                    })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0}>إظهار الإجابات الصحيحة</FormLabel>
                  <Switch
                    isChecked={formData.settings?.showCorrectAnswers}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, showCorrectAnswers: e.target.checked }
                    })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0}>السماح بإعادة المحاولة</FormLabel>
                  <Switch
                    isChecked={formData.settings?.allowRetake}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, allowRetake: e.target.checked }
                    })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0}>خلط الأسئلة</FormLabel>
                  <Switch
                    isChecked={formData.settings?.shuffleQuestions}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, shuffleQuestions: e.target.checked }
                    })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0}>خلط الإجابات</FormLabel>
                  <Switch
                    isChecked={formData.settings?.shuffleAnswers}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, shuffleAnswers: e.target.checked }
                    })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0}>إلزام الإجابة على جميع الأسئلة</FormLabel>
                  <Switch
                    isChecked={formData.settings?.requireAll}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings!, requireAll: e.target.checked }
                    })}
                  />
                </FormControl>
              </Stack>

              <HStack justify="flex-end" pt={4}>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`${basePath}/exams`)}
                >
                  إلغاء
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={saving}
                >
                  حفظ التغييرات
                </Button>
              </HStack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}

