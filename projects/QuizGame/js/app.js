// js/app.js
import { Quiz } from './quiz.js';
import * as UI from './ui.js';
import { loadQuestions, importQuestionsFromJsonObject } from './questions-loader.js';
import { saveScore } from './storage.js';

let quiz = null;
let playerNick = "Игрок";
const TIME_PER_QUESTION = 30;

async function init() {
  // загрузить вопросы (из localStorage или data/questions.json)
  const questions = await loadQuestions();
  quiz = new Quiz(questions);
  UI.bindCallbacks({
    onStart: (nick) => startGame(nick),
    onNext: () => onNext(),
    onQuit: () => onQuit(),
    onRestart: () => restartGame(),
    onImport: (arr) => handleImport(arr)
  });
  // подключить обработчик ответов
  UI.setPresentOnAnswer((choiceIdx, timeTaken) => {
    handleAnswer(choiceIdx, timeTaken);
  });

  UI.initUIState();
}

function startGame(nick) {
  playerNick = nick || "Игрок";
  quiz.reset();
  UI.showQuiz(playerNick, quiz.length);
  presentCurrent();
}

function presentCurrent() {
  const q = quiz.getCurrentQuestion();
  if (!q) return endGame();
  UI.presentQuestion(q, quiz.current, quiz.length, { time: TIME_PER_QUESTION });
}

function handleAnswer(choiceIdx, timeTaken) {
  const q = quiz.getCurrentQuestion();
  if (!q) return;
  const res = quiz.answer(choiceIdx, timeTaken, TIME_PER_QUESTION);
  UI.markAnswer(choiceIdx, q.correctIndex, res.bonus);
  UI.updateLiveScore(quiz.score);
}

function onNext() {
  const hasNext = quiz.next();
  if (hasNext) presentCurrent();
  else endGame();
}

function endGame() {
    UI.saveScoreAndRefreshLeaderboard(playerNick, quiz.score);
    UI.showResult(quiz.score, quiz.correctCount);
  }
  

function onQuit() {
  // показываем результат текущей игры (можно считать как сохранённый)
  endGame();
}

function restartGame() {
  quiz.reset();
  UI.showQuiz(playerNick, quiz.length);
  presentCurrent();
}

function handleImport(arr) {
  try {
    const newQs = importQuestionsFromJsonObject(arr);
    // replace quiz questions
    quiz.replaceQuestions(newQs);
    alert('Импортировано ' + newQs.length + ' вопросов. Игра будет использовать эти вопросы.');
  } catch (e) {
    alert('Ошибка импорта: ' + e.message);
  }
}

init();
