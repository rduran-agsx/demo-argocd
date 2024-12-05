import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';

const useQuestionState = (currentExam, API_URL) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [favoriteQuestions, setFavoriteQuestions] = useState([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);

  // Fetch all user data when exam changes
  useEffect(() => {
    if (!currentExam) return;

    const fetchUserData = async () => {
      try {
        // Fetch answers
        const answersResponse = await fetchWithAuth(
          `${API_URL}/api/get-answers/${encodeURIComponent(currentExam)}`
        );
        const answersData = await answersResponse.json();
        const answersMap = {};
        answersData.answers.forEach((answer) => {
          answersMap[`T${answer.topic_number} Q${answer.question_index + 1}`] = 
            answer.selected_options;
        });
        setUserAnswers(answersMap);

        // Fetch favorites
        const favoritesResponse = await fetchWithAuth(
          `${API_URL}/api/favorites/${encodeURIComponent(currentExam)}`
        );
        const favoritesData = await favoritesResponse.json();
        setFavoriteQuestions(favoritesData.favorites);

        // Fetch incorrect questions
        const incorrectResponse = await fetchWithAuth(
          `${API_URL}/api/incorrect-questions/${encodeURIComponent(currentExam)}`
        );
        const incorrectData = await incorrectResponse.json();
        setIncorrectQuestions(incorrectData.incorrect_questions);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentExam, API_URL]);

  const saveAnswer = async (topicNumber, questionIndex, selectedOptions) => {
    const questionId = `T${topicNumber} Q${questionIndex + 1}`;
    
    try {
      await fetchWithAuth(`${API_URL}/api/save-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: currentExam,
          topic_number: topicNumber,
          question_index: questionIndex,
          selected_options: selectedOptions,
        }),
      });

      setUserAnswers(prev => ({
        ...prev,
        [questionId]: selectedOptions
      }));
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const toggleFavorite = async (topicNumber, questionIndex) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: currentExam,
          topic_number: topicNumber,
          question_index: questionIndex,
        }),
      });

      if (response.ok) {
        const isCurrentlyFavorited = favoriteQuestions.some(
          fav => fav.topic_number === topicNumber && 
                fav.question_index === questionIndex
        );

        setFavoriteQuestions(prev => 
          isCurrentlyFavorited
            ? prev.filter(fav => 
                !(fav.topic_number === topicNumber && 
                  fav.question_index === questionIndex)
              )
            : [...prev, { topic_number: topicNumber, question_index: questionIndex }]
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    userAnswers,
    favoriteQuestions,
    incorrectQuestions,
    saveAnswer,
    toggleFavorite
  };
};

export default useQuestionState;