import { useState } from 'react';
import {
  Button,
  useToast,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import examService from '@/features/exams/examService';

interface DeleteQuestionProps {
  questionId: string;
  examId: string;
  onSuccess: () => void;
}

export default function DeleteQuestion({ questionId, examId, onSuccess }: DeleteQuestionProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      setLoading(true);
      await examService.removeQuestionFromExam(examId, questionId);
      toast({
        title: 'نجح',
        description: 'تم حذف السؤال بنجاح',
        status: 'success',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في حذف السؤال',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      colorScheme="red"
      fontWeight="medium"
      gap={2}
      borderRadius="lg"
      isDisabled={loading}
      isLoading={loading}
      onClick={handleDelete}
      leftIcon={<Icon icon="solar:trash-bin-minimalistic-bold-duotone" width="16" height="16" />}
    >
      حذف
    </Button>
  );
}


