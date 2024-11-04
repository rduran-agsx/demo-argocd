import React from 'react';
import { Box, Text, VStack, useColorMode } from '@chakra-ui/react';
import { FaFileDownload, FaChevronRight } from "react-icons/fa";

const DownloadBox = () => {
  const { colorMode } = useColorMode();

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
    <Box position="relative" width="100%" maxWidth="2xl" mx="auto">
      <Box
        width="100%"
        height="auto"
        py={12}
        bg={colorMode === 'light' ? 'gray.100' : 'gray.800'}
        borderRadius="20px"
        border="1px solid"
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
        boxShadow={colorMode === 'light'
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"}
        position="relative"
        overflow="hidden"
        display="flex"
        justifyContent="center"
        alignItems="center"
        cursor="not-allowed"
      >
        <VStack 
          spacing={2} 
          color={colorMode === 'light' ? 'gray.500' : 'gray.400'} 
          textAlign="center"
        >
          <FaFileDownload size="32px" />
          <Text fontSize="2xl" fontWeight="semibold">Download exam questions</Text>
          <Text fontSize="lg" fontWeight="bold">PDF</Text>
        </VStack>
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
          opacity="0.7"
          zIndex="1"
        />
      </Box>
      
      <Box
        as="button"
        position="absolute"
        top="-20px"
        right="-20px"
        transform="rotate(12deg)"
        bgGradient={premiumGradients[colorMode].normal}
        color="white"
        fontWeight="bold"
        fontSize="lg"
        borderRadius="full"
        px={6}
        py={3}
        border="1px solid"
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
        boxShadow={colorMode === 'light'
          ? "0 2px 0 0 black"
          : "0 2px 0 0 rgba(255, 255, 255, 0.2)"}
        _hover={{
          bgGradient: premiumGradients[colorMode].hover,
        }}
        _active={{
          boxShadow: "none",
          transform: "rotate(12deg) translateY(2px)",
        }}
        zIndex="2"
        cursor="pointer"
      >
        🎉 Go Premium! <Box as={FaChevronRight} display="inline-block" ml={1} />
      </Box>
    </Box>
  );
};

export default DownloadBox;