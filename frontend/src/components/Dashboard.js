import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  useToast,
  Spinner,
  useDisclosure,
  useColorMode,
  Grid,
  GridItem,
  Input,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { FaApple, FaAndroid, FaHeart, FaTimes } from "react-icons/fa";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { IconBox } from "./IconBox";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { createCustomToast } from "./CustomToast";
import Pagination from "./Pagination";

import { fetchWithAuth } from "../utils/api";

const CustomCheckbox = ({ isChecked, isIndeterminate, onChange }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      as="button"
      width="20px"
      height="20px"
      borderRadius="4px"
      border="2px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      backgroundColor={
        isChecked
          ? colorMode === "light"
            ? "brand.primary.light"
            : "brand.primary.dark"
          : "transparent"
      }
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onChange}
      _hover={{
        backgroundColor: isChecked
          ? colorMode === "light"
            ? "brand.primary.dark"
            : "brand.primary.light"
          : "rgba(0, 0, 0, 0.1)",
      }}
      transition="all 0.2s"
    >
      {isIndeterminate ? (
        <Box width="10px" height="2px" backgroundColor="white" />
      ) : (
        isChecked && (
          <Box
            width="10px"
            height="10px"
            backgroundColor="white"
            borderRadius="2px"
          />
        )
      )}
    </Box>
  );
};

const StatusBadge = ({ status }) => {
  const { colorMode } = useColorMode();
  let bgGradient;

  switch (status) {
    case "Passed":
      bgGradient =
        colorMode === "light"
          ? "linear(to-r, #4CAF50, #8BC34A)"
          : "linear(to-r, #2E673F, #4A6F2E)";
      break;
    case "Failed":
      bgGradient =
        colorMode === "light"
          ? "linear(to-r, #FF5252, #FF8A80)"
          : "linear(to-r, #992F2F, #994D4D)";
      break;
    case "Not Attempted":
      bgGradient =
        colorMode === "light"
          ? "linear(to-r, #9E9E9E, #BDBDBD)"
          : "linear(to-r, #4A4A4A, #666666)";
      break;
    default:
      bgGradient =
        colorMode === "light"
          ? "linear(to-r, #FFD54F, #FFF176)"
          : "linear(to-r, #997F30, #998E47)";
  }

  return (
    <Box
      paddingX={2}
      paddingY={0.5}
      bgGradient={bgGradient}
      borderRadius="full"
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
    >
      <Text
        fontSize="11px"
        fontWeight="600"
        color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
      >
        {status}
      </Text>
    </Box>
  );
};

const CustomProgressIndicator = ({ value }) => {
  const { colorMode } = useColorMode();

  const getColor = (value) => {
    if (value < 50)
      return colorMode === "light"
        ? "gradient.error.light"
        : "gradient.error.dark";
    if (value < 75)
      return colorMode === "light"
        ? "gradient.warning.light"
        : "gradient.warning.dark";
    return colorMode === "light"
      ? "gradient.success.light"
      : "gradient.success.dark";
  };

  const getGradientColors = (gradientKey) => {
    const gradients = {
      "gradient.error.light": ["#FF5252", "#FF8A80"],
      "gradient.error.dark": ["#992F2F", "#994D4D"],
      "gradient.warning.light": ["#FFD54F", "#FFF176"],
      "gradient.warning.dark": ["#997F30", "#998E47"],
      "gradient.success.light": ["#4CAF50", "#8BC34A"],
      "gradient.success.dark": ["#2E673F", "#4A6F2E"],
    };

    return gradients[gradientKey] || gradients["gradient.success.light"];
  };

  const gradientColors = getGradientColors(getColor(value));

  return (
    <Box position="relative" width="40px" height="40px">
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        borderRadius="50%"
        border="3px solid"
        borderColor={colorMode === "light" ? "#E0E0E0" : "#404040"}
      />
      <Box
        as="svg"
        viewBox="0 0 36 36"
        width="100%"
        height="100%"
        position="absolute"
      >
        <defs>
          <linearGradient
            id={`gradient-${value}`}
            gradientTransform="rotate(90)"
          >
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        <path
          d={`M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831`}
          fill="none"
          stroke={`url(#gradient-${value})`}
          strokeWidth="3"
          strokeDasharray={`${value}, 100`}
        />
      </Box>
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="11px"
          fontWeight="600"
          color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
        >
          {value}%
        </Text>
      </Flex>
    </Box>
  );
};

