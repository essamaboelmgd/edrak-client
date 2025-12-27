import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { KeyboardEvent, useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import AddLessonModal from "./AddLessonModal";
import CourseSectionsManager from "./CourseSectionsManager";
import LoadingCourseCard from "./LoadingCourseCard";
import LessonCard from "./LessonCard";

export default function CourseLessons() {
  const { courseId } = useParams();
  const [params, setParams] = useSearchParams({
    course: courseId || "",
  });
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['courseLessons', courseId, params.get('search')],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/${courseId}/lessons`, {
        params: {
          search: params.get('search') || undefined,
        },
      });
      return response.data?.data?.lessons || response.data?.data || [];
    },
    enabled: !!courseId,
  });

  const lessons = data || [];

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['courseLessons'] });
  };

  return (
    <Stack spacing={4}>
      <CourseSectionsManager onMoved={handleRefetch} />
      
      <Box>
        <Wrap alignItems="center" justifyContent="space-between" width="100%">
          <WrapItem flex={1}>
            <InputGroup>
              <InputRightElement pointerEvents="none">
                <Icon icon="lucide:search" width="18" height="18" />
              </InputRightElement>
              <Input
                type="search"
                placeholder="اكتب عنوان الدرس هنا ..."
                bg="white"
                w={300}
                maxWidth="100%"
                defaultValue={params.get("search") || ""}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    setParams((param) => {
                      param.set("search", (event.target as any)?.value);
                      return param;
                    });
                  }
                }}
              />
            </InputGroup>
          </WrapItem>

          <WrapItem>
            <AddLessonModal callback={handleRefetch} />
          </WrapItem>
        </Wrap>
      </Box>

      <Grid templateColumns="repeat(auto-fill, minmax(17rem, 1fr))" gap={3}>
        {!isLoading &&
          !!lessons?.length &&
          lessons?.map((item: any) => (
            <GridItem key={item._id}>
              <LessonCard lesson={item} callback={handleRefetch} />
            </GridItem>
          ))}
        {isLoading &&
          Array.from({ length: 4 })
            .fill(0)
            .map((_e, index) => (
              <GridItem key={index}>
                <LoadingCourseCard />
              </GridItem>
            ))}
      </Grid>

      {!isLoading && !lessons?.length && (
        <Center>
          <Stack spacing={4} my={6}>
            <Box mx="auto" color="blue">
              <Icon
                icon="solar:video-library-bold-duotone"
                width="60"
                height="60"
              />
            </Box>
            <Stack maxW={600}>
              <Heading
                as="h2"
                fontSize="large"
                fontWeight="bold"
                textAlign="center"
              >
                لا توجد بيانات للعرض
              </Heading>
              <Text textAlign="center" color="gray.500">
                ليس هناك نتائج لعرضها، يمكنك إضافة درس جديد بالضغط على زر إضافة
                درس جديد في الأعلى
              </Text>
            </Stack>
          </Stack>
        </Center>
      )}
    </Stack>
  );
}

