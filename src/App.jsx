import { useState, useEffect } from "react"
import axios from "axios"
import { Moon, Sun } from 'lucide-react'

export default function App() {
  const [quiz, setQuiz] = useState([])
  const [count, setCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [questionHistory, setQuestionHistory] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false) // New state for completion screen

  useEffect(() => {
    fetchQuizData()
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const fetchQuizData = async () => {
    try {
      const response = await axios.get(
        "https://api.allorigins.win/get?url=" + encodeURIComponent("https://api.jsonserve.com/Uw5CrX"),
      )
      const data = JSON.parse(response.data.contents)
      setQuiz(data.questions || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching quiz data:", error)
      setLoading(false)
    }
  }

  const handleAnswer = (option) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(option)
    if (option.is_correct) {
      setScore((prev) => prev + 1)
    }

    // Check if this is the last question
    if (count === quiz.length - 1) {
      // Wait for the answer feedback before showing completion screen
      setTimeout(() => {
        setShowCompletion(true)
      }, 1000)
    } else {
      setTimeout(() => {
        setSelectedAnswer(null)
        setQuestionHistory(prev => [...prev, count])
        setCount((prev) => prev + 1)
      }, 1000)
    }
  }

  const goToPreviousQuestion = () => {
    if (questionHistory.length > 0) {
      const prevQuestion = questionHistory[questionHistory.length - 1]
      setCount(prevQuestion)
      setQuestionHistory(prev => prev.slice(0, -1))
    }
  }

  const handleReset = () => {
    setCount(0)
    setScore(0)
    setSelectedAnswer(null)
    setQuestionHistory([])
    setShowCompletion(false) // Reset completion screen state
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading quiz...</p>
      </div>
    )
  }

  const currentQuestion = quiz[count]
  const progress = (count / quiz.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-gray-800 dark:text-white" />
        ) : (
          <Moon className="w-6 h-6 text-gray-800 dark:text-white" />
        )}
      </button>

      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Challenge</h1>
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 rounded-full">
              <span className="text-2xl">🏆</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{score}</span>
            </div>
          </div>
        </div>

        <div className="relative h-2 bg-gray-100 dark:bg-gray-700">
          <div 
            className="absolute h-full bg-indigo-600 transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="p-6">
          {showCompletion ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Completed!</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                You scored {score} out of {quiz.length}
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg
                            transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2
                            focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
                >
                  Try Again
                </button>
                <button
                  onClick={goToPreviousQuestion}
                  disabled={questionHistory.length === 0}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg
                            transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2
                            focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50
                            disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  Review Previous Question
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={questionHistory.length === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 
                            disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:bg-gray-700 
                            dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 
                            focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  ← Previous Question
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Question {count + 1} of {quiz.length}
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentQuestion.description}
              </h2>
              <div className="grid gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer?.id === option.id
                  const showCorrect = selectedAnswer && option.is_correct
                  const showIncorrect = isSelected && !option.is_correct

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 w-full text-left rounded-lg transition-all duration-200 transform hover:scale-[1.02]
                                font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                                ${
                                  showCorrect
                                    ? "bg-green-500 text-white ring-green-500 hover:bg-green-600"
                                    : showIncorrect
                                    ? "bg-red-500 text-white ring-red-500 hover:bg-red-600"
                                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                                }
                                ${selectedAnswer !== null ? "cursor-not-allowed" : "cursor-pointer"}
                                disabled:opacity-50`}
                    >
                      {option.description}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
