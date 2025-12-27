import {
    Avatar,
    Box,
    BoxProps,
    CloseButton,
    Drawer,
    DrawerContent,
    Flex,
    HStack,
    List,
    ListItem,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { Icon } from "@iconify-icon/react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface MenuItem {
    path: string;
    name: string;
    icon: string;
}

interface SimpleSidebarProps {
    children: ReactNode;
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export default function Sidebar({ children, isOpen: externalIsOpen, onClose: externalOnClose }: SimpleSidebarProps) {
    const { isOpen, onClose } = useDisclosure();
    const { role } = useAuth();

    // Use external props if provided, otherwise use internal state
    const effectiveIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
    const effectiveOnClose = externalOnClose || onClose;

    // Build menu items based on role
    const getRoutes = (): MenuItem[] => {
        if (role === UserRole.ADMIN) {
            return [
                { path: "/admin", name: "الرئيسية", icon: "solar:home-2-linear" },
                { path: "/admin/teachers", name: "المدرسين", icon: "solar:user-id-bold" },
                { path: "/admin/students", name: "الطلاب", icon: "solar:users-group-rounded-bold" },
                { path: "/admin/courses", name: "الكورسات", icon: "solar:book-bookmark-bold" },
                { path: "/admin/exams", name: "الامتحانات", icon: "solar:document-text-bold" },
                { path: "/admin/settings", name: "الإعدادات", icon: "solar:settings-minimalistic-line-duotone" },
            ];
        } else if (role === UserRole.TEACHER) {
            return [
                { path: "/teacher", name: "الرئيسية", icon: "solar:home-2-linear" },
                { path: "/teacher/courses", name: "الكورسات", icon: "solar:inbox-archive-bold" },
                { path: "/teacher/lessons", name: "الحصص", icon: "solar:video-library-line-duotone" },
                { path: "/teacher/exams", name: "الاختبارات", icon: "solar:document-text-bold" },
                { path: "/teacher/question-bank", name: "بنك الأسئلة", icon: "solar:database-bold" },
                { path: "/teacher/students", name: "طلابي", icon: "solar:users-group-two-rounded-bold" },
                { path: "/teacher/student-subscriptions", name: "اشتراكات الطلاب", icon: "solar:card-bold" },
                { path: "/teacher/platform-subscriptions", name: "اشتراكي في المنصة", icon: "solar:wallet-money-line-duotone" },
                { path: "/teacher/transactions", name: "المعاملات", icon: "solar:wallet-money-line-duotone" },
                { path: "/teacher/reports", name: "التقارير", icon: "solar:chart-2-bold" },
                { path: "/teacher/settings", name: "الإعدادات", icon: "solar:settings-minimalistic-line-duotone" },
            ];
        } else if (role === UserRole.STUDENT) {
            return [
                { path: "/student", name: "لوحة التحكم", icon: "solar:home-2-linear" },
                { path: "/student/courses", name: "الكورسات", icon: "solar:inbox-archive-bold" },
                { path: "/student/exams", name: "الاختبارات", icon: "solar:hashtag-square-line-duotone" },
                { path: "/student/certificates", name: "شهاداتي", icon: "ph:certificate-duotone" },
                { path: "/student/orders", name: "طلباتي", icon: "solar:archive-check-line-duotone" },
                { path: "/student/transactions", name: "الرصيد والمدفوعات", icon: "solar:wallet-money-line-duotone" },
                { path: "/student/settings", name: "الاعدادات", icon: "solar:settings-minimalistic-line-duotone" },
            ];
        }
        return [];
    };

    const routes = getRoutes();

    return (
        <Box minH="100vh" bg="gray.50">
            <SidebarContent
                onClose={effectiveOnClose}
                display={{ base: "none", md: "block" }}
                routes={routes}
            />
            <Drawer
                autoFocus={false}
                isOpen={effectiveIsOpen}
                placement="left"
                onClose={effectiveOnClose}
                returnFocusOnClose={false}
                onOverlayClick={effectiveOnClose}
                size="full"
            >
                <DrawerContent bg="gray.900">
                    <SidebarContent onClose={effectiveOnClose} routes={routes} />
                </DrawerContent>
            </Drawer>
            {/* Main content area - margin LEFT for sidebar */}
            <Box ml={{ base: 0, md: "280px" }} bg="gray.50" minH="100vh">
                {children}
            </Box>
        </Box>
    );
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
    routes: MenuItem[];
}

const SidebarContent = ({ onClose, routes, ...rest }: SidebarProps) => {
    const { user } = useAuth();

    return (
        <Stack
            bgGradient="linear(to-b, gray.900, gray.800)"
            borderRight="1px"
            borderRightColor="gray.800"
            w={{ base: "full", md: "280px" }}
            pos="fixed"
            h="full"
            p={4}
            spacing={4}
            overflow="hidden"
            {...rest}
        >
            {/* Logo + close */}
            <Flex alignItems="center" justifyContent="center" position="relative">
                <HStack spacing={3}>
                    <Box
                        bg="blue.500"
                        color="white"
                        w="56px"
                        h="56px"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        fontSize="2xl"
                    >
                        E
                    </Box>
                </HStack>
                <CloseButton
                    onClick={onClose}
                    display={{ base: "flex", md: "none" }}
                    color="whiteAlpha.800"
                    _hover={{ bg: "whiteAlpha.200" }}
                    position="absolute"
                    left={0}
                />
            </Flex>

            {/* Profile */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={5}
                px={3}
                py={3}
                mt={3}
                bg="whiteAlpha.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
            >
                <Avatar
                    src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=random`}
                    name={user?.firstName}
                    width={10}
                    height={10}
                />
                <Box flex={1} color="white" fontSize="sm">
                    <Text fontWeight="semibold" noOfLines={1}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text color="gray.300" noOfLines={1} fontSize="xs">
                        {user?.email}
                    </Text>
                </Box>
            </Stack>

            {/* Navigation */}
            <Box flex={1} overflowY="auto" pt={4}>
                <List spacing={1}>
                    {routes.map((link) => (
                        <ListItem key={link.path}>
                            <NavItem {...link} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Stack>
    );
};

interface NavItemProps {
    icon: string;
    name: string;
    path: string;
}

const NavItem = ({ icon, path, name }: NavItemProps) => {
    const { pathname } = useLocation();
    const isActive =
        path === "/" && pathname === path
            ? true
            : pathname.startsWith(path) && path !== "/"
                ? true
                : false;

    return (
        <Link to={path} title={name}>
            <HStack
                py={2.5}
                px={3}
                rounded="lg"
                bg={isActive ? "whiteAlpha.200" : "transparent"}
                _hover={{
                    bg: "whiteAlpha.150",
                }}
                alignItems="center"
                fontWeight={isActive ? "bold" : "medium"}
                fontSize="sm"
                transition="background 0.15s ease, transform 0.1s ease"
                transform={isActive ? "translateX(-2px)" : "translateX(0)"}
            >
                <Box
                    w={1}
                    h={6}
                    bg={isActive ? "blue.400" : "transparent"}
                    borderRadius="full"
                />
                <HStack spacing={3} flex={1}>
                    <Box color={isActive ? "white" : "whiteAlpha.800"}>
                        <Icon width={20} height={20} icon={icon} />
                    </Box>
                    <Text color={isActive ? "white" : "whiteAlpha.900"} flex={1} noOfLines={1}>
                        {name}
                    </Text>
                </HStack>
                <Box color={isActive ? "white" : "whiteAlpha.600"}>
                    <Icon width={18} height={18} icon="solar:alt-arrow-left-line-duotone" />
                </Box>
            </HStack>
        </Link>
    );
};
