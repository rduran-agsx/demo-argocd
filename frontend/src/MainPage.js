import React, { useState, lazy, Suspense, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Flex,
  Box,
  VStack,
  Spinner,
  Center,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import "@fontsource-variable/karla/wght.css";
import "@fontsource/space-grotesk/700.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import ComingSoonComponent from "./components/ComingSoonComponent";
import SelectExamBox from "./components/SelectExamBox";
import ResultsModal from "./components/ResultsModal";
import CustomConfirmationDialog from "./components/CustomConfirmationDialog";

const ProviderExamsCard = lazy(() => import("./components/ProviderExamsCard"));
const ProvidersPage = lazy(() => import("./components/ProvidersPage"));
const QuestionPanel = lazy(() => import("./components/QuestionPanel"));
const DownloadBox = lazy(() => import("./components/DownloadBox"));
const TopicSelector = lazy(() => import("./components/TopicSelector"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const TopicBox = lazy(() => import("./components/TopicBox"));

const LoadingSpinner = () => {
  const { colorMode } = useColorMode();

  return (
    <Center
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg={
        colorMode === "light"
          ? "rgba(255, 255, 255, 0.8)"
          : "rgba(26, 26, 26, 0.8)"
      }
      zIndex="9999"
    >
      <Spinner
        size="xl"
        color={
          colorMode === "light" ? "brand.primary.light" : "brand.primary.dark"
        }
        thickness="4px"
      />
    </Center>
  );
};

const MainPage = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  
  const { colorMode } = useColorMode();

  // Theme-aware colors
  const sidebarBgColor =
    colorMode === "light" ? "brand.surface.light" : "brand.surface.dark";

  // States
  const [isStarFilled, setIsStarFilled] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(null);
  const [isSidebarLoaded, setIsSidebarLoaded] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [view, setView] = useState("grid");
  const [lastVisitedExam, setLastVisitedExam] = useState(null);
  const [favoriteQuestions, setFavoriteQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [examResults, setExamResults] = useState(null);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState("");
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);

  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = (path) => {
    if (path === "/") return "Dashboard";
    if (path.startsWith("/providers")) return "Providers";
    if (path.startsWith("/exams")) return "Exams";
    if (path.startsWith("/custom-exam")) return "Custom Exam";
    if (path.startsWith("/actual-exam")) return "Actual Exam";
    return "";
  };

  useEffect(() => {
    const fetchLastVisitedExam = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/user-preference`
        );
        const data = await response.json();
        if (data.last_visited_exam) {
          setLastVisitedExam(data.last_visited_exam);
        }
      } catch (error) {
        console.error("Error fetching last visited exam:", error);
      }
    };

    fetchLastVisitedExam();
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/actual-exam") && examId) {
      setLastVisitedExam(examId);
      setCurrentExam(examId);
      updateLastVisitedExam(examId);
    }
  }, [location, examId]);

  const fetchUserAnswers = useCallback(async () => {
    try {
      const encodedExamId = encodeURIComponent(currentExam);
      const response = await fetch(
        `${API_URL}/api/get-answers/${encodedExamId}`
      );
      const data = await response.json();
      const answersMap = {};
      data.answers.forEach((answer) => {
        answersMap[`T${answer.topic_number} Q${answer.question_index + 1}`] =
          answer.selected_options;
      });
      setUserAnswers(answersMap);
    } catch (error) {
      console.error("Error fetching user answers:", error);
    }
  }, [currentExam]);

  const fetchIncorrectQuestions = useCallback(async () => {
    try {
      const encodedExamId = encodeURIComponent(currentExam);
      const response = await fetch(
        `${API_URL}/api/incorrect-questions/${encodedExamId}`
      );
      const data = await response.json();
      setIncorrectQuestions(data.incorrect_questions);
    } catch (error) {
      console.error("Error fetching incorrect questions:", error);
    }
  }, [currentExam]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setExamData(null);
        const encodedExamId = encodeURIComponent(currentExam);
        const response = await fetch(
          `${API_URL}/api/exams/${encodedExamId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExamData(data);
        const topics = Object.keys(data.topics).map(Number);
        setCurrentTopic(
          topics.length === 1 ? topics[0] : currentTopic || topics[0]
        );
        setCurrentQuestionIndex(0);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    if (currentExam) {
      fetchExamData();
      fetchUserAnswers();
      fetchIncorrectQuestions();
    }
  }, [
    currentExam,
    currentTopic,
    fetchUserAnswers,
    fetchIncorrectQuestions,
  ]);

  useEffect(() => {
    if (examData) {
      const allQuestions = Object.entries(examData.topics).flatMap(
        ([topicNumber, questions]) =>
          questions.map((_, index) => `T${topicNumber} Q${index + 1}`)
      );
      setUnansweredQuestions(
        allQuestions.filter(
          (q) => !userAnswers[q] || userAnswers[q].length === 0
        )
      );
    }
  }, [examData, userAnswers]);

  useEffect(() => {
    if (currentExam) {
      const fetchFavorites = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/favorites/${currentExam}`
          );
          const data = await response.json();
          setFavoriteQuestions(data.favorites);
        } catch (error) {
          console.error("Error fetching favorite questions:", error);
        }
      };

      fetchFavorites();
    }
  }, [currentExam]);

  useEffect(() => {
    const fetchSidebarState = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/sidebar-state`
        );
        const data = await response.json();
        setIsSidebarCollapsed(data.is_collapsed);
      } catch (error) {
        console.error("Error fetching sidebar state:", error);
        setIsSidebarCollapsed(false);
      } finally {
        setIsSidebarLoaded(true);
      }
    };

    fetchSidebarState();
  }, []);

  useEffect(() => {
    setSelectedOptions(
      userAnswers[`T${currentTopic} Q${currentQuestionIndex + 1}`] || []
    );
  }, [userAnswers, currentTopic, currentQuestionIndex]);

  const updateLastVisitedExam = async (examId) => {
    try {
      await fetch(`${API_URL}/api/user-preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ last_visited_exam: examId }),
      });
    } catch (error) {
      console.error("Error updating last visited exam:", error);
    }
  };

  const toggleStar = async (event) => {
    event.stopPropagation();
    if (!currentExam || !examData) return;

    try {
      const response = await fetch(`${API_URL}/api/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: currentExam,
          topic_number: currentTopic,
          question_index: currentQuestionIndex,
        }),
      });

      if (response.ok) {
        const updatedFavorites = favoriteQuestions.some(
          (favorite) =>
            favorite.topic_number === currentTopic &&
            favorite.question_index === currentQuestionIndex
        )
          ? favoriteQuestions.filter(
              (favorite) =>
                !(
                  favorite.topic_number === currentTopic &&
                  favorite.question_index === currentQuestionIndex
                )
            )
          : [
              ...favoriteQuestions,
              {
                topic_number: currentTopic,
                question_index: currentQuestionIndex,
              },
            ];

        setFavoriteQuestions(updatedFavorites);
        setIsStarFilled(!isStarFilled);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const toggleSidebar = async () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);

    try {
      await fetch(`${API_URL}/api/sidebar-state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_collapsed: newState }),
      });
    } catch (error) {
      console.error("Error updating sidebar state:", error);
    }
  };

  const handleExamSelect = async (examId) => {
    try {
      const encodedExamId = encodeURIComponent(examId);

      await fetch(`${API_URL}/api/track-exam-visit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exam_id: examId }),
      });

      setLastVisitedExam(examId);
      updateLastVisitedExam(examId);
      navigate(`/actual-exam/${encodedExamId}`);
    } catch (error) {
      console.error("Error tracking exam visit:", error);
      const encodedExamId = encodeURIComponent(examId);
      navigate(`/actual-exam/${encodedExamId}`);
    }
  };

  const handleTabChange = (tab) => {
    console.log(`Tab changed to: ${tab}`);
    if (tab === "INCORRECT") {
      fetchIncorrectQuestions();
    }
  };

  const handleSearch = (searchTerm) => {
    console.log("Searching for:", searchTerm);
  };

  const handleShuffle = () => {
    console.log("Shuffling questions");
  };

  const handleReset = () => {
    console.log("Resetting questions");
  };

  const handleSubmit = () => {
    if (!currentExam) return;

    const unansweredCount = unansweredQuestions.length;
    if (unansweredCount > 0) {
      setConfirmDialogMessage(
        `You have ${unansweredCount} unanswered question${
          unansweredCount > 1 ? "s" : ""
        }. Are you sure you want to submit?`
      );
      onConfirmOpen();
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/submit-answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam_id: currentExam,
            user_answers: userAnswers,
          }),
        }
      );

      if (response.ok) {
        const results = await response.json();
        setExamResults(results);
        setIncorrectQuestions(results.incorrect_questions);
        onOpen();
      } else {
        const errorData = await response.json();
        console.error("Error submitting answers:", errorData.error);
        alert(`Error submitting answers: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("An error occurred while submitting answers. Please try again.");
    }
  };

  const handleTopicChange = (topic) => {
    setCurrentTopic(topic);
    setCurrentQuestionIndex(0);
    setSelectedOptions(userAnswers[`T${topic} Q1`] || []);
  };

  const handleQuestionChange = (newIndex) => {
    const currentTopicQuestions = examData.topics[currentTopic] || [];
    if (newIndex >= 0 && newIndex < currentTopicQuestions.length) {
      setCurrentQuestionIndex(newIndex);
      setSelectedOptions(
        userAnswers[`T${currentTopic} Q${newIndex + 1}`] || []
      );
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleOptionSelect = async (newSelectedOptions) => {
    setSelectedOptions(newSelectedOptions);
    const currentQuestionId = `T${currentTopic} Q${currentQuestionIndex + 1}`;

    try {
      await fetch(`${API_URL}/api/save-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: currentExam,
          topic_number: currentTopic,
          question_index: currentQuestionIndex,
          selected_options: newSelectedOptions,
        }),
      });

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionId]: newSelectedOptions,
      }));

      if (newSelectedOptions.length > 0) {
        setUnansweredQuestions((prev) =>
          prev.filter((q) => q !== currentQuestionId)
        );
      } else {
        setUnansweredQuestions((prev) => [...prev, currentQuestionId]);
      }
    } catch (error) {
      console.error("Error saving user answer:", error);
    }
  };

  const renderContent = () => {
    const path = location.pathname;

    if (path === "/") {
      return (
        <Box width="100%">
          <Dashboard />
        </Box>
      );
    } else if (path === "/providers") {
      return (
        <Box width="100%">
          <ProvidersPage />
        </Box>
      );
    } else if (path === "/exams") {
      return (
        <Box width="100%">
          <ProviderExamsCard
            onExamSelect={handleExamSelect}
            view={view}
            onViewChange={handleViewChange}
          />
        </Box>
      );
    } else if (path === "/custom-exam") {
      return (
        <Box width="100%">
          <ComingSoonComponent />
        </Box>
      );
    } else if (path.startsWith("/actual-exam")) {
      if (!examId && !lastVisitedExam) {
        return <SelectExamBox onExamSelect={handleExamSelect} />;
      }
      if (!examData) {
        return <LoadingSpinner />;
      }
      const currentTopicQuestions = examData.topics[currentTopic] || [];
      const currentQuestion = currentTopicQuestions[currentQuestionIndex] || {};

      return (
        <Flex direction={{ base: "column", md: "row" }} width="100%">
          <Box flex={1} minWidth="0" paddingBottom={{ base: "80px", md: "0" }}>
            <QuestionPanel
              width="100%"
              onSearch={handleSearch}
              onShuffle={handleShuffle}
              onReset={handleReset}
              onSubmit={handleSubmit}
              tabs={[
                "ALL QUESTIONS",
                "FAVORITES",
                "ANSWERED",
                "UNANSWERED",
                "INCORRECT",
              ]}
              examData={examData}
              onTabChange={handleTabChange}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={currentTopicQuestions.length}
              questionData={currentQuestion}
              isStarFilled={favoriteQuestions.some(
                (favorite) =>
                  favorite.topic_number === currentTopic &&
                  favorite.question_index === currentQuestionIndex
              )}
              toggleStar={toggleStar}
              onNavigateLeft={() =>
                handleQuestionChange(currentQuestionIndex - 1)
              }
              onNavigateRight={() =>
                handleQuestionChange(currentQuestionIndex + 1)
              }
              currentTopic={currentTopic}
              currentQuestion={`T${currentTopic} Q${currentQuestionIndex + 1}`}
              onQuestionSelect={(selectedQuestion) => {
                const [, questionPart] = selectedQuestion.split(" ");
                const newIndex = parseInt(questionPart.slice(1)) - 1;
                handleQuestionChange(newIndex);
              }}
              favoriteQuestions={favoriteQuestions}
              onOptionSelect={handleOptionSelect}
              selectedOptions={selectedOptions}
              userAnswers={userAnswers}
              unansweredQuestions={unansweredQuestions}
              setUnansweredQuestions={setUnansweredQuestions}
              incorrectQuestions={incorrectQuestions}
              availableTopics={Object.keys(examData.topics).map(Number)}
              onTopicChange={handleTopicChange}
            />
          </Box>
          {/* Side Panel */}
          <Box
            width={{ base: "100%", md: "300px" }}
            minWidth={{ base: "0", md: "300px" }}
            marginLeft={{ base: 0, md: 8 }}
            marginTop={{ base: 4, md: 0 }}
            position={{ base: "fixed", md: "relative" }}
            bottom={{ base: "80px", md: "auto" }}
            right={{ base: "16px", md: "auto" }}
            zIndex={{ base: 1000, md: 1 }}
            display={{ base: "none", md: "block" }}
          >
            <VStack spacing={8}>
              <TopicBox
                topicNumber={currentTopic}
                examCode={examData.examCode}
                examTitle={examData.examTitle}
              />
              <DownloadBox />
              <TopicSelector
                availableTopics={Object.keys(examData.topics).map(Number)}
                currentTopic={currentTopic}
                onTopicChange={handleTopicChange}
              />
            </VStack>
          </Box>
        </Flex>
      );
    } else {
      return <SelectExamBox onExamSelect={handleExamSelect} />;
    }
  };

  return (
    <Flex height="100vh">
      {!isSidebarLoaded ? (
        <>
          <Box
            width="80px"
            height="100vh"
            bg={sidebarBgColor}
            transition="width 0.3s ease"
          />
          <Flex direction="column" flex={1} overflow="hidden">
            <Navbar activeItem={getActiveItem(location.pathname)}>
              {location.pathname.startsWith("/actual-exam") && examData && (
                <Breadcrumbs
                  items={[
                    { label: "All Providers", href: "/providers" },
                    { label: examData.provider, href: "/exams" },
                    {
                      label: examData.examTitle,
                      href: "#",
                      isCurrentPage: true,
                    },
                  ]}
                />
              )}
            </Navbar>
            <Box
              flex={1}
              overflow="auto"
              padding={{ base: 3, md: 8 }}
              bg={
                colorMode === "light"
                  ? "brand.background.light"
                  : "brand.background.dark"
              }
            >
              <Suspense fallback={<LoadingSpinner />}>
                {renderContent()}
              </Suspense>
            </Box>
          </Flex>
        </>
      ) : (
        <>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            activeItem={getActiveItem(location.pathname)}
            lastVisitedExam={lastVisitedExam}
          />
          <Flex direction="column" flex={1} overflow="hidden">
            <Navbar activeItem={getActiveItem(location.pathname)}>
              {location.pathname.startsWith("/actual-exam") && examData && (
                <Breadcrumbs
                  items={[
                    { label: "All Providers", href: "/providers" },
                    { label: examData.provider, href: "/exams" },
                    {
                      label: examData.examTitle,
                      href: "#",
                      isCurrentPage: true,
                    },
                  ]}
                />
              )}
            </Navbar>
            <Box
              flex={1}
              overflow="auto"
              padding={{ base: 3, md: 8 }}
              bg={
                colorMode === "light"
                  ? "brand.background.light"
                  : "brand.background.dark"
              }
            >
              <Suspense fallback={<LoadingSpinner />}>
                {renderContent()}
              </Suspense>
            </Box>
          </Flex>
        </>
      )}
      <CustomConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        onConfirm={() => {
          onConfirmClose();
          submitExam();
        }}
        message={confirmDialogMessage}
      />
      <ResultsModal isOpen={isOpen} onClose={onClose} results={examResults} />
    </Flex>
  );
};

export default MainPage;
