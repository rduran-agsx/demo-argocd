import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { PiShuffle } from "react-icons/pi";
import { RxReset } from "react-icons/rx";
import { PiSealFill, PiSeal } from "react-icons/pi";
import { MdFormatListNumbered } from "react-icons/md";
import QuestionListDropdown from "./QuestionListDropdown";
import SubmitButton from "./SubmitButton";

const SealedButton = React.memo(({ icon: Icon, onClick }) => {
  const { colorMode } = useColorMode();
  const [isPressed, setIsPressed] = useState(false);
  const size = "48px";
  const iconScale = 0.4;
  const iconSize = `${parseInt(size) * iconScale}px`;
  const borderThickness = 3;

  return (
    <Box
      position="relative"
      width={size}
      height={size}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      cursor="pointer"
      transition="all 0.1s ease"
      transform={isPressed ? "scale(0.95)" : "scale(1)"}
      userSelect="none"
    >
      <Box
        as={PiSealFill}
        size={size}
        color={
          colorMode === "light"
            ? "brand.secondary.light"
            : "brand.secondary.dark"
        }
      />
      <Box
        as={PiSeal}
        size={size}
        color={
          colorMode === "light" ? "brand.border.light" : "brand.border.dark"
        }
        position="absolute"
        top="0"
        left="0"
        style={{
          width: size,
          height: size,
        }}
        sx={{
          svg: {
            strokeWidth: borderThickness,
            stroke:
              colorMode === "light"
                ? "brand.border.light"
                : "brand.border.dark",
            fill: "none",
          },
          path: {
            strokeWidth: borderThickness,
            stroke:
              colorMode === "light"
                ? "brand.border.light"
                : "brand.border.dark",
            fill: "none",
          },
        }}
      />
      <Flex
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        alignItems="center"
        justifyContent="center"
      >
        <Icon
          size={iconSize}
          color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
        />
      </Flex>
    </Box>
  );
});

const SearchBar = ({
  placeholder = "Search questions...",
  onSearch,
  onShuffle,
  onReset,
  currentQuestion,
  currentTopic,
  totalQuestions,
  onQuestionSelect,
  onSubmit,
}) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleQuestionSelect = (question) => {
    if (onQuestionSelect) {
      onQuestionSelect(question);
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const questions = Array.from(
    { length: totalQuestions },
    (_, index) => `T${currentTopic} Q${index + 1}`
  );

  return (
    <Flex
      width="100%"
      marginBottom={4}
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 4 }}
    >
      {/* Search Input */}
      <InputGroup size="lg" flex={1}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
            opacity={0.5}
          />
        </InputLeftElement>
        <Input
          value={searchTerm}
          onChange={handleSearch}
          placeholder={placeholder}
          bg={
            colorMode === "light"
              ? "brand.background.light"
              : "brand.surface.dark"
          }
          border="1px solid"
          borderColor={
            colorMode === "light" ? "brand.border.light" : "brand.border.dark"
          }
          borderRadius="12px"
          color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
          _placeholder={{
            color:
              colorMode === "light" ? "brand.text.light" : "brand.text.dark",
            opacity: 0.5,
          }}
          _focus={{
            boxShadow: `0 0 0 1px ${colorMode === "light" ? "black" : "white"}`,
            borderColor:
              colorMode === "light"
                ? "brand.border.light"
                : "brand.border.dark",
          }}
          _hover={{
            borderColor:
              colorMode === "light"
                ? "brand.border.light"
                : "brand.border.dark",
          }}
          fontFamily='"Karla Variable", sans-serif'
          fontWeight={500}
          fontSize="16px"
        />
        {searchTerm && (
          <InputRightElement>
            <CloseIcon
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              opacity={0.5}
              cursor="pointer"
              onClick={clearSearch}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {/* Action Buttons */}
      <Flex
        ref={dropdownRef}
        gap={2}
        justifyContent={{ base: "space-between", md: "flex-start" }}
        width={{ base: "100%", md: "auto" }}
      >
        <Box position="relative">
          <SealedButton icon={MdFormatListNumbered} onClick={toggleDropdown} />
          {isDropdownOpen && (
            <QuestionListDropdown
              questions={questions}
              currentQuestion={currentQuestion}
              onSelect={handleQuestionSelect}
            />
          )}
        </Box>
        <SealedButton icon={PiShuffle} onClick={onShuffle} />
        <SealedButton icon={RxReset} onClick={onReset} />
        <SubmitButton onClick={onSubmit} />
      </Flex>
    </Flex>
  );
};

export default SearchBar;
