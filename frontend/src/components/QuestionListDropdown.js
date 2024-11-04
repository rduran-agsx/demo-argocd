import React from 'react';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { FixedSizeList as List } from 'react-window';

const QuestionListDropdown = React.memo(({ questions, currentQuestion, onSelect }) => {
  const { colorMode } = useColorMode();
  const itemSize = 32;
  const listHeight = Math.min(questions.length * itemSize, 300);

  const Row = ({ index, style }) => {
    const question = questions[index];
    const isSelected = question === currentQuestion;

    return (
      <Box
        style={style}
        paddingTop={2}
        paddingBottom={2}
        paddingLeft={4}
        paddingRight={4}
        cursor="pointer"
        backgroundColor={isSelected 
          ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
          : colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"
        }
        _hover={{
          backgroundColor: isSelected 
            ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
            : colorMode === 'light' ? "brand.secondary.light" : "brand.secondary.dark"
        }}
        onClick={() => onSelect(question)}
        transition="background-color 0.2s"
      >
        <Text 
          fontWeight={700} 
          fontSize="14px" 
          lineHeight="16px" 
          color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
        >
          {question}
        </Text>
      </Box>
    );
  };

  return (
    <Box
      position="absolute"
      top="calc(100% + 8px)"
      left="50%"
      transform="translateX(-50%)"
      width="120px"
      height={listHeight}
      backgroundColor={colorMode === 'light' 
        ? "brand.background.light" 
        : "brand.surface.dark"
      }
      borderRadius="10px"
      border="1px solid"
      borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
      zIndex={1000}
      overflow="hidden"
      boxShadow={colorMode === 'light'
        ? "0 4px 0 0 black"
        : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
    >
      <List
        height={listHeight}
        itemCount={questions.length}
        itemSize={itemSize}
        width="100%"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: colorMode === 'light' 
            ? '#888 #f5f5f5'
            : '#666 #2d2d2d'
        }}
      >
        {Row}
      </List>
    </Box>
  );
});

export default QuestionListDropdown;