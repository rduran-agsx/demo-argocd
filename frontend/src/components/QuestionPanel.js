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
  examData,
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
  unansweredQuestions,
  setUnansweredQuestions,
  incorrectQuestions,
  availableTopics,
  onTopicChange,
}) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentTab, setCurrentTab] = useState("ALL QUESTIONS");
  const [tabIndices, setTabIndices] = useState({
    "ALL QUESTIONS": questionNumber - 1,
    FAVORITES: 0,
    ANSWERED: 0,
    UNANSWERED: 0,
    INCORRECT: 0,
  });
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
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
    if (typeof answer === "string") return answer.length;
    if (Array.isArray(answer)) return answer.length;
    return 1;
  }, []);

  const handleNavigate = useCallback(
    (direction) => {
      if (isNavigationDisabled || navigationLock) {
        return;
      }

      setNavigationLock(true);
      setIsNavigationDisabled(true);

      const currentQuestionId = `T${currentTopic} Q${questionNumber}`;

      switch (currentTab) {
        case "ALL QUESTIONS": {
          if (direction === 1 && questionNumber < totalQuestions) {
            const nextQuestionId = `T${currentTopic} Q${questionNumber + 1}`;
            onQuestionSelect(nextQuestionId);
          } else if (direction === -1 && questionNumber > 1) {
            const prevQuestionId = `T${currentTopic} Q${questionNumber - 1}`;
            onQuestionSelect(prevQuestionId);
          }
          break;
        }

        case "FAVORITES": {
          const currentIndex = favoriteQuestions.findIndex(
            (item) =>
              `T${item.topic_number} Q${item.question_index + 1}` ===
              currentQuestionId
          );
          const nextIndex =
            (currentIndex !== -1 ? currentIndex : tabIndices["FAVORITES"]) +
            direction;

          if (nextIndex >= 0 && nextIndex < favoriteQuestions.length) {
            const favorite = favoriteQuestions[nextIndex];
            const targetQuestion = `T${favorite.topic_number} Q${
              favorite.question_index + 1
            }`;
            setTabIndices((prev) => ({ ...prev, FAVORITES: nextIndex }));
            onQuestionSelect(targetQuestion);
          }
          break;
        }

        case "ANSWERED": {
          const answeredIndex = answeredQuestions.indexOf(currentQuestionId);
          const currentIndex =
            answeredIndex !== -1 ? answeredIndex : tabIndices["ANSWERED"];
          const nextIndex = currentIndex + direction;

          if (nextIndex >= 0 && nextIndex < answeredQuestions.length) {
            const targetQuestion = answeredQuestions[nextIndex];
            setTabIndices((prev) => ({ ...prev, ANSWERED: nextIndex }));

            const [topic, question] = targetQuestion.split(" ");
            const questionNumber = parseInt(question.slice(1));

            setTimeout(() => {
              onQuestionSelect(`${topic} Q${questionNumber}`);
              setNavigationLock(false);
              setIsNavigationDisabled(false);
            }, 50);

            return;
          }
          break;
        }

        case "UNANSWERED": {
          const currentIndex = unansweredQuestions.indexOf(currentQuestionId);
          const nextIndex =
            (currentIndex !== -1 ? currentIndex : tabIndices["UNANSWERED"]) +
            direction;

          if (nextIndex >= 0 && nextIndex < unansweredQuestions.length) {
            const targetQuestion = unansweredQuestions[nextIndex];
            setTabIndices((prev) => ({ ...prev, UNANSWERED: nextIndex }));
            onQuestionSelect(targetQuestion);
          }
          break;
        }

        case "INCORRECT": {
          const currentIndex = incorrectQuestions.indexOf(currentQuestionId);
          const nextIndex =
            (currentIndex !== -1 ? currentIndex : tabIndices["INCORRECT"]) +
            direction;

          if (nextIndex >= 0 && nextIndex < incorrectQuestions.length) {
            const targetQuestion = incorrectQuestions[nextIndex];
            setTabIndices((prev) => ({ ...prev, INCORRECT: nextIndex }));
            onQuestionSelect(targetQuestion);
          }
          break;
        }
        default:
          break;
      }

      setTimeout(() => {
        setNavigationLock(false);
        setIsNavigationDisabled(false);
      }, 100);
    },
    [
      isNavigationDisabled,
      navigationLock,
      currentTab,
      currentTopic,
      questionNumber,
      totalQuestions,
      tabIndices,
      favoriteQuestions,
      answeredQuestions,
      unansweredQuestions,
      incorrectQuestions,
      onQuestionSelect,
    ]
  );

  const handleTabChange = useCallback(
    (tab) => {
      if (navigationLock || isNavigationDisabled) {
        return;
      }

      setCurrentTab(tab);
      setNavigationLock(true);
      setIsNavigationDisabled(true);

      switch (tab) {
        case "ALL QUESTIONS":
          onQuestionSelect(
            `T${currentTopic} Q${tabIndices["ALL QUESTIONS"] + 1}`
          );
          break;

        case "FAVORITES":
          if (favoriteQuestions.length > 0) {
            const favorite = favoriteQuestions[tabIndices["FAVORITES"]];
            onQuestionSelect(
              `T${favorite.topic_number} Q${favorite.question_index + 1}`
            );
          }
          break;

        case "ANSWERED":
          if (answeredQuestions.length > 0) {
            onQuestionSelect(
              answeredQuestions[
                Math.min(tabIndices["ANSWERED"], answeredQuestions.length - 1)
              ]
            );
          }
          break;

        case "UNANSWERED":
          if (unansweredQuestions.length > 0) {
            onQuestionSelect(unansweredQuestions[tabIndices["UNANSWERED"]]);
          }
          break;

        case "INCORRECT":
          if (incorrectQuestions.length > 0) {
            onQuestionSelect(incorrectQuestions[tabIndices["INCORRECT"]]);
          }
          break;
        default:
          break;
      }

      onTabChange(tab);

      if (currentTab === "ALL QUESTIONS") {
        setTabIndices((prev) => ({
          ...prev,
          "ALL QUESTIONS": questionNumber - 1,
        }));
      }

      setTimeout(() => {
        setNavigationLock(false);
        setIsNavigationDisabled(false);
      }, 100);
    },
    [
      currentTopic,
      questionNumber,
      tabIndices,
      favoriteQuestions,
      answeredQuestions,
      unansweredQuestions,
      incorrectQuestions,
      onQuestionSelect,
      onTabChange,
      navigationLock,
      isNavigationDisabled,
      currentTab,
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
          "ALL QUESTIONS": questionIndex,
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
          const arrayIndex = currentArray.indexOf(selectedQuestion);
          if (arrayIndex !== -1) {
            setTabIndices((prev) => ({
              ...prev,
              [currentTab]: arrayIndex,
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
    if (!navigationLock) {
      setTabIndices((prevIndices) => ({
        ...prevIndices,
        "ALL QUESTIONS": questionNumber - 1,
      }));
    }
  }, [questionNumber, navigationLock]);

  useEffect(() => {
    if (navigationLock || isNavigationDisabled || currentTab !== "ANSWERED")
      return;

    const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
    const requiredSelections = getRequiredSelections(questionData.answer);
    const isAnswered = selectedOptions.length === requiredSelections;

    if (isAnswered) {
      setAnsweredQuestions((prev) => {
        if (!prev.includes(currentQuestionId)) {
          const updatedAnswered = [
            ...prev.filter((q) => q !== currentQuestionId),
            currentQuestionId,
          ];
          return updatedAnswered;
        }
        return prev;
      });
    }
  }, [
    currentTopic,
    questionNumber,
    questionData,
    selectedOptions,
    getRequiredSelections,
    currentTab,
    navigationLock,
    isNavigationDisabled,
    answeredQuestions,
  ]);

  useEffect(() => {
    if (navigationLock || isNavigationDisabled) return;

    const currentQuestionId = `T${currentTopic} Q${questionNumber}`;
    const requiredSelections = getRequiredSelections(questionData.answer);
    const hasUserAnswers =
      userAnswers[currentQuestionId] &&
      userAnswers[currentQuestionId].length === requiredSelections;

    if (hasUserAnswers && !answeredQuestions.includes(currentQuestionId)) {
      setAnsweredQuestions((prev) => [...prev, currentQuestionId]);
    } else if (
      !hasUserAnswers &&
      answeredQuestions.includes(currentQuestionId)
    ) {
      setAnsweredQuestions((prev) =>
        prev.filter((q) => q !== currentQuestionId)
      );
    }
  }, [
    currentTopic,
    questionNumber,
    questionData,
    userAnswers,
    getRequiredSelections,
    navigationLock,
    isNavigationDisabled,
    answeredQuestions,
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
    if (pendingUpdate || navigationLock) return;

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
        case "FAVORITES":
          return {
            current:
              getCurrentIndex(favoriteQuestions, currentQuestionId) + 1 ||
              tabIndices["FAVORITES"] + 1,
            total: favoriteQuestions.length,
          };
        case "ANSWERED":
          return {
            current:
              getCurrentIndex(answeredQuestions, currentQuestionId) + 1 ||
              tabIndices["ANSWERED"] + 1,
            total: answeredQuestions.length,
          };
        case "UNANSWERED":
          return {
            current:
              getCurrentIndex(unansweredQuestions, currentQuestionId) + 1 ||
              tabIndices["UNANSWERED"] + 1,
            total: unansweredQuestions.length,
          };
        case "INCORRECT":
          return {
            current:
              getCurrentIndex(incorrectQuestions, currentQuestionId) + 1 ||
              tabIndices["INCORRECT"] + 1,
            total: incorrectQuestions.length,
          };
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
    tabIndices,
    favoriteQuestions,
    answeredQuestions,
    unansweredQuestions,
    incorrectQuestions,
    currentTopic,
    pendingUpdate,
    navigationLock,
  ]);

  const renderQuestions = () => {
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
          ) : !unansweredQuestions.includes(`T${currentTopic} Q${questionNumber}`) &&
            !removingQuestion ? (
            (() => {
              const nextQuestion = unansweredQuestions[0];
              const [topic, question] = nextQuestion.split(" ");
              onQuestionSelect(`${topic} ${question}`);
              return null;
            })()
          ) : null
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
