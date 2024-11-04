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
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';

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

const CustomButton = ({ children, onClick, isPrimary = false }) => {
  const { colorMode } = useColorMode();
  const buttonHeight = useBreakpointValue({ base: "40px", md: "48px" });
  const fontSize = useBreakpointValue({ base: "14px", md: "16px" });
  const padding = useBreakpointValue({ 
    base: "0 16px",
    md: "0 32px"
  });
  const buttonWidth = useBreakpointValue({ 
    base: "100%",
    md: "auto"
  });

  return (
    <Button
      onClick={onClick}
      height={buttonHeight}
      fontSize={fontSize}
      px={padding}
      minW={useBreakpointValue({ 
        base: "auto",
        md: isPrimary ? "120px" : "120px"
      })}
      width={buttonWidth}
      bg={isPrimary 
        ? (colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark")
        : (colorMode === 'light' ? "brand.background.light" : "brand.surface.dark")
      }
      color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
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
    >
      {children}
    </Button>
  );
};

const CustomConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  const { colorMode } = useColorMode();
  const modalPadding = useBreakpointValue({ base: 4, md: 6 });
  const headerFontSize = useBreakpointValue({ base: "20px", md: "24px" });
  const bodyFontSize = useBreakpointValue({ base: "16px", md: "18px" });
  const contentMaxWidth = useBreakpointValue({ base: "90%", md: "md" });
  const buttonStackDirection = useBreakpointValue({ base: "column", md: "row" });
  const buttonSpacing = useBreakpointValue({ base: 2, md: 4 });

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
          Confirm Submission
        </ModalHeader>
        <ModalBody>
          <Text 
            fontFamily="body"
            fontSize={bodyFontSize}
            color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
          >
            {message}
          </Text>
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
            <CustomButton onClick={onConfirm} isPrimary>
              Submit
            </CustomButton>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomConfirmationDialog;