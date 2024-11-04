import React, { useState } from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import { PiSealFill, PiSeal, PiStar, PiStarFill } from 'react-icons/pi';

const IconBox = ({
  icon: Icon,
  size = '48px',
  iconScale = 0.5,
  onClick,
  withBorder = true,
  borderThickness = 3,
  isActive = false,
  backgroundColor
}) => {
  const { colorMode } = useColorMode();
  const iconSize = `${parseInt(size) * iconScale}px`;

  const getBgColor = () => {
    if (backgroundColor) {
      return backgroundColor;
    }
    
    if (isActive) {
      return colorMode === 'light' ? 'brand.secondary.light' : 'brand.secondary.dark';
    }
    return colorMode === 'light' ? 'brand.background.light' : 'brand.surface.dark';
  };

  return (
    <Box
      position="relative"
      width={size}
      height={size}
      onClick={onClick}
      cursor="pointer"
      transition="all 0.1s ease"
      transform="scale(1)"
      userSelect="none"
      _hover={{
        transform: "scale(1.05)"
      }}
      _active={{
        transform: "scale(0.95)"
      }}
    >
      <Box
        as={PiSealFill}
        size={size}
        color={getBgColor()}
      />
      {withBorder && (
        <Box
          as={PiSeal}
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
              stroke: colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark',
              fill: 'none',
            },
            path: {
              strokeWidth: borderThickness,
              stroke: colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark',
              fill: 'none',
            },
          }}
        />
      )}
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
          color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
        />
      </Flex>
    </Box>
  );
};

const StarIconBox = ({
  size = '48px',
  iconScale = 0.5,
  onClick,
  isStarFilled = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { colorMode } = useColorMode();
  const iconSize = `${parseInt(size) * iconScale}px`;
  const starFillColor = "#FFD700"; // Gold color for star

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
      transform={isPressed ? 'scale(0.95)' : 'scale(1)'}
      userSelect="none"
    >
      <Box
        as={PiSealFill}
        size={size}
        color={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
      />
      
      <Box
        as={PiSeal}
        position="absolute"
        top="0"
        left="0"
        style={{
          width: size,
          height: size,
        }}
        sx={{
          svg: {
            strokeWidth: 3,
            stroke: colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark',
            fill: 'none',
          },
          path: {
            strokeWidth: 3,
            stroke: colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark',
            fill: 'none',
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
        <Box position="relative" width={iconSize} height={iconSize}>
          {isStarFilled && (
            <Box
              as={PiStarFill}
              size={iconSize}
              color={starFillColor}
              position="absolute"
              top="0"
              left="0"
              zIndex={1}
            />
          )}
          <Box
            as={PiStar}
            size={iconSize}
            color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
            position="absolute"
            top="0"
            left="0"
            zIndex={2}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export { IconBox, StarIconBox };