import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  VStack,
  HStack,
  Progress,
  Box,
  Flex,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const { colorMode } = useColorMode();
  const badgePadding = useBreakpointValue({ 
    base: "2px 12px",
    md: "4px 16px" 
  });
  const badgeFontSize = useBreakpointValue({ base: "12px", md: "14px" });
  let bgGradient;
  let textColor = colorMode === 'light' ? "brand.text.light" : "brand.text.dark";
  
  switch (status) {
    case "PASSED":
      bgGradient = colorMode === 'light'
        ? "linear(to-r, #4CAF50, #8BC34A)"
        : "linear(to-r, #2E673F, #4A6F2E)";
      break;
    case "FAILED":
      bgGradient = colorMode === 'light'
        ? "linear(to-r, #FF5252, #FF8A80)"
        : "linear(to-r, #992F2F, #994D4D)";
      break;
    default:
      bgGradient = colorMode === 'light'
        ? "linear(to-r, #FFD54F, #FFF176)"
        : "linear(to-r, #997F30, #998E47)";
  }
  
  return (
    <Box
      padding={badgePadding}
      borderRadius="full"
      display="inline-block"
      alignSelf="flex-start"
      border="1px solid"
      borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
      bgGradient={bgGradient}
      width="fit-content"
    >
      <Text fontSize={badgeFontSize} fontWeight="500" color={textColor}>
        {status}
      </Text>
    </Box>
  );
};

const CloseButton = ({ onClick, colorMode }) => {
  const buttonSize = useBreakpointValue({ base: "20px", md: "24px" });
  const iconSize = useBreakpointValue({ base: "14px", md: "16px" });

  return (
    <Box
      as="button"
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w={buttonSize}
      h={buttonSize}
      bg="transparent"
      _focus={{ boxShadow: "none" }}
      color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
      borderRadius="50%"
      _hover={{ bg: 'transparent' }}
    >
      <FaTimes size={iconSize} />
    </Box>
  );
};

