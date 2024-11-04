import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Text,
  Progress,
  Flex,
  Tooltip,
  Image,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getBadgeUrl } from "./BadgeUrls";

const ExamCard = React.memo(
  ({ title, progress, totalQuestions, view, examId }) => {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const progressPercentage = (progress / totalQuestions) * 100;

    const BadgeImage = ({ size }) => (
      <Image
        src={getBadgeUrl(title)}
        alt="badge"
        width={`${size}px`}
        height={`${size}px`}
        objectFit="contain"
      />
    );

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
    }, [title, view]);

    const handleContinue = () => {
      if (examId) {
        navigate(`/actual-exam/${examId}`);
      } else {
        console.error("Exam ID is undefined");
      }
    };

    const formatTitle = (title) => {
      const parts = title.split("-code-");
      if (parts.length === 2) {
        let [examName, examCode] = parts;
        if (examName.toLowerCase().includes("google")) {
          return examName;
        } else if (examName.toLowerCase().includes("microsoft")) {
          examCode = examCode
            .split("-")
            .map((part, index) => {
              if (index === 0) {
                return part.toUpperCase();
              }
              if (
                index === 1 &&
                ["DP", "MD", "AI"].includes(
                  examCode.split("-")[0].toUpperCase()
                )
              ) {
                return part.toUpperCase();
              }
              return part;
            })
            .join("-");

          return `${examCode}: ${examName}`;
        } else {
          return `${examCode.toUpperCase()}: ${examName}`;
        }
      }
      return title;
    };

    const formattedTitle = formatTitle(title);

    if (view === "grid") {
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
          padding={3}
          width={{ base: "100%", sm: "250px", md: "280px", lg: "300px" }}
          height="300px"
          flexShrink={0}
          display="flex"
          flexDirection="column"
        >
          <Tooltip label={formattedTitle} isDisabled={!isTruncatedGrid}>
            <Text
              ref={textRefGrid}
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              fontWeight="bold"
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
              {formattedTitle}
            </Text>
          </Tooltip>
          <Box
            flexGrow={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginBottom={2}
          >
            <BadgeImage size={150} />
          </Box>
          <Progress
            value={progressPercentage}
            colorScheme="blue"
            marginBottom={2}
            height="8px"
            width="100%"
            borderRadius="4px"
            backgroundColor={
              colorMode === "light" ? "gray.200" : "gray.600"
            }
          />
          <Flex justifyContent="space-between" alignItems="center">
            <Text
              fontSize={{ base: "12px", md: "13px", lg: "14px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
            >
              {progress} / {totalQuestions} questions
            </Text>
            <Button
              onClick={handleContinue}
              height="40px"
              paddingLeft="16px"
              paddingRight="16px"
              backgroundColor={
                colorMode === "light"
                  ? "brand.primary.light"
                  : "brand.primary.dark"
              }
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              fontWeight={700}
              fontSize={{ base: "12px", md: "13px", lg: "14px" }}
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
            >
              Continue
            </Button>
          </Flex>
        </Box>
      );
    } else {
      return (
        <>
          {/* Desktop List View */}
          <Flex
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            paddingY={2}
            paddingLeft={4}
            borderBottom="1px solid"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          >
            <Box width="80px" height="80px" marginRight={4} flexShrink={0}>
              <BadgeImage size={80} />
            </Box>
            <Box flex="1" minWidth="200px">
              <Tooltip label={formattedTitle} isDisabled={!isTruncatedList}>
                <Text
                  ref={textRefList}
                  fontSize={{ base: "14px", md: "16px", lg: "18px" }}
                  fontWeight="bold"
                  isTruncated
                  color={
                    colorMode === "light"
                      ? "brand.text.light"
                      : "brand.text.dark"
                  }
                >
                  {formattedTitle}
                </Text>
              </Tooltip>
            </Box>
            <Box width="25%" paddingX={2}>
              <Progress
                value={progressPercentage}
                colorScheme="blue"
                height="8px"
                width="100%"
                borderRadius="4px"
                backgroundColor={
                  colorMode === "light" ? "gray.200" : "gray.600"
                }
              />
            </Box>
            <Text
              fontSize={{ base: "12px", md: "13px", lg: "14px" }}
              color={colorMode === "light" ? "gray.600" : "gray.400"}
              width="15%"
              textAlign="right"
            >
              {progress} / {totalQuestions}
            </Text>
            <Button
              onClick={handleContinue}
              height="40px"
              paddingLeft="16px"
              paddingRight="16px"
              marginLeft={2}
              backgroundColor={
                colorMode === "light"
                  ? "brand.primary.light"
                  : "brand.primary.dark"
              }
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              fontWeight={700}
              fontSize={{ base: "12px", md: "13px", lg: "14px" }}
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
            >
              Continue
            </Button>
          </Flex>

          {/* Mobile List View */}
          <Box
            display={{ base: "block", md: "none" }}
            paddingY={4}
            paddingX={4}
            borderBottom="1px solid"
            borderColor={
              colorMode === "light" ? "gray.200" : "gray.600"
            }
          >
            {/* Container */}
            <Flex direction="row" alignItems="flex-start" width="100%">
              {/* Badge Image */}
              <Box width="80px" height="80px" flexShrink={0}>
                <BadgeImage size={80} />
              </Box>
              {/* Title and Progress */}
              <Box flex="1" marginLeft={4} minWidth="0">
                <Tooltip label={formattedTitle} isDisabled={!isTruncatedList}>
                  <Text
                    ref={textRefList}
                    fontSize={{ base: "16px" }}
                    fontWeight="bold"
                    lineHeight="1.2"
                    height="2.4em"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    display="-webkit-box"
                    color={
                      colorMode === "light"
                        ? "brand.text.light"
                        : "brand.text.dark"
                    }
                    sx={{
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {formattedTitle}
                  </Text>
                </Tooltip>
                {/* Progress Bar and X / Y Questions */}
                <Box width="100%" marginTop={2}>
                  <Progress
                    value={progressPercentage}
                    colorScheme="blue"
                    height="8px"
                    width="100%"
                    borderRadius="4px"
                    backgroundColor={
                      colorMode === "light" ? "gray.200" : "gray.600"
                    }
                  />
                  <Text
                    fontSize="14px"
                    color={
                      colorMode === "light" ? "gray.600" : "gray.400"
                    }
                    marginTop={1}
                    textAlign="left"
                  >
                    {progress} / {totalQuestions} questions
                  </Text>
                </Box>
              </Box>
            </Flex>
            {/* Continue Button */}
            <Button
              onClick={handleContinue}
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
              fontSize="14px"
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
              width="100%"
              marginTop={4}
            >
              Continue
            </Button>
          </Box>
        </>
      );
    }
  }
);

export default ExamCard;
