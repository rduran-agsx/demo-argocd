import React from 'react';
import { Flex, Text, Box, useColorMode, useBreakpointValue } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, sm: false });

  const getPageNumbers = () => {
    const pageNumbers = [];
    // Mobile view - show only current page with immediate neighbors
    if (isMobile) {
      if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        if (currentPage === 1) {
          pageNumbers.push(1, 2, '...');
        } else if (currentPage === totalPages) {
          pageNumbers.push('...', totalPages - 1, totalPages);
        } else {
          pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
        }
      }
    } 
    // Desktop view - show more pages
    else {
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pageNumbers.push(1);
          pageNumbers.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1);
          pageNumbers.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        }
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Flex 
      justifyContent="center" 
      alignItems="center" 
      marginTop={8} 
      marginBottom={4}
      width="100%"
      flexWrap="wrap"
      gap={2}
    >
      {/* Previous Button */}
      <Flex
        as="button"
        onClick={handlePrevPage}
        alignItems="center"
        justifyContent="center"
        paddingX={3}
        height={isMobile ? 8 : 10}
        fontSize={isMobile ? "sm" : "md"}
        pointerEvents={currentPage === 1 ? "none" : "auto"}
        color={currentPage === 1 
          ? colorMode === 'light' ? "gray.400" : "gray.600"
          : colorMode === 'light' ? "brand.text.light" : "brand.text.dark"
        }
        fontWeight="bold"
        _hover={{ 
          color: currentPage === 1 
            ? colorMode === 'light' ? "gray.400" : "gray.600"
            : colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
        }}
        cursor={currentPage === 1 ? "not-allowed" : "pointer"}
        opacity={currentPage === 1 ? 0.5 : 1}
      >
        <ChevronLeftIcon marginRight={isMobile ? 0 : 1} />
        {!isMobile && "Previous"}
      </Flex>

      {/* Page Numbers */}
      {pageNumbers.map((number, index) => (
        number === '...' ? (
          <Text
            key={index}
            marginX={1}
            color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
          >
            ...
          </Text>
        ) : (
          <Box
            key={index}
            as="button"
            width={isMobile ? "32px" : "40px"}
            height={isMobile ? "32px" : "40px"}
            fontSize={isMobile ? "sm" : "md"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
            backgroundColor={currentPage === number
              ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
              : colorMode === 'light' ? "brand.background.light" : "rgba(255, 255, 255, 0.2)"}
            color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
            fontWeight="bold"
            border="1px solid"
            borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
            boxShadow={colorMode === 'light'
              ? "0 2px 0 0 black"
              : "0 2px 0 0 rgba(255, 255, 255, 0.2)"}
            _hover={{
              backgroundColor: currentPage === number
                ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
                : colorMode === 'light' ? "brand.secondary.light" : "brand.secondary.dark"
            }}
            _active={{
              boxShadow: "none",
              transform: "translateY(2px)"
            }}
            onClick={() => onPageChange(number)}
            transition="all 0.2s"
          >
            {number}
          </Box>
        )
      ))}

      {/* Next Button */}
      <Flex
        as="button"
        onClick={handleNextPage}
        alignItems="center"
        justifyContent="center"
        paddingX={3}
        height={isMobile ? 8 : 10}
        fontSize={isMobile ? "sm" : "md"}
        pointerEvents={currentPage === totalPages ? "none" : "auto"}
        color={currentPage === totalPages 
          ? colorMode === 'light' ? "gray.400" : "gray.600"
          : colorMode === 'light' ? "brand.text.light" : "brand.text.dark"
        }
        fontWeight="bold"
        _hover={{ 
          color: currentPage === totalPages 
            ? colorMode === 'light' ? "gray.400" : "gray.600"
            : colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
        }}
        cursor={currentPage === totalPages ? "not-allowed" : "pointer"}
        opacity={currentPage === totalPages ? 0.5 : 1}
      >
        {!isMobile && "Next"}
        <ChevronRightIcon marginLeft={isMobile ? 0 : 1} />
      </Flex>
    </Flex>
  );
};

export default Pagination;