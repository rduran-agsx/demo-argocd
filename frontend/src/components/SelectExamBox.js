import React from 'react';
import { Box, Text, VStack, Button, Flex, useColorMode } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';

const SelectExamBox = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  return (
    <Flex 
      width="100%" 
      height="100%" 
      alignItems="flex-start" 
      justifyContent="center" 
      pt={{ base: "24px", md: "50px" }}
      px={{ base: 4, md: 8 }}
    >
      <Box
        width="100%"
        maxWidth="800px"
        bgGradient={colorMode === 'light'
          ? "linear(to-br, #8E2DE2, #4A00E0)"
          : "linear(to-br, #6620A3, #3500A3)"
        }
        borderRadius={{ base: "12px", md: "20px" }}
        border="1px solid"
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
        boxShadow={colorMode === 'light'
          ? "0 8px 0 0 black"
          : "0 8px 0 0 rgba(255, 255, 255, 0.2)"
        }
        position="relative"
        overflow="hidden"
        p={{ base: 4, sm: 6, md: 8 }}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Text
            fontSize={{ base: "32px", sm: "40px", md: "48px" }}
            fontWeight="800"
            color="white"
            textAlign="center"
            fontFamily="heading"
            textShadow={colorMode === 'light'
              ? "2px 2px 4px rgba(0,0,0,0.2)"
              : "2px 2px 4px rgba(0,0,0,0.5)"
            }
            lineHeight={{ base: "1.2", md: "1.3" }}
          >
            Select an Exam
          </Text>
          <Text 
            fontSize={{ base: "16px", sm: "18px", md: "20px" }}
            color={colorMode === 'light' ? '#E0E0E0' : '#CCCCCC'}
            textAlign="center" 
            lineHeight="1.6"
            px={{ base: 2, md: 4 }}
          >
            Please select an exam to begin your practice session.
          </Text>
          <Flex justifyContent="center">
            <Button
              onClick={() => navigate("/exams")}
              height={{ base: "40px", md: "48px" }}
              fontSize={{ base: "14px", md: "16px" }}
              px={{ base: "16px", md: "24px" }}
              backgroundColor={colorMode === 'light' ? '#4FD1C5' : '#2E7A73'}
              color={colorMode === 'light' ? 'black' : 'white'}
              borderRadius="full"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
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
                  ? '0 2px 0 0 black'
                  : '0 2px 0 0 rgba(255, 255, 255, 0.2)',
                backgroundColor: colorMode === 'light' ? "#45B7AB" : "#266159",
              }}
              _active={{
                transform: 'translateY(4px)',
                boxShadow: 'none',
              }}
              leftIcon={<FaPaperPlane />}
            >
              Go to Exams Page
            </Button>
          </Flex>
        </VStack>
        <Box
          position="absolute"
          bottom={{ base: "-30px", md: "-50px" }}
          right={{ base: "-30px", md: "-50px" }}
          width={{ base: "120px", md: "200px" }}
          height={{ base: "120px", md: "200px" }}
          borderRadius="full"
          backgroundColor={colorMode === 'light'
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(255, 255, 255, 0.05)"
          }
          zIndex={0}
        />
      </Box>
    </Flex>
  );
};

export default SelectExamBox;