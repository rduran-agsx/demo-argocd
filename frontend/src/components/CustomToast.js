import React from 'react';
import { Box, Text, Flex, useColorMode } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const CustomToast = ({ 
  title, 
  description, 
  status = 'success', 
  onClose,
  id 
}) => {
  const { colorMode } = useColorMode();

  const getStatusStyles = () => {
    const styles = {
      success: {
        light: {
          bg: 'linear-gradient(to right, #4CAF50, #8BC34A)',
          iconColor: 'white',
          textColor: 'black'
        },
        dark: {
          bg: 'linear-gradient(to right, #2E673F, #4A6F2E)',
          iconColor: 'white',
          textColor: 'white'
        }
      },
      error: {
        light: {
          bg: 'linear-gradient(to right, #FF5252, #FF8A80)',
          iconColor: 'white',
          textColor: 'black'
        },
        dark: {
          bg: 'linear-gradient(to right, #992F2F, #994D4D)',
          iconColor: 'white',
          textColor: 'white'
        }
      },
      warning: {
        light: {
          bg: 'linear-gradient(to right, #FFD54F, #FFF176)',
          iconColor: 'black',
          textColor: 'black'
        },
        dark: {
          bg: 'linear-gradient(to right, #997F30, #998E47)',
          iconColor: 'white',
          textColor: 'white'
        }
      }
    };

    const currentMode = colorMode === 'light' ? 'light' : 'dark';
    const statusStyle = styles[status] || styles.success;

    return {
      bg: statusStyle[currentMode].bg,
      icon: status === 'error' ? FaExclamationTriangle : FaCheck,
      iconColor: statusStyle[currentMode].iconColor,
      textColor: statusStyle[currentMode].textColor
    };
  };

  const { bg, icon: Icon, iconColor, textColor } = getStatusStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        style={{ width: '100%', position: 'relative' }}
      >
        <Box
          width="100%"
          bgGradient={bg}
          borderRadius="12px"
          border="1px solid"
          borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
          boxShadow={colorMode === 'light'
            ? "0 4px 0 0 black"
            : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
          }
          padding={4}
          position="relative"
        >
          <Flex alignItems="center">
            <Box
              borderRadius="full"
              bg={colorMode === 'light' 
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.1)"
              }
              p={2}
              mr={3}
            >
              <Icon size={24} color={iconColor} />
            </Box>
            <Box flex="1">
              <Text
                fontSize="16px"
                fontWeight="700"
                color={textColor}
                mb={description ? 1 : 0}
              >
                {title}
              </Text>
              {description && (
                <Text 
                  fontSize="14px" 
                  color={textColor}
                  opacity={0.8}
                >
                  {description}
                </Text>
              )}
            </Box>
            <Box
              as="button"
              onClick={() => onClose(id)}
              color={textColor}
              p={2}
              borderRadius="md"
              _hover={{ bg: 'transparent' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaTimes size={16} />
            </Box>
          </Flex>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export const createCustomToast = (toast) => {
  return ({
    title,
    description,
    status = 'success',
    duration = 5000,
    isClosable = true,
  }) => {
    toast({
      position: 'bottom-right',
      render: ({ onClose, id }) => (
        <CustomToast
          title={title}
          description={description}
          status={status}
          onClose={onClose}
          id={id}
        />
      ),
      duration,
      isClosable,
    });
  };
};

export default CustomToast;