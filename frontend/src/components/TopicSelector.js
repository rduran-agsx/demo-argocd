import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Flex, Button, VStack, useColorMode } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const CONTAINER_HEIGHT = "300px";
const TOPICS_PER_PAGE = 10;

const TopicButton = ({ topic, isSelected, onClick }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Button
      onClick={() => onClick(topic)}
      width="100%"
      height="40px"
      bg={isSelected 
        ? colorMode === 'light' ? 'brand.primary.light' : 'brand.primary.dark'
        : colorMode === 'light' ? 'brand.background.light' : 'brand.surface.dark'
      }
      color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
      fontWeight={700}
      fontSize="14px"
      borderRadius="10px"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
      boxShadow={isSelected 
        ? "none" 
        : colorMode === 'light'
          ? "0 2px 0 0 black"
          : "0 2px 0 0 rgba(255, 255, 255, 0.2)"
      }
      _hover={{
        bg: isSelected
          ? colorMode === 'light' ? 'brand.primary.dark' : 'brand.primary.light'
          : colorMode === 'light' ? 'brand.secondary.light' : 'brand.secondary.dark',
        transform: "translateY(1px)",
        boxShadow: isSelected 
          ? "none" 
          : colorMode === 'light'
            ? "0 1px 0 0 black"
            : "0 1px 0 0 rgba(255, 255, 255, 0.2)",
      }}
      _active={{
        transform: "translateY(2px)",
        boxShadow: "none",
      }}
      transition="all 0.2s"
    >
      Topic {topic}
    </Button>
  );
};

const TopicSelector = ({ availableTopics = [], currentTopic, onTopicChange }) => {
  const { colorMode } = useColorMode();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef(null);
  const totalPages = Math.ceil(availableTopics.length / TOPICS_PER_PAGE);

  const handlePageChange = (direction) => {
    setCurrentPage(prevPage => {
      const newPage = direction === 'left'
        ? Math.max(0, prevPage - 1)
        : Math.min(totalPages - 1, prevPage + 1);
      return newPage;
    });
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  if (availableTopics.length === 1) {
    return null;
  }

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
      padding={4}
    >
      <Text 
        fontSize="24px" 
        fontWeight="700" 
        color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'} 
        marginBottom={4}
      >
        Topics
      </Text>
      {availableTopics.length > 0 ? (
        <>
          <Box
            ref={scrollContainerRef}
            overflowY="auto"
            height={CONTAINER_HEIGHT}
            marginBottom={4}
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: colorMode === 'light' ? '#f1f1f1' : '#2d2d2d',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: colorMode === 'light' ? '#888' : '#666',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: colorMode === 'light' ? '#555' : '#888',
              },
            }}
          >
            <VStack spacing={3} align="stretch" padding={2}>
              {availableTopics
                .slice(currentPage * TOPICS_PER_PAGE, (currentPage + 1) * TOPICS_PER_PAGE)
                .map((topic) => (
                  <TopicButton
                    key={topic}
                    topic={topic}
                    isSelected={currentTopic === topic}
                    onClick={onTopicChange}
                  />
                ))}
            </VStack>
          </Box>
          <Flex justifyContent="space-between" alignItems="center">
            <Button
              onClick={() => handlePageChange('left')}
              isDisabled={currentPage === 0}
              leftIcon={<ChevronLeftIcon />}
              size="sm"
              bg={colorMode === 'light' ? 'brand.background.light' : 'brand.surface.dark'}
              color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
              fontWeight={700}
              fontSize="14px"
              borderRadius="full"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
              boxShadow={colorMode === 'light'
                ? "0 2px 0 0 black"
                : "0 2px 0 0 rgba(255, 255, 255, 0.2)"}
              _hover={{
                bg: colorMode === 'light' ? 'brand.secondary.light' : 'brand.secondary.dark',
                transform: "translateY(1px)",
                boxShadow: colorMode === 'light'
                  ? "0 1px 0 0 black"
                  : "0 1px 0 0 rgba(255, 255, 255, 0.2)",
              }}
              _active={{
                transform: "translateY(2px)",
                boxShadow: "none",
              }}
              _disabled={{
                opacity: 0.5,
                cursor: "not-allowed",
                boxShadow: "none",
              }}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange('right')}
              isDisabled={currentPage === totalPages - 1}
              rightIcon={<ChevronRightIcon />}
              size="sm"
              bg={colorMode === 'light' ? 'brand.background.light' : 'brand.surface.dark'}
              color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
              fontWeight={700}
              fontSize="14px"
              borderRadius="full"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
              boxShadow={colorMode === 'light'
                ? "0 2px 0 0 black"
                : "0 2px 0 0 rgba(255, 255, 255, 0.2)"}
              _hover={{
                bg: colorMode === 'light' ? 'brand.secondary.light' : 'brand.secondary.dark',
                transform: "translateY(1px)",
                boxShadow: colorMode === 'light'
                  ? "0 1px 0 0 black"
                  : "0 1px 0 0 rgba(255, 255, 255, 0.2)",
              }}
              _active={{
                transform: "translateY(2px)",
                boxShadow: "none",
              }}
              _disabled={{
                opacity: 0.5,
                cursor: "not-allowed",
                boxShadow: "none",
              }}
            >
              Next
            </Button>
          </Flex>
        </>
      ) : (
        <Text 
          fontSize="16px" 
          color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
        >
          No topics available for this exam.
        </Text>
      )}
    </Box>
  );
};

export default TopicSelector;