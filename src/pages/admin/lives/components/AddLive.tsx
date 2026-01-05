import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  Textarea,
  RadioGroup,
  Radio,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import livesService from "../../../../features/admin/services/livesService";
import coursesService from "../../../../features/admin/services/coursesService";
import lessonsService from "../../../../features/admin/services/lessonsService";

interface AddLiveProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLive({ isOpen, onClose, onSuccess }: AddLiveProps) {
  // const { isOpen, onOpen, onClose } = useDisclosure(); // Managed by parent
  const queryClient = useQueryClient();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    course: "", // course ID
    lesson: "", // lesson ID
    type: "internal", // internal | external
    externalLink: "",
  });

  const { data: coursesData } = useQuery({
      queryKey: ['courses-list'],
      queryFn: () => coursesService.getAllCourses({ limit: 1000 }),
      enabled: isOpen // Only fetch when modal is open
  });

  const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
      queryKey: ['lessons-list', formData.course],
      queryFn: () => lessonsService.getAllLessons({ course: formData.course, limit: 1000 }),
      enabled: !!formData.course && isOpen
  });

  const createMutation = useMutation({
      mutationFn: livesService.createLive,
      onSuccess: () => {
          toast({ status: "success", title: "تم إضافة البث بنجاح" });
          queryClient.invalidateQueries({ queryKey: ['lives'] });
          onSuccess();
          onClose();
          setFormData({
            title: "",
            description: "",
            date: "",
            course: "",
            lesson: "",
            type: "internal",
            externalLink: "",
          });
      },
      onError: (error: any) => {
          toast({ status: "error", title: error?.response?.data?.message || "حدث خطأ" });
      }
  });

  const handleSubmit = () => {
      createMutation.mutate(formData);
  };

  return (
    <>


      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إضافة بث مباشر جديد</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>عنوان البث</FormLabel>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>الكورس</FormLabel>
                <Select 
                    placeholder="اختر الكورس"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value, lesson: ""})}
                >
                    {coursesData?.data?.courses?.map((course: any) => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>الدرس (اختياري)</FormLabel>
                <Select 
                    placeholder={isLoadingLessons ? "جاري التحميل..." : "اختر الدرس"}
                    value={formData.lesson}
                    onChange={(e) => setFormData({...formData, lesson: e.target.value})}
                    isDisabled={!formData.course || isLoadingLessons}
                >
                    {lessonsData?.data?.lessons?.map((lesson: any) => (
                        <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                    ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>تاريخ ووقت البث</FormLabel>
                <Input 
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>نوع البث</FormLabel>
                <RadioGroup 
                    value={formData.type} 
                    onChange={(val) => setFormData({...formData, type: val})}
                >
                    <HStack spacing={4}>
                        <Radio value="internal">داخلي (Agora)</Radio>
                        <Radio value="external">خارجي (Zoom/Youtube)</Radio>
                    </HStack>
                </RadioGroup>
              </FormControl>

              {formData.type === 'external' && (
                  <FormControl isRequired>
                    <FormLabel>رابط البث</FormLabel>
                    <Input 
                        value={formData.externalLink}
                        onChange={(e) => setFormData({...formData, externalLink: e.target.value})}
                        placeholder="https://zoom.us/..."
                    />
                  </FormControl>
              )}

              <FormControl>
                <FormLabel>الوصف</FormLabel>
                <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>إلغاء</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={createMutation.isPending}>
              حفظ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
