import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import CourseLessons from "@/features/courses/components/CourseLessons";
import EditCourse from "@/features/courses/components/EditCourse";

const tabs = [
  {
    name: "الدروس",
    key: "lessons",
  },
  {
    name: "الاعدادات",
    key: "settings",
  },
];

export default function CourseBuilder() {
  const { courseId } = useParams();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/${courseId}`);
      return response.data?.data?.course || response.data?.data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>جاري التحميل...</Text>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box p={4}>
        <Text>الكورس غير موجود</Text>
      </Box>
    );
  }

  return (
    <Stack p={4} spacing={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {course.title}
        </Text>
        <Text color="gray.600">
          {course.description}
        </Text>
      </Box>

      <Tabs
        position="relative"
        variant="soft-rounded"
        colorScheme="blue"
        p={3}
      >
        <TabList whiteSpace="nowrap" overflow="auto">
          {tabs.map((tab) => (
            <Tab key={tab.key}>{tab.name}</Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <CourseLessons />
          </TabPanel>

          <TabPanel px={0}>
            <Stack spacing={4}>
              <Card p={4}>
                <EditCourse course={course} />
              </Card>
              <DeleteCourse courseId={courseId!} />
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}

function DeleteCourse({ courseId }: { courseId: string }) {
  const [disabled, setDisabled] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();

  async function deleteCurrentItem() {
    if (!confirm("هل أنت متأكد من حذف هذا الكورس؟")) return;

    try {
      setDisabled(true);
      await axiosInstance.delete(`/courses/${courseId}`);
      toast({
        status: "success",
        description: "تم الحذف بنجاح",
      });
      navigate("/teacher/courses", { replace: true });
    } catch (error: any) {
      toast({
        status: "error",
        description: error.response?.data?.message || "حدث خطأ أثناء الحذف",
      });
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Card p={4}>
      <Stack spacing={3}>
        <Box>
          <Text fontWeight="medium">حذف الكورس؟</Text>
          <Text color="gray.600">
            في حالة حذف الكورس بالخطأ أو بالقصد لن يعد لديك أي صلاحية لاسترجاع البيانات من حيث
            محتوى الكورس، الدروس، المذكرات، المشتركين وفي هذا الحالة سيتضطر في إنشاء كورس جديد
            لرفعه على المنصة من جديد للتسجيل من قبل الطلبة. إذا كنت تريد بالتأكيد الحذف قم بالنقر
            على زر الحذف التالي.
          </Text>
        </Box>
        <Divider />
        <Button
          colorScheme="red"
          size="sm"
          width={100}
          isDisabled={disabled}
          onClick={deleteCurrentItem}
        >
          حذف
        </Button>
      </Stack>
    </Card>
  );
}
