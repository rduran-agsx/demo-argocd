import React, { useState } from 'react';
import { Box, Text, VStack, Input, Button, Flex, useToast, useColorMode } from '@chakra-ui/react';
import { RiMailSendLine } from 'react-icons/ri';

const ComingSoonComponent = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    toast({
      title: "You're on the list!",
      description: "We'll notify you when the Custom Exam feature is ready.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    setEmail('');
  };

  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 8 }}
    >
      <Box
        w="100%"
        maxW="800px"
        bgGradient={colorMode === 'light' 
          ? "linear(to-br, #4158D0, #C850C0, #FFCC70)"
          : "linear(to-br, #2A3B97, #8C2F89, #B38537)"
        }
        borderRadius={{ base: "12px", md: "20px" }}
        border="1px solid"
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
        boxShadow={colorMode === 'light' 
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
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
              ? "2px 2px 4px rgba(0,0,0,0.3)"
              : "2px 2px 4px rgba(0,0,0,0.5)"
            }
            lineHeight={{ base: "1.2", md: "1.3" }}
          >
            Custom Exam
          </Text>
          <Text
            fontSize={{ base: "24px", sm: "26px", md: "28px" }}
            fontWeight="700"
            color={colorMode === 'light' ? '#FFCC70' : '#B38537'}
            textAlign="center"
            textShadow={colorMode === 'light'
              ? "1px 1px 2px rgba(0,0,0,0.2)"
              : "1px 1px 2px rgba(0,0,0,0.4)"
            }
          >
            Coming Soon!
          </Text>
          <Text 
            fontSize={{ base: "16px", md: "18px" }}
            color="white" 
            textAlign="center" 
            lineHeight="1.6"
            px={{ base: 2, md: 4 }}
          >
            Enter your email below to be notified when custom exams are ready!
          </Text>
          <form onSubmit={handleSubmit}>
            <Flex 
              flexDirection="column" 
              alignItems="center"
              gap={{ base: 3, md: 4 }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                bg={colorMode === 'light' ? 'white' : 'brand.surface.dark'}
                color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
                borderRadius="full"
                border="1px solid"
                borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
                height={{ base: "40px", md: "48px" }}
                width="100%"
                maxWidth="400px"
                px={4}
                fontSize={{ base: "14px", md: "16px" }}
                _focus={{
                  boxShadow: 'none',
                  borderColor: colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark',
                }}
                _placeholder={{
                  color: colorMode === 'light' 
                    ? 'rgba(0,0,0,0.6)' 
                    : 'rgba(255,255,255,0.6)',
                }}
              />
              <Button
                type="submit"
                height={{ base: "40px", md: "48px" }}
                fontSize={{ base: "14px", md: "16px" }}
                px={{ base: "16px", md: "24px" }}
                bg={colorMode === 'light' ? '#FFCC70' : '#B38537'}
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
                    ? "0 2px 0 0 black"
                    : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
                  bg: colorMode === 'light' ? '#FFD584' : '#C49245',
                }}
                _active={{
                  transform: 'translateY(4px)',
                  boxShadow: 'none',
                }}
                leftIcon={<RiMailSendLine />}
              >
                Notify Me
              </Button>
            </Flex>
          </form>
        </VStack>
        <Box
          position="absolute"
          bottom={{ base: "-30px", md: "-50px" }}
          right={{ base: "-30px", md: "-50px" }}
          width={{ base: "120px", md: "200px" }}
          height={{ base: "120px", md: "200px" }}
          borderRadius="full"
          bg={colorMode === 'light' 
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(255, 255, 255, 0.05)"
          }
          zIndex={0}
        />
      </Box>
    </Flex>
  );
};

export default ComingSoonComponent;