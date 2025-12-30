import {
  Avatar,
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onOpen: () => void;
}

export default function Header({ onOpen }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <Box
      h={16}
      bg="white"
      borderBottomWidth={1}
      borderBottomColor="gray.200"
      px={4}
      position="sticky"
      top={0}
      zIndex={5}
      boxShadow="sm"
    >
      <Stack direction="row" alignItems="center" spacing={4} h="full">
        {/* Mobile menu button */}
        <IconButton
          aria-label="القائمة"
          onClick={onOpen}
          display={{ base: "flex", md: "none" }}
          icon={<Icon icon="solar:hamburger-menu-bold-duotone" width="24" height="24" />}
          variant="ghost"
          colorScheme="gray"
        />

        {/* Spacer */}
        <Box flex={1} />

        {/* User menu */}
        <HStack spacing={3}>
          <Menu>
            <MenuButton>
              <HStack spacing={2}>
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=random`}
                  name={user?.firstName}
                  size="sm"
                  bg="blue.500"
                  color="white"
                />
                <Box display={{ base: "none", md: "block" }}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user?.email}
                  </Text>
                </Box>
                <Icon icon="flowbite:angle-down-outline" width="16" height="16" />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon icon="lucide:user-round" width="20" height="20" />}>
                الملف التعريفي
              </MenuItem>
              <MenuItem icon={<Icon icon="lucide:user-round-cog" width="20" height="20" />}>
                تحديث البيانات
              </MenuItem>
              <MenuItem
                icon={<Icon icon="solar:power-line-duotone" width="20" height="20" />}
                color="red.500"
                onClick={logout}
              >
                تسجيل خروج
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Stack>
    </Box>
  );
}


