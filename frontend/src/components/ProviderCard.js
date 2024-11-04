import React, { useState } from "react";
import {
  Box,
  Text,
  Flex,
  Input,
  Icon,
  useColorMode,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
} from "@chakra-ui/react";
import { BsBookmarkFill } from "react-icons/bs";
import { LuSearch } from "react-icons/lu";
import { IconBox } from "./IconBox";
import ExamCard from "./ExamCard";

const ProviderCard = ({ providerName, exams, view, isPopular }) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const MobileSearchDrawer = () => (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent
        borderTopRadius="20px"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor={colorMode === "light" ? "brand.border.light" : "brand.border.dark"}
        boxShadow="none"
        overflow="hidden"
        bg="transparent"
      >
        <Box
          bg={colorMode === "light" ? "brand.surface.light" : "brand.surface.dark"}
          boxShadow={colorMode === "light" 
            ? "0 -4px 0 0 black" 
            : "0 -4px 0 0 rgba(255, 255, 255, 0.2)"}
          height="100%"
        >
          <DrawerCloseButton />
          <DrawerHeader>Search Exams</DrawerHeader>
          <DrawerBody paddingBottom={8}>
            <VStack spacing={4}>
              <Input
                placeholder="Search exams..."
                size="lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                backgroundColor={colorMode === "light" ? "brand.background.light" : "brand.surface.dark"}
                color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
                borderColor={colorMode === "light" ? "brand.border.light" : "brand.border.dark"}
                _placeholder={{
                  color: colorMode === "light" ? "gray.500" : "gray.400",
                }}
              />
              <Button
                width="100%"
                onClick={onClose}
                backgroundColor={colorMode === "light" ? "brand.primary.light" : "brand.primary.dark"}
                color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
                borderRadius="full"
              >
                Apply Search
              </Button>
            </VStack>
          </DrawerBody>
        </Box>
      </DrawerContent>
    </Drawer>
  );

  const renderExams = () => {
    if (filteredExams.length === 0) {
      return (
        <Box paddingY={4} textAlign="center">
          <Text 
            fontSize="lg" 
            color={colorMode === 'light' ? "gray.600" : "gray.400"}
          >
            No exams or questions available for this provider.
          </Text>
        </Box>
      );
    }

    if (view === "grid") {
      return (
        <Box overflowX="auto" paddingBottom={4}>
          <Flex gap={6}>
            {filteredExams.map((exam, index) => (
              <ExamCard
                key={index}
                title={exam.title}
                progress={exam.progress}
                totalQuestions={exam.totalQuestions}
                view={view}
                examId={exam.id}
              />
            ))}
          </Flex>
        </Box>
      );
    } else {
      return (
        <Box>
          {filteredExams.map((exam, index) => (
            <ExamCard
              key={index}
              title={exam.title}
              progress={exam.progress}
              totalQuestions={exam.totalQuestions}
              view={view}
              examId={exam.id}
            />
          ))}
        </Box>
      );
    }
  };

  return (
    <Box
      backgroundColor={colorMode === 'light' ? "brand.surface.light" : "brand.surface.dark"}
      borderRadius="20px"
      border="1px solid"
      borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
      boxShadow={colorMode === 'light' 
        ? "0 4px 0 0 black"
        : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      padding={6}
      marginBottom={8}
      width="100%"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "center", md: "stretch" }}
        marginBottom={6}
        gap={4}
      >
        {/* Title and Controls Container */}
        <Flex 
          width="100%" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Text
            fontSize={{ base: "24px", md: "26px", lg: "28px" }}
            fontWeight="bold"
            color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
            flex={1}
          >
            {providerName}
            {isPopular && (
              <Box
                paddingX={2}
                paddingY={0}
                borderRadius="full"
                display="inline-block"
                marginLeft={4}
                border="1px solid"
                borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
                bgGradient={colorMode === 'light' 
                  ? "linear(to-r, #FFD700, #FFA500)"
                  : "linear(to-r, #B8860B, #CD853F)"
                }
              >
                <Text 
                  fontSize="14px" 
                  fontWeight="500" 
                  color={colorMode === 'light' ? "black" : "white"}
                >
                  Popular
                </Text>
              </Box>
            )}
          </Text>
          <Flex gap={2} alignItems="center">
            <Box
              as="button"
              onClick={toggleBookmark}
              transition="all 0.2s"
              padding={2}
              _hover={{ transform: "scale(1.1)" }}
              _active={{ transform: "scale(0.9)" }}
            >
              <Icon
                as={BsBookmarkFill}
                color={isBookmarked 
                  ? "#FFD700"
                  : colorMode === 'light' ? "white" : "gray.600"
                }
                boxSize={6}
                strokeWidth={1}
                stroke={colorMode === 'light' ? "black" : "white"}
                transition="all 0.2s"
              />
            </Box>
            {/* Mobile search button */}
            <Box display={{ base: "block", md: "none" }}>
              <IconBox
                icon={LuSearch}
                size="48px"
                iconScale={0.4}
                borderThickness={3}
                backgroundColor={colorMode === "light" ? "brand.background.light" : "brand.surface.dark"}
                onClick={onOpen}
                aria-label="Search"
              />
            </Box>
          </Flex>
        </Flex>

        {/* Desktop search input */}
        <Input
          display={{ base: "none", md: "block" }}
          placeholder="Search exams..."
          size="md"
          width={{ md: "250px", lg: "300px" }}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          backgroundColor={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
          color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
          borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
          _placeholder={{
            color: colorMode === 'light' ? "gray.500" : "gray.400"
          }}
        />
      </Flex>
      
      {renderExams()}
      
      <MobileSearchDrawer />
    </Box>
  );
};

export default ProviderCard;
