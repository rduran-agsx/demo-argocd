import React from 'react';
import { Box, Text, VStack, Flex, useColorMode } from '@chakra-ui/react';

const TopicBox = ({ topicNumber, examCode, examTitle }) => {
  const { colorMode } = useColorMode();
  const capitalizedExamCode = examCode.toUpperCase();

  const gradientColors = {
    light: "linear(to top left, #F7941E, #72C6EF, #00A651)",
    dark: "linear(to top left, #B55F0C, #2F7A9E, #00733A)"
  };

  return (
    <Flex
      direction="column"
      width="100%"
      bgGradient={gradientColors[colorMode]}
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
      <VStack spacing={4} align="stretch">
        <Box
          paddingX={2}
          paddingY={0}
          borderRadius="full"
          display="inline-block"
          alignSelf="flex-start"
          border="1px solid"
          borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
          backgroundColor={colorMode === 'light' 
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(255, 255, 255, 0.15)'}
        >
          <Text 
            fontSize="14px" 
            fontWeight="500" 
            color={colorMode === 'light' ? 'black' : 'white'}
          >
            Topic {topicNumber}
          </Text>
        </Box>
        <Text 
          fontSize="24px" 
          fontWeight="700" 
          color={colorMode === 'light' ? 'black' : 'white'}
          lineHeight="1.2"
        >
          {capitalizedExamCode}
        </Text>
        <Text 
          fontSize="20px" 
          fontWeight="700" 
          color={colorMode === 'light' ? 'black' : 'white'}
          lineHeight="1.2"
        >
          {examTitle}
        </Text>
      </VStack>
    </Flex>
  );
};

export default TopicBox;