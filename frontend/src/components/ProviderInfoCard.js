import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Flex,
  Image,
  Tooltip,
  useColorMode,
  Button,
} from "@chakra-ui/react";

const ProviderInfoCard = ({ provider, view }) => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { name, description, image, totalExams, totalQuestions, isPopular } =
    provider;

  const [isTruncatedGrid, setIsTruncatedGrid] = useState(false);
  const textRefGrid = useRef(null);
  const [isTruncatedList, setIsTruncatedList] = useState(false);
  const textRefList = useRef(null);

  useEffect(() => {
    if (view === "grid") {
      const textElement = textRefGrid.current;
      if (textElement) {
        const isOverflowing =
          textElement.scrollHeight > textElement.clientHeight;
        setIsTruncatedGrid(isOverflowing);
      }
    } else {
      const textElement = textRefList.current;
      if (textElement) {
        const isOverflowing =
          textElement.scrollWidth > textElement.clientWidth;
        setIsTruncatedList(isOverflowing);
      }
    }
  }, [name, view]);

  const handleViewExams = () => {
    navigate("/exams", {
      state: {
        selectedProvider: name,
        fromProviders: true,
      },
    });
  };

  if (view === "grid") {
    // Grid view remains the same as your current code
    return (
      <Box
        backgroundColor={
          colorMode === "light"
            ? "brand.background.light"
            : "brand.surface.dark"
        }
        borderRadius="12px"
        border="1px solid"
        borderColor={
          colorMode === "light" ? "brand.border.light" : "brand.border.dark"
        }
        boxShadow={
          colorMode === "light"
            ? "0 4px 0 0 black"
            : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
        }
        padding={{ base: 3, md: 4 }}
        width={{ base: "100%", sm: "250px", md: "280px", lg: "300px" }}
        height="400px"
        flexShrink={0}
        display="flex"
        flexDirection="column"
        position="relative"
      >
        {isPopular && (
          <Box
            paddingX={2}
            paddingY={0}
            borderRadius="full"
            display="inline-block"
            border="1px solid"
            borderColor={
              colorMode === "light" ? "brand.border.light" : "brand.border.dark"
            }
            bgGradient={
              colorMode === "light"
                ? "linear(to-r, #FFD700, #FFA500)"
                : "linear(to-r, #B8860B, #CD853F)"
            }
            position="absolute"
            top={2}
            right={2}
            zIndex={1}
          >
            <Text
              fontSize={{ base: "12px", sm: "14px" }}
              fontWeight="500"
              color={colorMode === "light" ? "black" : "white"}
            >
              Popular
            </Text>
          </Box>
        )}
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          height="100%"
          width="100%"
        >
          <Box
            width="100px"
            height="100px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            marginBottom={4}
            backgroundColor={
              colorMode === "light" ? "transparent" : "rgba(255, 255, 255, 1)"
            }
            borderRadius="md"
            padding={2}
          >
            <Image
              src={image}
              alt={`${name} logo`}
              maxWidth="100%"
              maxHeight="100%"
              objectFit="contain"
            />
          </Box>
          <Tooltip label={name} isDisabled={!isTruncatedGrid}>
            <Text
              ref={textRefGrid}
              fontSize={{ base: "16px", sm: "18px" }}
              fontWeight="bold"
              textAlign="center"
              marginBottom={2}
              lineHeight="1.2"
              height="2.4em"
              overflow="hidden"
              textOverflow="ellipsis"
              display="-webkit-box"
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              sx={{
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {name}
            </Text>
          </Tooltip>
          <Text
            fontSize={{ base: "14px", sm: "16px" }}
            textAlign="center"
            marginBottom={4}
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
          >
            {description}
          </Text>
          <Flex
            flexDirection="column"
            width="100%"
            alignItems="flex-start"
            marginBottom={4}
            gap={1}
          >
            <Text
              fontSize={{ base: "12px", sm: "14px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
            >
              Total Exams: {totalExams}
            </Text>
            <Text
              fontSize={{ base: "12px", sm: "14px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
            >
              Total Questions: {totalQuestions}
            </Text>
          </Flex>
          <Button
            onClick={handleViewExams}
            height="40px"
            paddingX="16px"
            backgroundColor={
              colorMode === "light"
                ? "brand.primary.light"
                : "brand.primary.dark"
            }
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
            fontWeight={700}
            fontSize={{ base: "12px", sm: "14px" }}
            borderRadius="full"
            border="1px solid"
            borderColor={
              colorMode === "light" ? "brand.border.light" : "brand.border.dark"
            }
            boxShadow={
              colorMode === "light"
                ? "0 4px 0 0 black"
                : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
            }
            _hover={{
              backgroundColor:
                colorMode === "light"
                  ? "brand.primary.dark"
                  : "brand.primary.light",
              transform: "translateY(2px)",
              boxShadow:
                colorMode === "light"
                  ? "0 2px 0 0 black"
                  : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
            }}
            _active={{
              transform: "translateY(4px)",
              boxShadow: "none",
            }}
            transition="all 0.2s"
            width="100%"
          >
            View Exams
          </Button>
        </Flex>
      </Box>
    );
  } else {
    // List view adjustments
    return (
      <Flex
        direction={{ base: "column", sm: "row" }}
        alignItems={{ base: "stretch", sm: "center" }}
        paddingY={4}
        paddingX={{ base: 3, sm: 4 }}
        borderBottom="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
        backgroundColor={
          colorMode === "light" ? "brand.surface.light" : "brand.surface.dark"
        }
        gap={{ base: 3, sm: 4 }}
      >
        {/* Image and Title Section */}
        <Flex alignItems="center" gap={3} flex="1">
          <Box
            width={{ base: "60px", sm: "80px" }}
            height={{ base: "60px", sm: "80px" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            backgroundColor={
              colorMode === "light" ? "transparent" : "rgba(255, 255, 255, 1)"
            }
            borderRadius="md"
            padding={2}
            flexShrink={0}
          >
            <Image
              src={image}
              alt={`${name} logo`}
              maxWidth="100%"
              maxHeight="100%"
              objectFit="contain"
            />
          </Box>
          <Box flex="1" minWidth="0">
            <Flex alignItems="center" flexWrap="nowrap">
              <Tooltip label={name} isDisabled={!isTruncatedList}>
                <Text
                  ref={textRefList}
                  fontSize={{ base: "16px", sm: "18px" }}
                  fontWeight="bold"
                  isTruncated
                  flex="1"
                  color={
                    colorMode === "light"
                      ? "brand.text.light"
                      : "brand.text.dark"
                  }
                >
                  {name}
                </Text>
              </Tooltip>
              {isPopular && (
                <Box
                  paddingX={2}
                  paddingY={0}
                  borderRadius="full"
                  display="inline-block"
                  border="1px solid"
                  borderColor={
                    colorMode === "light"
                      ? "brand.border.light"
                      : "brand.border.dark"
                  }
                  bgGradient={
                    colorMode === "light"
                      ? "linear(to-r, #FFD700, #FFA500)"
                      : "linear(to-r, #B8860B, #CD853F)"
                  }
                  marginLeft={2}
                  flexShrink={0}
                >
                  <Text
                    fontSize={{ base: "12px", sm: "14px" }}
                    fontWeight="500"
                    color={colorMode === "light" ? "black" : "white"}
                  >
                    Popular
                  </Text>
                </Box>
              )}
            </Flex>
            <Text
              fontSize={{ base: "14px", sm: "16px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
              marginTop={1}
            >
              {description}
            </Text>
          </Box>
        </Flex>

        {/* Details and Button Section */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justifyContent={{ base: "flex-start", sm: "flex-end" }}
          alignItems="center"
          gap={3}
          marginTop={{ base: 2, sm: 0 }}
          flexShrink={0}
          flexWrap="wrap"
        >
          <Flex direction="column" gap={1} flexShrink={0}>
            <Text
              fontSize={{ base: "12px", sm: "14px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
            >
              Total Exams: {totalExams}
            </Text>
            <Text
              fontSize={{ base: "12px", sm: "14px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
            >
              Total Questions: {totalQuestions}
            </Text>
          </Flex>

          <Button
            onClick={handleViewExams}
            height={{ base: "36px", sm: "40px" }}
            paddingX={{ base: "12px", sm: "16px" }}
            backgroundColor={
              colorMode === "light"
                ? "brand.primary.light"
                : "brand.primary.dark"
            }
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
            fontWeight={700}
            fontSize={{ base: "12px", sm: "14px" }}
            borderRadius="full"
            border="1px solid"
            borderColor={
              colorMode === "light"
                ? "brand.border.light"
                : "brand.border.dark"
            }
            boxShadow={
              colorMode === "light"
                ? "0 4px 0 0 black"
                : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
            }
            _hover={{
              backgroundColor:
                colorMode === "light"
                  ? "brand.primary.dark"
                  : "brand.primary.light",
              transform: "translateY(2px)",
              boxShadow:
                colorMode === "light"
                  ? "0 2px 0 0 black"
                  : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
            }}
            _active={{
              transform: "translateY(4px)",
              boxShadow: "none",
            }}
            transition="all 0.2s"
            size="sm"
            width={{ base: "100%", sm: "auto" }}
          >
            View Exams
          </Button>
        </Flex>
      </Flex>
    );
  }
};

export default ProviderInfoCard;
