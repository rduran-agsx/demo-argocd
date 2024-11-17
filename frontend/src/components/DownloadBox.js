import React from 'react';
import { Box, Text, VStack, useColorMode } from '@chakra-ui/react';
import { FaFileDownload, FaChevronRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const DownloadBox = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const premiumGradients = {
    light: {
      normal: "linear(to-r, #ffaa40, #9c40ff, #ffaa40)",
      hover: "linear(to-r, #ff9020, #7c20ff, #ff9020)",
    },
    dark: {
      normal: "linear(to-r, #cc7718, #7718cc, #cc7718)",
      hover: "linear(to-r, #b35f0f, #5f0fb3, #b35f0f)",
    }
  };

  return (
    <VStack
      spacing={4}
      p={4}
      align="stretch"
      bgGradient={premiumGradients[colorMode].normal}
      borderRadius="xl"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
      boxShadow={colorMode === 'light'
        ? "0 4px 0 0 black"
        : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      cursor="pointer"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(2px)",
        bgGradient: premiumGradients[colorMode].hover,
        boxShadow: colorMode === 'light'
          ? "0 2px 0 0 black"
          : "0 2px 0 0 rgba(255, 255, 255, 0.2)"
      }}
      _active={{
        transform: "translateY(4px)",
        boxShadow: "none"
      }}
      onClick={() => navigate('/premium')}
    >
      <Box>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="white"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <FaFileDownload /> Download exam questions PDF
        </Text>
      </Box>
      <Text
        fontSize="xl"
        fontWeight="bold"
        color="white"
        display="flex"
        alignItems="center"
        gap={2}
      >
        🎉 Go Premium! <FaChevronRight />
      </Text>
    </VStack>
  );
};

export default DownloadBox;