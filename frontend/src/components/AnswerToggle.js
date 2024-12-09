import React from 'react';
import { Flex, Divider, Tooltip, useColorMode } from '@chakra-ui/react';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';

const AnswerToggle = ({ isVisible, onToggle }) => {
  const { colorMode } = useColorMode();

  return (
    <Flex alignItems="stretch" height="calc(100% - 2px)" margin="1px">
      <Divider
        orientation="vertical"
        height="100%"
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
      />
      <Tooltip 
        label={isVisible ? 'Hide Answers' : 'Show Answers'}
        placement="bottom"
        hasArrow
        bg={colorMode === 'light' ? 'gray.700' : 'gray.200'}
        color={colorMode === 'light' ? 'white' : 'black'}
      >
        <Flex
          as="button"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="48px"
          cursor="pointer"
          onClick={onToggle}
          _hover={{
            bg: colorMode === 'light' 
              ? 'brand.secondary.light'
              : 'brand.secondary.dark'
          }}
          borderTopRightRadius="11px"    // Slightly smaller to account for border
          borderBottomRightRadius="11px"  // Slightly smaller to account for border
          transition="all 0.2s"
        >
          {isVisible ? (
            <BsEyeFill 
              size="20px"
              color={colorMode === 'light' ? 'black' : 'white'}
            />
          ) : (
            <BsEyeSlashFill 
              size="20px"
              color={colorMode === 'light' ? 'black' : 'white'}
            />
          )}
        </Flex>
      </Tooltip>
    </Flex>
  );
};

export default AnswerToggle;