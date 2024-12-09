import React from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Flex, 
  Text,
  Icon,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { PiArrowLeftBold, PiArrowRightBold } from "react-icons/pi";

const TabButton = React.memo(({ children, isSelected, onClick, ...props }) => {
  const { colorMode } = useColorMode();
  const [isTruncated, setIsTruncated] = React.useState(false);
  const textRef = React.useRef(null);

  React.useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    
    return () => window.removeEventListener('resize', checkTruncation);
  }, [children]);

  const buttonContent = (
    <Button
      variant="referral"
      backgroundColor={isSelected 
        ? colorMode === 'light' ? 'brand.primary.light' : 'brand.primary.dark'
        : colorMode === 'light' ? 'brand.surface.light' : 'brand.surface.dark'
      }
      color={isSelected 
        ? colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'
        : colorMode === 'light' ? 'gray.600' : 'gray.400'
      }
      _hover={{
        backgroundColor: isSelected
          ? colorMode === 'light' ? 'brand.primary.dark' : 'brand.primary.light'
          : colorMode === 'light' ? 'brand.secondary.light' : 'brand.secondary.dark'
      }}
      border="1px solid"
      borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
      height="48px"
      px={4}
      minW={0}
      flex={1}
      transition="all 0.2s"
      onClick={onClick}
      {...props}
    >
      <Text ref={textRef} isTruncated maxW="100%">
        {children}
      </Text>
    </Button>
  );

  if (!isTruncated) {
    return buttonContent;
  }

  return (
    <Tooltip 
      label={children}
      hasArrow
      bg={colorMode === 'light' ? 'gray.700' : 'gray.200'}
      color={colorMode === 'light' ? 'white' : 'black'}
    >
      {buttonContent}
    </Tooltip>
  );
});

