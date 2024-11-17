// src/pages/PremiumPage.js

import React from 'react';
import { Box, Text, VStack, Button, Flex, useColorMode, Grid, Icon, Badge, HStack } from '@chakra-ui/react';
import { FaCog, FaCheck, FaTimes, FaDownload, FaComments, FaCrown, FaUserClock, FaArrowLeft } from 'react-icons/fa';
import { RiFlashlightFill, RiTimeLine, RiSecurePaymentLine } from 'react-icons/ri';
import { PiStarFill } from 'react-icons/pi';
import { BsRocketTakeoffFill } from "react-icons/bs";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const PremiumPage = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const premiumFeatures = [
    { 
      icon: FaDownload, 
      text: "Download unlimited exam questions in PDF format",
      description: "Export and study offline anytime, anywhere"
    },
    { 
      icon: FaCrown, 
      text: "Access ALL exams from ALL providers",
      description: "Complete coverage of certification materials"
    },
    { 
      icon: FaUserClock, 
      text: "Real-time updates with latest exam patterns",
      description: "Stay ahead with the newest question formats"
    },
    { 
      icon: FaComments, 
      text: "Engage in active exam discussions",
      description: "Learn from the community and share insights"
    },
    { 
      icon: FaCog, 
      text: "Create personalized practice exams",
      description: "Focus on your weak areas and improve faster"
    }
  ];

  const freeFeatures = [
    { 
      icon: FaDownload, 
      text: "Basic exam questions preview",
      description: "Limited selection of practice questions"
    },
    { 
      icon: FaCrown, 
      text: "Access to selected providers",
      description: "Basic certification materials"
    },
    { 
      icon: FaUserClock, 
      text: "Standard question bank access",
      description: "Core exam preparation content"
    },
    { 
      icon: FaComments, 
      text: "Read-only discussion access",
      description: "View community discussions"
    },
    { 
      icon: FaCog, 
      text: "Fixed format practice tests",
      description: "Standard practice options"
    }
  ];

  const benefits = [
    { icon: RiFlashlightFill, title: "Smart Practice", text: "LLM-powered question selection" },
    { icon: RiTimeLine, title: "Time Saver", text: "Structured learning path" },
    { icon: RiSecurePaymentLine, title: "Secure", text: "Protected payment & access" },
  ];

  const FeatureList = ({ features, isPremium }) => (
    <VStack spacing={4} align="stretch">
      {features.map((feature, index) => (
        <MotionFlex
          key={index}
          align="center"
          bg={colorMode === 'light' 
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.05)'
          }
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor={colorMode === 'light' 
            ? 'rgba(255,255,255,0.2)'
            : 'rgba(255,255,255,0.1)'
          }
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          cursor="default"
        >
          <Box
            p={2}
            borderRadius="full"
            bg={isPremium 
              ? (colorMode === 'light' ? '#ffaa40' : '#cc7718')
              : (colorMode === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)')
            }
            mr={4}
          >
            <Icon 
              as={feature.icon} 
              boxSize={6} 
              color={isPremium ? 'white' : (colorMode === 'light' ? 'white' : 'gray.400')}
            />
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text color="white" fontWeight="bold">{feature.text}</Text>
            <Text color="whiteAlpha.700" fontSize="sm">{feature.description}</Text>
          </VStack>
          <Icon 
            as={isPremium ? FaCheck : FaTimes} 
            color={isPremium ? '#4CAF50' : '#FF5252'} 
            boxSize={5} 
          />
        </MotionFlex>
      ))}
    </VStack>
  );

  return (
    <Box
      width="100%"
      minHeight="100vh"
      bg={colorMode === 'light' ? 'brand.background.light' : 'brand.background.dark'}
      position="relative"
      overflow="hidden"
    >
      {/* Back Button */}
      <Button
        position="fixed"
        top={4}
        left={4}
        onClick={handleBack}
        leftIcon={<FaArrowLeft />}
        bg="transparent"
        color={colorMode === 'light' ? 'black' : 'white'}
        _hover={{
          bg: colorMode === 'light' ? 'whiteAlpha.200' : 'blackAlpha.200',
        }}
        boxShadow="lg"
        zIndex={2}
      >
        Back
      </Button>

      {/* Background Decorations */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        width="40%"
        height="40%"
        borderRadius="full"
        bg={colorMode === 'light' ? 'rgba(255,170,64,0.1)' : 'rgba(204,119,24,0.1)'}
        filter="blur(60px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        width="40%"
        height="40%"
        borderRadius="full"
        bg={colorMode === 'light' ? 'rgba(156,64,255,0.1)' : 'rgba(119,24,204,0.1)'}
        filter="blur(60px)"
        zIndex={0}
      />

      <Flex
        width="100%"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        p={{ base: 4, md: 8 }}
        position="relative"
        zIndex={1}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          width="100%"
          maxW="1200px"
        >
          <VStack spacing={12} align="stretch">
            {/* Header Section */}
            <VStack spacing={6} textAlign="center">
              <Badge
                colorScheme="purple"
                px={3}
                py={1}
                borderRadius="full"
                textTransform="none"
                fontSize="md"
              >
                🚀 Limited Time Offer
              </Badge>
              <Text
                fontSize={{ base: "40px", md: "56px" }}
                fontWeight="800"
                bgGradient={colorMode === 'light'
                  ? "linear(to-r, #ffaa40, #9c40ff)"
                  : "linear(to-r, #cc7718, #7718cc)"
                }
                bgClip="text"
                fontFamily="heading"
                lineHeight="1.2"
              >
                Accelerate Your <br/>
                Certification Journey
              </Text>
              <Text
                fontSize={{ base: "18px", md: "24px" }}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                maxW="800px"
                mx="auto"
              >
                Get premium access at just <Text as="span" fontWeight="bold" color={colorMode === 'light' ? 'purple.500' : 'purple.300'}>$15/month</Text> - while others charge $60+ for limited content
              </Text>

              {/* Benefits Section */}
              <Grid 
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={6}
                width="100%"
                mt={8}
              >
                {benefits.map((benefit, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    p={6}
                    borderRadius="xl"
                    bg={colorMode === 'light' ? 'white' : 'gray.800'}
                    boxShadow="xl"
                    textAlign="center"
                  >
                    <Icon 
                      as={benefit.icon} 
                      boxSize={8} 
                      mb={4}
                      color={colorMode === 'light' ? 'purple.500' : 'purple.300'}
                    />
                    <Text fontWeight="bold" mb={2}>{benefit.title}</Text>
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                      {benefit.text}
                    </Text>
                  </MotionBox>
                ))}
              </Grid>
            </VStack>

            {/* Plans Comparison */}
            <Grid
              templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
              gap={8}
              width="100%"
            >
              {/* Free Plan */}
              <Box
                bgGradient={colorMode === 'light'
                  ? "linear(to-br, #4158D0, #C850C0)"
                  : "linear(to-br, #2A3B97, #8C2F89)"
                }
                borderRadius="2xl"
                p={8}
                position="relative"
                border="1px solid"
                borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
                boxShadow={colorMode === 'light'
                  ? "0 8px 0 0 black"
                  : "0 8px 0 0 rgba(255, 255, 255, 0.2)"
                }
              >
                <VStack spacing={6} align="stretch">
                  <HStack>
                    <Icon as={PiStarFill} color="white" boxSize={6} />
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="white"
                    >
                      Free Access
                    </Text>
                  </HStack>
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color="white"
                  >
                    $0
                    <Text as="span" fontSize="xl" fontWeight="normal" ml={2}>/month</Text>
                  </Text>
                  <FeatureList features={freeFeatures} isPremium={false} />
                </VStack>
              </Box>

              {/* Premium Plan */}
              <Box
                bgGradient={colorMode === 'light'
                  ? "linear(to-r, #ffaa40, #9c40ff)"
                  : "linear(to-r, #cc7718, #7718cc)"
                }
                borderRadius="2xl"
                p={8}
                position="relative"
                border="1px solid"
                borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
                boxShadow={colorMode === 'light'
                  ? "0 8px 0 0 black"
                  : "0 8px 0 0 rgba(255, 255, 255, 0.2)"
                }
              >
                <VStack spacing={6} align="stretch">
                  <HStack>
                    <Icon as={BsRocketTakeoffFill} color="white" boxSize={6} />
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="white"
                    >
                      Premium Access
                    </Text>
                  </HStack>
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color="white"
                  >
                    $15
                    <Text as="span" fontSize="xl" fontWeight="normal" ml={2}>/month</Text>
                  </Text>
                  <FeatureList features={premiumFeatures} isPremium={true} />
                  <Button
                    height="60px"
                    fontSize="xl"
                    bg={colorMode === 'light' ? 'white' : 'rgba(255,255,255,0.1)'}
                    color={colorMode === 'light' ? 'black' : 'white'}
                    _hover={{
                      transform: 'translateY(2px)',
                      bg: colorMode === 'light' 
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.15)',
                      boxShadow: colorMode === 'light'
                        ? '0 2px 0 0 black'
                        : '0 2px 0 0 rgba(255, 255, 255, 0.2)',
                    }}
                    leftIcon={<BsRocketTakeoffFill />}
                  >
                    Upgrade to Premium
                  </Button>
                  <Text
                    fontSize="sm"
                    color="whiteAlpha.900"
                    textAlign="center"
                  >
                    30-day money-back guarantee
                  </Text>
                </VStack>
              </Box>
            </Grid>

            <Text
              textAlign="center"
              fontSize="sm"
              color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
              maxW="600px"
              mx="auto"
            >
              * Premium subscription helps us maintain 24/7 service, provide regular updates, 
              and ensure you always have access to the latest exam content
            </Text>
          </VStack>
        </MotionBox>
      </Flex>
    </Box>
  );
};

export default PremiumPage;