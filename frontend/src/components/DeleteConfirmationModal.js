import React from 'react';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  Flex,
  VStack,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaTimes, FaTrash } from 'react-icons/fa';

const CloseButton = ({ onClick, colorMode }) => {
  const buttonSize = useBreakpointValue({ base: "20px", md: "24px" });
  const iconSize = useBreakpointValue({ base: "14px", md: "16px" });

  return (
    <Box
      as="button"
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w={buttonSize}
      h={buttonSize}
      bg="transparent"
      _focus={{ boxShadow: "none" }}
      color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
      borderRadius="50%"
      _hover={{ bg: 'transparent' }}
    >
      <FaTimes size={iconSize} />
    </Box>
  );
};

const CustomButton = ({ children, onClick, isDanger = false, ...props }) => {
  const { colorMode } = useColorMode();
  const buttonHeight = useBreakpointValue({ base: "40px", md: "48px" });
  const fontSize = useBreakpointValue({ base: "14px", md: "16px" });
  const padding = useBreakpointValue({ 
    base: "0 16px",
    md: isDanger ? "0 40px" : "0 32px"
  });
  const buttonWidth = useBreakpointValue({ 
    base: "100%",
    md: "auto"
  });

  const dangerColors = {
    light: {
      bg: "#FF3333",
      hoverBg: "#FF0000",
      text: "white",
    },
    dark: {
      bg: "#CC0000",
      hoverBg: "#990000",
      text: "white",
    },
  };

  return (
    <Button
      onClick={onClick}
      height={buttonHeight}
      fontSize={fontSize}
      px={padding}
      minW={useBreakpointValue({ 
        base: "auto", 
        md: isDanger ? "200px" : "120px"
      })}
      width={buttonWidth}
      bg={isDanger 
        ? dangerColors[colorMode].bg
        : (colorMode === 'light' ? "brand.background.light" : "brand.surface.dark")
      }
      color={isDanger
        ? dangerColors[colorMode].text
        : (colorMode === 'light' ? "brand.text.light" : "brand.text.dark")
      }
      borderRadius="full"
      border="1px solid"
      borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
      fontWeight={700}
      textTransform="uppercase"
      transition="0.3s"
      boxShadow={colorMode === 'light'
        ? "0 4px 0 0 black"
        : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
      }
      _hover={{
        bg: isDanger
          ? dangerColors[colorMode].hoverBg
          : (colorMode === 'light' ? "brand.surface.light" : "brand.background.dark"),
        transform: 'translateY(2px)',
        boxShadow: colorMode === 'light'
          ? "0 2px 0 0 black"
          : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
      }}
      _active={{
        transform: 'translateY(4px)',
        boxShadow: 'none',
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="2"
      {...props}
    >
      {children}
    </Button>
  );
};

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion",
  message,
  itemCount,
  deleteType
}) => {
  const { colorMode } = useColorMode();
  const modalPadding = useBreakpointValue({ base: 4, md: 6 });
  const headerFontSize = useBreakpointValue({ base: "20px", md: "24px" });
  const bodyFontSize = useBreakpointValue({ base: "16px", md: "18px" });
  const contentMaxWidth = useBreakpointValue({ base: "90%", md: "md" });
  const buttonStackDirection = useBreakpointValue({ base: "column", md: "row" });
  const buttonSpacing = useBreakpointValue({ base: 2, md: 4 });
  const iconSize = useBreakpointValue({ base: 14, md: 16 });
  const secondaryFontSize = useBreakpointValue({ base: "14px", md: "16px" });

  const getDescription = () => {
    if (deleteType === "all") {
      return "This will permanently delete all your exam progress. This action cannot be undone.";
    }
    return `This will permanently delete ${itemCount} ${itemCount === 1 ? 'exam' : 'exams'} and their progress. This action cannot be undone.`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="20px"
        border="1px solid"
        borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
        boxShadow={colorMode === 'light'
          ? "0 8px 0 0 black"
          : "0 8px 0 0 rgba(255, 255, 255, 0.2)"
        }
        bg={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
        p={modalPadding}
        mx={4}
        maxW={contentMaxWidth}
      >
        <Flex justifyContent="flex-end">
          <CloseButton onClick={onClose} colorMode={colorMode} />
        </Flex>
        <ModalHeader
          fontFamily="heading"
          fontWeight="bold"
          fontSize={headerFontSize}
          pb={4}
          color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
        >
          {title}
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text 
              fontFamily="body"
              fontSize={bodyFontSize}
              color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
            >
              {getDescription()}
            </Text>
            {message && (
              <Text 
                fontFamily="body"
                fontSize={secondaryFontSize}
                color={colorMode === 'light' ? "gray.600" : "gray.400"}
              >
                {message}
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Flex 
            justifyContent="flex-end" 
            width="100%" 
            gap={buttonSpacing}
            flexDirection={buttonStackDirection}
          >
            <CustomButton onClick={onClose}>
              Cancel
            </CustomButton>
            <CustomButton 
              onClick={onConfirm} 
              isDanger
              leftIcon={<FaTrash size={iconSize} />}
            >
              Delete {deleteType === "all" ? "All" : "Selected"}
            </CustomButton>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;