const NavIconBox = ({ icon: Icon, onClick, isDisabled }) => {
  const { colorMode } = useColorMode();
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const size = '40px';
  const iconScale = 0.5;
  const iconSize = `${parseInt(size) * iconScale}px`;
  const borderThickness = '0.5px';

  const handleMouseDown = () => {
    if (!isDisabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (!isDisabled) {
      setIsPressed(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  return (
    <Box
      position="relative"
      width={size}
      height={size}
      onClick={isDisabled ? undefined : onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      cursor={isDisabled ? "not-allowed" : "pointer"}
      transition="all 0.1s ease"
      transform={isPressed && !isDisabled ? 'scale(0.95)' : 'scale(1)'}
      userSelect="none"
      opacity={isDisabled ? 0.5 : 1}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        borderRadius="50%"
        border={borderThickness + " solid"}
        borderColor={colorMode === 'light' ? 'brand.border.light' : 'brand.border.dark'}
        backgroundColor="transparent"
      />
      <Flex
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        <Icon 
          size={iconSize} 
          color={isHovered && !isDisabled 
            ? colorMode === 'light' ? 'brand.primary.light' : 'brand.primary.dark'
            : colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'
          } 
          transition="color 0.2s ease"
        />
      </Flex>
    </Box>
  );
};

const TabList = ({ 
  tabs, 
  onTabChange, 
  currentQuestionIndex, 
  totalQuestions, 
  onNavigateLeft, 
  onNavigateRight,
  isNavigationDisabled,
  currentTab 
}) => {
  const { colorMode } = useColorMode();
  const containerRef = React.useRef(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [lastKnownTotal, setLastKnownTotal] = React.useState(totalQuestions);
  const [transitionState, setTransitionState] = React.useState({
    previousTotal: totalQuestions,
    lastPosition: currentQuestionIndex,
    hasNavigated: false
  });

  React.useEffect(() => {
    if (lastKnownTotal === 2 && totalQuestions === 1) {
      setTransitionState({
        previousTotal: 2,
        lastPosition: currentQuestionIndex,
        hasNavigated: false
      });
    }
    setLastKnownTotal(totalQuestions);
  }, [totalQuestions, currentQuestionIndex, lastKnownTotal]);

  const handleTabChange = (selectedTab) => {
    if (selectedTab !== currentTab) {
      onTabChange(selectedTab);
      setIsTransitioning(false);
      setTransitionState({
        previousTotal: totalQuestions,
        lastPosition: currentQuestionIndex,
        hasNavigated: false
      });
    }
  };

  const handleNavigateLeft = () => {
    if (!isNavigationDisabled && !isTransitioning) {
      if (totalQuestions === 1) {
        onNavigateLeft(currentTab);
        setTransitionState(prev => ({ ...prev, hasNavigated: true })); // Set flag after navigation
      } else if (totalQuestions === 2 && currentQuestionIndex === 1) {
        onNavigateLeft(currentTab);
      } else if (totalQuestions > 2 && currentQuestionIndex > 0) {
        onNavigateLeft(currentTab);
      }
    }
  };
  
  const handleNavigateRight = () => {
    if (!isNavigationDisabled && !isTransitioning) {
      if (totalQuestions === 1) {
        onNavigateRight(currentTab);
        setTransitionState(prev => ({ ...prev, hasNavigated: true })); // Set flag after navigation
      } else if (totalQuestions === 2 && currentQuestionIndex === 0) {
        onNavigateRight(currentTab);
      } else if (totalQuestions > 2 && currentQuestionIndex < totalQuestions - 1) {
        onNavigateRight(currentTab);
      }
    }
  };

  const shouldDisableLeftNavigation = () => {
    if (isNavigationDisabled) return true;
    if (totalQuestions === 0) return true;
  
    if (totalQuestions === 1) {
      return transitionState.hasNavigated; // Disable after first navigation
    }
  
    if (totalQuestions === 2) {
      return currentQuestionIndex === 0;
    }
    return currentQuestionIndex === 0;
  };
  
  const shouldDisableRightNavigation = () => {
    if (isNavigationDisabled) return true;
    if (totalQuestions === 0) return true;
  
    if (totalQuestions === 1) {
      return transitionState.hasNavigated; // Disable after first navigation
    }
  
    if (totalQuestions === 2) {
      return currentQuestionIndex === 1;
    }
    return currentQuestionIndex === totalQuestions - 1;
  };

  React.useEffect(() => {
    setIsTransitioning(false);
    setTransitionState({
      previousTotal: totalQuestions,
      lastPosition: currentQuestionIndex,
      hasNavigated: false
    });
  }, [currentTab, totalQuestions, currentQuestionIndex]);

  return (
    <Box 
      backgroundColor={colorMode === 'light' ? 'brand.background.light' : 'brand.background.dark'}
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      width="100%" 
      marginBottom={4}
    >
      <Box display={{ base: "none", md: "block" }} width="100%" ref={containerRef}>
        <ButtonGroup 
          isAttached={true} 
          variant="referral" 
          width="100%" 
          marginBottom={4}
          spacing={0}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              isSelected={currentTab === tab}
              onClick={() => handleTabChange(tab)}
              data-testid={`tab-${tab}`}
            >
              {tab}
            </TabButton>
          ))}
        </ButtonGroup>
      </Box>

      <Flex 
        width="100%" 
        justifyContent="space-between" 
        alignItems="center" 
        paddingTop={4}
        paddingBottom={4}
      >
        <NavIconBox 
          icon={PiArrowLeftBold} 
          onClick={handleNavigateLeft}
          isDisabled={shouldDisableLeftNavigation()}
          data-testid="navigate-left"
        />
        <Text 
          fontSize="lg" 
          color={colorMode === 'light' ? 'brand.text.light' : 'brand.text.dark'}
          data-testid="question-counter"
        >
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Text>
        <NavIconBox 
          icon={PiArrowRightBold} 
          onClick={handleNavigateRight}
          isDisabled={shouldDisableRightNavigation()}
          data-testid="navigate-right"
        />
      </Flex>
    </Box>
  );
};

export default TabList;