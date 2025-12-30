import {
    Avatar,
    Box,
    BoxProps,
    CloseButton,
    Drawer,
    DrawerContent,
    Flex,
    HStack,
    Stack,
    Text,
    useDisclosure,
    IconButton,
    VStack,
    Divider,
    Badge,
} from "@chakra-ui/react";
import { ReactNode, useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface MenuItem {
    path: string;
    name: string;
    icon: string;
    badge?: string;
}

interface SimpleSidebarProps {
    children: ReactNode;
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export default function Sidebar({ children, isOpen: externalIsOpen, onClose: externalOnClose }: SimpleSidebarProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { role } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Use external props if provided, otherwise use internal state
    const effectiveIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
    const effectiveOnClose = externalOnClose || onClose;

    // Build menu items based on role
    const getRoutes = (): MenuItem[] => {
        if (role === UserRole.ADMIN) {
            return [
                { path: "/admin", name: "الرئيسية", icon: "solar:home-2-bold-duotone" },
                { path: "/admin/teachers", name: "المدرسين", icon: "solar:user-id-bold-duotone" },
                { path: "/admin/students", name: "الطلاب", icon: "solar:users-group-rounded-bold-duotone" },
                { path: "/admin/courses", name: "الكورسات", icon: "solar:book-bookmark-bold-duotone" },
                { path: "/admin/question-bank", name: "بنك الأسئلة", icon: "solar:question-circle-bold-duotone" },
                { path: "/admin/exams", name: "الامتحانات", icon: "solar:document-text-bold-duotone" },
                { path: "/admin/homeworks", name: "الواجبات", icon: "solar:notebook-bold-duotone" },
                { path: "/admin/features", name: "الميزات", icon: "solar:widget-5-bold-duotone" },
                { path: "/admin/subscriptions", name: "اشتراكات المدرسين", icon: "solar:card-bold-duotone" },
                { path: "/admin/activation-codes", name: "أكواد التفعيل", icon: "solar:key-bold-duotone" },
                { path: "/admin/coupons", name: "كوبونات الخصم", icon: "solar:ticket-sale-bold-duotone" },
                { path: "/admin/settings", name: "الإعدادات", icon: "solar:settings-bold-duotone" },
            ];
        } else if (role === UserRole.TEACHER) {
            return [
                { path: "/teacher", name: "الرئيسية", icon: "solar:home-2-bold-duotone" },
                { path: "/teacher/courses", name: "الكورسات", icon: "solar:book-bold-duotone" },
                { path: "/teacher/lessons", name: "الحصص", icon: "solar:video-library-bold-duotone" },
                { path: "/teacher/exams", name: "الاختبارات", icon: "solar:document-text-bold-duotone" },
                { path: "/teacher/homeworks", name: "الواجبات", icon: "solar:notebook-bold-duotone" },
                { path: "/teacher/question-bank", name: "بنك الأسئلة", icon: "solar:question-circle-bold-duotone" },
                { path: "/teacher/students", name: "طلابي", icon: "solar:users-group-rounded-bold-duotone" },
                { path: "/teacher/student-subscriptions", name: "اشتراكات الطلاب", icon: "solar:card-bold-duotone" },
                { path: "/teacher/platform-subscriptions", name: "اشتراكي في المنصة", icon: "solar:wallet-money-bold-duotone" },
                { path: "/teacher/activation-codes", name: "أكواد التفعيل", icon: "solar:key-bold-duotone" },
                { path: "/teacher/coupons", name: "كوبونات الخصم", icon: "solar:ticket-sale-bold-duotone" },
                { path: "/teacher/transactions", name: "المعاملات", icon: "solar:wallet-money-bold-duotone" },
                { path: "/teacher/reports", name: "التقارير", icon: "solar:chart-2-bold-duotone" },
                { path: "/teacher/settings", name: "الإعدادات", icon: "solar:settings-bold-duotone" },
            ];
        } else if (role === UserRole.STUDENT) {
            return [
                { path: "/student", name: "لوحة التحكم", icon: "solar:home-2-bold-duotone" },
                { path: "/student/courses", name: "الكورسات", icon: "solar:book-bold-duotone" },
                { path: "/student/exams", name: "الاختبارات", icon: "solar:document-text-bold-duotone" },
                { path: "/student/homework", name: "الواجبات", icon: "solar:notebook-bold-duotone" },
                { path: "/student/subscriptions", name: "اشتراكاتي", icon: "solar:card-bold-duotone" },
                { path: "/student/profile", name: "الملف الشخصي", icon: "solar:user-id-bold-duotone" },
                { path: "/student/certificates", name: "شهاداتي", icon: "solar:diploma-bold-duotone" },
                { path: "/student/orders", name: "طلباتي", icon: "solar:archive-check-bold-duotone" },
                { path: "/student/transactions", name: "الرصيد والمدفوعات", icon: "solar:wallet-money-bold-duotone" },
                { path: "/student/settings", name: "الاعدادات", icon: "solar:settings-bold-duotone" },
            ];
        }
        return [];
    };

    const routes = getRoutes();
    const sidebarWidth = isCollapsed ? "80px" : "280px";

    return (
        <Box minH="100vh" bg="gray.50">
            <SidebarContent
                onClose={effectiveOnClose}
                display={{ base: "none", md: "block" }}
                routes={routes}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
            <Drawer
                autoFocus={false}
                isOpen={effectiveIsOpen}
                placement="right"
                onClose={effectiveOnClose}
                returnFocusOnClose={false}
                onOverlayClick={effectiveOnClose}
                size="xs"
            >
                <DrawerContent bgGradient="linear(to-b, gray.900, gray.800)">
                    <SidebarContent onClose={effectiveOnClose} routes={routes} isCollapsed={false} />
                </DrawerContent>
            </Drawer>
            {/* Main content area */}
            <Box
                ml={{ base: 0, md: sidebarWidth }}
                bg="gray.50"
                minH="100vh"
                transition="margin-left 0.3s ease"
            >
                {children}
            </Box>
        </Box>
    );
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
    routes: MenuItem[];
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const SidebarContent = ({ onClose, routes, isCollapsed = false, onToggleCollapse, ...rest }: SidebarProps) => {
    const { user, role } = useAuth();
    const isMobile = rest.display === undefined || rest.display === "flex";

    return (
        <Box
            bgGradient="linear(to-b, gray.900, gray.800)"
            borderRight="1px"
            borderRightColor="gray.700"
            w={{ base: "full", md: isCollapsed ? "80px" : "280px" }}
            pos="fixed"
            h="full"
            overflowY="auto"
            overflowX="hidden"
            transition="width 0.3s ease"
            boxShadow="xl"
            zIndex={10}
            css={{
                '&::-webkit-scrollbar': {
                    width: '0px',
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'transparent',
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
            {...rest}
        >
            <Stack spacing={0} h="full">
                {/* Logo + Toggle */}
                <Flex
                    alignItems="center"
                    justifyContent={isCollapsed ? "center" : "space-between"}
                    p={4}
                    borderBottom="1px"
                    borderBottomColor="gray.700"
                    position="sticky"
                    top={0}
                    bgGradient="linear(to-b, gray.900, gray.800)"
                    zIndex={1}
                >
                    {!isCollapsed && (
                        <HStack spacing={3}>
                            <Box
                                bgGradient="linear(135deg, blue.500, purple.500)"
                                color="white"
                                w="48px"
                                h="48px"
                                borderRadius="xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontWeight="bold"
                                fontSize="xl"
                                boxShadow="md"
                            >
                                E
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="lg" color="white">
                                    إدراك
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                    {role === UserRole.ADMIN ? "لوحة المسؤول" : role === UserRole.TEACHER ? "لوحة المدرس" : "لوحة الطالب"}
                                </Text>
                            </VStack>
                        </HStack>
                    )}
                    {isCollapsed && (
                        <Box
                            bgGradient="linear(135deg, blue.500, purple.500)"
                            color="white"
                            w="48px"
                            h="48px"
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="xl"
                            boxShadow="md"
                        >
                            E
                        </Box>
                    )}
                    <HStack spacing={2}>
                        {!isMobile && (
                            <IconButton
                                aria-label="طي/إظهار القائمة"
                                icon={<Icon icon={isCollapsed ? "solar:double-alt-arrow-right-bold-duotone" : "solar:double-alt-arrow-left-bold-duotone"} width="20" height="20" />}
                                onClick={onToggleCollapse}
                                size="sm"
                                variant="ghost"
                                color="whiteAlpha.800"
                                _hover={{ bg: "whiteAlpha.200", color: "white" }}
                            />
                        )}
                        <CloseButton
                            onClick={onClose}
                            display={{ base: "flex", md: "none" }}
                            size="sm"
                            color="whiteAlpha.800"
                            _hover={{ bg: "whiteAlpha.200", color: "white" }}
                        />
                    </HStack>
                </Flex>

                {/* Profile */}
                {!isCollapsed && (
                    <Box
                        px={4}
                        py={4}
                        borderBottom="1px"
                        borderBottomColor="gray.700"
                    >
                        <HStack
                            spacing={3}
                            p={3}
                            bg="whiteAlpha.100"
                            borderRadius="xl"
                            border="1px"
                            borderColor="whiteAlpha.200"
                        >
                            <Avatar
                                name={user?.firstName}
                                size="md"
                                bgGradient="linear(135deg, blue.500, purple.500)"
                                color="white"
                            />
                            <VStack align="start" spacing={0} flex={1}>
                                <Text fontWeight="bold" fontSize="sm" color="white" noOfLines={1}>
                                    {user?.firstName} {user?.lastName}
                                </Text>
                                <Text color="gray.400" noOfLines={1} fontSize="xs">
                                    {user?.email}
                                </Text>
                                <Badge
                                    mt={1}
                                    colorScheme={role === UserRole.ADMIN ? "red" : role === UserRole.TEACHER ? "green" : "blue"}
                                    fontSize="xs"
                                    borderRadius="full"
                                    px={2}
                                >
                                    {role === UserRole.ADMIN ? "مسؤول" : role === UserRole.TEACHER ? "مدرس" : "طالب"}
                                </Badge>
                            </VStack>
                        </HStack>
                    </Box>
                )}

                {isCollapsed && (
                    <Box
                        px={2}
                        py={4}
                        borderBottom="1px"
                        borderBottomColor="gray.700"
                        display="flex"
                        justifyContent="center"
                    >
                        <Avatar
                            name={user?.firstName}
                            size="md"
                            bgGradient="linear(135deg, blue.500, purple.500)"
                            color="white"
                        />
                    </Box>
                )}

                {/* Navigation */}
                <Box
                    flex={1}
                    overflowY="auto"
                    py={4}
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '0px',
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'transparent',
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <Stack spacing={1} px={isCollapsed ? 2 : 3}>
                        {routes.map((link) => (
                            <NavItem
                                key={link.path}
                                {...link}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

interface NavItemProps {
    icon: string;
    name: string;
    path: string;
    badge?: string;
    isCollapsed?: boolean;
}

const NavItem = ({ icon, path, name, badge, isCollapsed = false }: NavItemProps) => {
    const { pathname } = useLocation();
    
    // Determine if this item should be active
    let isActive = false;
    
    // Normalize paths (remove trailing slashes for comparison)
    const normalizedPath = path.replace(/\/$/, '');
    const normalizedPathname = pathname.replace(/\/$/, '');
    
    // For home pages (/admin, /teacher, /student), only match exactly
    if (normalizedPath === "/admin" || normalizedPath === "/teacher" || normalizedPath === "/student") {
        isActive = normalizedPathname === normalizedPath;
    } 
    // For exact root path
    else if (normalizedPath === "/") {
        isActive = normalizedPathname === normalizedPath;
    }
    // For all other paths, match if pathname starts with the path
    // But ensure it's not matching a parent path (e.g., /admin/coupons should not match /admin)
    else {
        // Match if pathname exactly equals the path, or pathname starts with path/
        isActive = normalizedPathname === normalizedPath || 
                   normalizedPathname.startsWith(`${normalizedPath}/`);
    }

    return (
        <Link to={path} title={name}>
            <HStack
                py={3}
                px={isCollapsed ? 2 : 4}
                rounded="xl"
                bg={isActive ? "whiteAlpha.200" : "transparent"}
                borderLeft={isActive ? "3px solid" : "3px solid transparent"}
                borderLeftColor={isActive ? "blue.400" : "transparent"}
                _hover={{
                    bg: isActive ? "whiteAlpha.200" : "whiteAlpha.100",
                    transform: "translateX(-4px)",
                }}
                alignItems="center"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                fontWeight={isActive ? "bold" : "medium"}
                fontSize="sm"
                transition="all 0.2s ease"
                position="relative"
                group
            >
                <Box
                    color={isActive ? "white" : "whiteAlpha.700"}
                    _groupHover={{ color: "white" }}
                    transition="color 0.2s"
                >
                    <Icon width={22} height={22} icon={icon} />
                </Box>
                {!isCollapsed && (
                    <>
                        <Text
                            color={isActive ? "white" : "whiteAlpha.900"}
                            flex={1}
                            noOfLines={1}
                            _groupHover={{ color: "white" }}
                            transition="color 0.2s"
                        >
                            {name}
                        </Text>
                        {badge && (
                            <Badge colorScheme="blue" borderRadius="full" fontSize="xs" px={2}>
                                {badge}
                            </Badge>
                        )}
                    </>
                )}
                {isActive && !isCollapsed && (
                    <Box
                        position="absolute"
                        right={0}
                        w="4px"
                        h="60%"
                        bg="blue.400"
                        borderRadius="full"
                    />
                )}
            </HStack>
        </Link>
    );
};
