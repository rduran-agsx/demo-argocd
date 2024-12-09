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
  answersVisible,
  onAnswerToggle,
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
  handleQuestionChange,
}) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentTab, setCurrentTab] = useState("ALL QUESTIONS");
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [tabIndices, setTabIndices] = useState({
    "ALL QUESTIONS": {
      index: questionNumber - 1,
      lastQuestion: `T${currentTopic} Q${questionNumber}`,
    },
    FAVORITES: { index: 0, lastQuestion: null },
    ANSWERED: { index: 0, lastQuestion: null },
    UNANSWERED: { index: 0, lastQuestion: null },
    INCORRECT: { index: 0, lastQuestion: null },
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

  const updateDisplayedQuestions = (tab) => {
    switch (tab) {
      case "ALL QUESTIONS":
        setDisplayedQuestions(
          Array.from(
            { length: totalQuestions },
            (_, i) => `T${currentTopic} Q${i + 1}`
          )
        );
        break;
      case "FAVORITES":
        setDisplayedQuestions(
          favoriteQuestions.map(
            (fq) => `T${fq.topic_number} Q${fq.question_index + 1}`
          )
        );
        break;
      case "ANSWERED":
        setDisplayedQuestions(answeredQuestions);
        break;
      case "UNANSWERED":
        setDisplayedQuestions(unansweredQuestions);
        break;
      case "INCORRECT":
        // Filter incorrect questions for current topic
        setDisplayedQuestions(
          incorrectQuestions.filter((q) => q.startsWith(`T${currentTopic}`))
        );
        break;
      default:
        setDisplayedQuestions([]);
    }
  };

  const handleNavigate = useCallback(
    (direction) => {
      if (navigationLock) {
        setTimeout(() => setNavigationLock(false), 50); // Release lock if stuck
        return;
      }

      setNavigationLock(true);
      const currentQuestionId = `T${currentTopic} Q${questionNumber}`;

      let nextQuestion = null;
      let nextIndex = -1;

      switch (currentTab) {
        case "ALL QUESTIONS": {
          // For single question case, always navigate to it regardless of direction
          if (totalQuestions === 1) {
            nextQuestion = `T${currentTopic} Q1`;
            nextIndex = 0;
            break;
          }

          const nextNum = questionNumber + direction;
          if (nextNum >= 1 && nextNum <= totalQuestions) {
            nextQuestion = `T${currentTopic} Q${nextNum}`;
            nextIndex = nextNum - 1;
          }
          break;
        }

        case "FAVORITES":
        case "ANSWERED":
        case "UNANSWERED": {
          const list =
            currentTab === "FAVORITES"
              ? favoriteQuestions.map(
                  (fq) => `T${fq.topic_number} Q${fq.question_index + 1}`
                )
              : currentTab === "ANSWERED"
              ? answeredQuestions
              : unansweredQuestions;

          if (list.length === 0) break;

          // For single remaining question, always navigate to it
          if (list.length === 1) {
            nextQuestion = list[0];
            nextIndex = 0;
            break;
          }

          if (list.includes(currentQuestionId)) {
            const currentIndex = list.indexOf(currentQuestionId);
            const newIndex = currentIndex + direction;
            if (newIndex >= 0 && newIndex < list.length) {
              nextQuestion = list[newIndex];
              nextIndex = newIndex;
            }
          } else {
            // Changed this part to handle deselected questions better
            const currentNumber = parseInt(questionNumber);
            const availableNumbers = list.map((qId) =>
              parseInt(qId.split(" Q")[1])
            );

            if (direction > 0) {
              // Find next available question number
              const nextAvailable = availableNumbers.find(
                (num) => num > currentNumber
              );
              if (nextAvailable !== undefined) {
                nextQuestion = `T${currentTopic} Q${nextAvailable}`;
                nextIndex = list.indexOf(nextQuestion);
              } else {
                // If no higher number found, stay on current or wrap to first
                nextQuestion = `T${currentTopic} Q${Math.min(
                  ...availableNumbers
                )}`;
                nextIndex = list.indexOf(nextQuestion);
              }
            } else {
              // Find previous available question number
              const prevAvailable = [...availableNumbers]
                .reverse()
                .find((num) => num < currentNumber);
              if (prevAvailable !== undefined) {
                nextQuestion = `T${currentTopic} Q${prevAvailable}`;
                nextIndex = list.indexOf(nextQuestion);
              } else {
                // If no lower number found, stay on current or wrap to last
                nextQuestion = `T${currentTopic} Q${Math.max(
                  ...availableNumbers
                )}`;
                nextIndex = list.indexOf(nextQuestion);
              }
            }
          }
          break;
        }

        case "INCORRECT": {
          const incorrectQuestionsInTopic = incorrectQuestions.filter((q) =>
            q.startsWith(`T${currentTopic}`)
          );

          if (incorrectQuestionsInTopic.length === 0) {
            // If no incorrect questions in current topic but there are in other topics,
            const firstIncorrectQuestion = incorrectQuestions[0];
            if (firstIncorrectQuestion) {
              const [topicPart] = firstIncorrectQuestion.split(" ");
              const newTopic = parseInt(topicPart.slice(1));
              onTopicChange(newTopic);
              nextQuestion = firstIncorrectQuestion;
              nextIndex = 0;
            }
            break;
          }

          // For single remaining question, always navigate to it
          if (incorrectQuestionsInTopic.length === 1) {
            nextQuestion = incorrectQuestionsInTopic[0];
            nextIndex = 0;
            break;
          }

          if (incorrectQuestionsInTopic.includes(currentQuestionId)) {
            const currentIndex =
              incorrectQuestionsInTopic.indexOf(currentQuestionId);
            const newIndex = currentIndex + direction;
            if (newIndex >= 0 && newIndex < incorrectQuestionsInTopic.length) {
              nextQuestion = incorrectQuestionsInTopic[newIndex];
              nextIndex = newIndex;
            } else if (direction > 0) {
              // Wrap to first question
              nextQuestion = incorrectQuestionsInTopic[0];
              nextIndex = 0;
            } else {
              // Wrap to last question
              nextQuestion =
                incorrectQuestionsInTopic[incorrectQuestionsInTopic.length - 1];
              nextIndex = incorrectQuestionsInTopic.length - 1;
            }
          } else {
            // If current question is not in the incorrect list
            if (direction > 0) {
              nextQuestion = incorrectQuestionsInTopic[0];
              nextIndex = 0;
            } else {
              nextQuestion =
                incorrectQuestionsInTopic[incorrectQuestionsInTopic.length - 1];
              nextIndex = incorrectQuestionsInTopic.length - 1;
            }
          }
          break;
        }

        default:
          break;
      }

      if (nextQuestion) {
        setTabIndices((prev) => ({
          ...prev,
          [currentTab]: {
            index: nextIndex,
            lastQuestion: nextQuestion,
          },
        }));
        onQuestionSelect(nextQuestion);
      }

      setTimeout(() => setNavigationLock(false), 50);
    },
    [
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
      tabIndices,
    ]
  );

  const handleTabChange = useCallback(
    (tab) => {
      if (navigationLock) return;

      setNavigationLock(true);
      setIsTabChanging(true);
      setCurrentTab(tab);

      const lastQuestion = tabIndices[tab].lastQuestion;

      const executeTabChange = () => {
        switch (tab) {
          case "ALL QUESTIONS": {
            const questionToSelect =
              lastQuestion || `T${currentTopic} Q${tabIndices[tab].index + 1}`;
            onQuestionSelect(questionToSelect);
            break;
          }

          case "FAVORITES": {
            if (
              lastQuestion &&
              favoriteQuestions.some(
                (fq) =>
                  `T${fq.topic_number} Q${fq.question_index + 1}` ===
                  lastQuestion
              )
            ) {
              onQuestionSelect(lastQuestion);
            } else if (favoriteQuestions.length > 0) {
              const firstFavorite = favoriteQuestions[0];
              const questionId = `T${firstFavorite.topic_number} Q${
                firstFavorite.question_index + 1
              }`;
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
            // Filter incorrect questions for current topic
            const incorrectQuestionsInTopic = incorrectQuestions.filter((q) =>
              q.startsWith(`T${currentTopic}`)
            );

            if (incorrectQuestionsInTopic.length > 0) {
              // First try to use last question if it exists and is still incorrect
              if (
                lastQuestion &&
                incorrectQuestionsInTopic.includes(lastQuestion)
              ) {
                onQuestionSelect(lastQuestion);
              } else {
                // Otherwise select the first incorrect question in this topic
                onQuestionSelect(incorrectQuestionsInTopic[0]);
              }
            } else if (incorrectQuestions.length > 0) {
              // If no incorrect questions in current topic but there are in other topics,
              // find the first topic with incorrect questions
              const firstIncorrectQuestion = incorrectQuestions[0];
              const [topicPart] = firstIncorrectQuestion.split(" ");
              const newTopic = parseInt(topicPart.slice(1));

              // Update topic first, then select the question
              onTopicChange(newTopic);
              onQuestionSelect(firstIncorrectQuestion);
            }
            break;
          }

          default: {
            break;
          }
        }

        // Update displayed questions for the new tab
        updateDisplayedQuestions(tab);

        requestAnimationFrame(() => {
          setNavigationLock(false);
          setIsTabChanging(false);
        });
      };

      requestAnimationFrame(executeTabChange);
    },
    [
      favoriteQuestions,
      answeredQuestions,
      unansweredQuestions,
      incorrectQuestions,
      onQuestionSelect,
      navigationLock,
      currentTopic,
      tabIndices,
      onTopicChange,
      updateDisplayedQuestions,
      questionNumber,
      totalQuestions,
    ]
  );

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
            lastQuestion: selectedQuestion,
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
              (item) =>
                `T${item.topic_number} Q${item.question_index + 1}` ===
                selectedQuestion
            );
          } else {
            arrayIndex = currentArray.indexOf(selectedQuestion);
          }

          if (arrayIndex !== -1) {
            setTabIndices((prev) => ({
              ...prev,
              [currentTab]: {
                index: arrayIndex,
                lastQuestion: selectedQuestion,
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
    const allQuestions = Array.from(
      { length: totalQuestions },
      (_, i) => `T${currentTopic} Q${i + 1}`
    );

    // Sort questions into answered and unanswered arrays based on required selections
    const answered = [];
    const unanswered = [];

    allQuestions.forEach((questionId) => {
      const [topicPart, questionPart] = questionId.split(" ");
      const topicNum = parseInt(topicPart.slice(1));
      const questionNum = parseInt(questionPart.slice(1)) - 1;

      const question = examData.topics[topicNum]?.[questionNum];
      if (!question) return;

      const required = getRequiredSelections(question.answer);
      const userAnswer = userAnswers[questionId];

      if (!userAnswer || userAnswer.length < required) {
        unanswered.push(questionId);
      } else {
        answered.push(questionId);
      }
    });

    // Just update the lists without forcing navigation
    setAnsweredQuestions(answered);
    setUnansweredQuestions(unanswered);
  }, [
    currentTopic,
    totalQuestions,
    userAnswers,
    examData,
    getRequiredSelections,
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

    const calculateQuestionInfo = () => {
      switch (currentTab) {
        case "FAVORITES":
        case "ANSWERED":
        case "UNANSWERED":
        case "INCORRECT": {
          const list =
            currentTab === "FAVORITES"
              ? favoriteQuestions.map(
                  (fq) => `T${fq.topic_number} Q${fq.question_index + 1}`
                )
              : currentTab === "ANSWERED"
              ? answeredQuestions
              : currentTab === "UNANSWERED"
              ? unansweredQuestions
              : incorrectQuestions.filter((q) =>
                  q.startsWith(`T${currentTopic}`)
                );

          const total = list.length;

          if (total === 0) return { current: 0, total: 0 };

          // For the Incorrect tab, find the current question's position in the filtered list
          if (currentTab === "INCORRECT") {
            const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
            const currentIndex = list.indexOf(currentQuestionId);

            if (currentIndex !== -1) {
              return {
                current: currentIndex + 1,
                total,
              };
            }
            // If current question isn't in the list, use the first question
            return {
              current: 1,
              total,
            };
          }

          const currentIndex = tabIndices[currentTab].index;
          if (currentIndex >= total) {
            return { current: total, total };
          }
          return { current: currentIndex + 1, total };
        }

        default:
          return {
            current: questionNumber,
            total: totalQuestions,
          };
      }
    };

    requestAnimationFrame(() => {
      setDisplayedQuestionInfo(calculateQuestionInfo());
    });
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
    isTabChanging,
    tabIndices,
  ]);

  const renderQuestions = () => {
    if (isTabChanging) {
      return null; // Skip rendering during tab changes
    }

    return (
      <Box paddingBottom={{ base: "25px", md: 0 }}>
        {currentTab === "ANSWERED" && answeredQuestions.length === 0 ? (
          <Text
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
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
              {answersVisible && (
                <AnswerBox
                  answer={questionData.answer || ""}
                  answerDescription={questionData.answerDescription || ""}
                  votes={questionData.votes || []}
                />
              )}
            </VStack>
          )
        ) : currentTab === "FAVORITES" && favoriteQuestions.length === 0 ? (
          <Text
            color={
              colorMode === "light" ? "brand.text.light" : "brand.text.dark"
            }
          >
            There are no favorited questions.
          </Text>
        ) : currentTab === "INCORRECT" ? (
          (() => {
            // Get incorrect questions for current topic
            const incorrectQuestionsInTopic = incorrectQuestions.filter((q) =>
              q.startsWith(`T${currentTopic}`)
            );

            if (incorrectQuestions.length === 0) {
              return (
                <Text
                  color={
                    colorMode === "light"
                      ? "brand.text.light"
                      : "brand.text.dark"
                  }
                >
                  There are no incorrect questions. Great job!
                </Text>
              );
            }

            if (incorrectQuestionsInTopic.length === 0) {
              return (
                <Text
                  color={
                    colorMode === "light"
                      ? "brand.text.light"
                      : "brand.text.dark"
                  }
                >
                  No incorrect questions in this topic.
                </Text>
              );
            }

            const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
            if (!incorrectQuestionsInTopic.includes(currentQuestionId)) {
              // Navigate to first incorrect question in topic
              const firstIncorrectInTopic = incorrectQuestionsInTopic[0];
              if (firstIncorrectInTopic) {
                const [, questionPart] = firstIncorrectInTopic.split(" ");
                const newIndex = parseInt(questionPart.slice(1)) - 1;
                setTimeout(() => handleQuestionChange(newIndex), 0);
              }
              return (
                <Text
                  color={
                    colorMode === "light"
                      ? "brand.text.light"
                      : "brand.text.dark"
                  }
                >
                  Loading next incorrect question...
                </Text>
              );
            }

            return (
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
                {answersVisible && (
                  <AnswerBox
                    answer={questionData.answer || ""}
                    answerDescription={questionData.answerDescription || ""}
                    votes={questionData.votes || []}
                  />
                )}
              </VStack>
            );
          })()
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
            {answersVisible && (
              <AnswerBox
                answer={questionData.answer || ""}
                answerDescription={questionData.answerDescription || ""}
                votes={questionData.votes || []}
              />
            )}
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
              colorMode === "light" ? "brand.border.light" : "brand.border.dark"
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
                answersVisible={answersVisible}
                onAnswerToggle={onAnswerToggle}
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
          answersVisible={answersVisible}
          onAnswerToggle={onAnswerToggle}
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