import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { Lesson, LessonScenario, QuizQuestion } from '../types';
import { lessonService } from '../services/lessonService';

interface LessonViewerProps {
  user: AuthUser;
  onCompleteLesson: (lessonId: string) => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ user, onCompleteLesson }) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [scenarioAnswers, setScenarioAnswers] = useState<{ [key: string]: number }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const steps = ['introduction', 'keyPoints', 'scenarios', 'quiz', 'completion'];

  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) {
        setError('No lesson ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`📖 [LESSON VIEWER] Loading lesson: ${lessonId}`);
        
        const lessonData = await lessonService.getLessonById(lessonId);
        
        if (!lessonData) {
          console.error(`❌ [LESSON VIEWER] Lesson not found: ${lessonId}`);
          setError(`Lesson not found: ${lessonId}`);
          setDebugInfo({
            lessonId,
            error: 'Lesson not found',
            userAgeGroup: user.ageGroup,
            environment: import.meta.env.MODE,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
            hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
          });
          setLoading(false);
          return;
        }
        
        console.log(`✅ [LESSON VIEWER] Lesson loaded: ${lessonData.title}`);
        console.log(`📊 [LESSON VIEWER] Content stats:`, {
          keyPoints: lessonData.content.keyPoints.length,
          scenarios: lessonData.content.scenarios.length,
          quizQuestions: lessonData.quiz.questions.length
        });
        
        setLesson(lessonData);
        setDebugInfo({
          lessonId,
          title: lessonData.title,
          keyPointsCount: lessonData.content.keyPoints.length,
          scenariosCount: lessonData.content.scenarios.length,
          quizQuestionsCount: lessonData.quiz.questions.length,
          userAgeGroup: user.ageGroup,
          environment: import.meta.env.MODE
        });
      } catch (err) {
        console.error('❌ [LESSON VIEWER] Error loading lesson:', err);
        setError(`Failed to load lesson: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setDebugInfo({
          lessonId,
          error: err instanceof Error ? err.message : 'Unknown error',
          userAgeGroup: user.ageGroup,
          environment: import.meta.env.MODE,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, user.ageGroup]);

  const handleScenarioAnswer = (scenarioId: string, answerIndex: number) => {
    setScenarioAnswers(prev => ({
      ...prev,
      [scenarioId]: answerIndex
    }));
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
  };

  const handleCompleteLesson = async () => {
    if (!lessonId) return;
    
    try {
      console.log(`🏆 [LESSON VIEWER] Completing lesson: ${lessonId}`);
      await onCompleteLesson(lessonId);
      setLessonCompleted(true);
      console.log(`✅ [LESSON VIEWER] Lesson completed successfully`);
    } catch (err) {
      console.error('❌ [LESSON VIEWER] Error completing lesson:', err);
    }
  };

  const calculateQuizScore = (): { correct: number, total: number, percentage: number } => {
    if (!lesson) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    const total = lesson.quiz.questions.length;
    
    lesson.quiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, total, percentage };
  };

  const isQuizCompleted = lesson?.quiz.questions.every(q => quizAnswers[q.id] !== undefined) || false;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Lesson...</h2>
          <p className="text-gray-600">Preparing your safety learning experience</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Lesson</h2>
            <p className="text-red-500 mb-6">{error || 'Lesson not found'}</p>
            
            {/* Debug Information */}
            {debugInfo && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg text-left max-w-2xl mx-auto mb-6">
                <h3 className="font-semibold text-red-800 mb-2">Debug Information:</h3>
                <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/app/lessons')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'introduction':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{lesson.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <BookOpen className="w-5 h-5" />
                <span>{lesson.duration} minute lesson</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Introduction</h3>
              <p className="text-blue-700 leading-relaxed">{lesson.content.introduction}</p>
            </div>
          </div>
        );

      case 'keyPoints':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Learning Points</h2>
              <p className="text-gray-600 mb-6">Important concepts to understand about {lesson.title.toLowerCase()}</p>
            </div>

            <div className="space-y-4">
              {lesson.content.keyPoints.map((point, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'scenarios':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Scenarios</h2>
              <p className="text-gray-600 mb-6">Apply what you've learned to real-world situations</p>
            </div>

            <div className="space-y-8">
              {lesson.content.scenarios.map((scenario: LessonScenario, index) => (
                <div key={scenario.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Scenario {index + 1}
                  </h3>
                  <p className="text-gray-700 mb-6">{scenario.situation}</p>
                  
                  <div className="space-y-3 mb-6">
                    {scenario.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleScenarioAnswer(scenario.id, optionIndex)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          scenarioAnswers[scenario.id] === optionIndex
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 border-2 rounded-full mr-3 ${
                            scenarioAnswers[scenario.id] === optionIndex
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {scenarioAnswers[scenario.id] === optionIndex && (
                              <div className="w-3 h-3 bg-white rounded-full m-0.5" />
                            )}
                          </div>
                          {option}
                        </div>
                      </button>
                    ))}
                  </div>

                  {scenarioAnswers[scenario.id] !== undefined && (
                    <div className={`p-4 rounded-lg ${
                      scenarioAnswers[scenario.id] === scenario.correctAnswer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <div className="flex items-start">
                        {scenarioAnswers[scenario.id] === scenario.correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            scenarioAnswers[scenario.id] === scenario.correctAnswer
                              ? 'text-green-800'
                              : 'text-orange-800'
                          }`}>
                            {scenarioAnswers[scenario.id] === scenario.correctAnswer ? 'Correct!' : 'Not quite right'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            scenarioAnswers[scenario.id] === scenario.correctAnswer
                              ? 'text-green-700'
                              : 'text-orange-700'
                          }`}>
                            {scenario.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Safety Tips</h3>
              <ul className="space-y-3">
                {lesson.content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-yellow-700">
                    <span className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs">💡</span>
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Knowledge Check</h2>
              <p className="text-gray-600 mb-6">Test what you've learned with this quiz</p>
            </div>

            <div className="space-y-8">
              {lesson.quiz.questions.map((question: QuizQuestion, index) => (
                <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Question {index + 1}
                  </h3>
                  <p className="text-gray-700 mb-6">{question.question}</p>
                  
                  <div className="space-y-3 mb-6">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleQuizAnswer(question.id, optionIndex)}
                        disabled={showQuizResults}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          showQuizResults
                            ? optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : quizAnswers[question.id] === optionIndex && optionIndex !== question.correctAnswer
                              ? 'border-red-500 bg-red-50 text-red-800'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                            : quizAnswers[question.id] === optionIndex
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 border-2 rounded-full mr-3 ${
                            showQuizResults
                              ? optionIndex === question.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : quizAnswers[question.id] === optionIndex && optionIndex !== question.correctAnswer
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300'
                              : quizAnswers[question.id] === optionIndex
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {((showQuizResults && optionIndex === question.correctAnswer) ||
                              (!showQuizResults && quizAnswers[question.id] === optionIndex)) && (
                              <div className="w-3 h-3 bg-white rounded-full m-0.5" />
                            )}
                          </div>
                          {option}
                        </div>
                      </button>
                    ))}
                  </div>

                  {showQuizResults && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showQuizResults && isQuizCompleted && (
              <div className="text-center">
                <button
                  onClick={handleQuizSubmit}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Submit Quiz
                </button>
              </div>
            )}

            {showQuizResults && (
              <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz Results</h3>
                <p className="text-lg text-gray-600 mb-4">
                  You scored {calculateQuizScore().correct} out of {calculateQuizScore().total} ({calculateQuizScore().percentage}%)
                </p>
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${
                  calculateQuizScore().percentage === 100
                    ? 'bg-green-100 text-green-800'
                    : calculateQuizScore().percentage >= 70
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {calculateQuizScore().percentage === 100
                    ? '🎉 Perfect Score!'
                    : calculateQuizScore().percentage >= 70
                    ? '👍 Good Job!'
                    : '💪 Keep Learning!'
                  }
                </div>
              </div>
            )}
          </div>
        );

      case 'completion':
        return (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Lesson Complete! 🎉</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You've successfully completed "{lesson.title}". Great job learning these important safety skills!
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-4">What you learned:</h3>
              <ul className="space-y-2 text-left">
                {lesson.content.keyPoints.slice(0, 3).map((point, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCompleteLesson}
                disabled={lessonCompleted}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200"
              >
                {lessonCompleted ? 'Lesson Completed ✓' : 'Mark as Complete'}
              </button>
              
              <button
                onClick={() => navigate('/app/lessons')}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back to Lessons
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/app/lessons')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Lessons</span>
            </button>
            
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep !== steps.length - 1 && (
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={
                (steps[currentStep] === 'quiz' && !showQuizResults && isQuizCompleted)
              }
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;