import React, { useState } from 'react';
import { Box, Text, Flex, VStack, Tooltip, Image, useColorMode } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const voteColors = {
  light: ["yellow.400", "red.300", "blue.300", "green.300"],
  dark: ["yellow.500", "red.400", "blue.400", "green.400"]
};

const transformImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://www.examtopics.com${url}`;
};

const VoteBar = ({ votes }) => {
  const { colorMode } = useColorMode();
  const totalVotes = votes.reduce((sum, vote) => sum + vote.count, 0);
  const colors = voteColors[colorMode];
  
  return (
    <Box 
      width="100%" 
      height="30px" 
      borderRadius="md" 
      overflow="hidden" 
      position="relative"
    >
      <Flex height="100%">
        {votes.map((vote, index) => {
          const percentage = (vote.count / totalVotes) * 100;
          const isSmall = percentage < 10;

          return (
            <Tooltip
              key={index}
              label={`${vote.answer}: ${percentage.toFixed(2)}%`}
              placement="top"
              hasArrow
              bg={colorMode === 'light' ? 'gray.700' : 'gray.200'}
              color={colorMode === 'light' ? 'white' : 'black'}
              isDisabled={!isSmall}
            >
              <Box
                backgroundColor={colors[index]}
                width={`${percentage}%`}
                height="100%"
                position="relative"
                minWidth="1px"
              >
                {!isSmall && (
                  <Text
                    position="absolute"
                    left={2}
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize="14px"
                    fontWeight="bold"
                    color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {vote.answer} {percentage.toFixed(2)}%
                  </Text>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Flex>
    </Box>
  );
};

const AnswerContent = ({ content, isAnswer }) => {
  const { colorMode } = useColorMode();
  
  const parsedContent = content.split(/<br>|<br\/>/).map((part, index) => {
    if (part.startsWith('<img')) {
      const srcMatch = part.match(/src="([^"]+)"/);
      if (srcMatch) {
        const src = transformImageUrl(srcMatch[1]);
        return <Image key={index} src={src} alt="Answer content" />;
      }
    }
    const textContent = part.replace(/<[^>]*>/g, '');
    if (index === 0 && isAnswer) {
      return (
        <Text 
          key={index} 
          fontSize="24px" 
          fontWeight="700" 
          color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
        >
          {textContent}
        </Text>
      );
    }
    return (
      <Text 
        key={index} 
        fontSize="16px" 
        color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
      >
        {textContent}
      </Text>
    );
  });

  return <>{parsedContent}</>;
};

const AnswerBox = ({ answer, answerDescription, votes }) => {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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
      position="relative"
      overflow="hidden"
      marginTop={4}
    >
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
        padding={6}
        onClick={toggleDropdown} 
        cursor="pointer"
      >
        <Text 
          fontSize="24px" 
          fontWeight="700" 
          color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
        >
          Answer
        </Text>
        {isOpen ? 
          <ChevronUpIcon 
            boxSize={6} 
            color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'} 
          /> : 
          <ChevronDownIcon 
            boxSize={6} 
            color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'} 
          />
        }
      </Flex>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <VStack spacing={4} align="stretch" paddingX={6} paddingBottom={6}>
              <AnswerContent content={answer} isAnswer={true} />
              {answerDescription && (
                <AnswerContent content={answerDescription} isAnswer={false} />
              )}
              <Text 
                fontSize="24px" 
                fontWeight="700" 
                color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
              >
                Votes:
              </Text>
              <VoteBar votes={votes} />
            </VStack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default AnswerBox;