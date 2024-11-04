import React from 'react';
import { Box, Text, Flex, useColorMode } from '@chakra-ui/react';
import { StarIconBox } from './IconBox';
import { transformImageUrl } from '../utils';

const QuestionBox = ({ 
  questionNumber, 
  totalQuestionsInTopic, 
  questionData, 
  isStarFilled, 
  toggleStar, 
  currentTopic 
}) => {
  const { colorMode } = useColorMode();

  if (!questionData) {
    return (
      <Box
        width="100%"
        bg={colorMode === 'light' ? 'brand.surface.light' : 'brand.surface.dark'}
        borderRadius="20px"
        border="1px solid"
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
        boxShadow={colorMode === 'light' 
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"}
        position="relative"
        overflow="hidden"
        padding={6}
      >
        <Text 
          fontSize="20px" 
          fontWeight="500"
          color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
        >
          No question data available.
        </Text>
      </Box>
    );
  }

  const transformedBody = questionData.body.replace(
    /<img\s+src="([^"]+)"/g,
    (match, p1) => `<img src="${transformImageUrl(p1)}"`
  );

  return (
    <Box
      width="100%"
      bg={colorMode === 'light' ? 'brand.surface.light' : 'brand.surface.dark'}
      borderRadius="20px"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
      boxShadow={colorMode === 'light' 
        ? "0 4px 0 0 black"
        : "0 4px 0 0 rgba(255, 255, 255, 0.2)"}
      position="relative"
      overflow="hidden"
      padding={6}
    >
      <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Box
          bg={colorMode === 'light' ? 'brand.secondary.light' : 'brand.secondary.dark'}
          paddingX={1}
          paddingY={0}
          borderRadius="8px"
        >
          <Text 
            fontSize="24px" 
            fontWeight="700"
            color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
          >
            T{currentTopic} Q{questionNumber} of {totalQuestionsInTopic}
          </Text>
        </Box>
        <StarIconBox
          size="48px"
          iconScale={0.5}
          onClick={toggleStar}
          isStarFilled={isStarFilled}
        />
      </Flex>
      <Box>
        <Text 
          fontSize="20px" 
          fontWeight="500"
          color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
          dangerouslySetInnerHTML={{ __html: transformedBody || "No question text available." }} 
        />
      </Box>
    </Box>
  );
};

export default QuestionBox;