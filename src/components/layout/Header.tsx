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
  Button
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCartQuery } from "@/features/student/services/cartApi";
import HeaderNotifications from "./HeaderNotifications";

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

        {/* Action Buttons */}
        <HStack spacing={3}>
           {/* Notifications */}
           <HeaderCart />
           <HeaderNotifications />

           {/* Wallet */}
           <Button
               as={Link}
               to="/transactions" // Assuming route exists or will exist
               variant="ghost"
               colorScheme="blue"
               bg="blue.50"
               rounded="full"
               px={4}
               h={10}
               gap={2}
               display="flex"
               alignItems="center"
               _hover={{ bg: "blue.100" }}
           >
               <Icon icon="solar:wallet-money-line-duotone" width="22" height="22" />
               <Text fontWeight="bold" fontSize="sm" color="blue.600">
                   {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(0)}
               </Text>
           </Button>
        </HStack>

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

function HeaderCart() {
  const { data } = useGetCartQuery();
  const count = data?.result?.count || 0;
  return (
    <IconButton
      as={Link}
      to="/student/cart"
      aria-label="السلة"
      title="السلة"
      minW={0}
      w={10}
      h={10}
      rounded={100}
      border="1px"
      borderColor="gray.200"
      bg="transparent"
      color="gray.800"
      variant="ghost"
      _hover={{ bg: "gray.100" }}
    >
      <Box position="relative" color="gray.800" display="flex" alignItems="center" justifyContent="center">
        <Icon icon="solar:cart-large-2-bold-duotone" width="24" height="24" />
        {!!count && (
          <Box position="absolute" top={-1.5} right={-1.5} bg="red.500" color="white" rounded="full" px={1.5} py={0.5} fontSize="10px" fontWeight="bold" minW={5} textAlign="center" lineHeight={1}>
            {count}
          </Box>
        )}
      </Box>
    </IconButton>
  );
}


