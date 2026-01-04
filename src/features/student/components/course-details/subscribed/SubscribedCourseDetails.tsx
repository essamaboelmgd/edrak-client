import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Tabs
} from "@chakra-ui/react";
import { useState } from "react";
import { IStudentCourse, IStudentLesson, IStudentCourseSection, IStudentExam, IStudentHomework } from "@/features/student/types";
import CoursePlayerHeader from "@/features/student/components/course-details/subscribed/CoursePlayerHeader";
import CoursePlayerTabs from "@/features/student/components/course-details/subscribed/CoursePlayerTabs";
import CoursePlayerTabPanels from "@/features/student/components/course-details/subscribed/CoursePlayerTabPanels"; 

interface SubscribedCourseDetailsProps {
  course: IStudentCourse;
  sections: IStudentCourseSection[];
  lessons: IStudentLesson[]; // Fallback list
  exams: IStudentExam[];
  homeworks: IStudentHomework[];
}

export default function SubscribedCourseDetails({
  course,
  sections,
  lessons,
  exams,
  homeworks,
}: SubscribedCourseDetailsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
   const [viewMode, setViewMode] = useState<{ section: "all" | "video" | "homework" | "exam"; targetId?: string }>({
        section: "all",
    });

  // Derived state for stats
  const lessonsCount = course.stats?.totalLessons || lessons.length;
  const examsCount = course.stats?.totalExams || exams.length;
  const homeworksCount = homeworks.length;

  const handleLessonClick = (lesson: any, disabled: boolean, view?: any) => {
      if (disabled) return;
      setSelectedContent(lesson);
      if (view) setViewMode(view);
      else setViewMode({ section: "all" });
      
      // Ensure we are on the lessons tab
      if (activeTab !== 0) setActiveTab(0);
      
      // Scroll to player
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
      <Stack spacing={6}>
        {/* Legacy Course Header Style */}
        <CoursePlayerHeader course={course} homeworksCount={homeworksCount} />

        <Card
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          <CardHeader
            bgGradient="linear(to-r, #20365d, #56805b)"
            py={4}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Heading size="lg" color="#fefffe" fontWeight="bold">
              محتوى الكورس
            </Heading>
          </CardHeader>
          <CardBody p={0}>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
               <Card
                  borderRadius="xl"
                  bg="white"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor="gray.100"
                  overflow="hidden"
                >
                    <Box p={4} pb={0}>
                        <CoursePlayerTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            lessonsCount={lessonsCount}
                            examsCount={examsCount}
                            homeworksCount={homeworksCount}
                            livesCount={0} 
                            postsCount={0}
                            leaderboardCount={0}
                        />
                    </Box>
                </Card>

              <CoursePlayerTabPanels
                course={course}
                sections={sections}
                lessons={lessons}
                exams={exams}
                homeworks={homeworks}
                selectedContent={selectedContent}
                viewMode={viewMode}
                onLessonClick={handleLessonClick}
              />
            </Tabs>
          </CardBody>
        </Card>
      </Stack>
  );
}
