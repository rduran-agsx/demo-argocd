import React from "react";
import {
  Box,
  VStack,
  Text,
  Flex,
  chakra,
  Button,
  Icon,
  useColorMode,
  useColorModeValue,
  useMediaQuery,
} from "@chakra-ui/react";
import { GiCubeforce, GiSpellBook } from "react-icons/gi";
import { RxDashboard } from "react-icons/rx";
import { RiStackLine } from "react-icons/ri";
import {
  LuRocket,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import "@fontsource-variable/karla/wght.css";
import "@fontsource/space-grotesk/700.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SidebarItem = chakra(Flex, {
  baseStyle: {
    alignItems: "center",
    height: "52px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    marginTop: "3px",
    marginBottom: "3px",
  },
});

const DesktopSidebarItem = chakra(SidebarItem, {
  baseStyle: {
    borderRadius: "0 20px 20px 0",
    marginRight: "16px",
  },
});

const MobileSidebarItem = chakra(SidebarItem, {
  baseStyle: {
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "12px",
  },
});

const SidebarIcon = chakra(Box, {
  baseStyle: {
    fontSize: "24px",
    color: "inherit",
    transition: "all 0.3s ease",
  },
});

const DesktopSidebarIcon = chakra(SidebarIcon, {
  baseStyle: {
    position: "absolute",
    left: "20px",
    fontSize: "24px",
  },
});

const SidebarText = chakra(Text, {
  baseStyle: {
    fontFamily: "body",
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "27px",
    color: "inherit",
    marginLeft: "60px",
    transition: "opacity 0.3s ease",
  },
});

const PremiumBox = React.memo(({ isCollapsed }) => {
  const navigate = useNavigate();
  const borderColor = useColorModeValue(
    "brand.border.light",
    "brand.border.dark"
  );
  const boxShadow = useColorModeValue(
    "0 4px 0 0 black",
    "0 4px 0 0 rgba(255, 255, 255, 0.2)"
  );
  const textColor = useColorModeValue("brand.text.light", "brand.text.dark");
  const buttonBg = useColorModeValue("white", "brand.surface.dark");
  const premiumGradient = useColorModeValue(
    "linear(135deg, #FFD700, #FFA500)",
    "linear(135deg, #B38600, #804000)"
  );

  if (isCollapsed) return null;

  return (
    <Box
      bgGradient={premiumGradient}
      borderRadius="20px"
      border="1px solid"
      borderColor={borderColor}
      boxShadow={boxShadow}
      padding={4}
      margin={4}
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
    >
      <Box
        position="absolute"
        top="-10px"
        right="-10px"
        width="80px"
        height="80px"
        borderRadius="full"
        backgroundColor="rgba(255, 255, 255, 0.2)"
      />
      <Flex direction="column" alignItems="center" justifyContent="center">
        <Text
          fontWeight="bold"
          fontSize="18px"
          color={textColor}
          marginBottom={3}
        >
          Your access is limited
        </Text>
        <Button
          variant="solid"
          backgroundColor={buttonBg}
          color={textColor}
          borderRadius="full"
          fontWeight="bold"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={boxShadow}
          _hover={{
            transform: "translateY(-2px)",
          }}
          _active={{
            transform: "translateY(0)",
          }}
          onClick={() => navigate("/premium")}
        >
          Go Premium! ✨
        </Button>
      </Flex>
    </Box>
  );
});