const CustomButton = ({
  children,
  leftIcon,
  backgroundColor,
  color,
  _hover,
  boxShadow,
  isDisabled,  // Add this
  ...props
}) => (
  <Button
    height="48px"
    fontSize={{ base: "14px", md: "16px" }}
    paddingLeft={{ base: "16px", md: "24px" }}
    paddingRight={{ base: "16px", md: "24px" }}
    backgroundColor={backgroundColor || "white"}
    color={color || "black"}
    borderRadius="full"
    border="1px solid black"
    fontWeight={700}
    textTransform="uppercase"
    transition="0.3s"
    boxShadow={boxShadow || (isDisabled ? "none" : "0 4px 0 0 black")}  // Update this
    _hover={{
      transform: isDisabled ? "none" : "translateY(2px)",  // Update this
      boxShadow: isDisabled ? "none" : "0 2px 0 0 black", // Update this
      ..._hover,
    }}
    _active={{
      transform: isDisabled ? "none" : "translateY(4px)",  // Update this
      boxShadow: "none",
    }}
    isDisabled={isDisabled}
    leftIcon={leftIcon}
    {...props}
  >
    {children}
  </Button>
);

const CloseButton = ({ onClick }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      as="button"
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="24px"
      h="24px"
      bg="transparent"
      _focus={{ boxShadow: "none" }}
      color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
      borderRadius="50%"
    >
      <FaTimes size="16px" />
    </Box>
  );
};