const CustomButton = ({ children, onClick }) => {
  const { colorMode } = useColorMode();
  const buttonHeight = useBreakpointValue({ base: "40px", md: "48px" });
  const fontSize = useBreakpointValue({ base: "14px", md: "16px" });
  const padding = useBreakpointValue({ 
    base: "0 16px",
    md: "0 32px"
  });
  const buttonWidth = useBreakpointValue({ 
    base: "100%",
    md: "auto"
  });
  
  return (
    <Button
      onClick={onClick}
      height={buttonHeight}
      fontSize={fontSize}
      px={padding}
      minW={useBreakpointValue({ base: "auto", md: "120px" })}
      width={buttonWidth}
      bg={colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"}
      color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
      borderRadius="full"
      border="1px solid"
      borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
      fontWeight={700}
      textTransform="uppercase"
      transition="0.3s"
      boxShadow={colorMode === 'light' 
        ? "0 4px 0 0 black"
        : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      _hover={{
        transform: 'translateY(2px)',
        boxShadow: colorMode === 'light'
          ? "0 2px 0 0 black"
          : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
      }}
      _active={{
        transform: 'translateY(4px)',
        boxShadow: 'none',
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </Button>
  );
};

const formatIncorrectQuestions = (incorrectQuestions) => {
  if (incorrectQuestions.length === 0) return '';

  const sortedQuestions = incorrectQuestions.sort((a, b) => {
    const [aTopic, aQ] = a.split(' ');
    const [bTopic, bQ] = b.split(' ');
    return aTopic.localeCompare(bTopic) || parseInt(aQ.slice(1)) - parseInt(bQ.slice(1));
  });

  let result = [];
  let currentTopic = '';
  let currentRange = [];

  sortedQuestions.forEach((q, index) => {
    const [topic, questionNum] = q.split(' ');
    if (topic !== currentTopic) {
      if (currentRange.length > 0) {
        result.push(formatRange(currentTopic, currentRange));
      }
      currentTopic = topic;
      currentRange = [parseInt(questionNum.slice(1))];
    } else {
      const prevNum = currentRange[currentRange.length - 1];
      const currentNum = parseInt(questionNum.slice(1));
      if (currentNum !== prevNum + 1 && currentRange.length > 0) {
        result.push(formatRange(currentTopic, currentRange));
        currentRange = [currentNum];
      } else {
        currentRange.push(currentNum);
      }
    }

    if (index === sortedQuestions.length - 1) {
      result.push(formatRange(currentTopic, currentRange));
    }
  });

  return result.join(', ');
};

const formatRange = (topic, range) => {
  if (range.length === 1) {
    return `${topic} Q${range[0]}`;
  } else if (range.length === 2) {
    return `${topic} Q${range[0]}, ${topic} Q${range[1]}`;
  } else {
    return `${topic} Q${range[0]}-${topic} Q${range[range.length - 1]}`;
  }
};

const ResultsModal = ({ isOpen, onClose, results }) => {
  const { colorMode } = useColorMode();
  const modalPadding = useBreakpointValue({ base: 4, md: 6 });
  const headerFontSize = useBreakpointValue({ base: "20px", md: "24px" });
  const textFontSize = useBreakpointValue({ base: "14px", md: "16px" });
  const labelFontSize = useBreakpointValue({ base: "14px", md: "16px" });
  const stackSpacing = useBreakpointValue({ base: 3, md: 4 });
  const progressHeight = useBreakpointValue({ base: "12px", md: "16px" });
  const contentMaxWidth = useBreakpointValue({ base: "90%", md: "lg" });
  const itemDirection = useBreakpointValue({ base: "column", sm: "row" });
  const itemAlign = useBreakpointValue({ base: "flex-start", sm: "center" });
  const itemSpacing = useBreakpointValue({ base: 1, sm: 4 });

  const renderResults = () => {
    if (!results) {
      return (
        <VStack spacing={4} align="center">
          <Text fontSize={textFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
            Loading results...
          </Text>
        </VStack>
      );
    }

    return (
      <VStack spacing={stackSpacing} align="stretch">
        <HStack 
          justifyContent="space-between"
          flexDirection={itemDirection}
          alignItems={itemAlign}
          spacing={itemSpacing}
          width="100%"
        >
          <Text fontWeight="bold" fontSize={labelFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
            Score:
          </Text>
          <Text fontSize={textFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
            {results.score}%
          </Text>
        </HStack>

        <Progress 
          value={results.score} 
          colorScheme={results.passed ? "green" : "red"}
          bg={colorMode === 'light' ? "brand.surface.light" : "brand.background.dark"}
          height={progressHeight}
          borderRadius="full"
        />

        <HStack 
          justifyContent="space-between"
          flexDirection={itemDirection}
          alignItems={itemAlign}
          spacing={itemSpacing}
          width="100%"
        >
          <Text fontWeight="bold" fontSize={labelFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
            Result:
          </Text>
          <StatusBadge status={results.passed ? "PASSED" : "FAILED"} />
        </HStack>

        <HStack 
          justifyContent="space-between"
          flexDirection={itemDirection}
          alignItems={itemAlign}
          spacing={itemSpacing}
          width="100%"
        >
          <Text fontWeight="bold" fontSize={labelFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
            Correct Answers:
          </Text>
          <Text fontSize={textFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
            {results.correct_answers} / {results.total_questions}
          </Text>
        </HStack>

        {results.incorrect_questions.length > 0 && (
          <VStack align="stretch" spacing={2}>
            <Text fontWeight="bold" fontSize={labelFontSize} color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}>
              Incorrect Questions:
            </Text>
            <Text 
              fontSize={textFontSize} 
              color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
              sx={{ wordBreak: "break-word" }}
            >
              {formatIncorrectQuestions(results.incorrect_questions)}
            </Text>
          </VStack>
        )}
      </VStack>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="20px"
        border="1px solid"
        borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
        boxShadow={colorMode === 'light'
          ? "0 8px 0 0 black"
          : "0 8px 0 0 rgba(255, 255, 255, 0.2)"
        }
        bg={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
        p={modalPadding}
        mx={4}
        maxW={contentMaxWidth}
      >
        <Flex justifyContent="flex-end">
          <CloseButton onClick={onClose} colorMode={colorMode} />
        </Flex>
        <ModalHeader
          fontFamily="heading"
          fontWeight="bold"
          fontSize={headerFontSize}
          pb={3}
          color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
        >
          Exam Results
        </ModalHeader>
        <ModalBody>
          {renderResults()}
        </ModalBody>
        <ModalFooter pt={4}>
          <Flex justifyContent="flex-end" width="100%">
            <CustomButton onClick={onClose}>
              Close
            </CustomButton>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResultsModal;