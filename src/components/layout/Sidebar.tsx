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
    List,
    ListItem,
    Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

// Interfaces
interface MenuItem {
    path: string;
    name: string;
    icon: string;
    badge?: string;
    underDevelopment?: boolean;
}

interface RouteGroup {
    title: string;
    icon: string;
    routes: MenuItem[];
}

interface SimpleSidebarProps {
    children: React.ReactNode;
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export default function Sidebar({ children, isOpen: externalIsOpen, onClose: externalOnClose }: SimpleSidebarProps) {
    const { isOpen, onClose } = useDisclosure();
    const { role } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebarCollapsed") === "true";
        } catch {
            return false;
        }
    });

    // Use external props if provided
    const effectiveIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
    const effectiveOnClose = externalOnClose || onClose;

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem("sidebarCollapsed", String(next));
            return next;
        });
    };

    // Route Groups Definition
    const getRouteGroups = (): RouteGroup[] => {
        if (role === UserRole.ADMIN) {
             return [
                {
                    title: "الرئيسية",
                    icon: "solar:home-smile-bold-duotone",
                    routes: [
                         { path: "/admin", name: "لوحة التحكم", icon: "solar:widget-bold-duotone" },
                    ]
                },
                {
                    title: "الإدارة",
                    icon: "solar:users-group-rounded-bold-duotone",
                    routes: [
                        { path: "/admin/teachers", name: "المدرسين", icon: "solar:user-id-bold-duotone" },
                        { path: "/admin/students", name: "الطلاب", icon: "solar:users-group-rounded-bold-duotone" },
                    ]
                },
                {
                    title: "المحتوى",
                    icon: "solar:book-2-bold-duotone",
                    routes: [
                        { path: "/admin/courses", name: "الكورسات", icon: "solar:book-bookmark-bold-duotone" },
                        { path: "/admin/lessons", name: "الدروس", icon: "solar:play-circle-bold-duotone" },
                        { path: "/admin/question-bank", name: "بنك الأسئلة", icon: "solar:question-circle-bold-duotone" },
                        { path: "/admin/exams", name: "الامتحانات", icon: "solar:document-text-bold-duotone" },
                        { path: "/admin/homeworks", name: "الواجبات", icon: "solar:notebook-bold-duotone" },
                    ]
                },
                {
                    title: "المالية",
                    icon: "solar:wallet-bold-duotone",
                    routes: [
                         { path: "/admin/subscriptions", name: "الاشتراكات", icon: "solar:card-bold-duotone" },
                         { path: "/admin/activation-codes", name: "أكواد التفعيل", icon: "solar:key-bold-duotone" },
                         { path: "/admin/coupons", name: "الكوبونات", icon: "solar:ticket-sale-bold-duotone" },
                    ]
                },
                {
                     title: "النظام",
                     icon: "solar:settings-bold-duotone",
                     routes: [
                         { path: "/admin/settings", name: "الإعدادات", icon: "solar:settings-bold-duotone" },
                     ]
                }
             ];
        } else if (role === UserRole.TEACHER) {
             return [
                 {
                    title: "الرئيسية",
                    icon: "solar:home-smile-bold-duotone",
                    routes: [
                         { path: "/teacher", name: "الرئيسية", icon: "solar:home-2-bold-duotone" },
                    ]
                 },
                 {
                    title: "التعليم",
                    icon: "solar:book-2-bold-duotone",
                    routes: [
                        { path: "/teacher/courses", name: "الكورسات", icon: "solar:book-bold-duotone" },
                        { path: "/teacher/lessons", name: "الحصص", icon: "solar:video-library-bold-duotone" },
                        { path: "/teacher/students", name: "طلابي", icon: "solar:users-group-rounded-bold-duotone" },
                    ]
                 },
                 {
                    title: "الاختبارات والواجبات",
                    icon: "solar:document-text-bold-duotone",
                    routes: [
                        { path: "/teacher/exams", name: "الاختبارات", icon: "solar:document-text-bold-duotone" },
                        { path: "/teacher/homeworks", name: "الواجبات", icon: "solar:notebook-bold-duotone" },
                        { path: "/teacher/question-bank", name: "بنك الأسئلة", icon: "solar:question-circle-bold-duotone" },
                    ]
                 },
                 {
                    title: "المالية والتقارير",
                    icon: "solar:wallet-bold-duotone",
                    routes: [
                        { path: "/teacher/student-subscriptions", name: "اشتراكات الطلاب", icon: "solar:card-bold-duotone" },
                        { path: "/teacher/platform-subscriptions", name: "اشتراكي", icon: "solar:wallet-money-bold-duotone" },
                        { path: "/teacher/transactions", name: "المعاملات", icon: "solar:wallet-money-bold-duotone" },
                        { path: "/teacher/reports", name: "التقارير", icon: "solar:chart-2-bold-duotone" },
                    ]
                 },
                 {
                     title: "أدوات",
                     icon: "solar:widget-bold-duotone",
                     routes: [
                        { path: "/teacher/activation-codes", name: "أكواد التفعيل", icon: "solar:key-bold-duotone" },
                        { path: "/teacher/coupons", name: "الكوبونات", icon: "solar:ticket-sale-bold-duotone" },
                        { path: "/teacher/settings", name: "الإعدادات", icon: "solar:settings-bold-duotone" },
                     ]
                 }
             ];
        } else if (role === UserRole.STUDENT) {
            // Match Legacy Exact Groups
            return [
              {
                title: "الرئيسية",
                icon: "solar:home-smile-bold-duotone",
                routes: [
                  { path: "/student", name: "لوحة التحكم", icon: "solar:widget-bold-duotone" },
                ],
              },
              {
                title: "التعليم",
                icon: "solar:book-2-bold-duotone",
                routes: [
                  { path: "/student/courses", name: "الكورسات", icon: "solar:video-library-bold-duotone" },
                  { path: "/student/subscriptions", name: "دروسي المشتراه", icon: "solar:play-circle-bold-duotone" }, // Assuming new route /subscriptions maps to old /lessons-subscriptions intent
                  { path: "/student/free-exams", name: "امتحانات عامة", icon: "solar:hashtag-square-bold-duotone", underDevelopment: true },
                ],
              },
              {
                title: "الأنشطة",
                icon: "solar:medal-star-bold-duotone",
                routes: [
                  { path: "/student/attendance", name: "الحضور", icon: "solar:calendar-mark-bold-duotone", underDevelopment: true },
                  { path: "/student/certificates", name: "شهاداتي", icon: "solar:diploma-bold-duotone" },
                ],
              },
              {
                title: "المحتوى والمشتريات",
                icon: "solar:bag-5-bold-duotone",
                routes: [
                  { path: "/student/attachments", name: "الكتب", icon: "solar:book-bookmark-bold-duotone", underDevelopment: true },
                  { path: "/student/offers", name: "العروض الخاصة", icon: "solar:tag-price-bold-duotone", underDevelopment: true },
                  { path: "/student/invitations", name: "الدعوات", icon: "solar:letter-unread-bold-duotone", underDevelopment: true },
                ],
              },
              {
                title: "الطلبات والمدفوعات",
                icon: "solar:wallet-bold-duotone",
                routes: [
                  { path: "/student/orders", name: "طلباتي", icon: "solar:clipboard-list-bold-duotone" },
                  { path: "/student/transactions", name: "الرصيد والمدفوعات", icon: "solar:dollar-minimalistic-bold-duotone" },
                ],
              },
              {
                title: "الإعدادات",
                icon: "solar:settings-bold-duotone",
                routes: [
                  { path: "/student/settings", name: "الاعدادات", icon: "solar:settings-minimalistic-bold-duotone" },
                ],
              },
            ];
        }
        return [];
    };

    const routeGroups = getRouteGroups();
    const sidebarWidth = isCollapsed ? "88px" : "280px"; // Matched Legacy (88px)

    return (
        <Box minH="100vh" bg="gray.50">
            <SidebarContent
                onClose={effectiveOnClose}
                display={{ base: "none", md: "block" }}
                routeGroups={routeGroups}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
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
                <DrawerContent bg="gray.900">
                     <SidebarContent onClose={effectiveOnClose} routeGroups={routeGroups} isCollapsed={false} />
                </DrawerContent>
            </Drawer>
            
            <Box
                ml={{ base: 0, md: sidebarWidth }}
                bg="gray.50"
                minH="100vh"
                transition="all 0.3s ease"
            >
                {children}
            </Box>
        </Box>
    );
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
    routeGroups: RouteGroup[];
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const SidebarContent = ({ onClose, routeGroups, isCollapsed = false, onToggleCollapse, ...rest }: SidebarProps) => {
    const { user, role } = useAuth();
    const isMobile = rest.display === undefined || rest.display === "flex";

    return (
        <Stack
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)" // Legacy Gradient
            borderRight="1px"
            borderRightColor="whiteAlpha.200"
            w={{ base: "full", md: isCollapsed ? "88px" : "280px" }}
            pos="fixed"
            h="full"
            p={3}
            spacing={4}
            overflowY="auto"
            zIndex={100}
            css={{
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.3)', borderRadius: '10px' },
            }}
            {...rest}
        >
            {/* Header: Logo + Toggle */}
            <Flex
                alignItems="center"
                justifyContent={isCollapsed ? "center" : "space-between"}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                borderRadius="2xl"
                p={3}
                border="1px solid"
                borderColor="whiteAlpha.300"
                position="relative"
            >
                {!isCollapsed && (
                     <HStack spacing={3}>
                        <Box color="white" fontWeight="bold" fontSize="lg">
                            <Box as="span" bg="white" color="purple.600" px={2} py={1} borderRadius="md" mr={2}>E</Box>
                            إدراك
                        </Box>
                     </HStack>
                )}
                {isCollapsed && (
                     <Avatar 
                        name={user?.firstName} 
                        src={user?.image} 
                        size="sm"
                        border="2px solid white"
                    />
                )}
                 
                 <CloseButton 
                    display={{ base: "flex", md: "none" }} 
                    onClick={onClose} 
                    color="white"
                    position="absolute"
                    left={3}
                />
            </Flex>

            {/* Collapse Toggle Button - Legacy Style */}
            {!isMobile && onToggleCollapse && (
                <Flex mt={1} justify="center" display={{ base: "none", md: "flex" }}>
                    <Box
                        bg="white"
                        borderRadius="full"
                        w={9}
                        h={9}
                        boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                        cursor="pointer"
                        border="2px solid"
                        borderColor="whiteAlpha.400"
                        onClick={onToggleCollapse}
                        _hover={{
                            bg: "whiteAlpha.900",
                            transform: "scale(1.1)",
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.3s"
                    >
                        <Icon 
                            icon={isCollapsed ? "solar:alt-arrow-right-bold-duotone" : "solar:alt-arrow-left-bold-duotone"} 
                            width="20" 
                            color="#667eea"
                        />
                    </Box>
                </Flex>
            )}

            {/* Profile Section */}
            {!isCollapsed && (
                <Stack
                    direction="row"
                    align="center"
                    spacing={3}
                    px={4}
                    py={3}
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                >
                    <Avatar 
                        name={user?.firstName} 
                        size="md" 
                        border="2px solid white"
                        src={user?.image} 
                    />
                    <Stack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="sm" color="white" noOfLines={1}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                         <Text color="whiteAlpha.800" fontSize="xs" isTruncated>
                            {role}
                        </Text>
                    </Stack>
                </Stack>
            )}

            {/* Navigation Groups */}
            <Box flex={1} overflowY="auto" pt={2}>
                <Stack spacing={4}>
                    {routeGroups.map((group, idx) => (
                        <Box key={idx}>
                            {/* Group Title */}
                            {!isCollapsed && (
                                <HStack spacing={2} px={3} py={2} mb={2}>
                                    <Box p={1.5} bg="whiteAlpha.200" rounded="lg" color="white">
                                        <Icon icon={group.icon} width="16" height="16" />
                                    </Box>
                                    <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.900" textTransform="uppercase" letterSpacing="wide">
                                        {group.title}
                                    </Text>
                                </HStack>
                            )}

                             {/* Group Items */}
                             <List spacing={1.5}>
                                 {group.routes.map((route) => (
                                     <ListItem key={route.path}>
                                         <NavItem {...route} isCollapsed={isCollapsed} />
                                     </ListItem>
                                 ))}
                             </List>

                             {/* Divider */}
                             {idx < routeGroups.length - 1 && !isCollapsed && (
                                 <Box h="1px" bg="whiteAlpha.200" my={3} mx={3} />
                             )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};

interface NavItemProps extends MenuItem {
    isCollapsed?: boolean;
}

const NavItem = ({ icon, path, name, badge, underDevelopment, isCollapsed = false }: NavItemProps) => {
    const { pathname } = useLocation();
    
    // Exact match for root paths, prefix match for others but be careful
    const isActive = path === '/' 
        ? pathname === '/' 
        : pathname.startsWith(path);

    // Disable link if under development
    const content = (
         <HStack
            py={3}
            px={4}
            rounded="xl"
            bg={isActive ? "whiteAlpha.300" : "transparent"}
            backdropFilter={isActive ? "blur(10px)" : "none"}
            border="1px solid"
            borderColor={isActive ? "whiteAlpha.400" : "transparent"}
            alignItems="center"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            fontWeight={isActive ? "bold" : "medium"}
            fontSize="sm"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="pointer"
            position="relative"
            overflow="hidden"
            _hover={{
                bg: "whiteAlpha.200",
                borderColor: "whiteAlpha.300",
                transform: "translateX(-4px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
            boxShadow={isActive ? "0 4px 12px rgba(0,0,0,0.2)" : "none"}
            opacity={underDevelopment ? 0.6 : 1}
        >
             {/* Active Indicator */}
             {isActive && !isCollapsed && (
                 <Box position="absolute" right={0} top="50%" transform="translateY(-50%)" w="3px" h="60%" bg="white" borderRadius="full" />
             )}

             <Box color="white">
                 <Icon icon={icon} width="22" height="22" />
             </Box>

             {!isCollapsed && (
                 <>
                    <Text color="white" flex={1} noOfLines={1}>{name}</Text>
                    {underDevelopment && <Badge fontSize="xx-small" colorScheme="orange">قريباً</Badge>}
                    {badge && <Badge fontSize="xx-small" colorScheme="red">{badge}</Badge>}
                    <Box color="whiteAlpha.700">
                         <Icon icon="solar:alt-arrow-left-bold" width="18" />
                    </Box>
                 </>
             )}
        </HStack>
    );

    if (underDevelopment) {
        return <Box title="قريباً" cursor="not-allowed">{content}</Box>;
    }

    return (
        <Link to={path} title={name}>
            {content}
        </Link>
    );
};