const WelcomeComponent = ({ users, countries }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      width="100%"
      bgGradient={
        colorMode === "light"
          ? "linear(to-r, #00bfff, #0080ff)"
          : "linear(to-r, #006699, #004d80)"
      }
      borderRadius={{ base: "10px", md: "20px" }}
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      boxShadow={
        colorMode === "light"
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      padding={{ base: 4, md: 6 }}
      marginBottom={{ base: 4, md: 8 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={{ base: "-10px", md: "-20px" }}
        right={{ base: "-10px", md: "-20px" }}
        width={{ base: "100px", md: "150px" }}
        height={{ base: "100px", md: "150px" }}
        borderRadius="full"
        backgroundColor="rgba(255, 255, 255, 0.1)"
      />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
      >
        <VStack
          align={{ base: "center", md: "flex-start" }}
          spacing={2}
          marginBottom={{ base: 4, md: 0 }}
        >
          <Text
            fontSize={{ base: "24px", md: "32px" }}
            fontWeight="800"
            color="white"
            textAlign={{ base: "center", md: "left" }}
          >
            Welcome to Athena6
          </Text>
          <Text
            fontSize={{ base: "16px", md: "18px" }}
            fontWeight="500"
            color="white"
            textAlign={{ base: "center", md: "left" }}
          >
            Empowering your learning journey
          </Text>
        </VStack>
        <Flex>
          <Box marginRight={{ base: 4, md: 8 }} textAlign="center">
            <Text
              fontSize={{ base: "32px", md: "40px" }}
              fontWeight="800"
              color="white"
            >
              {users}M+
            </Text>
            <Text
              fontSize={{ base: "14px", md: "16px" }}
              fontWeight="600"
              color="white"
            >
              Users
            </Text>
          </Box>
          <Box textAlign="center">
            <Text
              fontSize={{ base: "32px", md: "40px" }}
              fontWeight="800"
              color="white"
            >
              {countries}+
            </Text>
            <Text
              fontSize={{ base: "14px", md: "16px" }}
              fontWeight="600"
              color="white"
            >
              Countries
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

const MobileAppsComing = ({ onClose }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      width="100%"
      bgGradient={
        colorMode === "light"
          ? "linear(to-br, #FFB347, #ffcc33)"
          : "linear(to-br, #8B6914, #806600)"
      }
      borderRadius={{ base: "10px", md: "20px" }}
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      boxShadow={
        colorMode === "light"
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      padding={{ base: 4, md: 6 }}
      marginBottom={{ base: 4, md: 8 }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={2} right={2} zIndex={1}>
        <CloseButton onClick={onClose} />
      </Box>
      <Box
        position="absolute"
        bottom={{ base: "-15px", md: "-30px" }}
        left={{ base: "-15px", md: "-30px" }}
        width={{ base: "100px", md: "150px" }}
        height={{ base: "100px", md: "150px" }}
        borderRadius="full"
        backgroundColor="rgba(255, 255, 255, 0.1)"
      />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
      >
        <VStack
          align={{ base: "center", md: "flex-start" }}
          spacing={2}
          marginBottom={{ base: 4, md: 0 }}
        >
          <Text
            fontSize={{ base: "24px", md: "28px" }}
            fontWeight="800"
            color="black"
            textAlign={{ base: "center", md: "left" }}
          >
            Mobile Apps Coming Soon
          </Text>
          <Text
            fontSize={{ base: "16px", md: "18px" }}
            fontWeight="500"
            color="black"
            textAlign={{ base: "center", md: "left" }}
          >
            Your learning journey, now in your pocket!
          </Text>
        </VStack>
        <Flex
          flexDirection={{ base: "column", sm: "row" }}
          marginTop={{ base: 4, md: 0 }}
        >
          <CustomButton
            leftIcon={<FaApple />}
            marginBottom={{ base: 2, sm: 0 }}
            marginRight={{ base: 0, sm: 4 }}
            backgroundColor="white"
            color="black"
            border="1px solid black"
            boxShadow="0 4px 0 0 black"
            _hover={{
              transform: "translateY(2px)",
              boxShadow: "0 2px 0 0 black",
            }}
            _active={{
              transform: "translateY(4px)",
              boxShadow: "none",
            }}
          >
            iOS
          </CustomButton>
          <CustomButton
            leftIcon={<FaAndroid />}
            backgroundColor="white"
            color="black"
            border="1px solid black"
            boxShadow="0 4px 0 0 black"
            _hover={{
              transform: "translateY(2px)",
              boxShadow: "0 2px 0 0 black",
            }}
            _active={{
              transform: "translateY(4px)",
              boxShadow: "none",
            }}
          >
            Android
          </CustomButton>
        </Flex>
      </Flex>
    </Box>
  );
};

const SupportDevelopers = ({ onClose }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      width="100%"
      bgGradient={
        colorMode === "light"
          ? "linear(to-r, #8BC34A, #4CAF50)"
          : "linear(to-r, #3D662A, #2D5A2E)"
      }
      borderRadius={{ base: "10px", md: "20px" }}
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      boxShadow={
        colorMode === "light"
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      padding={{ base: 4, md: 6 }}
      marginBottom={{ base: 4, md: 8 }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={2} right={2} zIndex={1}>
        <CloseButton onClick={onClose} />
      </Box>
      <Box
        position="absolute"
        top={{ base: "-15px", md: "-30px" }}
        right={{ base: "-15px", md: "-30px" }}
        width={{ base: "100px", md: "150px" }}
        height={{ base: "100px", md: "150px" }}
        borderRadius="full"
        backgroundColor="rgba(255, 255, 255, 0.1)"
      />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
      >
        <VStack
          align={{ base: "center", md: "flex-start" }}
          spacing={2}
          flex="1"
        >
          <Text
            fontSize={{ base: "24px", md: "28px" }}
            fontWeight="800"
            color="white"
            textAlign={{ base: "center", md: "left" }}
          >
            Support the Developers
          </Text>
          <Text
            fontSize={{ base: "16px", md: "18px" }}
            fontWeight="500"
            color="white"
            textAlign={{ base: "center", md: "left" }}
          >
            Help us keep Hiraya ad-free and running 24/7, 365 days a year
          </Text>
          <Text
            fontSize={{ base: "14px", md: "16px" }}
            fontWeight="500"
            color="white"
            textAlign={{ base: "center", md: "left" }}
          >
            Your support helps cover recurring costs and keeps this website
            ad-free. Thank you for your generosity!
          </Text>
        </VStack>
        <Box marginLeft={{ base: 0, md: 4 }} marginTop={{ base: 4, md: 0 }}>
          <CustomButton
            leftIcon={<FaHeart />}
            backgroundColor="#FF4081"
            color="white"
            border="1px solid black"
            boxShadow="0 4px 0 0 black"
            _hover={{
              backgroundColor: "#E91E63",
              transform: "translateY(2px)",
              boxShadow: "0 2px 0 0 black",
            }}
            _active={{
              transform: "translateY(4px)",
              boxShadow: "none",
            }}
          >
            DONATE
          </CustomButton>
        </Box>
      </Flex>
    </Box>
  );
};

const EmptyProgressState = () => {
  const { colorMode } = useColorMode();

  return (
    <Box
      borderRadius="12px"
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      padding={6}
      backgroundColor={
        colorMode === "light"
          ? "brand.background.light"
          : "brand.background.dark"
      }
      marginBottom={8}
      boxShadow={
        colorMode === "light"
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
    >
      <VStack spacing={4}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
        >
          No Exam Progress Yet
        </Text>
        <Text
          color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
          opacity={0.6}
          textAlign="center"
        >
          Start your learning journey by selecting an exam and clicking
          "Continue" to begin tracking your progress here.
        </Text>
      </VStack>
    </Box>
  );
};

const ExamMobileCard = ({ exam, isSelected, onSelect, navigate }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      padding={4}
      borderRadius="12px"
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      backgroundColor={
        colorMode === "light"
          ? "brand.background.light"
          : "brand.background.dark"
      }
      marginBottom={3}
    >
      <Flex justifyContent="space-between" marginBottom={3}>
        <CustomCheckbox
          isChecked={isSelected}
          onChange={() => onSelect(exam.id)}
        />
        <StatusBadge status={exam.status || "Not Attempted"} />
      </Flex>

      <Text
        fontSize="16px"
        fontWeight="700"
        color={
          colorMode === "light" ? "brand.primary.light" : "brand.primary.dark"
        }
        marginBottom={4}
        onClick={() => navigate(`/actual-exam/${exam.id}`)}
        cursor="pointer"
        _hover={{ textDecoration: "underline" }}
      >
        {exam.exam || "Untitled Exam"}
      </Text>

      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <Text fontSize="12px" color="gray.500">
            Type
          </Text>
          <Text fontSize="14px">{exam.examType || "Actual"}</Text>
        </GridItem>

        <GridItem>
          <Text fontSize="12px" color="gray.500">
            Attempts
          </Text>
          <Text fontSize="14px">
            {exam.attempts || 0} (Avg: {exam.averageScore?.toFixed(1) || "0.0"}
            %)
          </Text>
        </GridItem>

        <GridItem>
          <Text fontSize="12px" color="gray.500">
            Progress
          </Text>
          <Box>
            <Text fontSize="14px">{exam.progress || 0}%</Text>
          </Box>
        </GridItem>

        <GridItem>
          <Text fontSize="12px" color="gray.500">
            Latest Grade
          </Text>
          <Text fontSize="14px">
            {exam.latestGrade?.score || 0}/{exam.latestGrade?.total || 100}
          </Text>
        </GridItem>
      </Grid>

      <Text fontSize="12px" color="gray.500" marginTop={4}>
        Last Updated: {exam.updated || "Not started"}
      </Text>
    </Box>
  );
};

const SearchDrawer = ({ isOpen, onClose, searchTerm, setSearchTerm }) => {
  const { colorMode } = useColorMode();

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent
        borderTopRadius="20px"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor={
          colorMode === "light" ? "brand.border.light" : "brand.border.dark"
        }
        boxShadow="none"
        overflow="hidden"
        bg="transparent"
      >
        <Box
          bg={
            colorMode === "light" ? "brand.surface.light" : "brand.surface.dark"
          }
          boxShadow={
            colorMode === "light"
              ? "0 -4px 0 0 black"
              : "0 -4px 0 0 rgba(255, 255, 255, 0.2)"
          }
          height="100%"
        >
          <DrawerCloseButton />
          <DrawerHeader>Search Exams</DrawerHeader>
          <DrawerBody paddingBottom={8}>
            <VStack spacing={4}>
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
                backgroundColor={
                  colorMode === "light"
                    ? "brand.background.light"
                    : "brand.surface.dark"
                }
                color={
                  colorMode === "light" ? "brand.text.light" : "brand.text.dark"
                }
                borderColor={
                  colorMode === "light"
                    ? "brand.border.light"
                    : "brand.border.dark"
                }
                _placeholder={{
                  color: colorMode === "light" ? "gray.500" : "gray.400",
                }}
              />
              <CustomButton
                width="100%"
                onClick={onClose}
                backgroundColor={
                  colorMode === "light"
                    ? "brand.primary.light"
                    : "brand.primary.dark"
                }
                color="white"
              >
                Apply Search
              </CustomButton>
            </VStack>
          </DrawerBody>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

const CustomDashboardTable = ({ data, onDeleteSelected, onDeleteAll }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig] = useState({
    key: "updated",
    direction: "desc",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const [expandedProviders, setExpandedProviders] = useState(
    data.map((p) => p.name)
  );

  const toggleProvider = (providerName) => {
    setExpandedProviders((prev) =>
      prev.includes(providerName)
        ? prev.filter((name) => name !== providerName)
        : [...prev, providerName]
    );
  };

  const handleSelectRow = useCallback((ids, isSelected) => {
    setSelectedRows((prev) => {
      if (Array.isArray(ids)) {
        return isSelected
          ? [...new Set([...prev, ...ids])]
          : prev.filter((id) => !ids.includes(id));
      }
      return isSelected ? [...prev, ids] : prev.filter((id) => id !== ids);
    });
  }, []);

  return (
    <Box
      borderRadius="12px"
      border="1px solid"
      borderColor={
        colorMode === "light" ? "brand.border.light" : "brand.border.dark"
      }
      backgroundColor={
        colorMode === "light"
          ? "brand.background.light"
          : "brand.background.dark"
      }
      overflow="hidden"
    >
      {/* Mobile View */}
      <Box display={{ base: "block", md: "none" }}>
        <Flex padding={4} borderBottom="1px solid" borderColor={colorMode === "light" ? "brand.border.light" : "brand.border.dark"}>
          <Flex width="100%" alignItems="center" gap={4}>
            <IconBox
              icon={LuSearch}
              size="40px"
              iconScale={0.4}
              borderThickness={3}
              backgroundColor={colorMode === "light" ? "brand.background.light" : "brand.background.dark"}
              onClick={onOpen}
            />
            <Flex flex={1} justifyContent="flex-end">
              <VStack spacing={2} align="flex-end">
                <CustomButton
                  onClick={() => onDeleteSelected(selectedRows)}
                  isDisabled={selectedRows.length === 0}
                  backgroundColor="transparent"
                  color={colorMode === "light" ? "#FF3333" : "#FF6666"}
                  border="1px solid"
                  borderColor={colorMode === "light" ? "#FF3333" : "#FF6666"}
                  _hover={
                    selectedRows.length > 0
                      ? {
                          backgroundColor: colorMode === "light" ? "#FFE5E5" : "#4D0000",
                          transform: "translateY(2px)",
                          boxShadow: colorMode === "light"
                            ? "0 2px 0 0 black !important"
                            : "0 2px 0 0 rgba(255, 102, 102, 0.3) !important",
                        }
                      : undefined
                  }
                  sx={{
                    boxShadow: selectedRows.length > 0
                      ? colorMode === "light"
                        ? "0 4px 0 0 black !important"
                        : "0 4px 0 0 rgba(255, 102, 102, 0.3) !important"
                      : "none",
                  }}
                  fontSize="sm"
                  height="40px"
                  paddingX={3}
                >
                  Delete Selected
                </CustomButton>

                <CustomButton
                  onClick={onDeleteAll}
                  backgroundColor={colorMode === "light" ? "#FF3333" : "#FF6666"}
                  color="white"
                  _hover={{
                    backgroundColor: colorMode === "light" ? "#FF0000" : "#CC0000",
                    transform: "translateY(2px)",
                    boxShadow: colorMode === "light"
                      ? "0 2px 0 0 black !important"
                      : "0 2px 0 0 rgba(255, 102, 102, 0.3) !important",
                  }}
                  sx={{
                    boxShadow: colorMode === "light"
                      ? "0 4px 0 0 black !important"
                      : "0 4px 0 0 rgba(255, 102, 102, 0.3) !important",
                  }}
                  fontSize="sm"
                  height="40px"
                  paddingX={3}
                >
                  Delete All
                </CustomButton>
              </VStack>
            </Flex>
          </Flex>
        </Flex>

        {data.map((provider, index) => (
          <Box
            key={provider.name}
            marginBottom={index !== data.length - 1 ? 4 : 0}
            style={{
              borderBottomLeftRadius: index === data.length - 1 ? "12px" : "0",
              borderBottomRightRadius: index === data.length - 1 ? "12px" : "0",
              overflow: "hidden",
            }}
          >
            <Flex
              padding={4}
              alignItems="center"
              backgroundColor={
                colorMode === "light"
                  ? "brand.secondary.light"
                  : "brand.secondary.dark"
              }
              cursor="pointer"
              onClick={() => toggleProvider(provider.name)}
              justifyContent="space-between"
            >
              <Flex alignItems="center" flex={1}>
                <CustomCheckbox
                  isChecked={provider.exams.every((exam) =>
                    selectedRows.includes(exam.id)
                  )}
                  isIndeterminate={
                    provider.exams.some((exam) =>
                      selectedRows.includes(exam.id)
                    ) &&
                    !provider.exams.every((exam) =>
                      selectedRows.includes(exam.id)
                    )
                  }
                  onChange={(e) => {
                    e.stopPropagation();
                    const examIds = provider.exams.map((exam) => exam.id);
                    const allSelected = provider.exams.every((exam) =>
                      selectedRows.includes(exam.id)
                    );
                    handleSelectRow(examIds, !allSelected);
                  }}
                />
                <Text fontSize="16px" fontWeight="bold" marginLeft={4}>
                  {provider.name}
                </Text>
              </Flex>
              <Box color={colorMode === "light" ? "gray.600" : "gray.300"}>
                {expandedProviders.includes(provider.name) ? (
                  <IoChevronUp size={20} />
                ) : (
                  <IoChevronDown size={20} />
                )}
              </Box>
            </Flex>

            <AnimatePresence initial={false}>
              {expandedProviders.includes(provider.name) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: "hidden",
                    borderBottomLeftRadius:
                      index === data.length - 1 ? "12px" : "0",
                    borderBottomRightRadius:
                      index === data.length - 1 ? "12px" : "0",
                  }}
                >
                  <Box
                    padding={4}
                    style={{
                      borderBottomLeftRadius:
                        index === data.length - 1 ? "12px" : "0",
                      borderBottomRightRadius:
                        index === data.length - 1 ? "12px" : "0",
                    }}
                  >
                    {provider.exams.map((exam, examIndex) => (
                      <ExamMobileCard
                        key={exam.id}
                        exam={exam}
                        isSelected={selectedRows.includes(exam.id)}
                        onSelect={(id) =>
                          handleSelectRow([id], !selectedRows.includes(id))
                        }
                        navigate={navigate}
                        style={{
                          marginBottom:
                            examIndex !== provider.exams.length - 1
                              ? "12px"
                              : "0",
                        }}
                      />
                    ))}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        ))}
      </Box>

      {/* Desktop View */}
      <Box display={{ base: "none", md: "block" }}>
        <Flex
          padding={4}
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid"
          borderColor={
            colorMode === "light" ? "brand.border.light" : "brand.border.dark"
          }
        >
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
            backgroundColor={
              colorMode === "light"
                ? "brand.background.light"
                : "brand.background.dark"
            }
          />
          <Flex gap={4}>
            <CustomButton
              onClick={() => onDeleteSelected(selectedRows)}
              isDisabled={selectedRows.length === 0}
              backgroundColor="transparent"
              color={colorMode === "light" ? "#FF3333" : "#FF6666"}
              border="1px solid"
              borderColor={colorMode === "light" ? "#FF3333" : "#FF6666"}
              _hover={
                selectedRows.length > 0
                  ? {
                      backgroundColor:
                        colorMode === "light" ? "#FFE5E5" : "#4D0000",
                      transform: "translateY(2px)",
                      boxShadow:
                        colorMode === "light"
                          ? "0 2px 0 0 black !important"
                          : "0 2px 0 0 rgba(255, 102, 102, 0.3) !important",
                    }
                  : undefined
              }
              sx={{
                boxShadow:
                  selectedRows.length > 0
                    ? colorMode === "light"
                      ? "0 4px 0 0 black !important"
                      : "0 4px 0 0 rgba(255, 102, 102, 0.3) !important"
                    : "none",
              }}
              fontSize="sm"
              height="40px"
              paddingX={3}
            >
              Delete Selected
            </CustomButton>

            <CustomButton
              onClick={onDeleteAll}
              backgroundColor={colorMode === "light" ? "#FF3333" : "#FF6666"}
              color="white"
              _hover={{
                backgroundColor: colorMode === "light" ? "#FF0000" : "#CC0000",
                transform: "translateY(2px)",
                boxShadow:
                  colorMode === "light"
                    ? "0 2px 0 0 black !important"
                    : "0 2px 0 0 rgba(255, 102, 102, 0.3) !important",
              }}
              sx={{
                boxShadow:
                  colorMode === "light"
                    ? "0 4px 0 0 black !important"
                    : "0 4px 0 0 rgba(255, 102, 102, 0.3) !important",
              }}
              fontSize="sm"
              height="40px"
              paddingX={3}
            >
              Delete All
            </CustomButton>
          </Flex>
        </Flex>

        {data.map((provider, index) => (
          <Box
            key={provider.name}
            marginBottom={index !== data.length - 1 ? 4 : 0}
            style={{
              borderBottomLeftRadius: index === data.length - 1 ? "12px" : "0",
              borderBottomRightRadius: index === data.length - 1 ? "12px" : "0",
              overflow: "hidden",
            }}
          >
            <Flex
              padding={4}
              backgroundColor={
                colorMode === "light"
                  ? "brand.secondary.light"
                  : "brand.secondary.dark"
              }
              alignItems="center"
              cursor="pointer"
              onClick={() => toggleProvider(provider.name)}
              justifyContent="space-between"
            >
              <Flex alignItems="center" flex={1}>
                <CustomCheckbox
                  isChecked={provider.exams.every((exam) =>
                    selectedRows.includes(exam.id)
                  )}
                  isIndeterminate={
                    provider.exams.some((exam) =>
                      selectedRows.includes(exam.id)
                    ) &&
                    !provider.exams.every((exam) =>
                      selectedRows.includes(exam.id)
                    )
                  }
                  onChange={(e) => {
                    e.stopPropagation();
                    const examIds = provider.exams.map((exam) => exam.id);
                    const allSelected = provider.exams.every((exam) =>
                      selectedRows.includes(exam.id)
                    );
                    handleSelectRow(examIds, !allSelected);
                  }}
                />
                <Text fontSize="16px" fontWeight="bold" marginLeft={4}>
                  {provider.name}
                </Text>
              </Flex>
              <Box color={colorMode === "light" ? "gray.600" : "gray.300"}>
                {expandedProviders.includes(provider.name) ? (
                  <IoChevronUp size={20} />
                ) : (
                  <IoChevronDown size={20} />
                )}
              </Box>
            </Flex>

            <AnimatePresence initial={false}>
              {expandedProviders.includes(provider.name) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: "hidden",
                    borderBottomLeftRadius:
                      index === data.length - 1 ? "12px" : "0",
                    borderBottomRightRadius:
                      index === data.length - 1 ? "12px" : "0",
                  }}
                >
                  {/* Header Row */}
                  <Grid
                    templateColumns="40px 2fr 1fr 1fr 1fr 1.5fr 1fr"
                    gap={4}
                    padding={4}
                    backgroundColor={
                      colorMode === "light"
                        ? "brand.surface.light"
                        : "brand.surface.dark"
                    }
                    borderBottom="1px solid"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.600"
                    }
                  >
                    <GridItem></GridItem>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      textTransform="uppercase"
                    >
                      Exam
                    </Text>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      textTransform="uppercase"
                      textAlign="center"
                    >
                      Type
                    </Text>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      textTransform="uppercase"
                      textAlign="center"
                    >
                      Attempts
                    </Text>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      textTransform="uppercase"
                      textAlign="center"
                    >
                      Progress
                    </Text>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      textTransform="uppercase"
                      textAlign="center"
                    >
                      Latest Grade
                    </Text>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                      cursor="pointer"
                    >
                      <Text
                        fontSize="12px"
                        fontWeight="700"
                        textTransform="uppercase"
                      >
                        Updated
                      </Text>
                      <Box>
                        {sortConfig.key === "updated" &&
                          (sortConfig.direction === "asc" ? (
                            <PiSortAscending size={16} />
                          ) : (
                            <PiSortDescending size={16} />
                          ))}
                      </Box>
                    </Flex>
                  </Grid>

                  {provider.exams.map((exam, examIndex) => (
                    <Grid
                      key={exam.id}
                      templateColumns="40px 2fr 1fr 1fr 1fr 1.5fr 1fr"
                      gap={4}
                      padding={4}
                      alignItems="center"
                      borderBottom={
                        examIndex !== provider.exams.length - 1
                          ? "1px solid"
                          : "none"
                      }
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.600"
                      }
                      style={{
                        borderBottomLeftRadius:
                          index === data.length - 1 &&
                          examIndex === provider.exams.length - 1
                            ? "12px"
                            : "0",
                        borderBottomRightRadius:
                          index === data.length - 1 &&
                          examIndex === provider.exams.length - 1
                            ? "12px"
                            : "0",
                      }}
                      _hover={{
                        backgroundColor:
                          colorMode === "light"
                            ? "brand.surface.light"
                            : "brand.surface.dark",
                      }}
                    >
                      <GridItem>
                        <CustomCheckbox
                          isChecked={selectedRows.includes(exam.id)}
                          onChange={() =>
                            handleSelectRow(
                              [exam.id],
                              !selectedRows.includes(exam.id)
                            )
                          }
                        />
                      </GridItem>
                      <GridItem>
                        <Text
                          cursor="pointer"
                          fontSize="11px"
                          fontWeight="600"
                          color={
                            colorMode === "light"
                              ? "brand.primary.light"
                              : "brand.primary.dark"
                          }
                          _hover={{ textDecoration: "underline" }}
                          onClick={() => navigate(`/actual-exam/${exam.id}`)}
                        >
                          {exam.exam || "Untitled Exam"}
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                          textAlign="center"
                        >
                          {exam.examType || "Actual"}
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                          textAlign="center"
                        >
                          {exam.attempts || 0} (Avg:{" "}
                          {exam.averageScore?.toFixed(1) || "0.0"}%)
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Flex justifyContent="center">
                          <CustomProgressIndicator value={exam.progress || 0} />
                        </Flex>
                      </GridItem>
                      <GridItem>
                        <Flex direction="column" alignItems="center" gap={2}>
                          <Text fontSize="11px" fontWeight="600">
                            {exam.latestGrade?.score || 0}/
                            {exam.latestGrade?.total || 100}
                          </Text>
                          <StatusBadge
                            status={exam.status || "Not Attempted"}
                          />
                        </Flex>
                      </GridItem>
                      <GridItem>
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                          textAlign="center"
                        >
                          {exam.updated || "Not started"}
                        </Text>
                      </GridItem>
                    </Grid>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        ))}
      </Box>

      <SearchDrawer
        isOpen={isOpen}
        onClose={onClose}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </Box>
  );
};

const Dashboard = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [showMobileApps, setShowMobileApps] = useState(true);
  const [showSupport, setShowSupport] = useState(true);
  const [examProgress, setExamProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [deleteType, setDeleteType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 3;

  const totalPages = Math.ceil((examProgress?.length || 0) / providersPerPage);
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = examProgress.slice(
    indexOfFirstProvider,
    indexOfLastProvider
  );

  const abortControllerRef = useRef(null);
  const isMounted = useRef(true);

  const toast = useToast();
  const toastRef = useRef(createCustomToast(toast));
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchExamProgress = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (!isMounted.current) return;
      setIsLoading(true);

      const response = await fetchWithAuth(`${API_URL}/api/exam-progress`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exam progress");
      }

      const data = await response.json();
      if (isMounted.current) {
        setExamProgress(data.providers);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("Error fetching exam progress:", error);
      if (isMounted.current) {
        toastRef.current({
          title: "Error fetching exam progress",
          description: error.message,
          status: "error",
        });
        setExamProgress([]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [API_URL]);

  useEffect(() => {
    isMounted.current = true;
    fetchExamProgress();

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchExamProgress]);

  const handleDeleteSelected = useCallback(
    async (selectedIds) => {
      setSelectedForDeletion(selectedIds);
      setDeleteType("selected");
      openDeleteModal();
    },
    [openDeleteModal]
  );

  const handleDeleteAll = useCallback(() => {
    setDeleteType("all");
    openDeleteModal();
  }, [openDeleteModal]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (deleteType === "all") {
        await fetchWithAuth(`${API_URL}/api/delete-all-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (isMounted.current) {
          setExamProgress([]);
          toastRef.current({
            title: "All progress cleared",
            description: "Your exam progress history has been cleared.",
            status: "success",
          });
        }
      } else {
        const providerGroups = examProgress.reduce(
          (acc, provider) => {
            const selectedProviderExams = provider.exams
              .filter((exam) => selectedForDeletion.includes(exam.id))
              .map((exam) => exam.id);

            if (selectedProviderExams.length === provider.exams.length) {
              acc.providers.push(provider.name);
            } else if (selectedProviderExams.length > 0) {
              acc.exams.push(...selectedProviderExams);
            }
            return acc;
          },
          { providers: [], exams: [] }
        );

        if (providerGroups.providers.length > 0) {
          await fetchWithAuth(`${API_URL}/api/delete-provider-exams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider_names: providerGroups.providers }),
          });
        }

        if (providerGroups.exams.length > 0) {
          await fetchWithAuth(`${API_URL}/api/delete-exams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exam_ids: providerGroups.exams }),
          });
        }

        await fetchExamProgress();

        if (isMounted.current) {
          toastRef.current({
            title: "Selected items deleted",
            description:
              "The selected exams have been removed from your progress tracking.",
            status: "success",
          });
        }
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      if (isMounted.current) {
        toastRef.current({
          title: "Error",
          description: `Failed to delete ${
            deleteType === "all" ? "all progress" : "selected items"
          }`,
          status: "error",
        });
      }
    } finally {
      if (isMounted.current) {
        closeDeleteModal();
        setSelectedForDeletion([]);
      }
    }
  }, [
    API_URL,
    deleteType,
    examProgress,
    fetchExamProgress,
    selectedForDeletion,
    closeDeleteModal,
  ]);

  return (
    <Box
      width="100%"
      paddingLeft={{ base: 2, sm: 4, md: 6, lg: 8 }}
      paddingRight={{ base: 2, sm: 4, md: 6, lg: 8 }}
      paddingBottom={{ base: "100px", md: 0 }}
    >
      <WelcomeComponent users={2.0} countries={190} />

      {showMobileApps && (
        <MobileAppsComing onClose={() => setShowMobileApps(false)} />
      )}

      {showSupport && (
        <SupportDevelopers onClose={() => setShowSupport(false)} />
      )}

      {isLoading ? (
        <Flex justify="center" align="center" height="400px">
          <Spinner size="xl" color="#00bfff" thickness="4px" />
        </Flex>
      ) : examProgress.length === 0 ? (
        <EmptyProgressState />
      ) : (
        <>
          <CustomDashboardTable
            data={currentProviders}
            onDeleteSelected={handleDeleteSelected}
            onDeleteAll={handleDeleteAll}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        deleteType={deleteType}
        itemCount={selectedForDeletion.length}
        title={
          deleteType === "all"
            ? "Delete All Progress"
            : "Delete Selected Progress"
        }
        message={
          deleteType === "all"
            ? undefined
            : `Selected items include ${selectedForDeletion.length} exam${
                selectedForDeletion.length === 1 ? "" : "s"
              }`
        }
      />
    </Box>
  );
};

export default Dashboard;
