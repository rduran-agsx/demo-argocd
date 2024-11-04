import React from "react";
import {
  Box,
  Text,
  Flex,
  Avatar,
  HStack,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

const Navbar = ({ activeItem, children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const bgColor = useColorModeValue(
    "brand.background.light",
    "brand.background.dark"
  );
  const borderColor = useColorModeValue(
    "brand.border.light",
    "brand.border.dark"
  );
  const textColor = useColorModeValue("brand.text.light", "brand.text.dark");
  const highlightBg = useColorModeValue(
    "brand.secondary.light",
    "brand.secondary.dark"
  );
  const toggleBg = useColorModeValue(
    "brand.surface.light",
    "brand.surface.dark"
  );
  const toggleIconBg = useColorModeValue(
    "brand.primary.light",
    "brand.primary.dark"
  );
  const helloTextColor = useColorModeValue("gray.600", "gray.400");

  const MobileThemeToggle = () => (
    <Box
      width="40px"
      height="40px"
      bg={toggleBg}
      borderRadius="12px"
      border="1px solid"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onClick={toggleColorMode}
      transition="all 0.2s"
    >
      {colorMode === "light" ? (
        <RiSunFill size="20px" color={textColor} />
      ) : (
        <RiMoonFill size="20px" color={textColor} />
      )}
    </Box>
  );

  const DesktopThemeToggle = () => (
    <Flex align="center">
      <Box
        width="52px"
        height="24px"
        bg={toggleBg}
        borderRadius="full"
        display="flex"
        alignItems="center"
        padding="2px"
        cursor="pointer"
        onClick={toggleColorMode}
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        _hover={{
          opacity: 0.8,
        }}
        transition="all 0.2s"
      >
        <Box
          width="16px"
          height="16px"
          bg={toggleIconBg}
          borderRadius="full"
          transform={
            colorMode === "light" ? "translateX(3px)" : "translateX(27px)"
          }
          transition="all 0.2s"
          border="1px solid"
          borderColor={borderColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={textColor}
        >
          {colorMode === "light" ? (
            <RiSunFill size="10px" />
          ) : (
            <RiMoonFill size="10px" />
          )}
        </Box>
      </Box>
      <Text
        fontFamily="body"
        fontWeight={500}
        fontSize="16px"
        lineHeight="24px"
        color={textColor}
        ml={2}
        transition="color 0.2s"
      >
        {colorMode === "light" ? "Light theme" : "Dark theme"}
      </Text>
    </Flex>
  );

  return (
    <Flex
      justify="space-between"
      align="center"
      p={4}
      pl={isMobile ? 4 : 10}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="all 0.2s"
    >
      <Flex align="center" overflow="hidden" flex={1} minWidth={0}>
        {isMobile ? (
          <Flex align="center">
            <img
              src="/hiraya-logo.png"
              alt="Hiraya Logo"
              width="24"
              height="24"
              style={{
                filter: colorMode === "dark" ? "invert(1)" : "none",
              }}
            />
            <Text
              marginLeft="4px"
              fontFamily="heading"
              fontSize="24px"
              fontWeight="bold"
              color={textColor}
              position="relative"
            >
              hiraya
              <sup
                style={{
                  fontSize: "8px",
                  position: "absolute",
                  top: "8px",
                  right: "-12px",
                  color: textColor,
                }}
              >
                TM
              </sup>
            </Text>
          </Flex>
        ) : (
          <>
            <Box flexShrink={0} mr={4}>
              <Text
                fontFamily="heading"
                fontWeight={700}
                fontSize="24px"
                lineHeight="29px"
                color={textColor}
                transition="color 0.2s"
              >
                <Box
                  as="span"
                  bg={highlightBg}
                  px="1"
                  py="0"
                  borderRadius="8px"
                >
                  {activeItem}
                </Box>
              </Text>
            </Box>
            <Box overflow="hidden" flex={1} minWidth={0}>
              {children}
            </Box>
          </>
        )}
      </Flex>

      <HStack spacing={4} flexShrink={0} ml={4}>
        {isMobile ? <MobileThemeToggle /> : <DesktopThemeToggle />}
        <Flex align="center">
          {!isMobile && (
            <>
              <Text
                fontFamily="body"
                fontWeight={700}
                fontSize="20px"
                lineHeight="30px"
                color={helloTextColor}
                mr={1}
                transition="color 0.2s"
              >
                Hello,
              </Text>
              <Text
                fontFamily="body"
                fontWeight={700}
                fontSize="20px"
                lineHeight="30px"
                color={textColor}
                mr={2}
                transition="color 0.2s"
              >
                rsduran!
              </Text>
            </>
          )}
          <Avatar
            src="https://bit.ly/dan-abramov"
            size={isMobile ? "sm" : "md"}
          />
        </Flex>
      </HStack>
    </Flex>
  );
};

export default Navbar;
