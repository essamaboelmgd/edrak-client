import { Card, CardBody, Stack, Skeleton } from "@chakra-ui/react";

export default function LoadingCourseCard() {
  return (
    <Card>
      <CardBody>
        <Stack spacing={4}>
          <Skeleton height="150px" borderRadius="lg" />
          <Skeleton height="20px" />
          <Skeleton height="60px" />
          <Skeleton height="40px" />
        </Stack>
      </CardBody>
    </Card>
  );
}