const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  activeItem,
  lastVisitedExam,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { colorMode } = useColorMode();
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  const bgColor = useColorModeValue(
    "brand.surface.light",
    "brand.surface.dark"
  );
  const textColor = useColorModeValue("brand.text.light", "brand.text.dark");
  const itemColor = useColorModeValue("brand.text.light", "brand.text.dark");
  const borderColor = useColorModeValue(
    "brand.border.light",
    "brand.border.dark"
  );
  const activeItemBg = useColorModeValue(
    "brand.secondary.light",
    "brand.secondary.dark"
  );
  const boxShadow = useColorModeValue(
    "0 4px 0 0 black",
    "0 4px 0 0 rgba(255, 255, 255, 0.2)"
  );
  const logoutColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("brand.hover.light", "brand.hover.dark");
  const activeBg = useColorModeValue(
    "brand.primary.light",
    "brand.primary.dark"
  );
  const scrollbarThumbColor = useColorModeValue(
    "rgba(0,0,0,0.1)",
    "rgba(255,255,255,0.1)"
  );
  const scrollbarThumbHoverColor = useColorModeValue(
    "rgba(0,0,0,0.2)",
    "rgba(255,255,255,0.2)"
  );

  const menuItems = [
    { name: "Dashboard", icon: RxDashboard, path: "/" },
    { name: "Providers", icon: GiCubeforce, path: "/providers" },
    { name: "Exams", icon: RiStackLine, path: "/exams" },
    { name: "Custom Exam", icon: GiSpellBook, path: "/custom-exam" },
    { name: "Actual Exam", icon: LuRocket, path: "/actual-exam" },
  ];

  const handleItemClick = (path, name) => {
    if (name === "Actual Exam" && lastVisitedExam) {
      navigate(`/actual-exam/${lastVisitedExam}`);
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isMobile) {
    return (
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        backgroundColor={bgColor}
        borderTop="1px solid"
        borderColor={borderColor}
        borderTopRadius="32px"
        paddingTop={4}
        paddingBottom={4}
        paddingX={4}
        zIndex={1000}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {menuItems.map((item) => (
          <MobileSidebarItem
            key={item.name}
            onClick={() => handleItemClick(item.path, item.name)}
            backgroundColor={
              activeItem === item.name ? activeItemBg : "transparent"
            }
          >
            <Icon as={item.icon} fontSize="24px" color={itemColor} />
          </MobileSidebarItem>
        ))}
      </Box>
    );
  }

  return (
    <Box
      backgroundColor={bgColor}
      width={isCollapsed ? "80px" : "300px"}
      height="100vh"
      position="relative"
      transition="all 0.3s ease"
      borderRadius="0"
      display="flex"
      flexDirection="column"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "1px",
        backgroundColor: borderColor,
        zIndex: 1,
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "25px", // Adjusted from 24px
        right: 0,
        height: "30px", // Adjusted from 32px for better coverage
        width: "2px", // Increased from 1px to ensure full coverage
        backgroundColor: bgColor,
        zIndex: 25,
      }}
    >
      {/* Logo Section */}
      <Box flexShrink={0} paddingTop="20px" paddingX="0">
        <Flex
          alignItems="center"
          justifyContent="center"
          marginBottom="60px"
          opacity={isCollapsed ? 0 : 1}
          transition="opacity 0.3s ease"
          pointerEvents={isCollapsed ? "none" : "auto"}
        >
          <Box display="flex" alignItems="center">
            <img
              src="/hiraya-logo.png"
              alt="Hiraya Logo"
              width="32"
              height="32"
              style={{
                filter: colorMode === "dark" ? "invert(1)" : "none",
              }}
            />
            <Text
              marginLeft="4px"
              fontFamily="heading"
              fontSize="32px"
              fontWeight="bold"
              color={textColor}
              position="relative"
              transition="color 0.2s"
            >
              hiraya
              <sup
                style={{
                  fontSize: "8px",
                  position: "absolute",
                  top: "15px",
                  right: "-12px",
                  color: textColor,
                }}
              >
                TM
              </sup>
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Menu Items */}
      <Box
        flex="1"
        overflow={isCollapsed ? "visible" : "auto"}
        css={
          !isCollapsed
            ? {
                "&::-webkit-scrollbar": {
                  width: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "3px",
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: scrollbarThumbColor,
                  borderRadius: "24px",
                },
                "&:hover::-webkit-scrollbar-thumb": {
                  background: scrollbarThumbHoverColor,
                },
                scrollbarWidth: "thin",
                scrollbarColor: `${scrollbarThumbColor} transparent`,
              }
            : {}
        }
      >
        <VStack spacing={2} align="stretch">
          {menuItems.map((item) => (
            <DesktopSidebarItem
              key={item.name}
              onClick={() => handleItemClick(item.path, item.name)}
              position="relative"
              zIndex={1}
              color={itemColor}
              _hover={{
                backgroundColor: hoverBg,
              }}
            >
              <Box
                position="absolute"
                top="-3px"
                left={0}
                right={0}
                bottom="-3px"
                backgroundColor={
                  activeItem === item.name ? activeItemBg : "transparent"
                }
                borderRadius="0 20px 20px 0"
                borderTop={
                  activeItem === item.name ? `1px solid ${borderColor}` : "none"
                }
                borderRight={
                  activeItem === item.name ? `1px solid ${borderColor}` : "none"
                }
                borderBottom={
                  activeItem === item.name ? `1px solid ${borderColor}` : "none"
                }
                boxShadow={activeItem === item.name ? boxShadow : "none"}
                zIndex={-1}
                transition="all 0.2s"
              />
              <DesktopSidebarIcon as={item.icon} fontSize="24px" size="24px" />
              <SidebarText
                fontWeight={activeItem === item.name ? 700 : 500}
                opacity={isCollapsed ? 0 : 1}
                pointerEvents={isCollapsed ? "none" : "auto"}
              >
                {item.name}
              </SidebarText>
            </DesktopSidebarItem>
          ))}
        </VStack>
      </Box>

      {/* Bottom Section */}
      <Box flexShrink={0} paddingBottom="20px">
        <PremiumBox isCollapsed={isCollapsed} />
        <DesktopSidebarItem
          color={logoutColor}
          onClick={handleLogout}
          _hover={{
            "& > *": {
              color: "red.500",
            },
            transform: "translateY(-2px)",
          }}
        >
          <DesktopSidebarIcon as={LuLogOut} fontSize="24px" size="24px" />
          <SidebarText
            opacity={isCollapsed ? 0 : 1}
            pointerEvents={isCollapsed ? "none" : "auto"}
          >
            Logout
          </SidebarText>
        </DesktopSidebarItem>
      </Box>

      {/* Collapse Button */}
      <Button
        position="absolute"
        top="24px"
        right="-32px"
        size="sm"
        width="14px"
        height="32px"
        borderRadius="0 16px 16px 0"
        onClick={onToggleCollapse}
        zIndex={20}
        backgroundColor={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderLeft="none"
        color={textColor}
        _hover={{
          backgroundColor: hoverBg,
        }}
        _active={{ backgroundColor: activeBg }}
        transition="all 0.2s"
        padding={0}
        display={isMobile ? "none" : "flex"}
      >
        <Icon
          as={isCollapsed ? LuChevronRight : LuChevronLeft}
          fontSize="12px"
        />
      </Button>
    </Box>
  );
};

export default Sidebar;