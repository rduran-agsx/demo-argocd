import React, { useState, useRef } from "react";
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
import ProviderInfoCard from "./ProviderInfoCard";

const CategoryCard = ({ categoryName, providers, view }) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const scrollContainerRef = useRef(null);

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <DrawerHeader>Search Providers</DrawerHeader>
          <DrawerBody paddingBottom={8}>
            <VStack spacing={4}>
              <Input
                placeholder="Search providers..."
                size="lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <Button
                width="100%"
                onClick={onClose}
                backgroundColor={
                  colorMode === "light"
                    ? "brand.primary.light"
                    : "brand.primary.dark"
                }
                color={
                  colorMode === "light" ? "brand.text.light" : "brand.text.dark"
                }
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

  return (
    <Box
      backgroundColor={
        colorMode === "light" ? "brand.surface.light" : "brand.surface.dark"
      }
      borderRadius="20px"
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
      marginBottom={8}
      width="100%"
    >
      {/* Header Section */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "stretch", md: "center" }}
        marginBottom={6}
        gap={4}
      >
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text
            fontSize={{ base: "20px", md: "26px", lg: "28px" }}
            fontWeight="bold"
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
          >
            {categoryName}
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
                color={
                  isBookmarked
                    ? "#FFD700"
                    : colorMode === "light"
                    ? "white"
                    : "gray.600"
                }
                boxSize={6}
                strokeWidth={1}
                stroke={colorMode === "light" ? "black" : "white"}
              />
            </Box>
            {/* Mobile search button */}
            <Box display={{ base: "block", md: "none" }}>
              <IconBox
                icon={LuSearch}
                size="48px"
                iconScale={0.4}
                borderThickness={3}
                backgroundColor={
                  colorMode === "light"
                    ? "brand.background.light"
                    : "brand.surface.dark"
                }
                onClick={onOpen}
                aria-label="Search"
              />
            </Box>
          </Flex>
        </Flex>

        {/* Desktop search input */}
        <Input
          display={{ base: "none", md: "block" }}
          placeholder="Search providers..."
          size="md"
          width={{ md: "250px", lg: "300px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          backgroundColor={
            colorMode === "light"
              ? "brand.background.light"
              : "brand.surface.dark"
          }
          color={
            colorMode === "light" ? "brand.text.light" : "brand.text.dark"
          }
          borderColor={
            colorMode === "light" ? "brand.border.light" : "brand.border.dark"
          }
          _placeholder={{
            color: colorMode === "light" ? "gray.500" : "gray.400",
          }}
        />
      </Flex>

      {/* Content Section */}
      {view === "grid" ? (
        <Box>
          <Box
            ref={scrollContainerRef}
            overflowX="auto"
            paddingBottom={4}
            paddingX={{ base: 0, md: 2 }}
          >
            <Flex gap={6} wrap="nowrap">
              {filteredProviders.map((provider, index) => (
                <ProviderInfoCard
                  key={index}
                  provider={provider}
                  view={view}
                />
              ))}
            </Flex>
          </Box>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredProviders.map((provider, index) => (
            <ProviderInfoCard key={index} provider={provider} view={view} />
          ))}
        </VStack>
      )}

      <MobileSearchDrawer />
    </Box>
  );
};

export default CategoryCard;