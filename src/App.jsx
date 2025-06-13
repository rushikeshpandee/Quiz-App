import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => {
          const options = [...q.incorrect_answers, q.correct_answer];
          return {
            question: decodeHtml(q.question),
            options: shuffleArray(options.map(decodeHtml)),
            answer: decodeHtml(q.correct_answer),
          };
        });
        setQuestions(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch questions", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || showScore) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, loading, showScore]);

  const handleAnswer = (selected) => {
    if (selected === questions[currentQ].answer) {
      setScore(score + 1);
    }
    handleNext();
  };

  const handleNext = () => {
    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      setCurrentQ(nextQ);
      setTimeLeft(15);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    window.location.reload();
  };

  if (loading) return <div className="container"><h2>Loading questions...</h2></div>;

  return (
    <div className="container">
      <h1>React Quiz App</h1>
      {showScore ? (
        <div className="score-section">
          <h2>You scored {score} out of {questions.length}</h2>
          <button onClick={restartQuiz} className="btn">Restart Quiz</button>
        </div>
      ) : (
        <div className="quiz-section">
          <h2>{questions[currentQ].question}</h2>
          <p className="timer">Time left: {timeLeft}s</p>
          <div>
            {questions[currentQ].options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="btn"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export default App;
