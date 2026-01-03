import {
  Badge,
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
// Mock data for now since no API is found
const mockNotifications: any[] = [];
// Example structure: { id: 1, title: 'Welcome', body: 'Welcome to the platform', created_at: new Date() }

export default function HeaderNotifications() {
  const unreadCount = 0;
  
  // Mock refetch/data
  const data = { result: { data: mockNotifications, total: 0 } };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="الاشعارات"
        title="الاشعارات"
        minWidth={0}
        w={10}
        h={10}
        rounded="full"
        border="1px"
        borderColor="gray.200"
        bg="transparent"
        icon={
            <Box position="relative">
                <Icon
                    icon="solar:bell-bing-bold-duotone"
                    width="24"
                    height="24"
                />
                 {unreadCount > 0 && (
                    <Badge
                        bg="red.500"
                        color="white"
                        pos="absolute"
                        top={-2}
                        right={-2}
                        rounded="full"
                        px={1.5}
                        py={0.5}
                        fontSize="10px"
                        border="2px solid white"
                    >
                        {unreadCount}
                    </Badge>
                )}
            </Box>
        }
      />
      <MenuList
        w={320}
        maxW="100dvw"
        p={0}
        mt={2}
        zIndex={10}
      >
        <Stack
          borderBottom="1px"
          borderBottomColor="gray.200"
          p={3}
          direction="row"
          alignItems="center"
        >
          <Text fontWeight="medium">الاشعارات</Text>
          <Spacer />
          {!!data?.result?.total && (
            <Text
              color="blue.500"
              fontSize="small"
              fontWeight="medium"
            >
              {data?.result?.total || 0}
            </Text>
          )}
        </Stack>
        <Box
          flex={1}
          overflow="auto"
          maxH="calc(100vh - 10rem)"
        >
          {data?.result?.data?.map((item: any) => (
            <MenuItem
              key={item.id}
              borderBottom="1px"
              borderBottomColor="gray.200"
              _last={{
                borderBottom: 0,
              }}
              p={3}
              onClick={() => {}} 
              cursor="pointer"
            >
              <HStack
                alignItems="start"
                w="100%"
                spacing={3}
              >
                <Box
                  w={2}
                  flexShrink={0}
                  h={2}
                  bg={item.priority === "high" ? "red.500" : "blue.500"}
                  rounded="full"
                  mt={2}
                ></Box>
                <Stack spacing={1} flex={1}>
                  <Box>
                    <Text
                      fontWeight="bold"
                      fontSize="sm"
                      noOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.600"
                    >
                      {item.body}
                    </Text>
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color="gray.400"
                    textAlign="end"
                  >
                    {/* Assuming no moment, use simple date */}
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </Stack>
              </HStack>
            </MenuItem>
          ))}

          {!data?.result?.data?.length && (
            <Box p={6}>
              <Text
                textAlign="center"
                w="100%"
                color="gray.500"
                fontSize="sm"
              >
                لا توجد بيانات للعرض
              </Text>
            </Box>
          )}
        </Box>
      </MenuList>
    </Menu>
  );
}
