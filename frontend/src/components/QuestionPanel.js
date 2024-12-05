import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  Text,
  useColorMode,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";
import SearchBar from "./SearchBar";
import TabList from "./TabList";
import QuestionBox from "./QuestionBox";
import OptionsBox from "./OptionsBox";
import AnswerBox from "./AnswerBox";
import TopicBox from "./TopicBox";
import TopicSelector from "./TopicSelector";
import DownloadBox from "./DownloadBox";

const QuestionPanel = ({
  width = "100%",
  onSearch,
  onShuffle,
  onReset,
  onSubmit,
  tabs,
  onTabChange,
  questionNumber,
  totalQuestions,
  questionData,
  examData, // Add this prop
  isStarFilled,
  toggleStar,
  onNavigateLeft,
  onNavigateRight,
  currentTopic,
  currentQuestion,
  onQuestionSelect,
  favoriteQuestions,
  onOptionSelect,
  selectedOptions,
  userAnswers,
  incorrectQuestions,
  availableTopics,
  onTopicChange,
}) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentTab, setCurrentTab] = useState("ALL QUESTIONS");
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [tabIndices, setTabIndices] = useState({
    "ALL QUESTIONS": { index: questionNumber - 1, lastQuestion: `T${currentTopic} Q${questionNumber}` },
    FAVORITES: { index: 0, lastQuestion: null },
    ANSWERED: { index: 0, lastQuestion: null },
    UNANSWERED: { index: 0, lastQuestion: null },
    INCORRECT: { index: 0, lastQuestion: null }
  });
  const [removingQuestion, setRemovingQuestion] = useState(null);
  const [isNavigationDisabled, setIsNavigationDisabled] = useState(false);
  const [displayedQuestionInfo, setDisplayedQuestionInfo] = useState({
    current: questionNumber,
    total: totalQuestions,
  });
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [navigationLock, setNavigationLock] = useState(false);

  const getRequiredSelections = useCallback((answer) => {
    if (!answer) return 1;
  
    // If answer is a string like "AB", it means we need 2 selections
    if (typeof answer === "string") {
      return answer.length;
    }
  
    // If answer is an array, return its length 
    if (Array.isArray(answer)) {
      return answer.length;
    }
  
    return 1;
  }, []);

  const isQuestionFullyAnswered = useCallback((questionId) => {
    // Split the questionId to get topic and question number
    const [topicPart, questionPart] = questionId.split(" ");
    const topicNum = parseInt(topicPart.slice(1));
    const questionNum = parseInt(questionPart.slice(1)) - 1;
    
    // Get the actual question data from examData
    const question = examData?.topics[topicNum]?.[questionNum];
    
    if (!question || !question.answer) return false;
    
    // Get required selections for this specific question
    const requiredSelections = getRequiredSelections(question.answer);
    
    // Check if user has made all required selections
    const userHasAnswered = userAnswers[questionId] && 
                           Array.isArray(userAnswers[questionId]) && 
                           userAnswers[questionId].length === requiredSelections;
                           
    return userHasAnswered;
  }, [examData, userAnswers, getRequiredSelections]);

  const handleNavigate = useCallback((direction) => {
    if (navigationLock) return;
  
    setNavigationLock(true);
    const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
  
    const navigateInList = (list, currentId) => {
      const currentIndex = list.indexOf(currentId);
      const nextIndex = currentIndex + direction;
      
      if (nextIndex >= 0 && nextIndex < list.length) {
        return list[nextIndex];
      }
      return null;
    };
  
    let nextQuestion = null;
  
    switch (currentTab) {
      case "ALL QUESTIONS": {
        const nextNum = questionNumber + direction;
        if (nextNum >= 1 && nextNum <= totalQuestions) {
          nextQuestion = `T${currentTopic} Q${nextNum}`;
        }
        break;
      }
  
      case "FAVORITES": {
        const currentIndex = favoriteQuestions.findIndex(
          item => `T${item.topic_number} Q${item.question_index + 1}` === currentQuestionId
        );
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < favoriteQuestions.length) {
          const next = favoriteQuestions[nextIndex];
          nextQuestion = `T${next.topic_number} Q${next.question_index + 1}`;
        }
        break;
      }
  
      case "ANSWERED": {
        const currentIndex = answeredQuestions.indexOf(currentQuestionId);
        const nextIndex = (currentIndex !== -1 ? currentIndex : 0) + direction;
        if (nextIndex >= 0 && nextIndex < answeredQuestions.length) {
          nextQuestion = answeredQuestions[nextIndex];
        }
        break;
      }
  
      case "UNANSWERED": {
        nextQuestion = navigateInList(unansweredQuestions, currentQuestionId);
        break;
      }
  
      case "INCORRECT": {
        const currentIndex = incorrectQuestions.indexOf(currentQuestionId);
        const nextIndex = 
          (currentIndex !== -1 ? currentIndex : tabIndices["INCORRECT"].index) + 
          direction;
  
        if (nextIndex >= 0 && nextIndex < incorrectQuestions.length) {
          nextQuestion = incorrectQuestions[nextIndex];
          setTabIndices((prev) => ({
            ...prev,
            INCORRECT: { index: nextIndex, lastQuestion: nextQuestion }
          }));
        }
        break;
      }
  
      default: {
        break;
      }
    }
  
    if (nextQuestion) {
      // Update the lastQuestion for the current tab
      setTabIndices((prev) => ({
        ...prev,
        [currentTab]: {
          index: parseInt(nextQuestion.split(" Q")[1]) - 1,
          lastQuestion: nextQuestion
        }
      }));
      onQuestionSelect(nextQuestion);
    }
  
    setTimeout(() => setNavigationLock(false), 100);
  }, [
    currentTab,
    currentTopic, 
    questionNumber,
    totalQuestions,
    favoriteQuestions,
    answeredQuestions,
    unansweredQuestions,
    incorrectQuestions,
    navigationLock,
    onQuestionSelect,
    tabIndices
  ]);

  const handleTabChange = useCallback((tab) => {
    if (navigationLock) return;
  
    setNavigationLock(true);
    setIsTabChanging(true);
    setCurrentTab(tab);
  
    const lastQuestion = tabIndices[tab].lastQuestion;
  
    const executeTabChange = () => {
      switch (tab) {
        case "ALL QUESTIONS": {
          const questionToSelect = lastQuestion || `T${currentTopic} Q${tabIndices[tab].index + 1}`;
          onQuestionSelect(questionToSelect);
          break;
        }
  
        case "FAVORITES": {
          if (lastQuestion && favoriteQuestions.some(fq => 
            `T${fq.topic_number} Q${fq.question_index + 1}` === lastQuestion)) {
            onQuestionSelect(lastQuestion);
          } else if (favoriteQuestions.length > 0) {
            const firstFavorite = favoriteQuestions[0];
            const questionId = `T${firstFavorite.topic_number} Q${firstFavorite.question_index + 1}`;
            onQuestionSelect(questionId);
          }
          break;
        }
  
        case "ANSWERED": {
          if (lastQuestion && answeredQuestions.includes(lastQuestion)) {
            onQuestionSelect(lastQuestion);
          } else if (answeredQuestions.length > 0) {
            onQuestionSelect(answeredQuestions[0]);
          }
          break;
        }
  
        case "UNANSWERED": {
          if (lastQuestion && unansweredQuestions.includes(lastQuestion)) {
            onQuestionSelect(lastQuestion);
          } else if (unansweredQuestions.length > 0) {
            onQuestionSelect(unansweredQuestions[0]);
          }
          break;
        }
  
        case "INCORRECT": {
          if (lastQuestion && incorrectQuestions.includes(lastQuestion)) {
            onQuestionSelect(lastQuestion);
          } else if (incorrectQuestions.length > 0) {
            onQuestionSelect(incorrectQuestions[tabIndices["INCORRECT"].index]);
          }
          break;
        }
  
        default: {
          break;
        }
      }
  
      requestAnimationFrame(() => {
        setNavigationLock(false);
        setIsTabChanging(false);
      });
    };
  
    requestAnimationFrame(executeTabChange);
  }, [
    favoriteQuestions, 
    answeredQuestions, 
    unansweredQuestions, 
    incorrectQuestions,
    onQuestionSelect, 
    navigationLock, 
    currentTopic, 
    tabIndices
  ]);

  const handleQuestionSelect = useCallback(
    (selectedQuestion) => {
      if (navigationLock || isNavigationDisabled) {
        return;
      }
  
      setNavigationLock(true);
  
      const [, questionPart] = selectedQuestion.split(" ");
      const questionIndex = parseInt(questionPart.slice(1)) - 1;
  
      if (currentTab === "ALL QUESTIONS") {
        setTabIndices((prev) => ({
          ...prev,
          "ALL QUESTIONS": {
            index: questionIndex,
            lastQuestion: selectedQuestion
          },
        }));
      } else {
        const currentArray = (() => {
          switch (currentTab) {
            case "FAVORITES":
              return favoriteQuestions;
            case "ANSWERED":
              return answeredQuestions;
            case "UNANSWERED":
              return unansweredQuestions;
            case "INCORRECT":
              return incorrectQuestions;
            default:
              return null;
          }
        })();
  
        if (currentArray) {
          let arrayIndex;
          
          if (currentTab === "FAVORITES") {
            arrayIndex = currentArray.findIndex(
              item => `T${item.topic_number} Q${item.question_index + 1}` === selectedQuestion
            );
          } else {
            arrayIndex = currentArray.indexOf(selectedQuestion);
          }
  
          if (arrayIndex !== -1) {
            setTabIndices((prev) => ({
              ...prev,
              [currentTab]: {
                index: arrayIndex,
                lastQuestion: selectedQuestion
              },
            }));
          }
        }
      }
  
      onQuestionSelect(selectedQuestion);
      setTimeout(() => setNavigationLock(false), 100);
    },
    [
      currentTab,
      navigationLock,
      isNavigationDisabled,
      favoriteQuestions,
      answeredQuestions,
      unansweredQuestions,
      incorrectQuestions,
      onQuestionSelect,
    ]
  );

  useEffect(() => {
    if (!examData || !userAnswers) return;
  
    // Generate array of all question IDs for current topic
    const allQuestions = Array.from({ length: totalQuestions }, (_, i) => 
      `T${currentTopic} Q${i + 1}`
    );
  
    // Sort questions into answered and unanswered arrays based on required selections
    const answered = [];
    const unanswered = [];
  
    allQuestions.forEach(questionId => {
      const [topicPart, questionPart] = questionId.split(" ");
      const topicNum = parseInt(topicPart.slice(1));
      const questionNum = parseInt(questionPart.slice(1)) - 1;
      
      const question = examData.topics[topicNum]?.[questionNum];
      if (!question) return;
  
      const required = getRequiredSelections(question.answer);
      const userAnswer = userAnswers[questionId];
      
      // Changed this condition to better detect unanswered questions
      if (!userAnswer || userAnswer.length < required) {
        unanswered.push(questionId);
      } else {
        answered.push(questionId);
      }
    });
  
    setAnsweredQuestions(answered);
    setUnansweredQuestions(unanswered);
  }, [currentTopic, totalQuestions, userAnswers, examData, getRequiredSelections]);

  useEffect(() => {
    if (navigationLock || isNavigationDisabled) return;
  
    const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
    const requiredSelections = getRequiredSelections(questionData.answer);
    const hasUserAnswers =
      userAnswers[currentQuestionId] &&
      userAnswers[currentQuestionId].length === requiredSelections;
  
    setAnsweredQuestions((prev) => {
      if (hasUserAnswers && !prev.includes(currentQuestionId)) {
        return [...prev, currentQuestionId];
      } else if (!hasUserAnswers && prev.includes(currentQuestionId)) {
        return prev.filter((q) => q !== currentQuestionId);
      }
      return prev;
    });
  }, [
    currentTopic,
    questionNumber,
    questionData,
    userAnswers,
    getRequiredSelections,
    navigationLock,
    isNavigationDisabled
  ]);

  useEffect(() => {
    return () => {
      setNavigationLock(false);
      setIsNavigationDisabled(false);
      setRemovingQuestion(null);
      setPendingUpdate(null);
    };
  }, []);

  useEffect(() => {
    if (pendingUpdate || navigationLock || isTabChanging) return;
  
    const getCurrentIndex = (array, identifier) => {
      if (currentTab === "FAVORITES") {
        return array.findIndex(
          (item) =>
            `T${item.topic_number} Q${item.question_index + 1}` === identifier
        );
      }
      return array.indexOf(identifier);
    };
  
    const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
    const newQuestionInfo = (() => {
      switch (currentTab) {
        case "FAVORITES": {
          const total = favoriteQuestions.length;
          return {
            current: total > 0 ? Math.min(
              (getCurrentIndex(favoriteQuestions, currentQuestionId) + 1) || 1,
              total
            ) : 0,
            total: total
          };
        }
        case "ANSWERED": {
          const total = answeredQuestions.length;
          const index = getCurrentIndex(answeredQuestions, currentQuestionId);
          return {
            current: total > 0 ? (index !== -1 ? index + 1 : 1) : 0,
            total: total
          };
        }
        case "UNANSWERED": {
          const total = unansweredQuestions.length;
          return {
            current: total > 0 ? Math.min(
              (getCurrentIndex(unansweredQuestions, currentQuestionId) + 1) || 1,
              total
            ) : 0,
            total: total
          };
        }
        case "INCORRECT": {
          const total = incorrectQuestions.length;
          return {
            current: total > 0 ? Math.min(
              (getCurrentIndex(incorrectQuestions, currentQuestionId) + 1) || 1,
              total
            ) : 0,
            total: total
          };
        }
        default:
          return {
            current: questionNumber,
            total: totalQuestions,
          };
      }
    })();
  
    setDisplayedQuestionInfo(newQuestionInfo);
  }, [
    questionNumber,
    totalQuestions,
    currentTab,
    favoriteQuestions,
    answeredQuestions,
    unansweredQuestions,
    incorrectQuestions,
    currentTopic,
    pendingUpdate,
    navigationLock,
    isTabChanging
  ]);

  const renderQuestions = () => {
    if (isTabChanging) {
      return null; // Skip rendering during tab changes
    }
  
    return (
      <Box paddingBottom={{ base: "25px", md: 0 }}>
        {currentTab === "ANSWERED" && answeredQuestions.length === 0 ? (
          <Text
            color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
          >
            There are no answered questions yet.
          </Text>
        ) : currentTab === "UNANSWERED" ? (
          unansweredQuestions.length === 0 ? (
            <Text
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
            >
              There are no unanswered questions.
            </Text>
          ) : (
            <VStack spacing={4} align="stretch">
              <QuestionBox
                questionNumber={displayedQuestionInfo.current}
                totalQuestionsInTopic={displayedQuestionInfo.total}
                questionData={questionData}
                isStarFilled={isStarFilled}
                toggleStar={toggleStar}
                currentTopic={currentTopic}
              />
              <OptionsBox
                options={questionData.options || []}
                selectedOptions={selectedOptions}
                onOptionSelect={onOptionSelect}
                maxSelections={getRequiredSelections(questionData.answer)}
                isUnansweredTab={true}
                questionData={questionData}
              />
              <AnswerBox
                answer={questionData.answer || ""}
                answerDescription={questionData.answerDescription || ""}
                votes={questionData.votes || []}
              />
            </VStack>
          )
        ) : currentTab === "FAVORITES" && favoriteQuestions.length === 0 ? (
          <Text
            color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
          >
            There are no favorited questions.
          </Text>
        ) : currentTab === "INCORRECT" ? (
          incorrectQuestions.length === 0 ? (
            <Text
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
            >
              There are no incorrect questions. Great job!
            </Text>
          ) : !incorrectQuestions.includes(`T${currentTopic} Q${questionNumber}`) ? (
            <Text
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
            >
              Loading next incorrect question...
            </Text>
          ) : (
            <VStack spacing={4} align="stretch">
              <QuestionBox
                questionNumber={displayedQuestionInfo.current}
                totalQuestionsInTopic={displayedQuestionInfo.total}
                questionData={questionData}
                isStarFilled={isStarFilled}
                toggleStar={toggleStar}
                currentTopic={currentTopic}
              />
              <OptionsBox
                options={questionData.options || []}
                selectedOptions={selectedOptions}
                onOptionSelect={onOptionSelect}
                maxSelections={getRequiredSelections(questionData.answer)}
                isUnansweredTab={currentTab === "UNANSWERED"}
                questionData={questionData}
              />
              <AnswerBox
                answer={questionData.answer || ""}
                answerDescription={questionData.answerDescription || ""}
                votes={questionData.votes || []}
              />
            </VStack>
          )
        ) : (
          <VStack spacing={4} align="stretch">
            <QuestionBox
              questionNumber={displayedQuestionInfo.current}
              totalQuestionsInTopic={displayedQuestionInfo.total}
              questionData={questionData}
              isStarFilled={isStarFilled}
              toggleStar={toggleStar}
              currentTopic={currentTopic}
            />
            <OptionsBox
              options={questionData.options || []}
              selectedOptions={selectedOptions}
              onOptionSelect={onOptionSelect}
              maxSelections={getRequiredSelections(questionData.answer)}
              isUnansweredTab={currentTab === "UNANSWERED"}
              questionData={questionData}
            />
            <AnswerBox
              answer={questionData.answer || ""}
              answerDescription={questionData.answerDescription || ""}
              votes={questionData.votes || []}
            />
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <Box
      width={width}
      bg={
        colorMode === "light"
          ? "brand.background.light"
          : "brand.background.dark"
      }
    >
      {/* Mobile View */}
      <Flex
        display={{ base: "flex", md: "none" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onOpen}
          aria-label="Open menu"
          width="40px"
          height="40px"
          bg={
            colorMode === "light" ? "brand.surface.light" : "brand.surface.dark"
          }
          border="1px solid"
          borderColor={
            colorMode === "light" ? "brand.border.light" : "brand.border.dark"
          }
          borderRadius="12px"
          boxShadow={
            colorMode === "light"
              ? "0 2px 0 0 black"
              : "0 2px 0 0 rgba(255, 255, 255, 0.2)"
          }
          _hover={{
            bg:
              colorMode === "light"
                ? "brand.secondary.light"
                : "brand.secondary.dark",
          }}
          _active={{
            boxShadow: "none",
            transform: "translateY(2px)",
          }}
        />

        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            height="40px"
            bg={
              colorMode === "light"
                ? "brand.surface.light"
                : "brand.surface.dark"
            }
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
            border="1px solid"
            borderColor={
              colorMode === "light" ? "brand.border.light" : "brand.border.dark"
            }
            borderRadius="12px"
            boxShadow={
              colorMode === "light"
                ? "0 2px 0 0 black"
                : "0 2px 0 0 rgba(255, 255, 255, 0.2)"
            }
            _hover={{
              bg:
                colorMode === "light"
                  ? "brand.secondary.light"
                  : "brand.secondary.dark",
            }}
            _active={{
              boxShadow: "none",
              transform: "translateY(2px)",
            }}
          >
            {currentTab}
          </MenuButton>
          <MenuList
            bg={
              colorMode === "light"
                ? "brand.surface.light"
                : "brand.surface.dark"
            }
            borderColor={
              colorMode === "light"
                ? "brand.border.light"
                : "brand.border.dark"
            }
            boxShadow={
              colorMode === "light"
                ? "0 4px 0 0 black"
                : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
            }
          >
            {tabs.map((tab) => (
              <MenuItem
                key={tab}
                onClick={() => handleTabChange(tab)}
                bg={
                  tab === currentTab
                    ? colorMode === "light"
                      ? "brand.primary.light"
                      : "brand.primary.dark"
                    : "transparent"
                }
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "brand.secondary.light"
                      : "brand.secondary.dark",
                }}
              >
                {tab}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      {/* Drawer for Mobile View */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          bg={
            colorMode === "light"
              ? "brand.background.light"
              : "brand.background.dark"
          }
          borderRight="1px solid"
          borderColor={
            colorMode === "light" ? "brand.border.light" : "brand.border.dark"
          }
          borderTopRightRadius="20px"
          borderBottomRightRadius="20px"
          boxShadow={
            colorMode === "light"
              ? "0 2px 0 0 black"
              : "0 2px 0 0 rgba(255, 255, 255, 0.2)"
          }
        >
          <DrawerCloseButton top="8px" right="8px" />
          <DrawerBody pt={12} px={4} pb={4}>
            <VStack spacing={4} align="stretch">
              <SearchBar
                onSearch={onSearch}
                onShuffle={onShuffle}
                onReset={onReset}
                onSubmit={onSubmit}
                currentQuestion={`Q${displayedQuestionInfo.current} of ${displayedQuestionInfo.total}`}
                currentTopic={currentTopic}
                totalQuestions={displayedQuestionInfo.total}
                onQuestionSelect={handleQuestionSelect}
              />

              {examData && (
                <TopicBox
                  topicNumber={currentTopic}
                  examCode={examData.examCode}
                  examTitle={examData.examTitle}
                />
              )}

              <DownloadBox />

              <TopicSelector
                availableTopics={availableTopics}
                currentTopic={currentTopic}
                onTopicChange={onTopicChange}
              />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop View */}
      <Box display={{ base: "none", md: "block" }}>
        <SearchBar
          onSearch={onSearch}
          onShuffle={onShuffle}
          onReset={onReset}
          onSubmit={onSubmit}
          currentQuestion={`Q${displayedQuestionInfo.current} of ${displayedQuestionInfo.total}`}
          currentTopic={currentTopic}
          totalQuestions={displayedQuestionInfo.total}
          onQuestionSelect={handleQuestionSelect}
        />
      </Box>

      <TabList
        tabs={tabs}
        onTabChange={handleTabChange}
        currentQuestionIndex={displayedQuestionInfo.current - 1}
        totalQuestions={displayedQuestionInfo.total}
        onNavigateLeft={() => handleNavigate(-1)}
        onNavigateRight={() => handleNavigate(1)}
        isNavigationDisabled={isNavigationDisabled || navigationLock}
        currentTab={currentTab}
      />

      {renderQuestions()}
    </Box>
  );
};

export default QuestionPanel;